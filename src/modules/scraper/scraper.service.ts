import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import puppeteer from 'puppeteer';
import { PriceService } from '../price/price.service';

@Injectable()
export class ScraperService {
  constructor(private readonly priceService: PriceService) {}

  async scrapeBitcoinData(startDate?: string, endDate?: string): Promise<void> {
    const url = endDate
      ? `https://br.investing.com/crypto/bitcoin/historical-data?start_date=${startDate}&end_date=${endDate}`
      : 'https://br.investing.com/crypto/bitcoin/historical-data';

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('#curr_table');

    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#curr_table tbody tr'));
      return rows.map((row) => {
        const [date, price, open, high, low, vol, change] = Array.from(row.querySelectorAll('td')).map(
          (td) => td.innerText,
        );
        return {
          date,
          lastPrice: price,
          asset: 'BTC',
          openPrice: open,
          highPrice: high,
          lowPrice: low,
          volume: vol,
          variation: change,
        };
      });
    });

    await this.priceService.saveData(data);
    await browser.close();
  }

  @Cron('0 0 * * *') // Run at midnight every day
  async scrapeDailyData(): Promise<void> {
    await this.scrapeBitcoinData();
  }
}
