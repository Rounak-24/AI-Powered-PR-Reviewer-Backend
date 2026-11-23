import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { handleGetPr } from './pr.controller.js';

export const prRouter = Router()

prRouter.get("/", authMiddleware, handleGetPr)