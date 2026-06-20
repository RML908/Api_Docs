import { Router, type IRouter } from "express";
import healthRouter from "./health";
import groupsRouter from "./groups";
import endpointsRouter from "./endpoints";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(groupsRouter);
router.use(endpointsRouter);
router.use(statsRouter);

export default router;
