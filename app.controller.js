import cookieParser from 'cookie-parser';
import connectDB from './DB/connect.js';
import authRouter from './modules/auth/auth.routes.js';
import bookingRouter from './modules/booking/booking.routes.js';
import { globalErrorHandler } from './utils/response/error.response.js';

const bootstrap = async (app, express) => {
  app.use(express.json());
  app.use(cookieParser());

  await connectDB();

  app.use('/api/auth', authRouter);
  app.use('/api/booking', bookingRouter);

  app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
  });

  app.use(globalErrorHandler);
};

export default bootstrap;
