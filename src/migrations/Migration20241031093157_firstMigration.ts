import { Migration } from '@mikro-orm/migrations';

export class Migration20241031093157_firstMigration extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "users" ("id" bigserial primary key, "user_name" varchar not null, "name" varchar not null, "last_name" varchar not null, "profile_image_url" varchar null, "bio" varchar null, "email" varchar not null, "gender" text check ("gender" in ('Male', 'Female', 'Not_Specified')) not null);`,
    );
    this.addSql(
      `alter table "users" add constraint "users_user_name_unique" unique ("user_name");`,
    );
    this.addSql(
      `alter table "users" add constraint "users_email_unique" unique ("email");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "users" cascade;`);
  }
}
