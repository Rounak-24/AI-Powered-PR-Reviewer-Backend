CREATE TABLE "github_installations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"installation_id" bigint NOT NULL,
	"installation_html_url" text,
	"account_type" varchar(30) NOT NULL,
	"installed_by_user_id" uuid,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"permissions" jsonb DEFAULT '{}' NOT NULL,
	"repository_selection" varchar(30) NOT NULL,
	"suspended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pull_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"github_repository_id" bigint NOT NULL,
	"github_pr_id" bigint NOT NULL,
	"pr_number" integer NOT NULL,
	"title" varchar(512) NOT NULL,
	"description" text,
	"state" varchar(30) DEFAULT 'open' NOT NULL,
	"github_pr_html_url" text NOT NULL,
	"is_draft" boolean DEFAULT false NOT NULL,
	"is_merged" boolean DEFAULT false NOT NULL,
	"author_github_id" bigint NOT NULL,
	"author_github_username" varchar(255) NOT NULL,
	"author_github_profile_url" text,
	"source_branch" varchar(255),
	"target_branch" varchar(255),
	"base_sha" varchar(64) NOT NULL,
	"head_sha" varchar(64) NOT NULL,
	"additions" integer DEFAULT 0 NOT NULL,
	"deletions" integer DEFAULT 0 NOT NULL,
	"changed_files_count" integer DEFAULT 0 NOT NULL,
	"commits_count" integer DEFAULT 0 NOT NULL,
	"github_diff_url" text NOT NULL,
	"github_patch_url" text NOT NULL,
	"merged_at" timestamp with time zone,
	"github_created_at" timestamp with time zone NOT NULL,
	"github_updated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"github_id" bigint NOT NULL,
	"github_username" varchar(255) NOT NULL,
	"github_name" varchar(255),
	"github_email" varchar(255),
	"github_avatar_url" text,
	"github_html_url" text,
	"github_location" varchar(255),
	"github_bio" text,
	"oauth_access_token" text NOT NULL,
	"oauth_refresh_token" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "github_installation_id_idx" ON "github_installations" ("installation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "github_installation_user_idx" ON "github_installations" ("installed_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_id_idx" ON "pull_requests" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "github_pr_id_idx" ON "pull_requests" ("github_pr_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_github_id_idx" ON "users" ("github_id");--> statement-breakpoint
ALTER TABLE "github_installations" ADD CONSTRAINT "github_installations_installed_by_user_id_users_id_fkey" FOREIGN KEY ("installed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;