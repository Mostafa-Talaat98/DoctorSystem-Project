import connectDB from "./DB/connect.js";
import authRouter from "./modules/auth/auth.routes.js";
import { globalErrorHandler } from "./utils/response/error.response.js";

const bootstrap = async (app, express) => {
  app.use(express.json());

  await connectDB();


  app.use("/auth", authRouter);

  

  app.use((req, res) => {
    res.status(404).json({ message: "Not Found" });
  });

  app.use(globalErrorHandler)
};

export default bootstrap;
