import express from "express"
import cors from "cors"
import type { Express, Request, Response } from "express"
import dotenv from "dotenv"
dotenv.config()

import { authRouter } from "./modules/auth/auth.routes.js"
import { userRouter } from "./modules/user/user.routes.js"
import { webhookRouter } from "./modules/webhook/webhook.route.js";
import { installationRouter } from "./modules/github_installation/github_installation.routes.js"

export const app:Express = express()

export const corsOptions = {
    origin:"*",
    // origin:process.env.CORS_ORIGIN,
    // credentials:true
}

const logRequest = (req:Request, res:Response, next:Function)=>{
    console.log(`Time:${new Date(Date.now())} ,Request made to ${req.method} ${req.url}`)
    next()
}

app.use(logRequest)
app.use(express.json())
app.use(cors(corsOptions))

app.use("/api/v1/auth",authRouter)
app.use("/api/v1/user",userRouter)
app.use("/api/v1/webhook",webhookRouter)
app.use("/api/v1/github-installation", installationRouter)