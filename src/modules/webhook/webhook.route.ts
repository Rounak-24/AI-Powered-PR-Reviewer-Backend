import { Router } from 'express';
import { webhookController } from './webhook.controller.js';

export const webhookRouter = Router()

webhookRouter.post('/', webhookController)