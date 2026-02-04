import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770214650470 implements MigrationInterface {
    name = 'Migration1770214650470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" ADD "max_concurrent_sessions" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "max_concurrent_sessions"`);
    }

}
