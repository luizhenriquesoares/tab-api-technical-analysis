import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConsumerService } from '../../../src/common/kafka-lib/kafka-consumer/consumer.service';

jest.mock('kafkajs');

describe('ConsumerService', () => {
  let service: ConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumerService,
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
    service = module.get<ConsumerService>(ConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should subscribe and receive messages', async () => {
    const topic = 'test-topic';
    const onMessage = jest.fn();

    const mockRun = jest.fn().mockImplementation(({ eachMessage }) => {
      eachMessage({ message: { value: JSON.stringify({ foo: 'bar' }) } });
      return null;
    });

    (service as any).kafkaConsumer = {
      connect: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockResolvedValue(undefined),
      run: mockRun,
    };

    await service.onModuleInit();
    await service.subscribeToTopic(topic, onMessage);

    expect((service as any).kafkaConsumer.connect).toHaveBeenCalled();
    expect((service as any).kafkaConsumer.subscribe).toHaveBeenCalledWith({ topic });
    expect(mockRun).toHaveBeenCalled();
    expect(onMessage).toHaveBeenCalledWith({ foo: 'bar' });
  });
});
