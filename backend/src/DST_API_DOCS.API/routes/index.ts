import { Router } from 'express';
import authController from '../controllers/AuthController';
import groupController from '../controllers/GroupController';
import endpointController from '../controllers/EndpointController';
import changelogController from '../controllers/ChangelogController';
import apiKeyController from '../controllers/ApiKeyController';
import statsController from '../controllers/StatsController';
import { success } from '../../DST_API_DOCS.Application/dtos/common/ApiResponse';

const router = Router();

// Health
router.get('/healthz', (_req, res) => res.json(success({ status: 'ok' })));

// Versioned routes
router.use('/v1/auth', authController);
router.use('/v1/groups', groupController);
router.use('/v1/endpoints', endpointController);
router.use('/v1/changelogs', changelogController);
router.use('/v1/api-keys', apiKeyController);
router.use('/v1/stats', statsController);

export default router;
