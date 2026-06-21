import { Router } from 'express';
import { z } from 'zod';
import { changelogService } from '../di/container';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/authorize';
import { validateBody } from '../filters/ValidationFilter';
import { CreateChangelogSchema, UpdateChangelogSchema } from '../../DST_API_DOCS.Application/dtos/changelogs/ChangelogDtos';
import { success } from '../../DST_API_DOCS.Application/dtos/common/ApiResponse';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const version = typeof req.query['version'] === 'string' ? req.query['version'] : undefined;
    const data = await changelogService.listChangelogs(version);
    res.json(success(data));
  } catch (err) { next(err); }
});

router.post('/', authenticate, requireAdmin, validateBody(CreateChangelogSchema), async (req, res, next) => {
  try {
    const data = await changelogService.createChangelog(req.body, req.user?.id);
    res.status(201).json(success(data, 'Changelog created'));
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, requireAdmin, validateBody(UpdateChangelogSchema), async (req, res, next) => {
  try {
    const id = Number(req.params['id']);
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid ID', data: null, errors: [] }); return; }
    const data = await changelogService.updateChangelog(id, req.body, req.user?.id);
    res.json(success(data, 'Changelog updated'));
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params['id']);
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid ID', data: null, errors: [] }); return; }
    await changelogService.deleteChangelog(id, req.user?.id);
    res.json(success(null, 'Changelog deleted'));
  } catch (err) { next(err); }
});

export default router;
