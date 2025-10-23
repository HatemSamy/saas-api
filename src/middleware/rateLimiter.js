import rateLimit from 'express-rate-limit';


export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 

  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});


export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 5, 
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 10 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
