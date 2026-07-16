import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260716184151 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "site_banner" ("id" text not null, "name" text not null, "placement" text check ("placement" in ('announcement_top', 'footer_ticker')) not null default 'announcement_top', "messages" jsonb not null, "link_url" text null, "background_color" text not null default '#E63946', "text_color" text not null default '#FAFAF7', "alignment" text check ("alignment" in ('left', 'center', 'right')) not null default 'center', "display_mode" text check ("display_mode" in ('static', 'marquee')) not null default 'static', "is_active" boolean not null default true, "sort_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "site_banner_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_site_banner_deleted_at" ON "site_banner" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "site_banner" cascade;`);
  }

}
