import dotenv from 'dotenv'
import path from "path";
dotenv.config({ path: path.resolve("./.env") });

import cookieParser from "cookie-parser";
import connectDB from "./DB/connect.js";
import { globalErrorHandler } from "./utils/response/error.response.js";
import reviewRouter from "./modules/review/review.routes.js";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createRateLimiter } from "./utils/security/rate.limit.js";
import authRouter from "./modules/auth/auth.controller.js";
import bookingRouter from "./modules/booking/booking.controller.js";
import usersRouter from "./modules/users/users.controller.js";
import { authenticateUser } from "./middleware/authenticateUser.middleware.js";
import express from "express";
import { Server } from "socket.io";
import { initializeSocket } from './modules/chats/chat.socket.js';
import chatRouter from './modules/chats/chat.controller.js';



const app = express();
const port = process.env.PORT || 3000;

export const bootstrap = async () => {
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(morgan("dev"));

  const corsOptions = {
    origin: ["http://localhost:4200", "http://127.0.0.1:5500"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  };

  app.use(cors(corsOptions));

  app.use(express.json());
  app.use(cookieParser());

  await connectDB();

  

  app.use("/api/auth", createRateLimiter(20, 15 * 60 * 1000), authRouter);

  app.use(
    "/api/booking",
    authenticateUser(),
    createRateLimiter(1000, 60 * 60 * 1000),
    bookingRouter
  );


    app.use(
    "/api/chat",
    authenticateUser(),
    createRateLimiter(1000, 60 * 60 * 1000),
    chatRouter
  );
  

  app.use(
    "/api/user",
    createRateLimiter(1000, 60 * 60 * 1000),
    authenticateUser(),
    usersRouter
  );

  app.use("/api/reviews", reviewRouter);
  
  // 404 Router
  app.all("{*dummy}", (req, res) => {
    res.status(404).json({
      message: "Page Not Found",
      info: "Place Check Your Method And URL Path",
      method: req.method,
      path: req.path,
    });
  });

  app.use(globalErrorHandler);

  const httpServer = app.listen(port, () =>
    console.log(`app listening on port ${port}! 🚀`)
  );

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });


    initializeSocket(io);
};

export default bootstrap;
