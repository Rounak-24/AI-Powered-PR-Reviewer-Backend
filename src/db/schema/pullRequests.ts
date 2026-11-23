import { 
    pgTable, 
    text, 
    varchar, 
    integer, 
    boolean, 
    timestamp, 
    uniqueIndex, 
    uuid, 
    bigint,
    pgEnum
} from "drizzle-orm/pg-core"

import { githubInstallations } from "./githubInstallations.js";

export const prState = pgEnum('pr_state',['open','closed'])

export const pullRequests = pgTable(
    "pull_requests",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        appInstallationId: uuid('github_installation_id')
        .references(()=>githubInstallations.id, {
            onDelete: 'cascade'
        }).notNull(),

        githubRepositoryId: bigint("github_repository_id", {mode: "number",}).notNull(),
        githubPrId: bigint("github_pr_id", {mode: "number",}).notNull(),
        prNumber: integer("pr_number").notNull(),
        title: varchar("title", {length: 512,}).notNull(),
        description: text("description"),

        // open | closed
        state: prState().default('open').notNull(),

        url: text('url').notNull(),
        githubPrHtmlUrl: text("github_pr_html_url").notNull(),

        isDraft: boolean("is_draft").default(false).notNull(),
        isMerged: boolean("is_merged").default(false).notNull(),

        // PR author
        authorGithubUsername: varchar("author_github_username", {length: 255,}).notNull(),
        authorGithubProfileUrl: text("author_github_profile_url"),

        // Branch information
        sourceBranch: varchar("source_branch", {length: 255,}).notNull(),
        targetBranch: varchar("target_branch", {length: 255,}).notNull(),

        // Commit references
        baseSha: varchar("base_sha", {length: 64,}).notNull(),
        headSha: varchar("head_sha", {length: 64,}).notNull(),

        changedFilesCount: integer("changed_files_count").default(0).notNull(),
        changedFileContent: text('changed_file_content'),

        commitsCount: integer("commits_count").default(0).notNull(),

        mergedAt: timestamp("merged_at", {withTimezone:true,}),
        closedAt: timestamp('closed_at', {withTimezone:true,}),

        issuesContent: text('issues_content'),
        repo: text('repo_name').notNull(),
        repoId: bigint("repo_id", {mode: "number",}).notNull(),

        githubCreatedAt: timestamp("github_created_at", {withTimezone: true,}).notNull(),
        githubUpdatedAt: timestamp("github_updated_at", {withTimezone: true,}).notNull(),

        createdAt: timestamp("created_at", {withTimezone: true,}).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", {withTimezone: true,}).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("app_installation_id_idx").on(table.appInstallationId,),
        uniqueIndex("github_pr_id_idx").on(table.githubPrId,),
    ],
);