import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { Price } from '../price/price.entity';
import { PriceService } from '../price/price.service';

@Module({
  imports: [TypeOrmModule.forFeature([Price])],
  controllers: [ScraperController],
  providers: [ScraperService, PriceService],
})
export class ScraperModule {}
