ALTER TABLE "pull_requests" DROP CONSTRAINT "pull_requests_user_id_users_id_fkey";--> statement-breakpoint
DROP INDEX "user_id_idx";--> statement-breakpoint
ALTER TABLE "pull_requests" ADD COLUMN "github_installation_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD COLUMN "changed_file_content" text;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD COLUMN "closed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD COLUMN "issues_url" text;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD COLUMN "repo_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pull_requests" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "pull_requests" DROP COLUMN "author_github_id";--> statement-breakpoint
ALTER TABLE "pull_requests" DROP COLUMN "github_diff_url";--> statement-breakpoint
ALTER TABLE "pull_requests" DROP COLUMN "github_patch_url";--> statement-breakpoint
CREATE UNIQUE INDEX "github_app_installation_id_idx" ON "pull_requests" ("github_installation_id");--> statement-breakpoint
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_20XFjokncFKj_fkey" FOREIGN KEY ("github_installation_id") REFERENCES "github_installations"("id") ON DELETE CASCADE;