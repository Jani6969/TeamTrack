const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../src/app');
const User = require('../src/models/User');
const generateToken = require('../src/utils/generateToken');

describe('AI Copilot & Team Intelligence Integration Tests', () => {
  let managerToken;
  let memberToken;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/weekly-report-system';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    let manager = await User.findOne({ email: 'manager@example.com' });
    let member = await User.findOne({ email: 'member1@example.com' });

    if (!manager) {
      manager = await User.create({
        name: 'Sarah Connor',
        email: 'manager@example.com',
        password: 'Password123',
        role: 'MANAGER'
      });
    }

    if (!member) {
      member = await User.create({
        name: 'Alex Johnson',
        email: 'member1@example.com',
        password: 'Password123',
        role: 'TEAM_MEMBER'
      });
    }

    managerToken = generateToken(manager);
    memberToken = generateToken(member);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // TEST 1: Unauthenticated request to /api/ai/chat returns 401
  test('Unauthenticated user cannot access AI chat (401 Unauthorized)', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ message: 'Hello' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // TEST 2: Fetch suggested prompts
  test('Authenticated user can fetch dynamic suggested prompts (200 OK)', async () => {
    const res = await request(app)
      .get('/api/ai/suggestions')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.prompts)).toBe(true);
    expect(res.body.data.prompts.length).toBeGreaterThan(0);
  });

  // TEST 3: Team member cannot trigger executive summary (403 Forbidden)
  test('Team member cannot generate executive team summary (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/ai/summary')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // TEST 4: Chat input validation (empty message returns 400)
  test('Empty chat message returns 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ message: '   ' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
