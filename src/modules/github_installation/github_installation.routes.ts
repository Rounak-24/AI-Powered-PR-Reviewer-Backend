import { Router } from "express";
import { getInstallationHandler, handleInstallation } from "./github_installation.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

export const installationRouter = Router()

installationRouter.post('/', authMiddleware, handleInstallation)
installationRouter.get('/', authMiddleware, getInstallationHandler)