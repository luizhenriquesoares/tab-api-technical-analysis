import { Controller, Get, Query } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('scrape')
  async scrapeBitcoinData(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string): Promise<void> {
    await this.scraperService.scrapeBitcoinData(startDate, endDate);
  }
}
