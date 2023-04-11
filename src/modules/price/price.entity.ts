import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'historical_prices' })
@Index(['date', 'variation'])
export class Price {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  lastPrice: number;

  @Column()
  asset: string;

  @Column()
  openPrice: number;

  @Column()
  highPrice: number;

  @Column()
  lowPrice: number;

  @Column()
  volume: number;

  @Column()
  variation: number;
}
