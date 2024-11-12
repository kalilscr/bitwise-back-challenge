import { Migration } from '@mikro-orm/migrations';

export class Migration20241108195851 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "users" drop constraint "users_user_name_unique";`);

    this.addSql(`alter table "users" rename column "user_name" to "username";`);
    this.addSql(`alter table "users" add constraint "users_username_unique" unique ("username");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "users" drop constraint "users_username_unique";`);

    this.addSql(`alter table "users" rename column "username" to "user_name";`);
    this.addSql(`alter table "users" add constraint "users_user_name_unique" unique ("user_name");`);
  }

}
