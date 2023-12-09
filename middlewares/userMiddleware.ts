import { Request, Response } from 'express';
import connection from '../db';
import bcrypt from 'bcrypt';

const getUserByUsername = (username: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    connection.query(
      'SELECT * FROM users WHERE username = ?',
      [username],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]);
        }
      }
    );
  });
};

const updateUser = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res
      .status(400)
      .json({ error: 'New password is required for update' });
  }

  try {
    console.log('Update user route reached');
    const user = await getUserByUsername(username);
    console.log('Updating user with username:', username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    connection.query(
      'UPDATE users SET password = ? WHERE username = ?',
      [hashedPassword, username],
      err => {
        if (err) {
          console.error('Error during update:', err);
          return res.status(500).json({ error: 'Error during update' });
        }

        res.json({ message: 'User updated successfully' });
      }
    );
  } catch (error) {
    console.error('Error during update:', error);
    res.status(500).json({ error: 'Error during update' });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { username } = req.params;

  try {
    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    connection.query(
      'DELETE FROM users WHERE username = ?',
      [username],
      err => {
        if (err) {
          console.error('Error during delete:', err);
          return res.status(500).json({ error: 'Error during delete' });
        }

        res.json({ message: 'User deleted successfully' });
      }
    );
  } catch (error) {
    console.error('Error during delete:', error);
    res.status(500).json({ error: 'Error during delete' });
  }
};

export { getUserByUsername, updateUser, deleteUser };
