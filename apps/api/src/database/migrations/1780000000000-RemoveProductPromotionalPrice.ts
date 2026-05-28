import type { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveProductPromotionalPrice1780000000000 implements MigrationInterface {
  readonly name = 'RemoveProductPromotionalPrice1780000000000'

  /**
   * Remove promotional price support from products.
   *
   * @param queryRunner - Active migration query runner : QueryRunner
   *
   * @returns Migration execution promise : Promise<void>
   */
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "CHK_products_promotional_price_lte_price"`,
    )
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "promotional_price"`)
  }

  /**
   * Restore promotional price support on products.
   *
   * @param queryRunner - Active migration query runner : QueryRunner
   *
   * @returns Migration rollback promise : Promise<void>
   */
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" ADD COLUMN "promotional_price" numeric(12, 2)`)
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "CHK_products_promotional_price_lte_price" CHECK (promotional_price IS NULL OR promotional_price <= price)`,
    )
  }
}
