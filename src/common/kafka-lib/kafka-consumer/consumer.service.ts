import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
@Injectable()
export class ConsumerService implements OnModuleInit {
  private readonly kafkaConsumer: Consumer;
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    const kafka = new Kafka({
      clientId: 'nestjs-kafka-consumer',
      brokers: configService.get<string>('KAFKA_BROKERS').split(','),
    });

    this.kafkaConsumer = kafka.consumer({ groupId: configService.get<string>('KAFKA_GROUP_ID') });

    this.logger = new Logger(ConsumerService.name);
  }

  async onModuleInit() {
    this.logger.log('Connecting to the consumer');
    await this.kafkaConsumer.connect();
  }

  async subscribeToTopic(topic: string, onMessage: (message: any) => void) {
    this.logger.debug(`Subscribing to topic: ${topic}`);
    await this.kafkaConsumer.subscribe({ topic });

    this.logger.debug(`Running consumer for topic: ${topic}`);
    await this.kafkaConsumer.run({
      eachMessage: async ({ message }) => {
        const parsedMessage = JSON.parse(message.value.toString());
        onMessage(parsedMessage);
      },
    });
  }
}
