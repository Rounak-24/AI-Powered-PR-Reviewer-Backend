import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import dotenv from 'dotenv'
dotenv.config()

import { 
    createNewUser, 
    findUserByGithubId,
    getGithubProfile, 
    oAuthExchange, 
    saveGithubToekns, 
    saveSession 
} from './auth.services.js';


export const githubLoginHandler = asyncHandler(async (req:Request, res:Response)=>{
    const CLIENT_ID = process.env.GITHUB_CLIENT_ID
    const scope = 'read:user user:email'
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${encodeURIComponent(scope)}`
    return res.redirect(githubUrl)
})


export const githubCallbackHandler = asyncHandler(async (req:Request, res:Response)=>{
    const code = req.query.code as string;
    if (!code) return res.status(400).json({ error: 'Authorization code missing' });
    
    const {
        access_token, 
        refresh_token, 
        expires_in, 
        refresh_token_expires_in
    } = await oAuthExchange(code)

    if(!access_token) return res.status(400).json({ error: 'AccessToken is missing' })

    const githubUser = await getGithubProfile(access_token)
    let exists = await findUserByGithubId(githubUser.githubId)

    if(!exists) {
        const newUser = await createNewUser(githubUser, access_token, refresh_token)
        if (!newUser) return res.json(new ApiError(500, 'Failed to create new user'))
        
        exists = newUser
    }

    const token = await saveSession(exists.userId)
    res.json(new ApiResponse(200, {user:exists, token}, 'Logged in successfully'))

    await saveGithubToekns(exists.userId,access_token,refresh_token,expires_in)
})