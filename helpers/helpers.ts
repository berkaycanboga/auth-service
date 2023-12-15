import connection from '../db';

type User = {
  id: string;
  username: string;
  password: string;
};

interface Role {
  id: number;
  name: string;
}

export const getRoleByNameOrId = (identifier: string | number) => {
  const query = isNaN(identifier as number)
    ? 'SELECT * FROM roles WHERE name = ?'
    : 'SELECT * FROM roles WHERE id = ?';

  return new Promise<Role | undefined>((resolve, reject) => {
    connection.query(query, [identifier], (err, roles) => {
      if (err) {
        reject(err);
      } else {
        resolve(roles.length > 0 ? (roles[0] as Role) : undefined);
      }
    });
  });
};

export const getUserByIdOrUsername = (identifier: string | number) => {
  const query = isNaN(identifier as number)
    ? 'SELECT * FROM users WHERE username = ?'
    : 'SELECT * FROM users WHERE id = ?';

  return new Promise<User | undefined>((resolve, reject) => {
    connection.query(query, [identifier], (err, users) => {
      if (err) {
        reject(err);
      } else {
        resolve(users.length > 0 ? (users[0] as User) : undefined);
      }
    });
  });
};
