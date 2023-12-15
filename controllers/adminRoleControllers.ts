import { Request, Response } from 'express';
import connection from '../db';
import { getRoleByNameOrId } from '../helpers/helpers';

export const getAllRoles = (req: Request, res: Response) => {
  connection.query('SELECT * FROM roles', (err, roles) => {
    if (err) {
      console.error('Error fetching roles:', err);
      return res.status(500).json({ error: 'Error fetching roles' });
    }

    res.json({ roles });
  });
};

export const createRole = (req: Request, res: Response) => {
  const { roleName } = req.body;

  if (!roleName) {
    return res.status(400).json({ error: 'Role name is required' });
  }

  connection.query(
    'SELECT id FROM roles WHERE name = ?',
    [roleName],
    (selectErr, selectResult) => {
      if (selectErr) {
        console.error('Error during role check:', selectErr);
        return res.status(500).json({ error: 'Error during role check' });
      }

      if (selectResult.length > 0) {
        return res
          .status(400)
          .json({ error: 'Role with this name already exists' });
      }

      connection.query(
        'INSERT INTO roles (name) VALUES (?)',
        [roleName],
        (err, result) => {
          if (err) {
            console.error('Error during role creation:', err);
            return res
              .status(500)
              .json({ error: 'Error during role creation' });
          }

          const roleId = result.insertId;

          res.json({ message: 'Role created successfully', id: roleId });
        },
      );
    },
  );
};

export const updateRole = async (req: Request, res: Response) => {
  const { roleName: identifier, newRoleName } = req.body;

  if (!identifier || !newRoleName) {
    return res
      .status(400)
      .json({ error: 'Role name or ID and new role name are required' });
  }

  try {
    const existingRole = await getRoleByNameOrId(identifier);

    if (!existingRole || !existingRole.id || !existingRole.name) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const roleIdToUpdate = existingRole.id;

    connection.query(
      'SELECT id FROM roles WHERE name = ? AND id != ?',
      [newRoleName, roleIdToUpdate],
      (selectErr, selectResult) => {
        if (selectErr) {
          console.error('Error during role check:', selectErr);
          return res.status(500).json({ error: 'Error during role check' });
        }

        if (selectResult.length > 0) {
          return res
            .status(400)
            .json({ error: 'Role with this name already exists' });
        }

        connection.query(
          'UPDATE roles SET name = ? WHERE id = ?',
          [newRoleName, roleIdToUpdate],
          (err) => {
            if (err) {
              console.error('Error during role update:', err);
              return res
                .status(500)
                .json({ error: 'Error during role update' });
            }

            connection.query(
              'UPDATE user_roles SET rolename = ? WHERE rolename = ?',
              [newRoleName, existingRole.name],
              (errUpdateUserRole) => {
                if (errUpdateUserRole) {
                  console.error(
                    'Error during user_roles update:',
                    errUpdateUserRole,
                  );
                  return res
                    .status(500)
                    .json({ error: 'Error during user_roles update' });
                }

                res.json({ message: 'Role updated successfully' });
              },
            );
          },
        );
      },
    );
  } catch (err) {
    console.error('Error checking if role exists:', err);
    return res.status(500).json({ error: 'Error checking if role exists' });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  const { roleId } = req.params;

  try {
    const roleIdNumber = parseInt(roleId, 10);
    if (!isNaN(roleIdNumber)) {
      connection.query(
        'DELETE FROM roles WHERE id = ?',
        [roleIdNumber],
        (err, result) => {
          if (err) {
            console.error('Error during role deletion by ID:', err);
            return res
              .status(500)
              .json({ error: 'Error during role deletion by ID' });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Role not found' });
          }

          res.json({
            message: 'Role deleted successfully',
            id: roleIdNumber,
          });
        },
      );
    } else {
      return res.status(400).json({ error: 'Invalid roleId' });
    }
  } catch (err) {
    console.error('Error deleting role:', err);
    return res.status(500).json({ error: 'Error deleting role' });
  }
};
