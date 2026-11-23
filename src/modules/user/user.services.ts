import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schema/users.js";
import type { IProfileResponse } from "../../types/interfaces.js";


export const findUserById = async (userId:string)=>{
    const user = await db.select({
        userId: users.id,
        githubUsername: users.githubUsername,
        githubAvatar: users.githubAvatarUrl,
        githubName: users.githubName,
        githubEmail: users.githubEmail,
        githubProfileUrl: users.githubHTMLUrl,
        location: users.githubLocation,
        bio: users.githubBio

    }).from(users).where(eq(users.id, userId))

    if(user) return user[0] as IProfileResponse
    else return null
}