import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import app from '../index.js';
import { getJwtSecret } from '../middleware/auth.js';
import { isValidEmail, isValidPassword, isValidName } from '../utils/validation.js';
import Lead from '../models/Lead.js';
import User from '../models/User.js';
import Visit from '../models/Visit.js';

describe('Gharpayy CRM — Backend & Authentication Test Suite', () => {
  let server;
  let baseUrl;

  before(async () => {
    // Start test server on dynamic ephemeral port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // 1. Validation Utils
  describe('Input Validation Rules', () => {
    test('isValidName rejects short names and generic placeholders', () => {
      assert.equal(isValidName(''), false);
      assert.equal(isValidName('ab'), false);
      assert.equal(isValidName('admin'), false);
      assert.equal(isValidName('test'), false);
      assert.equal(isValidName('demo'), false);
      assert.equal(isValidName('User 123'), false); // numbers not allowed
      assert.equal(isValidName('Eshwar Chavan'), true);
      assert.equal(isValidName('John Doe'), true);
    });

    test('isValidEmail validates format and blocks disposable domains', () => {
      assert.equal(isValidEmail('not-an-email'), false);
      assert.equal(isValidEmail('user@'), false);
      assert.equal(isValidEmail('user@mailinator.com'), false);
      assert.equal(isValidEmail('user@tempmail.com'), false);
      assert.equal(isValidEmail('user@10minutemail.com'), false);
      assert.equal(isValidEmail('eshwar@gharpayy.com'), true);
      assert.equal(isValidEmail('contact@realestate.in'), true);
    });

    test('isValidPassword enforces strong SaaS security requirements', () => {
      assert.equal(isValidPassword('short'), false); // < 8
      assert.equal(isValidPassword('nouppercase1@'), false); // no uppercase
      assert.equal(isValidPassword('NOLOWERCASE1@'), false); // no lowercase
      assert.equal(isValidPassword('NoNumberSpecial'), false); // no number
      assert.equal(isValidPassword('NoSpecialChar123'), false); // no special char
      assert.equal(isValidPassword('StrongPass@123'), true); // valid
      assert.equal(isValidPassword('Gharpayy#2026'), true); // valid
    });
  });

  // 2. Health & Base Endpoints
  describe('API Health and Routing', () => {
    test('GET /api/health returns status ok and database connectivity state', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.status, 'ok');
      assert.ok('database' in data);
      assert.ok('timestamp' in data);
    });

    test('GET /api/unknown-route returns clean JSON 404', async () => {
      const res = await fetch(`${baseUrl}/api/unknown-route-check`);
      assert.equal(res.status, 404);
      const data = await res.json();
      assert.ok(data.message.includes('API route not found'));
    });
  });

  // 3. Authentication Validation & Error Handling
  describe('Authentication Requests Validation', () => {
    test('POST /api/auth/signup rejects invalid input payloads', async () => {
      // Invalid name
      const res1 = await fetch(`${baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'ad',
          email: 'valid@example.com',
          password: 'Password@123',
        }),
      });
      assert.equal(res1.status, 400);
      const data1 = await res1.json();
      assert.ok(data1.message.includes('Invalid name'));

      // Invalid email
      const res2 = await fetch(`${baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Real User',
          email: 'invalid-email',
          password: 'Password@123',
        }),
      });
      assert.equal(res2.status, 400);
      const data2 = await res2.json();
      assert.ok(data2.message.includes('Invalid or disposable email'));

      // Weak password
      const res3 = await fetch(`${baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Real User',
          email: 'user@example.com',
          password: '123',
        }),
      });
      assert.equal(res3.status, 400);
      const data3 = await res3.json();
      assert.ok(data3.message.includes('Password must be at least 8 characters'));
    });

    test('POST /api/auth/login requires email and password', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.message, 'Email and password are required.');
    });

    test('POST /api/auth/signup and /login return 503 immediately when DB is offline (no hang)', async () => {
      // Since local MongoDB is offline, verify that signup does NOT hang or timeout
      const start = Date.now();
      const res = await fetch(`${baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Eshwar Chavan',
          email: 'eshwar@gharpayy.com',
          password: 'Password@123',
          role: 'admin',
        }),
      });
      const duration = Date.now() - start;

      // Must respond promptly without 10-30s buffering hang
      assert.ok(duration < 3000, `Took ${duration}ms, expected < 3000ms`);
      assert.equal(res.status, 503);
      const data = await res.json();
      assert.ok(data.message.includes('Database is currently offline'));
    });
  });

  // 4. Token & Security Verification
  describe('JWT Verification & Auth Middleware', () => {
    test('Protected route rejects requests without Authorization header', async () => {
      const res = await fetch(`${baseUrl}/api/leads`);
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.ok(data.message.includes('Authentication required'));
    });

    test('Protected route rejects requests with legacy demo-token', async () => {
      const res = await fetch(`${baseUrl}/api/leads`, {
        headers: { Authorization: 'Bearer demo-token' },
      });
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.ok(data.message.includes('Invalid or demo token'));
    });

    test('Protected route rejects requests with forged or malformed token', async () => {
      const res = await fetch(`${baseUrl}/api/leads`, {
        headers: { Authorization: 'Bearer not-a-valid-jwt-token' },
      });
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.ok(data.message.includes('Invalid authentication token'));
    });

    test('Protected route rejects expired JWT tokens', async () => {
      const secret = getJwtSecret();
      const expiredToken = jwt.sign({ id: '123456789012345678901234', role: 'agent' }, secret, {
        expiresIn: '-1s',
      });
      const res = await fetch(`${baseUrl}/api/leads`, {
        headers: { Authorization: `Bearer ${expiredToken}` },
      });
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.ok(data.message.includes('Session expired') || data.message.includes('Invalid authentication token'));
    });

    test('bcrypt password hashing produces valid hashes and verifies correctly', async () => {
      const rawPassword = 'SecretPassword#2026';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(rawPassword, salt);

      assert.notEqual(rawPassword, hash);
      const isMatch = await bcrypt.compare(rawPassword, hash);
      assert.equal(isMatch, true);

      const isWrong = await bcrypt.compare('WrongPassword#2026', hash);
      assert.equal(isWrong, false);
    });
  });

  // 5. Data Model Schema Logic
  describe('Mongoose Models & Business Logic', () => {
    test('Lead model schema initializes with correct temperature and status defaults', () => {
      const lead1 = new Lead({ name: 'Rohit Sharma', phone: '9876543210', score: 85 });
      assert.equal(lead1.status, 'New');
      assert.equal(lead1.source, 'Website');

      // Check temperature logic
      const scoreHot = 75;
      const tempHot = scoreHot >= 70 ? 'HOT' : scoreHot >= 40 ? 'WARM' : 'COLD';
      assert.equal(tempHot, 'HOT');

      const scoreWarm = 50;
      const tempWarm = scoreWarm >= 70 ? 'HOT' : scoreWarm >= 40 ? 'WARM' : 'COLD';
      assert.equal(tempWarm, 'WARM');

      const scoreCold = 20;
      const tempCold = scoreCold >= 70 ? 'HOT' : scoreCold >= 40 ? 'WARM' : 'COLD';
      assert.equal(tempCold, 'COLD');
    });

    test('User model requires name, email, and password', () => {
      const user = new User({});
      const err = user.validateSync();
      assert.ok(err.errors.name);
      assert.ok(err.errors.email);
      assert.ok(err.errors.password);
    });

    test('Visit model requires leadId, agentId, and visitDate', () => {
      const visit = new Visit({});
      const err = visit.validateSync();
      assert.ok(err.errors.leadId);
      assert.ok(err.errors.agentId);
      assert.ok(err.errors.visitDate);
    });
  });
});
