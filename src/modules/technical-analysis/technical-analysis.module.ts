import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Price } from '../price/price.entity';
import { PriceService } from '../price/price.service';
import { TechnicalAnalysisController } from './technical-analysis.controller';
import { PriceRepository } from '../price/price.repository';
import { TechnicalAnalysisService } from './technical-analysis.service';

@Module({
  imports: [TypeOrmModule.forFeature([Price])],
  controllers: [TechnicalAnalysisController],
  providers: [PriceRepository, PriceService, TechnicalAnalysisService],
})
export class TechnicalAnalysisModules {}
