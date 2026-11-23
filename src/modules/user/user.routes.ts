import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { getProfileHandler } from './user.controllers.js';

export const userRouter = Router()

userRouter.get("/profile", authMiddleware, getProfileHandler)
