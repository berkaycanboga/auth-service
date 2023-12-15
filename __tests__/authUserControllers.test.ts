import request from 'supertest';
import app from '../app';
import connection from '../db';

describe('Authentication Routes', () => {
  describe('User Signup', () => {
    test('should create a new user successfully', async () => {
      const response = await request(app)
        .post('/signup')
        .send({ username: 'TestUser', password: 'TestPassword' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Signup successful');
      expect(response.body).toHaveProperty('username', 'TestUser');
      expect(response.body).toHaveProperty('token');
    });

    test('should return 400 for missing username or password', async () => {
      const response = await request(app).post('/signup').send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Username and password are required',
      });
    });
  });

  describe('User Login', () => {
    test('should log in with correct credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({ username: 'TestUser', password: 'TestPassword' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'TestUser');
    });

    test('should return 400 for missing username or password', async () => {
      const response = await request(app).post('/login').send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Username and password are required',
      });
    });
  });

  describe('User Logout', () => {
    test('should log out successfully', async () => {
      const response = await request(app).get('/logout');

      expect(response.status).toBe(302);
    });
  });

  afterAll(async () => {
    try {
      const deleteByUsernameQuery = 'DELETE FROM users WHERE username = ?';
      const deleteByUsernameParams = ['TestUser'];

      await connection.query(deleteByUsernameQuery, deleteByUsernameParams);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });
});
