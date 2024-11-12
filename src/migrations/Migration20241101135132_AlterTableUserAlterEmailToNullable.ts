import { Migration } from '@mikro-orm/migrations';

export class Migration20241101135132_AlterTableUserAlterEmailToNullable extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "users" alter column "email" type varchar using ("email"::varchar);`,
    );
    this.addSql(`alter table "users" alter column "email" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "users" alter column "email" type varchar using ("email"::varchar);`,
    );
    this.addSql(`alter table "users" alter column "email" set not null;`);
  }
}
