import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, AUTH_RATE_LIMIT_MAX } from '../../DST_API_DOCS.Domain/constants/DomainConstants';
import { failure } from '../../DST_API_DOCS.Application/dtos/common/ApiResponse';

export const generalRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(failure(['Too many requests, please try again later'], 'Rate limit exceeded'));
  },
});

export const authRateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(failure(['Too many login attempts, please try again later'], 'Rate limit exceeded'));
  },
});
