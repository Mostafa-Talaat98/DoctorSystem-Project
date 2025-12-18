import connectDB from "./DB/connect.js";
import authRouter from "./modules/auth/auth.routes.js";
import { sendVerifyEmailOtp, verifyEmailOtp } from "./modules/auth/Otp/otp.service.js";

const bootstrap = async (app, express) => {
  app.use(express.json());

  await connectDB();

  app.use("/auth", authRouter);

  app.post("/test", (req, res) => {
    verifyEmailOtp({ email: "magicianmt@gmail.com",code:"120753" });

    res.end()
  });

  app.use((req, res) => {
    res.status(404).json({ message: "not found" });
  });

  app.use((error, req, res, next) => {
    const status = error.cause;
    res.status(500).json({ message: error.message, stack: error.stack });
  });
};

export default bootstrap;
