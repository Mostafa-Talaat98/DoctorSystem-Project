import express from 'express';
import bootstrap from './app.controller.js';
import dotenv from 'dotenv';
import authRouter from './modules/auth/auth.routes.js';

dotenv.config();
const app = express();
const port = process.env.PORT;
app.use(express.json());

app.use(authRouter);



// ONLY FOR TESTING PURPOSES

app.use((error, req, res, next) => {
  const statusCode = error.cause || 500;
  console.log("error from error middleware", error);
  res.status(statusCode).json({ message: 'Error Handler Middleware', error: error.details });
});

bootstrap(app, express);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
