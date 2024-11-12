import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/postgresql';
import { Gender } from '../users/users.enum';

@Entity({ tableName: 'users' })
export class UserEntity {
  @PrimaryKey()
  id: bigint;

  @Property({ columnType: 'varchar', unique: true, length: 30 })
  username: string;

  @Property({
    columnType: 'varchar',
    length: 30,
    nullable: true,
  })
  name: string;

  @Property({
    columnType: 'varchar',
    length: 30,
    nullable: true,
  })
  lastName: string;

  @Property({ columnType: 'varchar', nullable: true })
  profileImageUrl: string;

  @Property({
    columnType: 'varchar',
    nullable: true,
    length: 30,
  })
  bio: string;

  @Property({
    columnType: 'varchar',
    unique: true,
    nullable: true,
  })
  email: string;

  @Enum({
    columnType: 'enum',
    nativeEnumName: 'gender',
    items: () => Gender,
    length: 15,
  })
  gender: Gender;
}

// when fetching from github data, name and email can be null only username should be obligatory
// postgres automatically creates index to unique constraints and PK
