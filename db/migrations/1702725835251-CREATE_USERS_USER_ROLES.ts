import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserRolesTable1702725607625 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "users_user_roles" (
                "id" SERIAL PRIMARY KEY,
                "roleId" INTEGER,
                "userId" INTEGER,
                CONSTRAINT "fk_role"
                    FOREIGN KEY ("roleId") 
                    REFERENCES "users_roles"("id")
                    ON DELETE CASCADE,
                CONSTRAINT "fk_user"
                    FOREIGN KEY ("userId") 
                    REFERENCES "users_users"("id")
                    ON DELETE CASCADE
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "users_user_roles";
        `);
  }
}
