import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    bigint,
    uniqueIndex,
    jsonb,
    pgEnum
} from "drizzle-orm/pg-core";

export const installationStatus = pgEnum(
    'installation_status',
    ['active','suspended','deleted']
)

import { users } from "./users.js";


export const githubInstallations = pgTable(
    "github_installations",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        githubInstallationId: bigint("installation_id", {mode: "number",}).notNull(),
        githubInstallationHTMLUrl: text("installation_html_url"),

        accountType: varchar("account_type", {length: 30,}).notNull(),

        installedByUserId: uuid("installed_by_user_id")
        .references(() => users.id, {
            onDelete: "set null",
        }).notNull(),

        status: installationStatus().default('active').notNull(),

        permissions: jsonb("permissions")
        .$type<Record<string, string>>()
        .default({})
        .notNull(),

        // all | selected
        repositorySelection: varchar("repository_selection", {length: 30,}).notNull(),

        suspendedAt: timestamp("suspended_at", {withTimezone: true,}),
        suspendedByProfileUrl: text('suspended_by_profile_url'),

        createdAt: timestamp("created_at", {withTimezone: true,}).defaultNow().notNull(),
        updatedAt: timestamp("updated_at", {withTimezone: true,}).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("github_installation_id_idx").on(table.githubInstallationId,),
        uniqueIndex("github_installation_user_idx").on(table.installedByUserId,),
    ],
);