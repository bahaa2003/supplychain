import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import mongoSanitize from 'express-mongo-sanitize';
import xssClean from 'xss-clean';

const blacklistedIPs = ['123.45.67.89', '111.222.333.444'];

export const securityMiddleware = (app) => {
  app.use(helmet());

  app.use(cors({
    origin: ['*'],
    credentials: true
  }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
  });
  app.use(limiter);

  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 50,
    delayMs: 500
  });
  app.use(speedLimiter);

  app.use(mongoSanitize());

  app.use(xssClean());

  app.use((req, res, next) => {
    if (blacklistedIPs.includes(req.ip)) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    next();
  });
};
