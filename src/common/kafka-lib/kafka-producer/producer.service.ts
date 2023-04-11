import { Injectable } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common'; // Importe o Logger

@Injectable()
export class ProducerService {
  private readonly kafkaProducer: Producer;
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    const kafka = new Kafka({
      clientId: 'nestjs-kafka-producer',
      brokers: configService.get<string>('KAFKA_BROKERS').split(','),
    });

    this.kafkaProducer = kafka.producer();

    this.logger = new Logger(ProducerService.name);
  }

  async sendMessage(topic: string, partition: number, message: any) {
    this.logger.debug(`Connecting to the topic producer: ${topic}`);
    await this.kafkaProducer.connect();

    this.logger.debug(`Sending message to topic: ${topic}`);
    await this.kafkaProducer.send({
      topic,
      messages: [{ value: JSON.stringify(message), partition: partition }],
    });

    this.logger.debug(`Disconnecting from topic producer: ${topic}`);
    await this.kafkaProducer.disconnect();
  }
}
