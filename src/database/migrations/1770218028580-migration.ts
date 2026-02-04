import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770218028580 implements MigrationInterface {
    name = 'Migration1770218028580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_session" ALTER COLUMN "current_tenant_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_session" ALTER COLUMN "current_tenant_id" SET NOT NULL`);
    }

}
