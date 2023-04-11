import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProducerService } from '../../../src/common/kafka-lib/kafka-producer/producer.service';

jest.mock('kafkajs');

describe('ProducerService', () => {
  let service: ProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProducerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'KAFKA_BROKERS':
                  return 'localhost:9092';
                case 'KAFKA_GROUP_ID':
                  return 'nestjs-kafka-group';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();
    service = module.get<ProducerService>(ProducerService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a message', async () => {
    const topic = 'test-topic';
    const message = { key: 'value' };
    const partition = 1;

    (service as any).kafkaProducer = {
      connect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
    };

    await service.sendMessage(topic, partition, message);

    expect((service as any).kafkaProducer.connect).toHaveBeenCalled();
    expect((service as any).kafkaProducer.send).toHaveBeenCalledWith({
      topic,
      messages: [{ value: JSON.stringify(message), partition }],
    });
    expect((service as any).kafkaProducer.disconnect).toHaveBeenCalled();
  });
});
