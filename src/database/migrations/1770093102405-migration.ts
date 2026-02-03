import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770093102405 implements MigrationInterface {
    name = 'Migration1770093102405'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "receipt" ADD "s3_key" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "receipt" ADD "use_id" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "receipt" DROP COLUMN "use_id"`);
        await queryRunner.query(`ALTER TABLE "receipt" DROP COLUMN "s3_key"`);
    }

}
