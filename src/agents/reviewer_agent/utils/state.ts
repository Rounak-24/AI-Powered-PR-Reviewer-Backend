import { z } from 'zod'
import { ReviewSchema } from './output_schema.js';

const FileChangeSchema = z.object({
    sha: z.string(),
    filename: z.string(),
    status: z.string(),
    changes: z.int(),
    patch: z.string(),
    prev_filename: z.string().optional()
})

const PRMetadata = z.object({
    prId: z.string().nonempty(),
    prNumber: z.number().int().nonnegative(),
    issues: z.string(),
    title: z.string(),
    body: z.string(),

    headSha: z.string().nonempty(),
    baseSha: z.string().nonempty(),
    sourceBranch: z.string().nonempty(),
    targetBranch: z.string().nonempty(),
})

export const ReviewAgentState = z.object({
    metadata: PRMetadata,
    fileChanges: z.array(FileChangeSchema).nonempty(),

    review: ReviewSchema.optional()
})

export type StateObject = z.infer<typeof ReviewAgentState>