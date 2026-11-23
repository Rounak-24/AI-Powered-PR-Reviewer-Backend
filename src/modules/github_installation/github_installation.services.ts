import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { githubInstallations, installationStatus } from "../../db/schema/githubInstallations.js";
import type { IGithubInstallation } from "../../types/interfaces.js";
import { users } from "../../db/schema/users.js";


export const createInstallation = async (data:IGithubInstallation)=>{

    const created = db.transaction(async (tx)=>{
        const appUser = await tx.select({ userId: users.id })
        .from(users)
        .where(eq(users.githubId, data.installedByGithubUser))

        if (!appUser || appUser.length===0) throw Error(`User not found`)

        return await tx.insert(githubInstallations).values({
            githubInstallationId: data.installationId,
            githubInstallationHTMLUrl: data.installationUrl,
            repositorySelection: data.repoSelection,
            accountType: data.accountType,
            permissions: data.permissions,
            installedByUserId: appUser[0]?.userId as string
        })
    })

    if(!created) throw Error(`Something went wrong while creating installation:${data.installationId}....`)
}


export const suspendInstallation = async (
    installationId:number,
    suspendedAt: string,
    suspendedBy: string
)=>{
    const suspended = await db.update(githubInstallations)
    .set({
        status: installationStatus.enumValues[1],
        suspendedAt: new Date(suspendedAt),
        suspendedByProfileUrl: suspendedBy
    })
    .where(eq(githubInstallations.githubInstallationId, installationId))

    if(!suspended) throw Error(`Something went wrong while suspending installation:${installationId}....`)
}


export const unsuspendInstallation = async (installationId:number)=>{
    const unsuspended = await db.update(githubInstallations)
    .set({
        status: installationStatus.enumValues[0],
        suspendedAt: null,
        suspendedByProfileUrl: null
    })
    .where(eq(githubInstallations.githubInstallationId, installationId))

    if(!unsuspended) throw Error(`Something went wrong while unsuspending installation:${installationId}....`)
}


export const acceptNewPermissions = async (installationId:number, newPermissions:Record<string,string>)=>{
    const accepted = await db.update(githubInstallations)
    .set({ permissions: newPermissions })
    .where(eq(githubInstallations.githubInstallationId, installationId))

    if(!accepted) throw Error(`Something went wrong while accepting new permissions installation:${installationId}....`)
}

export const delInstallation = async (installationId:number)=>{
    const deleted = await db.delete(githubInstallations)
    .where(eq(githubInstallations.githubInstallationId, installationId))

    if(!deleted) throw Error(`Something went wrong while deleting installation:${installationId}....`)
}

export const getInstallation = async (userId:string)=>{
    return await db.select({
        githubInstallationId: githubInstallations.githubInstallationId,
        repoSelection: githubInstallations.repositorySelection,
        permissions: githubInstallations.permissions,
        accountType: githubInstallations.accountType,
        status: githubInstallations.status
    })
    .from(githubInstallations)
    .where(eq(githubInstallations.installedByUserId, userId))
}