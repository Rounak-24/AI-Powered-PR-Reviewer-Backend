import { Job, Worker } from "bullmq";
import { WEBHOOK_EVENT_QUEUE, webhookJob } from './webhook.queue.js'
import type { IPullRequestOpened, IPullRequestUpdated } from "../../types/interfaces.js";
import { prFileChangesAndIssue } from "../../services/github.services.js";
import { createPr, updatePr } from "../../modules/pr/pr.services.js";
import { redis } from "../../config/redis.js";


export const initQueueWorker = ()=>{
    console.log(`Init Queue Worker.....`)

    const webhookQueueWorker = new Worker(WEBHOOK_EVENT_QUEUE, async (job:Job)=>{
        const jobname = job.name
        console.log(`Job arrived in worker, job:${jobname}, id:${job.id}`)

        switch(jobname){
            case(webhookJob.ADD_PR):{
                const addData:IPullRequestOpened = job.data
                const { owner, repo, githubInstallationId, number } = addData

                const repoContent = await prFileChangesAndIssue(
                    githubInstallationId,repo,owner,number
                )

                if (repoContent) await createPr(addData, repoContent?.fileChangesStr, repoContent?.issueStr)
                else throw Error('repocontent is missing')

                console.log(`PR has been created, pr_id:${addData.githubPrId}`)
                break
            }

            case(webhookJob.UPDATE_PR):{
                const updateData:IPullRequestUpdated = job.data
                await updatePr(updateData)
                console.log(`PR state has been updated, pr_id:${updateData.githubPrId}`)
                break
            }
        }
    }, { connection:redis })

    webhookQueueWorker.on("completed", (job:Job)=>{
        console.log(`job completed, job_id:${job.id}, job_name:${job.name}`)
    })

    webhookQueueWorker.on("failed", (job:any,err)=>{
        console.log(`job failed`, job.id, job.name, job.data)
        console.log(`Error occured, ${err}`)
    })
}