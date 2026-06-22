import { Router } from 'express';
import { apiKeyService } from '../di/container';
import { authenticate } from '../middleware/authenticate';
import { writeRateLimiter } from '../middleware/rateLimiter';
import { requireAdmin } from '../middleware/authorize';
import { validateBody } from '../filters/ValidationFilter';
import { CreateApiKeySchema } from '../../DST_API_DOCS.Application/dtos/api-keys/ApiKeyDtos';
import { success } from '../../DST_API_DOCS.Application/dtos/common/ApiResponse';

const router = Router();

router.get('/', authenticate, requireAdmin, async (_req, res, next) => {
  try {
    const data = await apiKeyService.listApiKeys();
    res.json(success(data));
  } catch (err) { next(err); }
});

router.post('/', authenticate, requireAdmin, writeRateLimiter, validateBody(CreateApiKeySchema), async (req, res, next) => {
  try {
    const data = await apiKeyService.createApiKey(req.body, req.user?.id);
    res.status(201).json(success(data, 'API key created — save the key now, it will not be shown again'));
  } catch (err) { next(err); }
});

router.patch('/:id/revoke', authenticate, requireAdmin, writeRateLimiter, async (req, res, next) => {
  try {
    const id = Number(req.params['id']);
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid ID', data: null, errors: [] }); return; }
    await apiKeyService.revokeApiKey(id);
    res.json(success(null, 'API key revoked'));
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, requireAdmin, writeRateLimiter, async (req, res, next) => {
  try {
    const id = Number(req.params['id']);
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid ID', data: null, errors: [] }); return; }
    await apiKeyService.deleteApiKey(id);
    res.json(success(null, 'API key deleted'));
  } catch (err) { next(err); }
});

export default router;
