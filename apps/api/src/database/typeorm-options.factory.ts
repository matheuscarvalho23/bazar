import type { TypeOrmModuleOptions } from '@nestjs/typeorm'
import type { DataSourceOptions } from 'typeorm'
import type { IDatabaseConfig } from '../config/interfaces/database-config.interface'
import type { DatabaseSslOption } from './types/database-ssl-option.type'

/**
 * Create TypeORM options for the NestJS application runtime.
 *
 * @param databaseConfig - Database configuration : IDatabaseConfig
 *
 * @returns Nest TypeORM module options : TypeOrmModuleOptions
 */
export function createNestTypeOrmOptions(databaseConfig: IDatabaseConfig): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    url: databaseConfig.url,
    ssl: createSslOption(databaseConfig),
    synchronize: databaseConfig.synchronize,
    autoLoadEntities: true,
    migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  }
}

/**
 * Create TypeORM options for migration commands.
 *
 * @param databaseConfig - Database configuration : IDatabaseConfig
 *
 * @returns TypeORM data source options : DataSourceOptions
 */
export function createMigrationDataSourceOptions(
  databaseConfig: IDatabaseConfig,
): DataSourceOptions {
  return {
    type: 'postgres',
    url: databaseConfig.url,
    ssl: createSslOption(databaseConfig),
    synchronize: databaseConfig.synchronize,
    entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
    migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  }
}

/**
 * Create the PostgreSQL SSL option.
 *
 * @param databaseConfig - Database configuration : IDatabaseConfig
 *
 * @returns PostgreSQL SSL option : DatabaseSslOption
 */
function createSslOption(databaseConfig: IDatabaseConfig): DatabaseSslOption {
  if (!databaseConfig.ssl) {
    return false
  }

  return {
    rejectUnauthorized: false,
  }
}
