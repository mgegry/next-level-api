import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770378274157 implements MigrationInterface {
    name = 'Migration1770378274157'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_session" ADD "refresh_expires_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_session" DROP COLUMN "refresh_expires_at"`);
    }

}
