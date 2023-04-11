import { Controller, Post, Body } from '@nestjs/common';
import { TechnicalAnalysisService } from './technical-analysis.service';
import { CalculateRsiDto } from './dtos/calculate-rsi.dto';

@Controller('technical-analysis')
export class TechnicalAnalysisController {
  constructor(private readonly technicalAnalysisService: TechnicalAnalysisService) {}

  @Post('calculate-rsi')
  calculateRSI(@Body() data: CalculateRsiDto): number {
    return this.technicalAnalysisService.calculateRSI(data);
  }

  // Adicione endpoints para os outros indicadores
}
