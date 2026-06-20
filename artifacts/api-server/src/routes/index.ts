import { Router, type IRouter } from "express";
import healthRouter from "./health";
import groupsRouter from "./groups";
import endpointsRouter from "./endpoints";
import statsRouter from "./stats";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(groupsRouter);
router.use(endpointsRouter);
router.use(statsRouter);

export default router;
