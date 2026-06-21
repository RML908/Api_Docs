import { Router } from 'express';
import { groupService } from '../di/container';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/authorize';
import { validateBody } from '../filters/ValidationFilter';
import { CreateGroupSchema, UpdateGroupSchema } from '../../DST_API_DOCS.Application/dtos/groups/GroupDtos';
import { success } from '../../DST_API_DOCS.Application/dtos/common/ApiResponse';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const data = await groupService.listGroups();
    res.json(success(data));
  } catch (err) { next(err); }
});

router.post('/', authenticate, requireAdmin, validateBody(CreateGroupSchema), async (req, res, next) => {
  try {
    const data = await groupService.createGroup(req.body, req.user?.id);
    res.status(201).json(success(data, 'Group created'));
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, requireAdmin, validateBody(UpdateGroupSchema), async (req, res, next) => {
  try {
    const id = Number(req.params['id']);
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid ID', data: null, errors: [] }); return; }
    const data = await groupService.updateGroup(id, req.body, req.user?.id);
    res.json(success(data, 'Group updated'));
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params['id']);
    if (isNaN(id)) { res.status(400).json({ success: false, message: 'Invalid ID', data: null, errors: [] }); return; }
    await groupService.deleteGroup(id, req.user?.id);
    res.json(success(null, 'Group deleted'));
  } catch (err) { next(err); }
});

export default router;
