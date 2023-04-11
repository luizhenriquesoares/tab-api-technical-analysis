import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProducerService } from './producer.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [ProducerService, ConfigService],
  exports: [ProducerService],
})
export class ProducerModule {}
