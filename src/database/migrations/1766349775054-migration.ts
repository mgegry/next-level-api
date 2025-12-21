import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1766349775054 implements MigrationInterface {
    name = 'Migration1766349775054'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tenant_erp_provider_enum" AS ENUM('softone', 'wme')`);
        await queryRunner.query(`CREATE TABLE "tenant" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "erp_provider" "public"."tenant_erp_provider_enum" NOT NULL, "erp_config_encrypted" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_da8c6efd67bb301e810e56ac139" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "first_name" character varying, "last_name" character varying, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" character varying NOT NULL, "refresh_token_hash" text, "tenant_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_ae07d48a61ca20ab3586d397a71" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_ae07d48a61ca20ab3586d397a71"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "tenant"`);
        await queryRunner.query(`DROP TYPE "public"."tenant_erp_provider_enum"`);
    }

}
