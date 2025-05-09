import express from 'express';
import morgan from 'morgan';
import { AppError } from './utils/AppError.js';
import { globalErrorHandler } from './middleware/errorMiddleware.js';
import authRouter from './routes/auth.router.js';

const app = express();

app.use(express.json());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));


app.get('/', (req, res) => {
  res.send('API is running...');
});
app.use("/api/v1/auth", authRouter);
app.use(globalErrorHandler);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


export default app;