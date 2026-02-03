import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770093126257 implements MigrationInterface {
    name = 'Migration1770093126257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "receipt" RENAME COLUMN "use_id" TO "user_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "receipt" RENAME COLUMN "user_id" TO "use_id"`);
    }

}
