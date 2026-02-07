import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770385967883 implements MigrationInterface {
    name = 'Migration1770385967883'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant_membership" ADD "permission_version" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant_membership" DROP COLUMN "permission_version"`);
    }

}
