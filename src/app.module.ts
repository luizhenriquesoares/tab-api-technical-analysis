import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { envValidate } from './common/config/env.validation';
import { HealthController } from './modules/health/health.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './nest-core/auth/strategies/jwt.strategy';
import { AuthModule } from './nest-core/auth/auth.module';
import { DatabaseModule } from './common/database/database.module';

@Module({
  controllers: [HealthController],
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
    AuthModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
