import cookieParser from "cookie-parser";
import connectDB from "./DB/connect.js";
import { globalErrorHandler } from "./utils/response/error.response.js";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createRateLimiter } from "./utils/security/rate.limit.js";
import authRouter from "./modules/auth/auth.controller.js";
import bookingRouter from "./modules/booking/booking.controller.js";
import usersRouter from "./modules/users/users.controller.js";
import { authenticateUser } from "./modules/middleware/authenticateUser.middleware.js";
import doctorFavouriteRouter from "./modules/Doctor/Favourite feature/Routes/doctorRoutes.js";
import getDoctorsRouter from "./modules/Doctor/Get Doctors Feature/Routes/getDoctorsRoutes.js";

const bootstrap = async (app, express) => {
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(morgan("dev"));

  app.use(
    cors({
      origin: ["http://localhost:4200", "http://127.0.0.1:5500"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    })
  );

  app.use(express.json());
  app.use(cookieParser());

  await connectDB();

  app.use("/api/auth", createRateLimiter(20, 15 * 60 * 1000), authRouter);

  app.use(
    "/api/booking",
    createRateLimiter(1000, 60 * 60 * 1000),
    bookingRouter
  );

  app.use("/api/user", createRateLimiter(1000, 60 * 60 * 1000), authenticateUser(), usersRouter);
  app.use("/api/doctors", doctorFavouriteRouter);
  app.use("/api/doctors", getDoctorsRouter);

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
};

export default bootstrap;
