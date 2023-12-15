import { Request, Response } from 'express';
import connection from '../db';
import bcrypt from 'bcrypt';
import { clearToken, createToken } from '../middlewares/authMiddleware';
import { getUserByIdOrUsername } from '../helpers/helpers';

const updateUser = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { newPassword, newUsername } = req.body;

  if (!newPassword && !newUsername) {
    return res
      .status(400)
      .json({ error: 'New password or username is required for update' });
  }

  try {
    const user = await getUserByIdOrUsername(username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (newUsername && newUsername !== username) {
      const existingUser = await getUserByIdOrUsername(newUsername);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    const hashedPassword = newPassword
      ? await bcrypt.hash(newPassword, 10)
      : user.password;

    connection.query(
      'UPDATE users SET password = ?, username = ? WHERE username = ?',
      [hashedPassword, newUsername || username, username],
      (err, result) => {
        if (err) {
          console.error('Error during update:', err);
          return res.status(500).json({ error: 'Error during update' });
        }

        if (result.affectedRows > 0) {
          const newToken = createToken(newUsername || username);

          res.cookie('token', newToken, { httpOnly: true });

          return res.status(200).json({ message: 'Update successful' });
        } else {
          return res.status(404).json({ error: 'User not found' });
        }
      },
    );
  } catch (error) {
    console.error('Error during update:', error);
    res.status(500).json({ error: 'Error during update' });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  const { username } = req.params;

  try {
    const user = await getUserByIdOrUsername(username);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    connection.query(
      'DELETE FROM users WHERE username = ?',
      [username],
      (err) => {
        if (err) {
          console.error('Error during delete:', err);
          return res.status(500).json({ error: 'Error during delete' });
        }
        clearToken(res);
        return res.status(200).json({ message: 'User deleted successfully' });
      },
    );
  } catch (error) {
    console.error('Error during delete:', error);
    res.status(500).json({ error: 'Error during delete' });
  }
};

export { updateUser, deleteUser };
