import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769524755485 implements MigrationInterface {
    name = 'Migration1769524755485'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "receipt_item" ADD "item_price" numeric(12,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "receipt_item" ADD "quantity" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "receipt_item" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "receipt_item" DROP COLUMN "item_price"`);
    }

}
