import { IsNumber, IsNotEmpty } from 'class-validator';

export class CalculateRsiDto {
  @IsNotEmpty()
  @IsNumber()
  period: number;

  @IsNotEmpty()
  prices: number[];
}
