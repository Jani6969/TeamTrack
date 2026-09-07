const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../src/app');
const User = require('../src/models/User');
const Report = require('../src/models/Report');
const Project = require('../src/models/Project');
const generateToken = require('../src/utils/generateToken');

describe('Role-Based Access Control (RBAC) & Ownership Tests', () => {
  let managerToken;
  let member1Token;
  let member2Token;
  let member1ReportId;
  let member2ReportId;

  beforeAll(async () => {
    // Connect to database for tests
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/weekly-report-system';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Retrieve seeded manager and members
    const manager = await User.findOne({ email: 'manager@example.com' });
    const member1 = await User.findOne({ email: 'member1@example.com' });
    const member2 = await User.findOne({ email: 'member2@example.com' });

    managerToken = generateToken(manager);
    member1Token = generateToken(member1);
    member2Token = generateToken(member2);

    // Find a report owned by member 1
    const report1 = await Report.findOne({ user: member1._id });
    member1ReportId = report1._id.toString();

    // Find a report owned by member 2
    const report2 = await Report.findOne({ user: member2._id });
    member2ReportId = report2._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // TEST 1: Team member cannot access manager dashboard
  test('Team member cannot access manager dashboard (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${member1Token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/access denied/i);
  });

  // TEST 2: Manager CAN access manager dashboard
  test('Manager can access manager dashboard (200 OK)', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalReportsSubmitted');
    expect(res.body.data).toHaveProperty('submissionComplianceRate');
  });

  // TEST 3: Team member cannot access another team member\'s report
  test('Team member cannot access another member\'s report (403 Forbidden)', async () => {
    // Member 1 attempts to access Member 2's report
    const res = await request(app)
      .get(`/api/reports/${member2ReportId}`)
      .set('Authorization', `Bearer ${member1Token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  // TEST 4: Team member CAN access their own report
  test('Team member can access their own report (200 OK)', async () => {
    const res = await request(app)
      .get(`/api/reports/${member1ReportId}`)
      .set('Authorization', `Bearer ${member1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.report._id).toBe(member1ReportId);
  });

  // TEST 5: Team member cannot access manager-only user management API
  test('Team member cannot access user management API (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${member1Token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // TEST 6: Unauthenticated request is rejected (401 Unauthorized)
  test('Unauthenticated request without token is rejected (401 Unauthorized)', async () => {
    const res = await request(app).get('/api/reports/my');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no token provided/i);
  });
});
