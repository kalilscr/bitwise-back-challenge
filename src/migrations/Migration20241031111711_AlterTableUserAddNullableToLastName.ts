import { Migration } from '@mikro-orm/migrations';

export class Migration20241031111711_AlterTableUserAddNullableToLastName extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "users" alter column "last_name" type varchar using ("last_name"::varchar);`,
    );
    this.addSql(`alter table "users" alter column "last_name" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "users" alter column "last_name" type varchar using ("last_name"::varchar);`,
    );
    this.addSql(`alter table "users" alter column "last_name" set not null;`);
  }
}
