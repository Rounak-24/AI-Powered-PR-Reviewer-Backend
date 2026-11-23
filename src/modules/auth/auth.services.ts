import { redis } from '../../config/redis.js'
import crypto from 'crypto'
import { db } from '../../db/index.js'
import { users } from '../../db/schema/users.js'
import { eq } from 'drizzle-orm'
import { exchangeWebFlowCode, refreshToken } from '@octokit/oauth-methods'
import type { IGithubUser, IProfileResponse, ISessionData } from '../../types/interfaces.js'


export const saveSession = async (userId:string)=>{
    const token = crypto.randomBytes(32).toString("hex")
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

    const sessionData:ISessionData = {
        userId,
        createdAt: Date.now(),
    };

    await redis.set(
        `session:${tokenHash}`,
        JSON.stringify(sessionData),
        "EX",
        60 * 60 * 24
    )

    return token
}

export const delSession = async (token: string)=>{
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
    await redis.del(`session:${tokenHash}`)
}


export const saveGithubToekns = async (
    userId:string,
    accessToken:string,
    refreshToken:string,
    accessTokenExpiry:number,
)=>{
    const saveTokenstoDB = await db.update(users).set({
        oauthRefreshToken: refreshToken,
        oauthAccessToken: accessToken,
    }).where(eq(users.id,userId))

    const savetoCahce = await redis.set(`oauthAccessToken:${userId}`, accessToken, "EX", accessTokenExpiry)
} 


interface GitHubTokenData {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_token_expires_in: number;
    token_type: string;
    scope: string;
}

export const oAuthExchange = async (code:string)=>{
    const res = await exchangeWebFlowCode({
        clientType: 'oauth-app',
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        code,
    })

    if (res.status!==200) throw new Error("Something went erong in OAuth exchange")
    console.log('OAuth exchange successful:')

    return res.data as GitHubTokenData 
}


export const getGithubProfile = async (accessToken:string)=>{
    const GITHUB_PROFILE_URL = 'https://api.github.com/user'
    const response = await fetch(GITHUB_PROFILE_URL, {
        headers:{
            Authorization: `Bearer ${accessToken}`,
            'User-Agent': 'Node-TypeScript-OAuth-App',
        }
    })

    if(!response.ok) throw new Error(`GitHub API error: ${response.statusText}`) 

    const data = await response.json()
    if(!data["id"]) throw new Error("github_id is missing....")
    
    const githubProfile:IGithubUser = {
        githubId: data["id"],
        githubProfileUrl: data["html_url"],
        githubUsername: data["login"],
        githubAvatar: data["avatar_url"],
        githubEmail: data["email"],
        githubName: data["name"],
        location: data["location"],
        bio: data["bio"]
    }

    return githubProfile
}


export const findUserByGithubId = async (githubId:number)=>{
    const user = await db.select({
        userId: users.id,
        githubUsername: users.githubUsername,
        githubAvatar: users.githubAvatarUrl,
        githubName: users.githubName,
        githubEmail: users.githubEmail,
        githubProfileUrl: users.githubHTMLUrl,
        location: users.githubLocation,
        bio: users.githubBio

    }).from(users).where(eq(users.githubId, githubId))

    if(user) return user[0] as IProfileResponse
    else return null
}


export const createNewUser = async (
    profile:IGithubUser, 
    oauthAccessToken: string,
    oauthRefreshToken: string
)=>{
    const {
        githubId, 
        githubUsername, 
        githubAvatar, 
        githubProfileUrl,
        githubName,
        githubEmail, 
        location,
        bio 
    } = profile

    const newUser = await db.insert(users).values({
        githubId,
        githubUsername,
        githubHTMLUrl: githubProfileUrl,
        githubEmail,
        githubLocation: location,
        githubBio: bio,
        githubAvatarUrl: githubAvatar,
        githubName,
        oauthAccessToken,
        oauthRefreshToken

    }).returning({ 
        userId:users.id,
        githubUsername:users.githubUsername,
        githubAvatar:users.githubAvatarUrl,
        githubName:users.githubName,
        githubEmail:users.githubEmail,
        githubProfileUrl:users.githubHTMLUrl,
        location:users.githubLocation,
        bio:users.githubBio
    })

    return newUser[0] as IProfileResponse
}


export const refreshGithubAccessToken = async (userId:string, currentRefreshToken:string)=>{
    const { data, authentication } = await refreshToken({
        clientType: 'github-app',
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        refreshToken: currentRefreshToken,
    })

    const { 
        access_token, 
        expires_in, 
        refresh_token, 
        refresh_token_expires_in 
    } = data

    await saveGithubToekns(userId, access_token, refresh_token, expires_in)
}