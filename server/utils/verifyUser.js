import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  // console.log('Token:', token);  // Log the token

  if (!token) {
    return next(errorHandler(401, 'Unauthorized line no. 8'));
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(errorHandler(401, 'Unauthorized line no. 12'));
    }
    req.user = user;
    next(); 
  });
};