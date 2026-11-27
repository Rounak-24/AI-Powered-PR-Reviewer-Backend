import { z } from 'zod'

export const FindingSchema = z.object({
    file: z.string(),
    line: z.number(),
    endLine: z.number().nullable(),
    severity: z.enum(["blocker", "warning", "nit"]),
    category: z.enum([
        "bug", "security", "performance", "error_handling",
        "testing", "maintainability", "breaking_change", "docs",
    ]),
    confidence: z.enum(["low", "medium", "high"]),
    message: z.string(),
    suggestion: z.string().nullable(),
    // status: z.enum(["open", "resolved", "dismissed"]),
})


export const ReviewSchema = z.object({
    summary: z.object({
        description: z.string(),
        changeType: z.enum(["feature", "bugfix", "refactor", "docs", "test", "chore", "mixed"]),
        riskLevel: z.enum(["low", "medium", "high"]),
        filesTouched: z.array(z.string()),
    }),
    findings: z.array(FindingSchema),
    breakingChanges: z.array(z.string()),
    prHygiene: z
        .object({
            shouldSplit: z.boolean(),
            descriptionMatchesDiff: z.boolean(),
            notes: z.array(z.string()),
        })
        .nullable(),
    verdict: z.object({
        decision: z.enum(["approve", "request_changes", "comment"]),
        topPriorities: z.array(z.string()),
    }),
})


export type Review = z.infer<typeof ReviewSchema>