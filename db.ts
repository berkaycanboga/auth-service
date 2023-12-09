import * as mysql from 'mysql';

const connection = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'sqluser',
  password: 'password',
  database: 'authservice',
});

export default connection;
