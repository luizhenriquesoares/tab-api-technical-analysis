import { Controller, Get, Query } from '@nestjs/common';
import { PriceService } from './price.service';

@Controller('price')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get()
  async getPricesByDateRange(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string): Promise<any> {
    if (startDate && endDate) {
      return await this.priceService.getPricesByDateRange(new Date(startDate), new Date(endDate));
    } else {
      return await this.priceService.getLatestPrice();
    }
  }
}
