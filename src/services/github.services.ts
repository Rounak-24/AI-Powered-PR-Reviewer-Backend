import fs from "node:fs";
import path from "node:path";
import { App } from "octokit";

const privateKeyPath = path.join(import.meta.dirname, "codelens-pr-reviewerbyrounak.2026-11-17.private-key.pem")
const privateKey = fs.readFileSync(privateKeyPath, "utf8")

const app = new App({
    appId: process.env.GITHUB_APP_ID as string,
    privateKey,
})


export const prFileChangesAndIssue = async (
    appInstallationId: number,
    repo:string,
    owner:string,
    pull_number: number
)=>{
    try{
        const octokit = await app.getInstallationOctokit(appInstallationId)

        const [files, issues] = await Promise.all([
            octokit.rest.pulls.listFiles({
                repo:repo,
                owner:owner,
                pull_number: pull_number,
                per_page: 100, 
            }),

            octokit.rest.issues.get({
                owner: owner,
                repo: repo,
                issue_number: pull_number,
            })
        ])

        const issue = {
            githubIssueId: issues.data.id,
            lables: issues.data.labels
        }

        const fileChangesStr = JSON.stringify(files.data)
        const issueStr = JSON.stringify(issue)
        
        return { fileChangesStr, issueStr }

    }catch(err){
        console.log(`Something went wrong while fetching file changes`, err)
    }
}