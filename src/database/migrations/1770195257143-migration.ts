import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1770195257143 implements MigrationInterface {
    name = 'Migration1770195257143'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_ae07d48a61ca20ab3586d397a71"`);
        await queryRunner.query(`CREATE TYPE "public"."tenant_membership_role_enum" AS ENUM('admin', 'moderator', 'user')`);
        await queryRunner.query(`CREATE TYPE "public"."tenant_membership_status_enum" AS ENUM('ACTIVE', 'INVITED', 'DISABLED')`);
        await queryRunner.query(`CREATE TABLE "tenant_membership" ("id" SERIAL NOT NULL, "tenant_id" integer NOT NULL, "user_id" integer NOT NULL, "role" "public"."tenant_membership_role_enum" NOT NULL, "status" "public"."tenant_membership_status_enum" NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_d37498083d043449be904c208d4" UNIQUE ("tenant_id", "user_id"), CONSTRAINT "PK_38e3138fdae6f512cb782bc1ac7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_session" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "refresh_token_hash" text NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "last_seen_at" TIMESTAMP WITH TIME ZONE, "user_agent" text, "device_fingerprint" text, "current_tenant_id" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_adf3b49590842ac3cf54cac451a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_006f87c093c917f3c6ee477697" ON "user_session" ("is_active") `);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refresh_token_hash"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tenant_id"`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "erp_config_encrypted"`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "erp_config_encrypted" text`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "tenant_membership" ADD CONSTRAINT "FK_1bf64d9b30103ff5e13967387c1" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tenant_membership" ADD CONSTRAINT "FK_dad38711672f0651ce4107954b3" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_session" ADD CONSTRAINT "FK_13275383dcdf095ee29f2b3455a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_session" DROP CONSTRAINT "FK_13275383dcdf095ee29f2b3455a"`);
        await queryRunner.query(`ALTER TABLE "tenant_membership" DROP CONSTRAINT "FK_dad38711672f0651ce4107954b3"`);
        await queryRunner.query(`ALTER TABLE "tenant_membership" DROP CONSTRAINT "FK_1bf64d9b30103ff5e13967387c1"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "tenant" DROP COLUMN "erp_config_encrypted"`);
        await queryRunner.query(`ALTER TABLE "tenant" ADD "erp_config_encrypted" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "tenant_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "refresh_token_hash" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "role" character varying NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_006f87c093c917f3c6ee477697"`);
        await queryRunner.query(`DROP TABLE "user_session"`);
        await queryRunner.query(`DROP TABLE "tenant_membership"`);
        await queryRunner.query(`DROP TYPE "public"."tenant_membership_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."tenant_membership_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_ae07d48a61ca20ab3586d397a71" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
