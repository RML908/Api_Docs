import { Router } from 'express';
import { endpointService } from '../di/container';
import { authenticate } from '../middleware/authenticate';
import { writeRateLimiter } from '../middleware/rateLimiter';
import { requireAdmin } from '../middleware/authorize';
import { publicCache } from '../middleware/cache';
import { validateBody, validateQuery } from '../filters/ValidationFilter';
import {
  CreateEndpointSchema,
  UpdateEndpointSchema,
  ListEndpointsQuerySchema,
} from '../../DST_API_DOCS.Application/dtos/endpoints/EndpointDtos';
import { success } from '../../DST_API_DOCS.Application/dtos/common/ApiResponse';

const router = Router();

router.get('/', publicCache(30), validateQuery(ListEndpointsQuerySchema), async (req, res, next) => {
  try {
    const query = (req as any).validatedQuery;
    const data = await endpointService.listEndpoints(query);
    res.json(success(data));
  } catch (err) { next(err); }
});

router.get('/:id', publicCache(30), async (req, res, next) => {
  try {
    const id = Number(req.params['id']);
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid ID', data: null, errors: [] }); return; }
    const data = await endpointService.getEndpoint(id);
    res.json(success(data));
  } catch (err) { next(err); }
});

router.post('/', authenticate, requireAdmin, writeRateLimiter, validateBody(CreateEndpointSchema), async (req, res, next) => {
  try {
    const data = await endpointService.createEndpoint(req.body, req.user?.id);
    res.status(201).json(success(data, 'Endpoint created'));
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, requireAdmin, writeRateLimiter, validateBody(UpdateEndpointSchema), async (req, res, next) => {
  try {
    const id = Number(req.params['id']);
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid ID', data: null, errors: [] }); return; }
    const data = await endpointService.updateEndpoint(id, req.body, req.user?.id);
    res.json(success(data, 'Endpoint updated'));
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, requireAdmin, writeRateLimiter, async (req, res, next) => {
  try {
    const id = Number(req.params['id']);
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid ID', data: null, errors: [] }); return; }
    await endpointService.deleteEndpoint(id, req.user?.id);
    res.json(success(null, 'Endpoint deleted'));
  } catch (err) { next(err); }
});

export default router;
