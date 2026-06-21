import { Router } from 'express';
import { authService } from '../di/container';
import { validateBody } from '../filters/ValidationFilter';
import { authenticate } from '../middleware/authenticate';
import { authRateLimiter } from '../middleware/rateLimiter';
import { LoginSchema, RefreshTokenSchema } from '../../DST_API_DOCS.Application/dtos/auth/AuthDtos';
import { success } from '../../DST_API_DOCS.Application/dtos/common/ApiResponse';

const router = Router();

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [auth]
 *     summary: Login with username/password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Authentication tokens
 */
router.post('/login', authRateLimiter, validateBody(LoginSchema), async (req, res, next) => {
  try {
    const ip = req.ip ?? req.socket.remoteAddress;
    const result = await authService.login(req.body, ip);
    res.json(success(result, 'Login successful'));
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', validateBody(RefreshTokenSchema), async (req, res, next) => {
  try {
    const ip = req.ip ?? req.socket.remoteAddress;
    const result = await authService.refresh(req.body.refreshToken, ip);
    res.json(success(result, 'Token refreshed'));
  } catch (err) {
    next(err);
  }
});

router.post('/logout', validateBody(RefreshTokenSchema), async (req, res, next) => {
  try {
    await authService.logout(req.body.refreshToken);
    res.json(success(null, 'Logged out successfully'));
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json(success(req.user, 'Current user'));
});

export default router;
