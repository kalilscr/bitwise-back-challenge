import { Migration } from '@mikro-orm/migrations';

export class Migration20241104152555_AlterTableUserAlterNameToNullable extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "users" alter column "name" type varchar using ("name"::varchar);`,
    );
    this.addSql(`alter table "users" alter column "name" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "users" alter column "name" type varchar using ("name"::varchar);`,
    );
    this.addSql(`alter table "users" alter column "name" set not null;`);
  }
}
