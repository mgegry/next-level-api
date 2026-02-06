import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770373158397 implements MigrationInterface {
    name = 'Migration1770373158397'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant_membership" RENAME COLUMN "role" TO "role_id"`);
        await queryRunner.query(`ALTER TYPE "public"."tenant_membership_role_enum" RENAME TO "tenant_membership_role_id_enum"`);
        await queryRunner.query(`CREATE TABLE "permission" ("key" character varying(128) NOT NULL, "category" character varying(64) NOT NULL, "description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_20ff45fefbd3a7c04d2572c3bbd" PRIMARY KEY ("key"))`);
        await queryRunner.query(`CREATE TABLE "tenant_role_permission" ("role_id" integer NOT NULL, "permission_key" character varying(128) NOT NULL, CONSTRAINT "PK_c0eeb56103971b09700b7fed8ef" PRIMARY KEY ("role_id", "permission_key"))`);
        await queryRunner.query(`CREATE TABLE "tenant_role" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "name" character varying(64) NOT NULL, "is_system" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_c5789699c18ab41316d010c1cea" UNIQUE ("tenant_id", "name"), CONSTRAINT "PK_36def0c70162a40b8201d97ff11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_14486463fbd7c51a7ca22e9871" ON "tenant_role" ("tenant_id") `);
        await queryRunner.query(`ALTER TABLE "tenant_membership" DROP COLUMN "role_id"`);
        await queryRunner.query(`ALTER TABLE "tenant_membership" ADD "role_id" integer`);
        await queryRunner.query(`ALTER TABLE "tenant_role_permission" ADD CONSTRAINT "FK_094e2d4ac0d0e8b68d29d1c3ceb" FOREIGN KEY ("role_id") REFERENCES "tenant_role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenant_role_permission" ADD CONSTRAINT "FK_958932670b07d985a4a949cb41e" FOREIGN KEY ("permission_key") REFERENCES "permission"("key") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenant_role" ADD CONSTRAINT "FK_14486463fbd7c51a7ca22e9871f" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenant_membership" ADD CONSTRAINT "FK_95799d597201cd62e829dbc0f95" FOREIGN KEY ("role_id") REFERENCES "tenant_role"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tenant_membership" DROP CONSTRAINT "FK_95799d597201cd62e829dbc0f95"`);
        await queryRunner.query(`ALTER TABLE "tenant_role" DROP CONSTRAINT "FK_14486463fbd7c51a7ca22e9871f"`);
        await queryRunner.query(`ALTER TABLE "tenant_role_permission" DROP CONSTRAINT "FK_958932670b07d985a4a949cb41e"`);
        await queryRunner.query(`ALTER TABLE "tenant_role_permission" DROP CONSTRAINT "FK_094e2d4ac0d0e8b68d29d1c3ceb"`);
        await queryRunner.query(`ALTER TABLE "tenant_membership" DROP COLUMN "role_id"`);
        await queryRunner.query(`ALTER TABLE "tenant_membership" ADD "role_id" "public"."tenant_membership_role_id_enum" NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_14486463fbd7c51a7ca22e9871"`);
        await queryRunner.query(`DROP TABLE "tenant_role"`);
        await queryRunner.query(`DROP TABLE "tenant_role_permission"`);
        await queryRunner.query(`DROP TABLE "permission"`);
        await queryRunner.query(`ALTER TYPE "public"."tenant_membership_role_id_enum" RENAME TO "tenant_membership_role_enum"`);
        await queryRunner.query(`ALTER TABLE "tenant_membership" RENAME COLUMN "role_id" TO "role"`);
    }

}
