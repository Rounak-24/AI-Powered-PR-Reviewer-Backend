import type { IPullRequestData } from "../../types/interfaces.js";
import type { StateObject } from "../../agents/reviewer_agent/utils/state.js";
import { invokeReviewAgent } from "../../agents/reviewer_agent/agent.js";

export const getAgentReview = async (data:IPullRequestData, userId:string)=>{

    const initialState:StateObject = {
        metadata:{
            prId: data.id,
            issues: data.issues,
            title: data.title,
            body: data.description ?? '',
            prNumber: data.number,
            headSha: data.headSha,
            baseSha: data.baseSha,
            sourceBranch: data.sourceBranch,
            targetBranch: data.targetBranch
        },
        fileChanges: data.fileChanges.map((fileChange)=>{
            return {
                sha: fileChange.sha,
                filename: fileChange.filename,
                status: fileChange.status,
                changes: fileChange.changes,
                patch: fileChange.patch,
                prev_filename: fileChange.prev_filename
            }
        })
    }

    return await invokeReviewAgent(userId, initialState)
}