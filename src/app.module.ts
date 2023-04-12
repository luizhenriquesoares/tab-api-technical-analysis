import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { envValidate } from './common/config/env.validation';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ScraperModule } from './modules/scraper/scraper.module';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  controllers: [],
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db/database.sqlite',
      logging: true,
      synchronize: false,
      entities: ['dist/**/*.entity.js'],
      subscribers: ['dist/db/subscribers/*.js'],
      migrations: ['dist/db/migrations/*.js'],
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
  ],
})
export class AppModule {}
