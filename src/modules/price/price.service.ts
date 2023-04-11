import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Price } from './price.entity';

@Injectable()
export class PriceService {
  constructor(
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
  ) {}

  async saveData(data: any): Promise<void> {
    const prices = data.map((d) => this.priceRepository.create(d));
    await this.priceRepository.save(prices);
  }

  async getPricesByDateRange(startDate: Date, endDate: Date): Promise<Price[]> {
    return await this.priceRepository
      .createQueryBuilder('price')
      .where('price.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('price.date', 'ASC')
      .getMany();
  }

  async getLatestPrice(): Promise<Price> {
    return await this.priceRepository.createQueryBuilder('price').orderBy('price.date', 'DESC').getOne();
  }
}
