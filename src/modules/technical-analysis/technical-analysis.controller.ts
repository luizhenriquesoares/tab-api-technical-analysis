import { Controller, Get, Query } from '@nestjs/common';
import { TechnicalAnalysisService } from './technical-analysis.service';

@Controller('technical-analysis')
export class TechnicalAnalysisController {
  constructor(private readonly technicalAnalysisService: TechnicalAnalysisService) {}

  @Get()
  async calculateTechnicalAnalysis(@Query('asset') asset: string, @Query('period') period: string) {
    return this.technicalAnalysisService.analyzeAsset(asset, period);
  }
}
