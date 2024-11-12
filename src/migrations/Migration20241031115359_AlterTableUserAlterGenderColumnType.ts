import { Migration } from '@mikro-orm/migrations';

export class Migration20241031115359_AlterTableUserAlterGenderColumnType extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create type "gender" as enum ('Male', 'Female', 'Not_Specified');`,
    );
    this.addSql(
      `alter table "users" drop constraint if exists "users_gender_check";`,
    );

    this.addSql(
      `alter table "users" alter column "gender" type "gender" using ("gender"::"gender");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "users" alter column "gender" type varchar using ("gender"::varchar);`,
    );
    this.addSql(
      `alter table "users" add constraint "users_gender_check" check("gender" in ('Male', 'Female', 'Not_Specified'));`,
    );

    this.addSql(`drop type "gender";`);
  }
}
