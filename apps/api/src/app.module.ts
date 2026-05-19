import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import authConfig from './config/auth.config'
import databaseConfig from './config/database.config'
import { validateEnvironment } from './config/environment.validation'
import { createNestTypeOrmOptions } from './database/typeorm-options.factory'
import { AdminsModule } from './modules/admins/admins.module'
import { AuthModule } from './modules/auth/auth.module'
import type { IDatabaseConfig } from './config/interfaces/database-config.interface'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig],
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ReturnType<typeof createNestTypeOrmOptions> => {
        const config = configService.getOrThrow<IDatabaseConfig>('database')

        return createNestTypeOrmOptions(config)
      },
    }),
    AdminsModule,
    AuthModule,
  ],
})
export class AppModule {}
