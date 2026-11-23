import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { githubInstallations } from "../../db/schema/githubInstallations.js";
import { prState, pullRequests } from "../../db/schema/pullRequests.js";
import type { IPullRequestOpened, IPullRequestUpdated } from "../../types/interfaces.js";


export const createPr = async (data:IPullRequestOpened, fileChanges:string, issues:string)=>{
    try{
        if(!data.githubInstallationId) throw new Error('Installation id is missing')

        return await db.transaction(async (tx)=>{
    
            const installation = await tx.select({
                installationId: githubInstallations.id
            })
            .from(githubInstallations)
            .where(eq(githubInstallations.githubInstallationId, data.githubInstallationId))

            if(!installation || !installation[0]?.installationId) throw new Error('Installation not found')

            await db.insert(pullRequests).values({
                githubPrId: data.githubPrId,
                appInstallationId: installation[0]?.installationId as string,
                githubRepositoryId: data.repoId,
                prNumber: data.number,
                url: data.url,
                githubPrHtmlUrl: data.htmlUrl,
                title: data.title,
                description: data.description ?? null,
                githubCreatedAt: data.createdAt,
                githubUpdatedAt: data.updatedAt,
                changedFileContent: fileChanges,
                sourceBranch: data.headRef ?? null,
                targetBranch: data.baseRef ?? null,
                baseSha: data.baseSha,
                headSha: data.headSha,
                commitsCount: data.commitsCount,
                issuesContent: issues,
                repo: data.repo,
                authorGithubUsername: data.createdBy,
                authorGithubProfileUrl: data.createdByProfileUrl ?? null,
            })

            return true
        })

    }catch(err){
        console.log(`Something wen wrong for saving pr:${data.githubPrId}`)
    }
}


export const updatePr = async (data:IPullRequestUpdated)=>{
    try{
        const { mergedAt, closedAt, githubPrId, githubInstallationId } = data

        const updated = await db.update(pullRequests)
        .set({
            mergedAt: mergedAt,
            closedAt,
            state:prState.enumValues[1]
        })
        .where(eq(pullRequests.githubPrId, githubPrId))

        if(!updated || !updated.rows) throw Error(`Unable to update or PR dosen't exits....`)
        console.log(`PR data has been updated for pr:${data.githubPrId}, installation:${githubInstallationId}`)

    } catch(err){
        console.log(`Something went wrong for updating pr`, err)
    }
}


export const getPrs = async (userId:string)=>{

    return db.transaction(async (tx)=>{
        const installation = await tx.select({installationId:githubInstallations.id})
        .from(githubInstallations)
        .where(eq(githubInstallations.installedByUserId, userId))

        if(!installation) throw Error(`Unable to find installation....`)

        return await tx.select({
            id: pullRequests.id,
            githubId: pullRequests.githubPrId,
            number: pullRequests.prNumber,
            fileChanges: pullRequests.changedFileContent,
            issues: pullRequests.issuesContent,
            mergedAt: pullRequests.mergedAt,
            closedAt: pullRequests.closedAt,
            githubPrUrl: pullRequests.githubPrHtmlUrl,
            title: pullRequests.title,
            body: pullRequests.description,
            targetBranch: pullRequests.targetBranch,
            sourceBranch: pullRequests.sourceBranch,
            state: pullRequests.state,
            repo: pullRequests.repo,
            createdByProfile: pullRequests.authorGithubProfileUrl,
            createdBy: pullRequests.authorGithubUsername,
            createdAt: pullRequests.githubCreatedAt
        })
        .from(pullRequests)
        .where(eq(pullRequests.appInstallationId, installation[0]?.installationId as string))
    })
}