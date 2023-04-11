import { Schema } from 'mongoose';

export const TechnicalAnalysisSchema = new Schema({
  prices: [Number],
  movingAverage: Number,
  rsi: Number,
  // Adicione os campos necessários para os outros indicadores
});
