const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app'); // Import your Express app
const User = require('../../models/User');

// Note: The global setup in `tests/setupFile.js` handles DB connection and disconnection.
// `global.clearDatabase()` can be used here if needed before each test or describe block.

describe('Auth API Endpoints', () => {
  // Utility to create a user directly for testing login or protected routes
  const createUser = async (userData) => {
    return await User.create(userData);
  };

  // Clear User collection before each test in this suite
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          passwordConfirm: 'password123',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name', 'Test User');
      expect(res.body.data).toHaveProperty('email', 'test@example.com');
      expect(res.body).toHaveProperty('token');
      expect(res.headers['set-cookie']).toBeDefined(); // Check for cookie

      // Check if user was actually saved to the DB
      const userInDb = await User.findOne({ email: 'test@example.com' });
      expect(userInDb).not.toBeNull();
      expect(userInDb.name).toBe('Test User');
    });

    it('should fail to register with missing fields (e.g., email)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User Missing',
          password: 'password123',
          passwordConfirm: 'password123',
        });
      // Zod validation middleware now returns 400 with specific error structure
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toBe('Invalid input data.');
      expect(res.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ path: 'email', message: 'Email is required' })
      ]));
    });

    it('should fail to register if passwords do not match', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User Mismatch',
          email: 'mismatch@example.com',
          password: 'password123',
          passwordConfirm: 'password456',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ path: 'passwordConfirm', message: "Passwords don't match" })
      ]));
    });

    it('should fail to register if email is already taken', async () => {
      await createUser({ name: 'Existing User', email: 'taken@example.com', password: 'password123' });
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'New User',
          email: 'taken@example.com',
          password: 'password789',
          passwordConfirm: 'password789',
        });
      expect(res.statusCode).toEqual(409); // 409 Conflict from authService
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User with this email already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Ensure a user exists to test login
      await createUser({ name: 'Login User', email: 'login@example.com', password: 'password123' });
    });

    it('should login an existing user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', 'login@example.com');
      expect(res.body).toHaveProperty('token');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail to login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        });
      expect(res.statusCode).toEqual(401); // Unauthorized from authService
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Incorrect email or password');
    });

    it('should fail to login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nosuchuser@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Incorrect email or password');
    });

    it('should fail to login if email field is missing', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                password: 'password123',
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toBe('fail');
        expect(res.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({ path: 'email', message: 'Email is required' })
        ]));
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let token;
    let userId;

    beforeEach(async () => {
      const user = await createUser({ name: 'Me User', email: 'me@example.com', password: 'password123' });
      userId = user._id;
      // Login to get a token
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'me@example.com', password: 'password123' });
      token = loginRes.body.token;
    });

    it('should get current user details with a valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [`token=${token}`]); // Or .set('Authorization', `Bearer ${token}`) if you use Bearer tokens primarily

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id', userId.toString());
      expect(res.body.data).toHaveProperty('email', 'me@example.com');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should fail to get user details without a token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.statusCode).toEqual(401); // Unauthorized from protect middleware
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Not authorized');
    });

    it('should fail to get user details with an invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', ['token=invalidtoken123']);
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('invalid token');
    });
  });

  describe('GET /api/v1/auth/logout', () => {
    it('should logout the user and clear the token cookie', async () => {
      // First, register and login to get a valid session/cookie
      await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Logout User', email: 'logout@example.com', password: 'password123', passwordConfirm: 'password123' });

      const loginAgent = request.agent(app); // Use agent to persist cookies
      await loginAgent
        .post('/api/v1/auth/login')
        .send({ email: 'logout@example.com', password: 'password123' });

      // Now, logout
      const res = await loginAgent.get('/api/v1/auth/logout');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');

      // Check that the cookie is cleared or set to 'none' and expired
      const cookieHeader = res.headers['set-cookie'];
      expect(cookieHeader).toBeDefined();
      expect(cookieHeader[0]).toMatch(/token=none;/);
      expect(cookieHeader[0]).toMatch(/expires=/i); // Check if an expiry date is set (should be in the past or very soon)
    });
  });

});
