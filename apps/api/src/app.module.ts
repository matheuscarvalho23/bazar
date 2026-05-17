import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import databaseConfig from './config/database.config'
import { validateEnvironment } from './config/environment.validation'
import { createNestTypeOrmOptions } from './database/typeorm-options.factory'
import type { IDatabaseConfig } from './config/interfaces/database-config.interface'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ReturnType<typeof createNestTypeOrmOptions> => {
        const config = configService.getOrThrow<IDatabaseConfig>('database')

        return createNestTypeOrmOptions(config)
      },
    }),
  ],
})
export class AppModule {}
