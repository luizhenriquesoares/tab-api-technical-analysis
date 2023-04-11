import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PriceRepository } from '../price/price.repository';
import { MoreThan } from 'typeorm';

@Injectable()
export class TechnicalAnalysisService {
  constructor(
    @InjectRepository(PriceRepository)
    private readonly priceRepository: PriceRepository,
  ) {}

  public async analyzeAsset(asset: string, period: string) {
    const prices = await this.getPricesForPeriod(asset, period);

    const closePrices = prices.map((price) => price.lastPrice);
    const volumes = prices.map((price) => price.volume);

    const indicators = {
      sma50: this.calculateSimpleMovingAverage(closePrices, 50),
      sma200: this.calculateSimpleMovingAverage(closePrices, 200),
      ema9: this.calculateExponentialMovingAverage(closePrices, 9),
      macd: this.calculateMovingAverageConvergenceDivergence(closePrices),
      rsi: this.calculateRelativeStrengthIndex(closePrices, 14),
      bbands: this.calculateBollingerBands(closePrices, 20, 2),
      volumeSMA50: this.calculateVolumeSMA(volumes, 50),
      volumeSMA200: this.calculateVolumeSMA(volumes, 200),
      fibonacciRetracements: this.calculateFibonacciRetracements(Math.min(...closePrices), Math.max(...closePrices)),
      stochastic: this.calculateStochastic(
        prices.map((price) => price.highPrice),
        prices.map((price) => price.lowPrice),
        closePrices,
      ),
      obv: this.calculateOBV(closePrices, volumes),
      atr: this.calculateAverageTrueRange(
        prices.map((price) => price.highPrice),
        prices.map((price) => price.lowPrice),
        closePrices,
        14,
      ),
    };

    return { asset, period, prices, ...indicators };
  }

