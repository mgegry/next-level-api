import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769523803405 implements MigrationInterface {
    name = 'Migration1769523803405'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "receipt_item" ADD "name" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "receipt_item" DROP COLUMN "name"`);
    }

}
