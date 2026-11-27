import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { generateReviewHandler } from "./review.controllers.js";

export const reviewRouter = Router()

reviewRouter.get('/', authMiddleware, generateReviewHandler)