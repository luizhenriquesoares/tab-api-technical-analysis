import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { Price } from '../price/price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Price])],
  controllers: [ScraperController],
  providers: [ScraperService],
})
export class ScraperModule {}
