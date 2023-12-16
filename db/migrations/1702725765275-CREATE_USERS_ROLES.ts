import { UserRoles } from '@app/common/users/enum';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolesTable1702725607620 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const userRolesEnum = Object.values(UserRoles)
      .map((role) => `'${role}'`)
      .join(', ');

    await queryRunner.query(`
            CREATE TYPE "user_roles_enum" AS ENUM(${userRolesEnum});
            CREATE TABLE "users_roles" (
                "id" SERIAL PRIMARY KEY,
                "name" "user_roles_enum" NOT NULL DEFAULT '${UserRoles.Customer}'
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "users_roles";
            DROP TYPE "user_roles_enum";
        `);
  }
}
