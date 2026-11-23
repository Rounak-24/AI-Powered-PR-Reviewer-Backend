import { Router } from 'express'
import { githubCallbackHandler, githubLoginHandler } from './auth.controller.js';

export const authRouter = Router()

authRouter.get("/login/github", githubLoginHandler)
authRouter.get("/callback", githubCallbackHandler)
