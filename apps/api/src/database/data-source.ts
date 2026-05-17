import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { createDatabaseConfig } from '../config/database.config'
import { validateEnvironment } from '../config/environment.validation'
import { createMigrationDataSourceOptions } from './typeorm-options.factory'

const environment = validateEnvironment(process.env)
const databaseConfig = createDatabaseConfig(environment)

export default new DataSource(createMigrationDataSourceOptions(databaseConfig))
