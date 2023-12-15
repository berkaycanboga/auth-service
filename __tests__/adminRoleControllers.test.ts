import request from 'supertest';
import app from '../app';
import connection from '../db';

describe('Role CRUD Operations', () => {
  const createdRoleIds: number[] = [];

  describe('Create Role', () => {
    test('should create a new role successfully', async () => {
      const response = await request(app)
        .post('/api/v1/role')
        .send({ roleName: 'TestRoleToCreate' });

      const roleIdToDelete = response.body.id;

      createdRoleIds.push(roleIdToDelete);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toEqual({
        id: roleIdToDelete,
        message: 'Role created successfully',
      });
    });

    test('should return 400 for missing role name during role creation', async () => {
      const response = await request(app).post('/api/v1/role').send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Role name is required' });
    });
  });

  describe('Update Role', () => {
    test('should update role successfully', async () => {
      const createRoleResponse = await request(app)
        .post('/api/v1/role')
        .send({ roleName: 'TestRoleToUpdate' });

      const roleIdToDelete = createRoleResponse.body.id;
      createdRoleIds.push(roleIdToDelete);

      const updateResponse = await request(app)
        .post(`/api/v1/role/${roleIdToDelete}`)
        .send({ roleName: 'TestRoleToUpdate', newRoleName: 'UpdatedTestRole' });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body).toEqual({
        message: 'Role updated successfully',
      });
    });

    test('should return 400 for missing parameters during role update', async () => {
      const response = await request(app).post(`/api/v1/role/99999`).send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Role name or ID and new role name are required',
      });
    });

    test('should return 404 for non-existing role during update', async () => {
      const nonExistingRoleId = 999;

      const response = await request(app)
        .post(`/api/v1/role/${nonExistingRoleId}`)
        .send({
          roleName: 'NonExistingRole',
          newRoleName: 'UpdatedNonExistingRole',
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Role not found' });
    });
  });

  describe('Delete Role', () => {
    test('should delete role successfully', async () => {
      const createRoleResponse = await request(app)
        .post('/api/v1/role')
        .send({ roleName: 'TestRoleToDelete' });

      const roleIdToDelete = createRoleResponse.body.id;

      createdRoleIds.push(roleIdToDelete);

      const response = await request(app)
        .delete(`/api/v1/role/${roleIdToDelete}`)
        .send({ roleName: 'TestRoleToDelete' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: roleIdToDelete,
        message: 'Role deleted successfully',
      });
    });

    test('should return 404 for non-existing role during deletion', async () => {
      const nonExistingRoleId = 999;

      const response = await request(app)
        .delete(`/api/v1/role/${nonExistingRoleId}`)
        .send({ roleName: 'NonExistingRoleToDelete' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Role not found' });
    });
  });

  describe('Fetch Roles', () => {
    test('should fetch all roles successfully', async () => {
      const response = await request(app).get('/api/v1/role/all-roles');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('roles');
      expect(response.body.roles).toBeInstanceOf(Array);
    });
  });

  afterAll(async () => {
    try {
      const deleteRoleQuery = 'DELETE FROM roles WHERE id IN (?)';
      await connection.query(deleteRoleQuery, [createdRoleIds]);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });
});
