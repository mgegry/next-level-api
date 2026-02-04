import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770198182503 implements MigrationInterface {
    name = 'Migration1770198182503'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_session" ALTER COLUMN "refresh_token_hash" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_session" ALTER COLUMN "refresh_token_hash" SET NOT NULL`);
    }

}
