import { verify } from '@octokit/webhooks-methods'
import { addWebhookJob, webhookJob } from '../../queues/webhook/webhook.queue.js';
import type { IGithubInstallation, IPullRequestOpened, IPullRequestUpdated } from '../../types/interfaces.js';
import { 
    acceptNewPermissions, 
    createInstallation, 
    delInstallation, 
    suspendInstallation, 
    unsuspendInstallation
} from '../github_installation/github_installation.services.js';

export const verifyGithubSignature = async (signature:string, body:string)=>{
    return await verify(process.env.GITHUB_WEBHOOK_SECRET as string, body, signature)
}

export const handlePRHook = async (body:any)=>{
    const { action, pull_request, installation } = body

    if(action==='opened'){
        const newPrData:IPullRequestOpened = {
            githubPrId: pull_request['id'],
            githubInstallationId: installation['id'],
            number: pull_request['number'],
            title: pull_request['title'],
            description: pull_request['body'],
            htmlUrl: pull_request['url'],
            createdBy: pull_request['user']['login'],
            createdByProfileUrl: pull_request['user']['html_url'],
            createdAt: pull_request['created_at'],
            updatedAt: pull_request['updated_at'],
            headSha: pull_request['head']['sha'],
            baseSha: pull_request['base']['sha'],
            repo: pull_request['base']['repo']['name'],
            repoId: pull_request['base']['repo']['id'],
            owner: pull_request['base']['repo']['owner']['login'],
            headRef: pull_request['head']['ref'],
            baseRef: pull_request['base']['ref'],
            commitsCount: pull_request['commits'],
            url: pull_request['html_url']
        }

        const jobId = await addWebhookJob(webhookJob.ADD_PR, newPrData)
        console.log(`job for add_pr has been added to queue, id:${jobId}`)
    }

    else if(action==='closed'){
        const updatePrData:IPullRequestUpdated = {
            githubPrId: pull_request['id'],
            githubInstallationId: installation['id'],
            closedAt: pull_request['closed_at'],
            mergedAt: pull_request['merged_at']
        }

        const jobId = await addWebhookJob(webhookJob.UPDATE_PR, updatePrData)
        console.log(`job for UPDATE_PR has been added to queue, id:${jobId}`)
    }
}


export const handleInstallationHook = async (body:any)=>{
    const { action, installation } = body

    switch(action){
        case('created'):{
            const account = installation['account']

            const data:IGithubInstallation = {
                installationId: installation['id'],
                installedByGithubUser: account['id'],
                installationUrl: installation['html_url'],
                repoSelection: installation['repository_selection'],
                permissions: installation['permissions'],
                accountType: account['type']
            }

            await createInstallation(data)
            break
        }
        case('suspend'):{ 
            await suspendInstallation(
                installation['id'], installation['suspended_at'], installation['suspended_by']['html_url']
            )
            break
        }
        case('unsuspend'):{ 
            await unsuspendInstallation(installation['id'])
            break
        }  
        case('new_permissions_accepted'):{
            await acceptNewPermissions(installation['id'], installation['permissions'])
            break
        }
        case('deleted'):{
            await delInstallation(installation['id'])
            break
        }
    }

    console.log(`Installation Event:${action}, installationId:${installation['id']}`)
}