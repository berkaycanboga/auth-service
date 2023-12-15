import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/userRoutes/authRoutes';
import homeRoutes from './routes/userRoutes/homeRoutes';
import panelLoginRoute from './routes/adminRoutes/panelLoginRoute';

const app: Express = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', authRoutes);
app.use('/home', homeRoutes);
app.use('/api/v1/role', panelLoginRoute);

export default app;

app.listen(3000, async () => {
  console.log('Server is running at http://localhost:3000');
});
