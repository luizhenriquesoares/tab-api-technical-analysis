import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { envValidate } from './common/config/env.validation';
import { HealthController } from './modules/health/health.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from './common/database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ScraperModule } from './modules/scraper/scraper.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Price } from './modules/price/price.entity';

@Module({
  controllers: [HealthController],
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () =>
        await Promise.resolve({
          type: 'sqlite',
          database: 'data.sqlite',
          synchronize: false,
          migrationsRun: false,
          logging: false,
          entities: [__dirname, 'dist/src/modules/**/*entity{.ts,.js}'],
          migrations: ['../../db/migrations/**/*.{ts,js}'],
          subscribers: ['./db/subscribers/**/*.{ts,js}'],
          cli: {
            entitiesDir: './db/migrations/entities',
            migrationsDir: './db/migrations',
            subscribersDir: './db/subscribers',
          },
        }),
    }),
    ScheduleModule.forRoot(),
    ScraperModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '3h' },
    }),
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidate,
    }),
    TerminusModule,
    DatabaseModule,
  ],
})
export class AppModule {}
