export interface IGithubUser{
    githubId: number
    githubUsername: string
    githubEmail?: string
    githubName?: string
    githubAvatar?: string
    githubProfileUrl: string
    location?: string
    bio?: string
}

export interface IProfileResponse{
    userId: string
    githubUsername: string
    githubAvatar: string
    githubName?: string
    githubEmail?: string
    githubProfileUrl: string
    location?: string
    bio?: string
}

export interface ISessionData{
    userId: string
    createdAt: number
}

export interface IPullRequestOpened{
    githubPrId: number
    githubInstallationId: number
    number: number
    url:string
    htmlUrl: string
   
    title: string
    description: string
    commitsCount: number

    createdBy: string
    createdByProfileUrl: string

    headSha: string
    baseSha: string
    headRef: string
    baseRef: string
    
    createdAt: Date
    updatedAt: Date

    repo: string
    repoId: number
    owner: string
}

export interface IPullRequestUpdated {
    githubPrId: number
    closedAt?: Date
    mergedAt?: Date
    githubInstallationId: number
}

export interface IGithubInstallation{
    installationId: number
    installationUrl: string
    installedByGithubUser: number
    permissions: Record<string,string>
    repoSelection: string
    accountType: string
}

export interface IFileChange{
    sha: string
    filename: string
    status: string
    changes: number
    patch: string
    prev_filename: string
}

export interface IPullRequestData {
    id: string
    githubId: number
    number: number
    fileChanges: Array<IFileChange>
    issues: string
    headSha: string
    baseSha: string
    sourceBranch: string
    targetBranch: string
    title: string
    description: string
}