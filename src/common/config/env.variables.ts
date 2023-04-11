import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum NodeEnv {
  Local = 'local',
  Development = 'dev',
  Homologation = 'hml',
  Production = 'prd',
}

export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv;

  @IsNumber()
  @IsOptional()
  PORT?: number;

  @IsString()
  MONGO_CONNECTION_URL: string;

  @IsString()
  JWT_SECRET_KEY: string;

  @IsString()
  DB_NAME: string;

  @IsString()
  KAFKA_BROKERS: string;

  @IsString()
  KAFKA_GROUP_ID: string;

  @IsString()
  KAFKA_TOPIC: string;

  @IsOptional()
  @IsNumber()
  KAFKA_PARTITION: number;
}
