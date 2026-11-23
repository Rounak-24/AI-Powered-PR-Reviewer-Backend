CREATE TYPE "installation_status" AS ENUM('active', 'suspended', 'deleted');--> statement-breakpoint
CREATE TYPE "pr_state" AS ENUM('open', 'closed');--> statement-breakpoint
DROP INDEX "github_app_installation_id_idx";--> statement-breakpoint
ALTER TABLE "github_installations" ADD COLUMN "suspended_by_profile_url" text;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD COLUMN "url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD COLUMN "issues_content" text;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD COLUMN "repo_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD COLUMN "repo_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "pull_requests" DROP COLUMN "additions";--> statement-breakpoint
ALTER TABLE "pull_requests" DROP COLUMN "deletions";--> statement-breakpoint
ALTER TABLE "pull_requests" DROP COLUMN "issues_url";--> statement-breakpoint
ALTER TABLE "pull_requests" DROP COLUMN "repo_url";--> statement-breakpoint
ALTER TABLE "github_installations" ALTER COLUMN "installed_by_user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "github_installations" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "github_installations" ALTER COLUMN "status" SET DATA TYPE "installation_status" USING "status"::"installation_status";--> statement-breakpoint
ALTER TABLE "github_installations" ALTER COLUMN "status" SET DEFAULT 'active'::"installation_status";--> statement-breakpoint
ALTER TABLE "pull_requests" ALTER COLUMN "state" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "pull_requests" ALTER COLUMN "state" SET DATA TYPE "pr_state" USING "state"::"pr_state";--> statement-breakpoint
ALTER TABLE "pull_requests" ALTER COLUMN "state" SET DEFAULT 'open'::"pr_state";--> statement-breakpoint
ALTER TABLE "pull_requests" ALTER COLUMN "source_branch" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pull_requests" ALTER COLUMN "target_branch" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "app_installation_id_idx" ON "pull_requests" ("github_installation_id");