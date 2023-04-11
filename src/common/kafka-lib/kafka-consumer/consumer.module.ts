import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConsumerService } from './consumer.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [ConsumerService, ConfigService],
  exports: [ConsumerService],
})
export class ConsumerModule {}