  private async getPricesForPeriod(asset: string, period: string) {
    return await this.priceRepository.find({
      where: {
        asset,
        date: MoreThan(new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000)),
      },
      order: {
        date: 'ASC',
      },
    });
  }

  private calculateSimpleMovingAverage(prices: number[], windowSize: number): number[] {
    const simpleMovingAverage: number[] = [];
    const length = prices.length;

    let sum = 0;
    for (let i = 0; i < windowSize; i++) {
      sum += prices[i];
    }

    simpleMovingAverage.push(sum / windowSize);

    for (let i = windowSize; i < length; i++) {
      sum += prices[i] - prices[i - windowSize];
      simpleMovingAverage.push(sum / windowSize);
    }
    return simpleMovingAverage;
  }

  private calculateExponentialMovingAverage(prices: number[], windowSize: number): number[] {
    const exponentialMovingAverage: number[] = [];
    const length = prices.length;

    // Calculate the initial Simple Moving Average (SMA) for the first EMA value
    let sum = 0;
    for (let i = 0; i < windowSize; i++) {
      sum += prices[i];
    }
    const sma = sum / windowSize;
    exponentialMovingAverage.push(sma);

    // Smoothing factor
    const smoothingFactor = 2 / (windowSize + 1);

    // Calculate EMA for the remaining prices
    for (let i = windowSize; i < length; i++) {
      const currentEma =
        (prices[i] - exponentialMovingAverage[i - 1]) * smoothingFactor + exponentialMovingAverage[i - 1];
      exponentialMovingAverage.push(currentEma);
    }
    return exponentialMovingAverage;
  }
  private calculateMovingAverageConvergenceDivergence(
    prices: number[],
    shortPeriod = 12,
    longPeriod = 26,
    signalPeriod = 9,
  ): { macdLine: number[]; signalLine: number[]; histogram: number[] } {
    if (shortPeriod >= longPeriod) {
      throw new Error('Short period must be smaller than long period.');
    }

    // Calculate short-term and long-term Exponential Moving Averages (EMAs)
    const shortEMA = this.calculateExponentialMovingAverage(prices, shortPeriod);
    const longEMA = this.calculateExponentialMovingAverage(prices, longPeriod);

    // Calculate the MACD line (difference between short-term and long-term EMAs)
    const macdLine = shortEMA.slice(longPeriod - shortPeriod).map((shortValue, index) => shortValue - longEMA[index]);

    // Calculate the signal line (EMA of the MACD line)
    const signalLine = this.calculateExponentialMovingAverage(macdLine, signalPeriod);

    // Calculate the histogram (difference between the MACD line and the signal line)
    const histogram = macdLine.slice(signalPeriod - 1).map((macdValue, index) => macdValue - signalLine[index]);

    return { macdLine, signalLine, histogram };
  }

  private calculateRelativeStrengthIndex(prices: number[], windowSize: number): number[] {
    const length = prices.length;
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    // Calculate gains and losses
    for (let i = 1; i < length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(Math.max(change, 0));
      losses.push(Math.max(-change, 0));
    }

    // Calculate initial average gains and losses
    let sumGain = 0;
    let sumLoss = 0;
    for (let i = 0; i < windowSize; i++) {
      sumGain += gains[i];
      sumLoss += losses[i];
    }
    let averageGain = sumGain / windowSize;
    let averageLoss = sumLoss / windowSize;

    // Calculate the first RSI value
    let rs = averageGain / averageLoss;
    rsi.push(100 - 100 / (1 + rs));

    // Calculate RSI for the remaining prices
    for (let i = windowSize; i < length - 1; i++) {
      averageGain = (averageGain * (windowSize - 1) + gains[i]) / windowSize;
      averageLoss = (averageLoss * (windowSize - 1) + losses[i]) / windowSize;

      rs = averageGain / averageLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
    return rsi;
  }

  private calculateBollingerBands(
    prices: number[],
    windowSize: number,
    numStdDeviations: number,
  ): { upperBand: number[]; middleBand: number[]; lowerBand: number[] } {
    if (numStdDeviations < 0) {
      throw new Error('Number of standard deviations must be greater than or equal to 0.');
    }

    const length = prices.length;
    const upperBand: number[] = [];
    const middleBand: number[] = [];
    const lowerBand: number[] = [];

    // Calculate the middle band (SMA)
    for (let i = windowSize - 1; i < length; i++) {
      let sum = 0;
      for (let j = i - (windowSize - 1); j <= i; j++) {
        sum += prices[j];
      }
      middleBand.push(sum / windowSize);
    }

    // Calculate the upper and lower bands
    for (let i = windowSize - 1; i < length; i++) {
      let sumSquaredDiffs = 0;
      for (let j = i - (windowSize - 1); j <= i; j++) {
        const diff = prices[j] - middleBand[i - (windowSize - 1)];
        sumSquaredDiffs += diff * diff;
      }

      const stdDeviation = Math.sqrt(sumSquaredDiffs / windowSize);
      upperBand.push(middleBand[i - (windowSize - 1)] + numStdDeviations * stdDeviation);
      lowerBand.push(middleBand[i - (windowSize - 1)] - numStdDeviations * stdDeviation);
    }

    return {
      upperBand,
      middleBand,
      lowerBand,
    };
  }

  private calculateVolumeSMA(volumes: number[], windowSize: number): number[] {
    const length = volumes.length;
    const volumeSMA: number[] = [];

    // Calculate the volume simple moving average (SMA)
    for (let i = windowSize - 1; i < length; i++) {
      let sum = 0;
      for (let j = i - (windowSize - 1); j <= i; j++) {
        sum += volumes[j];
      }
      volumeSMA.push(sum / windowSize);
    }

    return volumeSMA;
  }

  private calculateFibonacciRetracements(minPrice: number, maxPrice: number): { [key: string]: number } {
    // Calculate Fibonacci retracement levels
    const retracements = {
      '0.0%': maxPrice,
      '23.6%': maxPrice - (maxPrice - minPrice) * 0.236,
      '38.2%': maxPrice - (maxPrice - minPrice) * 0.382,
      '50.0%': maxPrice - (maxPrice - minPrice) * 0.5,
      '61.8%': maxPrice - (maxPrice - minPrice) * 0.618,
      '76.4%': maxPrice - (maxPrice - minPrice) * 0.764,
      '100.0%': minPrice,
    };

    return retracements;
  }

  private calculateStochastic(
    highPrices: number[],
    lowPrices: number[],
    closePrices: number[],
    kPeriod = 14,
    dPeriod = 3,
  ): { kValues: number[]; dValues: number[] } {
    if (highPrices.length !== lowPrices.length || highPrices.length !== closePrices.length) {
      throw new Error('High, low, and close price arrays must be the same size');
    }

    const kValues: number[] = [];
    const dValues: number[] = [];

    for (let i = kPeriod - 1; i < highPrices.length; i++) {
      const highestHigh = Math.max(...highPrices.slice(i - kPeriod + 1, i + 1));
      const lowestLow = Math.min(...lowPrices.slice(i - kPeriod + 1, i + 1));

      const k = ((closePrices[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
      kValues.push(k);
    }

    for (let i = dPeriod - 1; i < kValues.length; i++) {
      const d = kValues.slice(i - dPeriod + 1, i + 1).reduce((acc, val) => acc + val, 0) / dPeriod;
      dValues.push(d);
    }
    return { kValues, dValues };
  }

  private calculateOBV(closePrices: number[], volumes: number[]): number[] {
    if (closePrices.length !== volumes.length) {
      throw new Error('Close price and volume arrays must be the same size');
    }

    const obvValues: number[] = [volumes[0]];

    for (let i = 1; i < closePrices.length; i++) {
      const previousObv = obvValues[i - 1];
      const currentVolume = closePrices[i] > closePrices[i - 1] ? volumes[i] : -volumes[i];
      obvValues.push(previousObv + currentVolume);
    }

    return obvValues;
  }
  private calculateAverageTrueRange(
    highPrices: number[],
    lowPrices: number[],
    closePrices: number[],
    windowSize: number,
  ): number[] {
    if (highPrices.length !== lowPrices.length || highPrices.length !== closePrices.length) {
      throw new Error('High, low, and close price arrays must be the same size');
    }

    const trueRanges: number[] = [];
    const averageTrueRanges: number[] = [];

    for (let i = 1; i < highPrices.length; i++) {
      const tr = Math.max(
        highPrices[i] - lowPrices[i],
        Math.abs(highPrices[i] - closePrices[i - 1]),
        Math.abs(lowPrices[i] - closePrices[i - 1]),
      );
      trueRanges.push(tr);
    }

    let sum = 0;
    for (let i = 0; i < windowSize; i++) {
      sum += trueRanges[i];
    }
    averageTrueRanges.push(sum / windowSize);

    for (let i = windowSize; i < trueRanges.length; i++) {
      const atr = (averageTrueRanges[i - windowSize] * (windowSize - 1) + trueRanges[i]) / windowSize;
      averageTrueRanges.push(atr);
    }

    return averageTrueRanges;
  }
}
