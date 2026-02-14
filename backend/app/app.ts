import express, { Request, Response } from 'express';
import auth_routes from './src/routes/authroutes';
import society_routes from './src/routes/societyRoutes';
import group_routes from './src/routes/groupRoutes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
    res.send("Hello How are you");
});

app.use('/api/auth', auth_routes);
app.use('/api/society', society_routes);
app.use('/api/groups', group_routes);

export default app;
