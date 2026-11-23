import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    boolean,
    bigint,
    uniqueIndex,
} from "drizzle-orm/pg-core";


export const users = pgTable(
    "users",
    {
        id: uuid("id").defaultRandom().primaryKey(),

        githubId: bigint("github_id",{mode: "number",}).notNull(),
        githubUsername: varchar("github_username", {length: 255,}).notNull(),

        githubName: varchar("github_name", {length: 255,}),
        githubEmail: varchar("github_email",{length: 255,}),

        githubAvatarUrl: text("github_avatar_url"),
        githubHTMLUrl: text("github_html_url"),

        githubLocation: varchar("github_location", {length: 255,}),
        githubBio: text("github_bio"),
       
        oauthAccessToken: text("oauth_access_token").notNull(),
        oauthRefreshToken: text("oauth_refresh_token").notNull(),

        isActive: boolean("is_active").default(true).notNull(),

        createdAt: timestamp("created_at",{withTimezone: true,}).defaultNow().notNull(),
        updatedAt: timestamp("updated_at",{withTimezone: true,}).defaultNow().notNull(),
    },
    (table) => [
        uniqueIndex("users_github_id_idx").on(table.githubId)
    ],
);