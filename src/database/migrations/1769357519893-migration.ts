import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769357519893 implements MigrationInterface {
    name = 'Migration1769357519893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "receipt" ("id" SERIAL NOT NULL, "receipt_number" character varying, "receipt_date" date NOT NULL, "supplier_name" character varying NOT NULL, "supplier_tax_id" character varying, "total_amount" numeric(12,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b4b9ec7d164235fbba023da9832" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "receipt_item" ("id" SERIAL NOT NULL, "receipt_id" integer NOT NULL, CONSTRAINT "PK_f83b5790116dde891f8176d79d4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "receipt_item" ADD CONSTRAINT "FK_af93b7dae4cba8a37654272490d" FOREIGN KEY ("receipt_id") REFERENCES "receipt"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "receipt_item" DROP CONSTRAINT "FK_af93b7dae4cba8a37654272490d"`);
        await queryRunner.query(`DROP TABLE "receipt_item"`);
        await queryRunner.query(`DROP TABLE "receipt"`);
    }

}
