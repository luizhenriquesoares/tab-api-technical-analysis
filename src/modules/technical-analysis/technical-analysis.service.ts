import { Injectable } from '@nestjs/common';

@Injectable()
export class TechnicalAnalysisService {
  public calculateSMA(prices: number[], windowSize: number): number[] {
    const sma: number[] = [];
    const length = prices.length;

    // Validação dos parâmetros
    if (windowSize <= 0 || windowSize > length) {
      throw new Error('window size must be greater than 0 and less than or equal to price array size.');
    }

    let sum = 0;
    for (let i = 0; i < windowSize; i++) {
      sum += prices[i];
    }

    sma.push(sum / windowSize);

    for (let i = windowSize; i < length; i++) {
      sum += prices[i] - prices[i - windowSize];
      sma.push(sum / windowSize);
    }

    return sma;
  }

  public calculateEMA(prices: number[], windowSize: number): number[] {
    const ema: number[] = [];
    const length = prices.length;

    // Validação dos parâmetros
    if (windowSize <= 0 || windowSize > length) {
      throw new Error('window size must be greater than 0 and less than or equal to price array size.');
    }

    // Calcular a Média Móvel Simples (SMA) inicial para o primeiro valor da EMA
    let sum = 0;
    for (let i = 0; i < windowSize; i++) {
      sum += prices[i];
    }
    const sma = sum / windowSize;
    ema.push(sma);

    // Fator de suavização
    const smoothingFactor = 2 / (windowSize + 1);

    // Calcular EMA para os preços restantes
    for (let i = windowSize; i < length; i++) {
      const currentEma = (prices[i] - ema[i - 1]) * smoothingFactor + ema[i - 1];
      ema.push(currentEma);
    }

    return ema;
  }

  public calculateRSI(prices: number[], windowSize: number): number[] {
    const length = prices.length;
    const rsi: number[] = [];

    // Validação dos parâmetros
    if (windowSize <= 0 || windowSize > length) {
      throw new Error('window size must be greater than 0 and less than or equal to price array size.');
    }

    const gains: number[] = [];
    const losses: number[] = [];

    // Calcular ganhos e perdas
    for (let i = 1; i < length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(Math.max(change, 0));
      losses.push(Math.max(-change, 0));
    }

    // Calcular ganhos e perdas médios iniciais
    let sumGain = 0;
    let sumLoss = 0;
    for (let i = 0; i < windowSize; i++) {
      sumGain += gains[i];
      sumLoss += losses[i];
    }
    let averageGain = sumGain / windowSize;
    let averageLoss = sumLoss / windowSize;

    // Calcular o primeiro valor do IFR
    let rs = averageGain / averageLoss;
    rsi.push(100 - 100 / (1 + rs));

    // Calcular IFR para os preços restantes
    for (let i = windowSize; i < length - 1; i++) {
      averageGain = (averageGain * (windowSize - 1) + gains[i]) / windowSize;
      averageLoss = (averageLoss * (windowSize - 1) + losses[i]) / windowSize;

      rs = averageGain / averageLoss;
      rsi.push(100 - 100 / (1 + rs));
    }

    return rsi;
  }

  public calculateBollingerBands(
    prices: number[],
    windowSize: number,
    numStdDev = 2,
  ): { upperBand: number[]; middleBand: number[]; lowerBand: number[] } {
    const length = prices.length;

    if (windowSize <= 0 || windowSize > length) {
      throw new Error('window size must be greater than 0 and less than or equal to price array size.');
    }

    const upperBand: number[] = [];
    const middleBand: number[] = [];
    const lowerBand: number[] = [];

    // Calcular a média móvel simples (SMA)
    for (let i = 0; i <= length - windowSize; i++) {
      const windowPrices = prices.slice(i, i + windowSize);
      const sum = windowPrices.reduce((a, b) => a + b, 0);
      const sma = sum / windowSize;
      middleBand.push(sma);
    }

    // Calcular as Bandas de Bollinger
    for (let i = 0; i < middleBand.length; i++) {
      const windowPrices = prices.slice(i, i + windowSize);
      const sma = middleBand[i];

      // Calcular o desvio padrão
      const variance = windowPrices.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / windowSize;
      const stdDev = Math.sqrt(variance);

      // Calcular as bandas superior e inferior
      const upper = sma + numStdDev * stdDev;
      const lower = sma - numStdDev * stdDev;

      upperBand.push(upper);
      lowerBand.push(lower);
    }

    return { upperBand, middleBand, lowerBand };
  }

  public calculateMACD(
    prices: number[],
    shortPeriod = 12,
    longPeriod = 26,
    signalPeriod = 9,
  ): { macdLine: number[]; signalLine: number[]; histogram: number[] } {
    if (shortPeriod >= longPeriod) {
      throw new Error('O período curto deve ser menor que o período longo.');
    }

    // Calcular as médias móveis exponenciais (EMA) de curto e longo prazos
    const shortEMA = this.calculateEMA(prices, shortPeriod);
    const longEMA = this.calculateEMA(prices, longPeriod);

    // Calcular a linha MACD (diferença entre as EMAs de curto e longo prazos)
    const macdLine = shortEMA.slice(longPeriod - shortPeriod).map((shortValue, index) => shortValue - longEMA[index]);

    // Calcular a linha de sinal (EMA da linha MACD)
    const signalLine = this.calculateEMA(macdLine, signalPeriod);

    // Calcular o histograma (diferença entre a linha MACD e a linha de sinal)
    const histogram = macdLine.slice(signalPeriod - 1).map((macdValue, index) => macdValue - signalLine[index]);

    return { macdLine, signalLine, histogram };
  }

  public calculateVolumeSMA(volumes: number[], period: number): number[] {
    const volumeSMA: number[] = [];

    for (let i = 0; i < volumes.length; i++) {
      if (i < period - 1) {
        volumeSMA.push(null);
        continue;
      }

      const sum = volumes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      volumeSMA.push(sum / period);
    }

    return volumeSMA;
  }

  public calculateFibonacciRetracements(minPrice: number, maxPrice: number): { [key: string]: number } {
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

  public calculateStochastic(
    highPrices: number[],
    lowPrices: number[],
    closePrices: number[],
    kPeriod = 14,
    dPeriod = 3,
  ): { kValues: number[]; dValues: number[] } {
    if (highPrices.length !== lowPrices.length || highPrices.length !== closePrices.length) {
      throw new Error('High, low and close price arrays must be the same size');
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

  public calculateOBV(prices: number[], volumes: number[]): number[] {
    if (prices.length !== volumes.length) {
      throw new Error('Price and volume arrays must be the same size');
    }

    const obv: number[] = [0]; // Inicialize o OBV com o primeiro valor como 0

    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > prices[i - 1]) {
        obv.push(obv[i - 1] + volumes[i]);
      } else if (prices[i] < prices[i - 1]) {
        obv.push(obv[i - 1] - volumes[i]);
      } else {
        obv.push(obv[i - 1]);
      }
    }

    return obv;
  }

  // Métodos privados auxiliares podem ser adicionados abaixo, se necessário
}
