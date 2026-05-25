import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

const DEFAULT_CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']

/**
 * Return the allowed browser origins for CORS.
 *
 * @returns Allowed CORS origins : string[]
 */
function getCorsOrigins(): string[] {
  const configuredOrigins = process.env.CORS_ORIGIN

  if (!configuredOrigins) {
    return DEFAULT_CORS_ORIGINS
  }

  return configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
}

/**
 * Bootstrap the NestJS API application.
 *
 * @returns void : Promise<void>
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: getCorsOrigins(),
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )

  await app.listen(3001)
}

void bootstrap()
