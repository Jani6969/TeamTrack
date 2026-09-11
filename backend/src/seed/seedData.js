const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Project = require('../models/Project');
const Report = require('../models/Report');
const Review = require('../models/Review');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/weekly-report-system';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB for seeding: ${mongoUri}`);

    // Clear existing data
    console.log('Clearing old data...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Report.deleteMany({}),
      Review.deleteMany({})
    ]);

    // 1. Create Users
    console.log('Creating users...');
    const users = await User.create([
      {
        name: 'Sarah Connor (Manager)',
        email: 'manager@example.com',
        password: 'Password123',
        role: 'MANAGER'
      },
      {
        name: 'Alex Johnson',
        email: 'member1@example.com',
        password: 'Password123',
        role: 'TEAM_MEMBER'
      },
      {
        name: 'Beth Smith',
        email: 'member2@example.com',
        password: 'Password123',
        role: 'TEAM_MEMBER'
      },
      {
        name: 'Carlos Diaz',
        email: 'member3@example.com',
        password: 'Password123',
        role: 'TEAM_MEMBER'
      },
      {
        name: 'Diana Prince',
        email: 'member4@example.com',
        password: 'Password123',
        role: 'TEAM_MEMBER'
      }
    ]);

    const manager = users[0];
    const member1 = users[1];
    const member2 = users[2];
    const member3 = users[3];
    const member4 = users[4];

    // 2. Create Projects
    console.log('Creating projects...');
    const projects = await Project.create([
      {
        name: 'Mobile Banking App',
        description: 'Next-generation mobile banking experience with biometric login and instant transfers.',
        isActive: true
      },
      {
        name: 'Customer Portal Redesign',
        description: 'Modern customer self-service dashboard built with React and Tailwind CSS.',
        isActive: true
      },
      {
        name: 'Analytics & Reporting Pipeline',
        description: 'Real-time telemetry and financial audit reporting pipeline in Node.js & MongoDB.',
        isActive: true
      },
      {
        name: 'Cloud Infrastructure Migration',
        description: 'Containerization and Kubernetes cluster deployment on AWS.',
        isActive: true
      },
      {
        name: 'Payment Gateway Integration',
        description: 'PCI-compliant checkout with Apple Pay, Google Pay, and Stripe multi-currency.',
        isActive: true
      }
    ]);

    // Helper dates for previous 4 weeks
    const now = new Date();
    const getWeek = (weeksAgo) => {
      const d = new Date(now);
      d.setDate(d.getDate() - weeksAgo * 7);
      const day = d.getDay();
      const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diffToMonday));
      monday.setHours(0, 0, 0, 0);

      const friday = new Date(monday);
      friday.setDate(friday.getDate() + 4);
      friday.setHours(23, 59, 59, 999);

      return { weekStart: monday, weekEnd: friday };
    };

    const week4 = getWeek(3); // 3 weeks ago
    const week3 = getWeek(2); // 2 weeks ago
    const week2 = getWeek(1); // 1 week ago
    const week1 = getWeek(0); // current week

    console.log('Creating reports and reviews...');

    // Week 4: All 4 approved
    const rep1 = await Report.create({
      user: member1._id,
      weekStart: week4.weekStart,
      weekEnd: week4.weekEnd,
      project: projects[0]._id,
      tasks: [
        {
          taskName: 'Implement Biometric Auth Module',
          priority: 'HIGH',
          plannedPercentage: 100,
          actualPercentage: 100,
          status: 'COMPLETED',
          plannedHours: 20,
          actualHours: 22,
          deliverable: 'PR #102 merged with FaceID/TouchID support'
        },
        {
          taskName: 'Keychain Secure Storage Helper',
          priority: 'MEDIUM',
          plannedPercentage: 100,
          actualPercentage: 100,
          status: 'COMPLETED',
          plannedHours: 15,
          actualHours: 14,
          deliverable: 'Unit tests passed 100%'
        }
      ],
      plannedTasks: 'Next week: Wire authentication into navigation flow.',
      blockers: '',
      keyBlocker: '',
      achievements: 'Biometric flow passes Apple guidelines inspection.',
      keyAchievement: 'FaceID latency under 200ms.',
      hoursWorked: { development: 26, testing: 8, meetings: 4, documentation: 2, other: 0 },
      notes: 'Smooth delivery this week.',
      status: 'APPROVED',
      submittedAt: new Date(week4.weekEnd),
      approvedAt: new Date(week4.weekEnd.getTime() + 86400000)
    });

    await Review.create({
      report: rep1._id,
      reviewer: manager._id,
      action: 'APPROVED',
      comment: 'Excellent work on the biometric integration.',
      createdAt: rep1.approvedAt
    });

    const rep2 = await Report.create({
      user: member2._id,
      weekStart: week4.weekStart,
      weekEnd: week4.weekEnd,
      project: projects[1]._id,
      tasks: [
        {
          taskName: 'Design customer landing layout',
          priority: 'HIGH',
          plannedPercentage: 100,
          actualPercentage: 100,
          status: 'COMPLETED',
          plannedHours: 25,
          actualHours: 24,
          deliverable: 'Responsive Figma designs translated to React'
        }
      ],
      plannedTasks: 'Begin billing widgets integration.',
      blockers: '',
      keyBlocker: '',
      achievements: 'Lighthouse score reached 98 on desktop.',
      keyAchievement: 'Sub-second first contentful paint.',
      hoursWorked: { development: 24, testing: 6, meetings: 5, documentation: 3, other: 1 },
      notes: 'Component library is standardizing nicely.',
      status: 'APPROVED',
      submittedAt: new Date(week4.weekEnd),
      approvedAt: new Date(week4.weekEnd.getTime() + 86400000)
    });

    await Review.create({
      report: rep2._id,
      reviewer: manager._id,
      action: 'APPROVED',
      comment: 'Looks great! Clean component structure.',
      createdAt: rep2.approvedAt
    });

    // Week 3: 2 Approved, 1 Needs Correction, 1 Submitted
    const rep3 = await Report.create({
      user: member3._id,
      weekStart: week3.weekStart,
      weekEnd: week3.weekEnd,
      project: projects[2]._id,
      tasks: [
        {
          taskName: 'Configure Kafka consumer for transaction logs',
          priority: 'HIGH',
          plannedPercentage: 100,
          actualPercentage: 70,
          status: 'IN_PROGRESS',
          plannedHours: 20,
          actualHours: 25,
          deliverable: 'Draft PR #44 created'
        }
      ],
      plannedTasks: 'Resolve partition lag issue.',
      blockers: 'Occasional connection timeout with stage Kafka cluster.',
      keyBlocker: 'Broker timeout on replica failover.',
      achievements: 'Benchmarked 15k events/second throughput.',
      keyAchievement: 'Event schema validated with Avro.',
      hoursWorked: { development: 25, testing: 8, meetings: 3, documentation: 2, other: 2 },
      notes: 'Infra team was alerted about broker issue.',
      status: 'NEEDS_CORRECTION',
      latestReviewComment: 'Please update actual hours and provide reproduction steps for the Kafka timeout.',
      submittedAt: new Date(week3.weekEnd)
    });

    await Review.create({
      report: rep3._id,
      reviewer: manager._id,
      action: 'REQUEST_CORRECTION',
      comment: 'Please update actual hours and provide reproduction steps for the Kafka timeout.',
      createdAt: new Date(week3.weekEnd.getTime() + 43200000)
    });

    const rep4 = await Report.create({
      user: member4._id,
      weekStart: week3.weekStart,
      weekEnd: week3.weekEnd,
      project: projects[3]._id,
      tasks: [
        {
          taskName: 'Helm charts setup for microservices',
          priority: 'MEDIUM',
          plannedPercentage: 100,
          actualPercentage: 100,
          status: 'COMPLETED',
          plannedHours: 18,
          actualHours: 16,
          deliverable: 'Merged Helm values into infra repo'
        }
      ],
      plannedTasks: 'Setup Prometheus alert rules.',
      blockers: '',
      keyBlocker: '',
      achievements: 'Automated cluster spin-up in under 6 minutes.',
      keyAchievement: 'Zero downtime rolling restart verified.',
      hoursWorked: { development: 20, testing: 10, meetings: 4, documentation: 4, other: 1 },
      notes: 'All charts linted cleanly.',
      status: 'APPROVED',
      submittedAt: new Date(week3.weekEnd),
      approvedAt: new Date(week3.weekEnd.getTime() + 86400000)
    });

    await Review.create({
      report: rep4._id,
      reviewer: manager._id,
      action: 'APPROVED',
      comment: 'Helm charts verified in staging cluster.',
      createdAt: rep4.approvedAt
    });

    // Week 2: 2 Submitted, 1 Needs Correction, 1 Approved
    const rep5 = await Report.create({
      user: member1._id,
      weekStart: week2.weekStart,
      weekEnd: week2.weekEnd,
      project: projects[0]._id,
      tasks: [
        {
          taskName: 'Account Summary Dashboard Screen',
          priority: 'HIGH',
          plannedPercentage: 100,
          actualPercentage: 100,
          status: 'COMPLETED',
          plannedHours: 20,
          actualHours: 20,
          deliverable: 'Full screen implemented with balance card and transaction list'
        }
      ],
      plannedTasks: 'Add pull-to-refresh and currency toggle.',
      blockers: '',
      keyBlocker: '',
      achievements: 'Smooth 60fps animations on both iOS and Android.',
      keyAchievement: 'Offline caching with SQLite verified.',
      hoursWorked: { development: 24, testing: 8, meetings: 4, documentation: 2, other: 0 },
      notes: 'Ready for manager review.',
      status: 'SUBMITTED',
      submittedAt: new Date(week2.weekEnd)
    });

    const rep6 = await Report.create({
      user: member2._id,
      weekStart: week2.weekStart,
      weekEnd: week2.weekEnd,
      project: projects[4]._id,
      tasks: [
        {
          taskName: 'Stripe Webhook Handler & Idempotency',
          priority: 'HIGH',
          plannedPercentage: 100,
          actualPercentage: 60,
          status: 'IN_PROGRESS',
          plannedHours: 20,
          actualHours: 22,
          deliverable: 'Signature verification unit tests'
        }
      ],
      plannedTasks: 'Complete edge cases for charge.refunded events.',
      blockers: 'Sandbox webhook latency spikes during testing.',
      keyBlocker: 'Webhook events dropped intermittently in test sandbox.',
      achievements: 'Implemented Redis-backed idempotency lock.',
      keyAchievement: 'Zero double-spend risk during rapid retries.',
      hoursWorked: { development: 22, testing: 10, meetings: 4, documentation: 2, other: 1 },
      notes: 'Need manager guidance on timeout threshold.',
      status: 'NEEDS_CORRECTION',
      latestReviewComment: 'Please detail the Redis lock timeout duration and add deliverable link.',
      submittedAt: new Date(week2.weekEnd)
    });

    await Review.create({
      report: rep6._id,
      reviewer: manager._id,
      action: 'REQUEST_CORRECTION',
      comment: 'Please detail the Redis lock timeout duration and add deliverable link.',
      createdAt: new Date(week2.weekEnd.getTime() + 50000000)
    });

    // Week 1 (Current): 2 Submitted, 2 Drafts
    const rep7 = await Report.create({
      user: member3._id,
      weekStart: week1.weekStart,
      weekEnd: week1.weekEnd,
      project: projects[2]._id,
      tasks: [
        {
          taskName: 'Aggregated Daily Revenue Summary Worker',
          priority: 'HIGH',
          plannedPercentage: 80,
          actualPercentage: 75,
          status: 'IN_PROGRESS',
          plannedHours: 22,
          actualHours: 20,
          deliverable: 'Cron job script running in worker dyno'
        }
      ],
      plannedTasks: 'Add Slack alert webhook on discrepancy.',
      blockers: '',
      keyBlocker: '',
      achievements: 'Database query runtime dropped from 12s to 450ms with indexing.',
      keyAchievement: 'Compound index on transactionDate & status.',
      hoursWorked: { development: 20, testing: 6, meetings: 3, documentation: 2, other: 0 },
      notes: 'Submitted for manager review.',
      status: 'SUBMITTED',
      submittedAt: new Date()
    });

    const rep8 = await Report.create({
      user: member4._id,
      weekStart: week1.weekStart,
      weekEnd: week1.weekEnd,
      project: projects[3]._id,
      tasks: [
        {
          taskName: 'Terraform AWS EKS Provisioning Script',
          priority: 'HIGH',
          plannedPercentage: 100,
          actualPercentage: 100,
          status: 'COMPLETED',
          plannedHours: 25,
          actualHours: 24,
          deliverable: 'Tested terraform plan with 0 errors'
        }
      ],
      plannedTasks: 'Setup ingress-nginx controller.',
      blockers: '',
      keyBlocker: '',
      achievements: 'VPC and subnet isolation created according to security spec.',
      keyAchievement: 'Public/private subnets with NAT gateways.',
      hoursWorked: { development: 24, testing: 8, meetings: 4, documentation: 3, other: 1 },
      notes: 'Awaiting manager approval.',
      status: 'SUBMITTED',
      submittedAt: new Date()
    });

    // Draft reports for Member 1 and Member 2
    await Report.create({
      user: member1._id,
      weekStart: week1.weekStart,
      weekEnd: week1.weekEnd,
      project: projects[0]._id,
      tasks: [
        {
          taskName: 'Wireframe Bill Pay Feature',
          priority: 'MEDIUM',
          plannedPercentage: 50,
          actualPercentage: 30,
          status: 'IN_PROGRESS',
          plannedHours: 15,
          actualHours: 8,
          deliverable: 'Initial screen layouts'
        }
      ],
      plannedTasks: 'Complete API connector.',
      blockers: '',
      keyBlocker: '',
      achievements: 'Selected UI component library.',
      keyAchievement: '',
      hoursWorked: { development: 8, testing: 2, meetings: 2, documentation: 1, other: 0 },
      notes: 'Work in progress draft.',
      status: 'DRAFT'
    });

    await Report.create({
      user: member2._id,
      weekStart: week1.weekStart,
      weekEnd: week1.weekEnd,
      project: projects[1]._id,
      tasks: [
        {
          taskName: 'Profile Settings Tab Redesign',
          priority: 'LOW',
          plannedPercentage: 40,
          actualPercentage: 20,
          status: 'IN_PROGRESS',
          plannedHours: 12,
          actualHours: 4,
          deliverable: 'Draft component'
        }
      ],
      plannedTasks: 'Add notification toggles.',
      blockers: '',
      keyBlocker: '',
      achievements: '',
      keyAchievement: '',
      hoursWorked: { development: 4, testing: 1, meetings: 2, documentation: 0, other: 0 },
      notes: 'Initial work draft for this week.',
      status: 'DRAFT'
    });

    console.log('--------------------------------------------------');
    console.log('Seed completed successfully!');
    console.log('Created:');
    console.log('  - 1 Manager: manager@example.com (Password: Password123)');
    console.log('  - 4 Team Members: member1@example.com to member4@example.com (Password: Password123)');
    console.log('  - 5 Projects');
    console.log('  - 10 Reports across 4 weeks (APPROVED, NEEDS_CORRECTION, SUBMITTED, DRAFT)');
    console.log('  - Realistic review history and dashboard metrics');
    console.log('--------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedDatabase();
