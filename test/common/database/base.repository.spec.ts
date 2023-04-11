import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../src/common/database/database.repository';

interface TestDocument {
  id: string;
  name: string;
}

class TestBaseRepository extends BaseRepository<TestDocument> {}

describe('BaseRepository', () => {
  let baseRepository: BaseRepository<TestDocument>;
  let testModel: Model<TestDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestBaseRepository,
        {
          provide: getModelToken('MODEL_TOKEN'),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndRemove: jest.fn(),
          },
        },
      ],
    }).compile();
    baseRepository = module.get<TestBaseRepository>(TestBaseRepository);
    testModel = module.get<Model<TestDocument>>(getModelToken('MODEL_TOKEN'));
  });

  it('should findAll', async () => {
    const result: TestDocument[] = [{ id: '1', name: 'test1' }];
    jest.spyOn(testModel, 'find').mockResolvedValueOnce(result);

    const findAllResult = await baseRepository.findAll();
    expect(findAllResult).toEqual(result);
  });

  it('should findById', async () => {
    const id = '1';
    const result: TestDocument = { id: '1', name: 'test1' };
    jest.spyOn(testModel, 'findById').mockResolvedValueOnce(result);

    const findByIdResult = await baseRepository.findById(id);
    expect(findByIdResult).toEqual(result);
  });

  it('should create', async () => {
    const doc = { id: '1', name: 'test1' };

    const createResult = await baseRepository.create(doc);
    expect(createResult).toBeUndefined();
  });

  it('should update', async () => {
    const id = '1';
    const doc: TestDocument = { id: '1', name: 'test1' };
    const updatedDoc: TestDocument = { id: '1', name: 'test2' };
    jest.spyOn(testModel, 'findByIdAndUpdate').mockResolvedValueOnce(updatedDoc);

    const updateResult = await baseRepository.update(id, doc);
    expect(updateResult).toEqual(updatedDoc);
  });

  it('should delete', async () => {
    const id = '1';
    const doc: TestDocument = { id: '1', name: 'test1' };
    jest.spyOn(testModel, 'findByIdAndRemove').mockResolvedValueOnce(doc);

    const deleteResult = await baseRepository.delete(id);
    expect(deleteResult).toEqual(doc);
  });
});
