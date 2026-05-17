import type { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateInitialSchema1778976000000 implements MigrationInterface {
  readonly name = 'CreateInitialSchema1778976000000'

  /**
   * Create the initial MVP schema.
   *
   * @param queryRunner - Active migration query runner : QueryRunner
   *
   * @returns Migration execution promise : Promise<void>
   */
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    await queryRunner.query(
      `CREATE TYPE "public"."product_status" AS ENUM('active', 'inactive', 'reserved', 'sold')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."product_condition" AS ENUM('new', 'like_new', 'used', 'damaged')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."reservation_status" AS ENUM('new', 'whatsapp_opened', 'in_service', 'reserved', 'sold', 'cancelled', 'expired')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."stock_movement_type" AS ENUM('entry', 'exit', 'adjustment', 'reservation', 'reservation_cancelled', 'sale', 'import')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."import_status" AS ENUM('pending', 'processing', 'completed', 'completed_with_errors', 'failed')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."import_item_status" AS ENUM('imported', 'updated', 'ignored', 'error')`,
    )

    await queryRunner.query(`
      CREATE TABLE "admins" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "email" varchar NOT NULL,
        "password" varchar NOT NULL,
        "phone" varchar,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "slug" varchar NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "category_id" uuid,
        "name" varchar NOT NULL,
        "description" text,
        "brand" varchar,
        "size" varchar,
        "color" varchar,
        "gender" varchar,
        "condition" "public"."product_condition",
        "price" numeric(12, 2) NOT NULL,
        "promotional_price" numeric(12, 2),
        "status" "public"."product_status" NOT NULL DEFAULT 'active',
        "external_code" varchar,
        "import_source" varchar,
        "created_by_admin_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_products_promotional_price_lte_price"
          CHECK (promotional_price IS NULL OR promotional_price <= price),
        CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "product_images" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_id" uuid NOT NULL,
        "url" text NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_main" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "inventory" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_id" uuid NOT NULL,
        "available_quantity" integer NOT NULL DEFAULT 0,
        "reserved_quantity" integer NOT NULL DEFAULT 0,
        "sold_quantity" integer NOT NULL DEFAULT 0,
        "minimum_quantity" integer NOT NULL DEFAULT 0,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "CHK_inventory_available_quantity_non_negative"
          CHECK (available_quantity >= 0),
        CONSTRAINT "CHK_inventory_reserved_quantity_non_negative"
          CHECK (reserved_quantity >= 0),
        CONSTRAINT "CHK_inventory_sold_quantity_non_negative"
          CHECK (sold_quantity >= 0),
        CONSTRAINT "CHK_inventory_minimum_quantity_non_negative"
          CHECK (minimum_quantity >= 0),
        CONSTRAINT "REL_732fdb1f76432d65d2c136340d" UNIQUE ("product_id"),
        CONSTRAINT "PK_82aa5da437c5bbfb80703b08309" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "stock_movements" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_id" uuid NOT NULL,
        "admin_id" uuid,
        "type" "public"."stock_movement_type" NOT NULL,
        "quantity" integer NOT NULL,
        "reason" text,
        "reference_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_57a26b190618550d8e65fb860e7" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "customer_contacts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar,
        "phone" varchar NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bde619dbcb45a3e4d542e137bd3" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "interests_reservations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_id" uuid NOT NULL,
        "customer_contact_id" uuid,
        "customer_name" varchar,
        "customer_phone" varchar NOT NULL,
        "status" "public"."reservation_status" NOT NULL DEFAULT 'new',
        "whatsapp_message" text,
        "whatsapp_url" text,
        "expires_at" TIMESTAMP WITH TIME ZONE,
        "notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_939a50a9dda037e8ba4b1216fbf" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "product_imports" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "admin_id" uuid NOT NULL,
        "file_name" varchar,
        "source" varchar NOT NULL,
        "status" "public"."import_status" NOT NULL DEFAULT 'pending',
        "total_rows" integer NOT NULL DEFAULT 0,
        "total_imported" integer NOT NULL DEFAULT 0,
        "total_updated" integer NOT NULL DEFAULT 0,
        "total_ignored" integer NOT NULL DEFAULT 0,
        "total_errors" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "finished_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "CHK_product_imports_total_rows_non_negative"
          CHECK (total_rows >= 0),
        CONSTRAINT "CHK_product_imports_total_imported_non_negative"
          CHECK (total_imported >= 0),
        CONSTRAINT "CHK_product_imports_total_updated_non_negative"
          CHECK (total_updated >= 0),
        CONSTRAINT "CHK_product_imports_total_ignored_non_negative"
          CHECK (total_ignored >= 0),
        CONSTRAINT "CHK_product_imports_total_errors_non_negative"
          CHECK (total_errors >= 0),
        CONSTRAINT "PK_a02a4bd96cc40b9480f4ae9c4a0" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "product_import_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "import_id" uuid NOT NULL,
        "product_id" uuid,
        "row_number" integer NOT NULL,
        "external_code" varchar,
        "status" "public"."import_item_status" NOT NULL,
        "error_message" text,
        "original_data_json" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_b42bdefbec3683e77d6fc456205" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_products_category_id" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_products_created_by_admin_id" FOREIGN KEY ("created_by_admin_id") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_images" ADD CONSTRAINT "FK_product_images_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "inventory" ADD CONSTRAINT "FK_inventory_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_stock_movements_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_stock_movements_admin_id" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "interests_reservations" ADD CONSTRAINT "FK_interests_reservations_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "interests_reservations" ADD CONSTRAINT "FK_interests_reservations_customer_contact_id" FOREIGN KEY ("customer_contact_id") REFERENCES "customer_contacts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_imports" ADD CONSTRAINT "FK_product_imports_admin_id" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_import_items" ADD CONSTRAINT "FK_product_import_items_import_id" FOREIGN KEY ("import_id") REFERENCES "product_imports"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_import_items" ADD CONSTRAINT "FK_product_import_items_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )

    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_admins_email" ON "admins" ("email")`)
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_categories_slug" ON "categories" ("slug")`)
    await queryRunner.query(`CREATE INDEX "IDX_products_status" ON "products" ("status")`)
    await queryRunner.query(`CREATE INDEX "IDX_products_category_id" ON "products" ("category_id")`)
    await queryRunner.query(
      `CREATE INDEX "IDX_products_created_by_admin_id" ON "products" ("created_by_admin_id")`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_products_import_source_external_code" ON "products" ("import_source", "external_code") WHERE "import_source" IS NOT NULL AND "external_code" IS NOT NULL`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_product_images_product_id_sort_order" ON "product_images" ("product_id", "sort_order")`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_product_images_main_per_product" ON "product_images" ("product_id") WHERE "is_main" = true`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_inventory_product_id" ON "inventory" ("product_id")`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_stock_movements_product_id_created_at" ON "stock_movements" ("product_id", "created_at")`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_stock_movements_admin_id" ON "stock_movements" ("admin_id")`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_customer_contacts_phone" ON "customer_contacts" ("phone")`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_interests_reservations_product_id_status_created_at" ON "interests_reservations" ("product_id", "status", "created_at")`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_interests_reservations_customer_phone" ON "interests_reservations" ("customer_phone")`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_product_imports_admin_id_status_created_at" ON "product_imports" ("admin_id", "status", "created_at")`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_product_import_items_import_id_row_number" ON "product_import_items" ("import_id", "row_number")`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_product_import_items_product_id" ON "product_import_items" ("product_id")`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_product_import_items_external_code" ON "product_import_items" ("external_code")`,
    )
  }

  /**
   * Drop the initial MVP schema.
   *
   * @param queryRunner - Active migration query runner : QueryRunner
   *
   * @returns Migration rollback promise : Promise<void>
   */
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_product_import_items_external_code"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_product_import_items_product_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_product_import_items_import_id_row_number"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_product_imports_admin_id_status_created_at"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_interests_reservations_customer_phone"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_interests_reservations_product_id_status_created_at"`,
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_customer_contacts_phone"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_stock_movements_admin_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_stock_movements_product_id_created_at"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_inventory_product_id"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_product_images_main_per_product"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_product_images_product_id_sort_order"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_products_import_source_external_code"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_products_created_by_admin_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_products_category_id"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_products_status"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_categories_slug"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_admins_email"`)

    await queryRunner.query(
      `ALTER TABLE "product_import_items" DROP CONSTRAINT "FK_product_import_items_product_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_import_items" DROP CONSTRAINT "FK_product_import_items_import_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_imports" DROP CONSTRAINT "FK_product_imports_admin_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "interests_reservations" DROP CONSTRAINT "FK_interests_reservations_customer_contact_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "interests_reservations" DROP CONSTRAINT "FK_interests_reservations_product_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_stock_movements_admin_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_stock_movements_product_id"`,
    )
    await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_inventory_product_id"`)
    await queryRunner.query(
      `ALTER TABLE "product_images" DROP CONSTRAINT "FK_product_images_product_id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_products_created_by_admin_id"`,
    )
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_products_category_id"`)

    await queryRunner.query(`DROP TABLE "product_import_items"`)
    await queryRunner.query(`DROP TABLE "product_imports"`)
    await queryRunner.query(`DROP TABLE "interests_reservations"`)
    await queryRunner.query(`DROP TABLE "customer_contacts"`)
    await queryRunner.query(`DROP TABLE "stock_movements"`)
    await queryRunner.query(`DROP TABLE "inventory"`)
    await queryRunner.query(`DROP TABLE "product_images"`)
    await queryRunner.query(`DROP TABLE "products"`)
    await queryRunner.query(`DROP TABLE "categories"`)
    await queryRunner.query(`DROP TABLE "admins"`)

    await queryRunner.query(`DROP TYPE "public"."import_item_status"`)
    await queryRunner.query(`DROP TYPE "public"."import_status"`)
    await queryRunner.query(`DROP TYPE "public"."stock_movement_type"`)
    await queryRunner.query(`DROP TYPE "public"."reservation_status"`)
    await queryRunner.query(`DROP TYPE "public"."product_condition"`)
    await queryRunner.query(`DROP TYPE "public"."product_status"`)
  }
}
