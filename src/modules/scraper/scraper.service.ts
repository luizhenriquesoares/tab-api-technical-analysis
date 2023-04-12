import { Injectable } from '@nestjs/common';
import { PriceService } from '../price/price.service';
import axios from 'axios';
import { JSDOM } from 'jsdom';

@Injectable()
export class ScraperService {
  constructor(private readonly priceService: PriceService) {}

  async scrapeBitcoinData(startDate: string, endDate: string): Promise<void> {
    console.debug(`Iniciando coleta de dados para o período de ${startDate} até ${endDate}`);

    const data = await this.fetchBitcoinData(startDate, endDate);
    await this.priceService.saveData(data);

    console.debug(`Dados coletados e salvos para o período de ${startDate} até ${endDate}`);
  }

  async fetchBitcoinData(startDate: string, endDate: string): Promise<any[]> {
    const url = 'https://br.investing.com/instruments/HistoricalDataAjax';
    const formData = new URLSearchParams();
    formData.append('curr_id', '1057391');
    formData.append('smlID', '25609848');
    formData.append('header', 'null');
    formData.append('st_date', startDate);
    formData.append('end_date', endDate);
    formData.append('interval_sec', 'Daily');
    formData.append('sort_col', 'date');
    formData.append('sort_ord', 'DESC');
    formData.append('action', 'historical_data');

    const response = await axios.post(url, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.39',
        Referer: 'https://br.investing.com/crypto/bitcoin/historical-data',
      },
    });

    const data = this.parseTableData(response.data);
    return data;
  }

  private parseTableData(htmlString: string): any[] {
    const dom = new JSDOM(htmlString);
    const document = dom.window.document;
    const rows = Array.from(document.querySelectorAll('#curr_table tbody tr'));

    return rows.map((row: HTMLElement) => {
      const [date, price, open, high, low, vol, change] = Array.from(row.querySelectorAll('td')).map(
        (td: HTMLElement) => td.textContent,
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
  }
}
