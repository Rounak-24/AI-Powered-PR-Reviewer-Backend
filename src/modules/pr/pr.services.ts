import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { githubInstallations } from "../../db/schema/githubInstallations.js";
import { prState, pullRequests } from "../../db/schema/pullRequests.js";
import type { IPullRequestData, IPullRequestOpened, IPullRequestUpdated } from "../../types/interfaces.js";
import { redis } from "../../config/redis.js";


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

    const prs = await db.transaction(async (tx)=>{
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
            createdAt: pullRequests.githubCreatedAt,

            headSha: pullRequests.headSha,
            baseSha: pullRequests.baseSha
        })
        .from(pullRequests)
        .where(eq(pullRequests.appInstallationId, installation[0]?.installationId as string))
    })

    const dataForCache = []

    for (const pr of prs){
        const prData:IPullRequestData = {
            id: pr.id,
            githubId: pr.githubId,
            title: pr.title,
            description: pr.body ?? '',
            number: pr.number,
            fileChanges: JSON.parse(pr.fileChanges as string),
            issues:(pr.issues as string),
            headSha: pr.headSha ?? '',
            baseSha: pr.baseSha ?? '',
            sourceBranch: pr.sourceBranch ?? '',
            targetBranch: pr.targetBranch ?? ''
        }

        dataForCache.push(prData)
    }

    await cachePRData(dataForCache as [IPullRequestData])

    prs.map((pr)=>{
        if(pr.fileChanges) pr.fileChanges = JSON.parse(pr.fileChanges)
        if(pr.issues) pr.issues = JSON.parse(pr.issues)['lables']
    })

    return prs.map(({headSha,baseSha,...rest})=>{return rest})
}


export const cachePRData = async (prs:[IPullRequestData])=>{
    const pipeline = redis.multi()

    for (const pr of prs){
        pipeline.set(`pr:${pr.id}`, JSON.stringify(pr), 'EX', 60*60*24)
    }

    await pipeline.exec()
    console.log(`PR data has been cached`)
}

export const getPRById = async (prId:string)=>{
    const cached = await redis.get(`pr:${prId}`)
    if(cached) return JSON.parse(cached) as IPullRequestData

    console.log(`Searching from DB....`)

    const inDB = await db
    .select({
        id: pullRequests.id,
        githubId: pullRequests.githubPrId,
        title: pullRequests.title,
        description: pullRequests.description ?? '',
        number: pullRequests.prNumber,
        fileChanges: pullRequests.changedFileContent,
        issues:pullRequests.issuesContent,
        headSha: pullRequests.headSha,
        baseSha: pullRequests.baseSha,
        sourceBranch: pullRequests.sourceBranch,
        targetBranch: pullRequests.targetBranch
    })
    .from(pullRequests)
    .where(eq(pullRequests.id,prId))

    if(!inDB || !inDB[0]) throw new Error(`PR not found for id:${prId}`)
    const data = inDB[0]

    return { 
        id: data.id,
        githubId: data.githubId,
        title: data.title,
        description: data.description ?? '',
        number: data.number,
        fileChanges: JSON.parse(data.fileChanges as string),
        issues: data.issues as string,
        headSha: data.headSha,
        baseSha: data.baseSha,
        sourceBranch: data.sourceBranch,
        targetBranch: data.targetBranch
    } as IPullRequestData
}