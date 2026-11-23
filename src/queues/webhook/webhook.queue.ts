import { Queue } from 'bullmq'
import { redis } from '../../config/redis.js'
import type { IPullRequestOpened, IPullRequestUpdated } from '../../types/interfaces.js';


export enum webhookJob {
    ADD_PR = 'add_pr',
    UPDATE_PR = 'update_pr'
}

export const WEBHOOK_EVENT_QUEUE = 'webhook-event-queue'

const webhookEventQueue = new Queue(WEBHOOK_EVENT_QUEUE, { connection: redis })

webhookEventQueue.on('error', (error) => {
    console.error('Error occurred in webhook event queue:', error)
})


export const addWebhookJob = async (jobType:webhookJob, data:IPullRequestOpened | IPullRequestUpdated)=>{
    try{
        const { id } = await webhookEventQueue.add(jobType, data)
        console.log(`Webhook Job for ${jobType} has been added to ${WEBHOOK_EVENT_QUEUE}, jobId:${id}`)
        return id

    }catch(err){
        console.log(`Something went wrong while adding ${jobType} to ${WEBHOOK_EVENT_QUEUE}`, err)
    }
}