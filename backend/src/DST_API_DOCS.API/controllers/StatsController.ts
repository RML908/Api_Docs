import { Router } from 'express';
import { statsService } from '../di/container';
import { success } from '../../DST_API_DOCS.Application/dtos/common/ApiResponse';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const data = await statsService.getStats();
    res.json(success(data));
  } catch (err) { next(err); }
});

export default router;
