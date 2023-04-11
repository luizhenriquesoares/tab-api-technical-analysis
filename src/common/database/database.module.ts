import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DB_CONNECTION } from './database.constant';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      connectionName: DB_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const uri = configService.get('MONGO_CONNECTION_URL');
        return {
          uri,
          dbName: configService.get('DB_NAME'),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
