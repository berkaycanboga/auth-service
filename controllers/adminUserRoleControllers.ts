import { Request, Response } from 'express';
import connection from '../db';
import { getUserByIdOrUsername, getRoleByNameOrId } from '../helpers/helpers';

export const assignUserToRole = async (req: Request, res: Response) => {
  try {
    const { identifier, roleIdentifier } = req.body;

    if (!identifier || !roleIdentifier) {
      return res
        .status(400)
        .json({ error: 'User identifier and role identifier are required' });
    }

    const existingUser = await getUserByIdOrUsername(identifier);
    const existingRole = await getRoleByNameOrId(roleIdentifier);

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const rolename = existingRole.name;

    connection.query(
      'INSERT INTO user_roles (user_id, role_id, username, rolename) VALUES (?, ?, ?, ?)',
      [existingUser.id, existingRole.id, existingUser.username, rolename],
      (err) => {
        if (err) {
          console.error('Error during user role assignment:', err);
          return res
            .status(500)
            .json({ error: 'Error assigning user to role' });
        }

        res.json({ message: 'User assigned to role successfully' });
      },
    );
  } catch (error) {
    console.error('Error assigning user to role:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUsersByRole = async (req: Request, res: Response) => {
  try {
    const roleIdentifier = req.body.roleIdentifier as string;

    if (!roleIdentifier) {
      return res.status(400).json({ error: 'Role identifier is required' });
    }

    const existingRole = await getRoleByNameOrId(roleIdentifier);

    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    connection.query(
      'SELECT users.*, user_roles.username ' +
        'FROM users ' +
        'JOIN user_roles ON users.id = user_roles.user_id ' +
        'WHERE user_roles.rolename = ? OR user_roles.role_id = ?',
      [roleIdentifier, existingRole.id],
      (err, results) => {
        if (err) {
          console.error('Error retrieving users by role:', err);
          return res
            .status(500)
            .json({ error: 'Error retrieving users by role' });
        }

        res.json({ users: results });
      },
    );
  } catch (error) {
    console.error('Error retrieving users by role:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const removeUserFromRole = async (req: Request, res: Response) => {
  try {
    const { identifier, roleIdentifier } = req.body;

    if (!identifier || !roleIdentifier) {
      return res
        .status(400)
        .json({ error: 'User identifier and role identifier are required' });
    }

    const existingUser = await getUserByIdOrUsername(identifier);
    const existingRole = await getRoleByNameOrId(roleIdentifier);

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    connection.query(
      'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?',
      [existingUser.id, existingRole.id],
      (err) => {
        if (err) {
          console.error('Error removing user from role:', err);
          return res
            .status(500)
            .json({ error: 'Error removing user from role' });
        }

        res.json({ message: 'User removed from role successfully' });
      },
    );
  } catch (error) {
    console.error('Error removing user from role:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
