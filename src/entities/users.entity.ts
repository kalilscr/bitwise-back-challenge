import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/postgresql';
import { Gender } from '../users/users.enum';

@Entity({ tableName: 'users' })
export class UserEntity {
  @PrimaryKey()
  id: bigint;

  @Property({ columnType: 'varchar', unique: true, length: 30 })
  userName: string;

  @Property({ columnType: 'varchar', length: 30 })
  name: string;

  @Property({ columnType: 'varchar', length: 30 })
  lastName: string;

  @Property({ columnType: 'varchar', nullable: true })
  profileImageUrl: string;

  @Property({ columnType: 'varchar', nullable: true, length: 30 })
  bio: string;

  @Property({ columnType: 'varchar', unique: true })
  email: string;

  @Enum({ columnType: 'enum', items: () => Gender, nullable: true })
  gender: Gender;
}
