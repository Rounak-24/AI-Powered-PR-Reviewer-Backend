import type { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'
import { redis } from '../config/redis.js';
import { ApiError } from '../utils/ApiError.js';
import type { ISessionData } from '../types/interfaces.js';


declare global{
    namespace Express{
        interface Request {
            user?:any
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction)=>{
    const sessionToken = req.headers.authorization || req.cookies?.authorization
    if(!sessionToken) throw new ApiError(401,'Authorization header missing')

    try{
        const tokenHash = crypto.createHash("sha256").update(sessionToken).digest("hex")
        const session = await redis.get(`session:${tokenHash}`)

        if(!session) throw new ApiError(401,"session has been expired")
        const sessionData:ISessionData = JSON.parse(session)

        req.user = { userId: sessionData.userId }
        next()

    }catch(err){
        console.log(`Error in authMiddleware, ${err}`)
        return res.status(401).json({ error: 'Invalid session token' })
    }
}