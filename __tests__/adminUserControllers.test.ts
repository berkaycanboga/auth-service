import request from 'supertest';
import app from '../app';
import connection from '../db';

describe('User Role CRUD Operations', () => {
  let roleId: number;
  let userId: number;

  beforeAll(async () => {
    try {
      const createRoleResponse = await request(app)
        .post('/api/v1/role')
        .send({ roleName: 'TestRole' });

      roleId = createRoleResponse.body.id;

      const createUserResponse = await request(app)
        .post('/signup')
        .send({ username: 'TestUser', password: 'TestPassword' });

      if (!createUserResponse.body || !createUserResponse.body.userId) {
        throw new Error('User creation failed');
      }

      userId = createUserResponse.body.userId;
    } catch (error) {
      console.error('Error during setup:', (error as Error).message);
    }
  });

  describe('Assign User To A Role', () => {
    test('should assign user to role successfully', async () => {
      const response = await request(app)
        .post(`/api/v1/role/${roleId}/${userId}`)
        .send({ identifier: 'TestUser', roleIdentifier: 'TestRole' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'User assigned to role successfully',
      });
    });

    test('should return 400 for missing identifiers', async () => {
      const response = await request(app)
        .post(`/api/v1/role/${roleId}/${userId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'User identifier and role identifier are required',
      });
    });

    test('should return 404 for non-existing user', async () => {
      const response = await request(app)
        .post(`/api/v1/role/${roleId}/nonExistingUserId`)
        .send({ identifier: 'non-existing-user', roleIdentifier: 'TestRole' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'User not found',
      });
    });

    test('should return 404 for non-existing role', async () => {
      const response = await request(app)
        .post(`/api/v1/role/nonExistingRoleId/${userId}`)
        .send({ identifier: 'TestUser', roleIdentifier: 'non-existing-role' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Role not found',
      });
    });
  });

  describe('Get Users By Role', () => {
    test('should retrieve users by role successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/role/${roleId}/users`)
        .send({ roleIdentifier: 'TestRole' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body.users).toBeInstanceOf(Array);
    });

    test('should return 400 for missing role identifier', async () => {
      const response = await request(app)
        .get(`/api/v1/role/${roleId}/users`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Role identifier is required',
      });
    });

    test('should return 404 for non-existing role', async () => {
      const response = await request(app)
        .get('/api/v1/role/nonExistingRoleId/users')
        .send({ roleIdentifier: 'non-existing-role' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Role not found',
      });
    });
  });

  describe('Remove User From a Role', () => {
    test('should remove user from role successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/role/${roleId}/${userId}`)
        .send({ identifier: 'TestUser', roleIdentifier: 'TestRole' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'User removed from role successfully',
      });
    });

    test('should return 400 for missing identifiers', async () => {
      const response = await request(app)
        .delete(`/api/v1/role/${roleId}/${userId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'User identifier and role identifier are required',
      });
    });

    test('should return 404 for non-existing user', async () => {
      const response = await request(app)
        .delete(`/api/v1/role/${roleId}/nonExistingUserId`)
        .send({ identifier: 'non-existing-user', roleIdentifier: 'TestRole' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'User not found',
      });
    });

    test('should return 404 for non-existing role', async () => {
      const response = await request(app)
        .delete(`/api/v1/role/nonExistingRoleId/${userId}`)
        .send({ identifier: 'TestUser', roleIdentifier: 'non-existing-role' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Role not found',
      });
    });
  });

  afterAll(async () => {
    try {
      const deleteByUsernameQuery = 'DELETE FROM users WHERE username = ?';
      const deleteByUsernameParams = ['TestUser'];

      await connection.query(deleteByUsernameQuery, deleteByUsernameParams);

      const deleteRoleQuery = 'DELETE FROM roles WHERE id = ?';
      const deleteRoleParams = [roleId];

      await connection.query(deleteRoleQuery, deleteRoleParams);

      const deleteUserRolesQuery = 'DELETE FROM user_roles WHERE role_id = ?';
      const deleteUserRolesParams = [roleId];

      await connection.query(deleteUserRolesQuery, deleteUserRolesParams);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });
});
