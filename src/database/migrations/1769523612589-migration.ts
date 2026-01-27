import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769523612589 implements MigrationInterface {
    name = 'Migration1769523612589'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "receipt_item" ADD "category_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "receipt_item" ADD "total_price" numeric(12,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "receipt_item" ADD "category_classification_confidence" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "receipt_item" DROP COLUMN "category_classification_confidence"`);
        await queryRunner.query(`ALTER TABLE "receipt_item" DROP COLUMN "total_price"`);
        await queryRunner.query(`ALTER TABLE "receipt_item" DROP COLUMN "category_id"`);
    }

}
