import MeasurementModel from '../../src/models/MeasurementModel';
import { MeasurementService } from '../../src/services/MeasurementService';
import { DatabaseError } from '../../src/utils/errors';

// Mock Sequelize Model methods
jest.mock('../../src/models/MeasurementModel', () => ({
  create: jest.fn(),
  bulkCreate: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
}));

const measurementService = new MeasurementService();

describe('MeasurementService', () => {
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
      });
      
      afterAll(() => {
        (console.error as jest.Mock).mockRestore();
      });
      
  const mockMeasurement = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    timestamp: "2025-03-04T12:00:00Z",
    value: 10,
    meterID: "meter-123",
    type: "production" as "production",
};

  it('should create a measurement successfully', async () => {
    (MeasurementModel.create as jest.Mock).mockResolvedValue(mockMeasurement);

    await expect(measurementService.create(mockMeasurement)).resolves.toBeUndefined();
    expect(MeasurementModel.create).toHaveBeenCalledWith({
      ...mockMeasurement,
      timestamp: new Date(mockMeasurement.timestamp),
    });
  });

  it('should throw DatabaseError if create() fails', async () => {
    (MeasurementModel.create as jest.Mock).mockRejectedValue(new DatabaseError("DB Error"));

    await expect(measurementService.create(mockMeasurement)).rejects.toThrow(DatabaseError);
  });

  it('should create multiple measurements successfully', async () => {
    (MeasurementModel.bulkCreate as jest.Mock).mockResolvedValue([mockMeasurement]);

    await expect(measurementService.createMany([mockMeasurement])).resolves.toBeUndefined();
    expect(MeasurementModel.bulkCreate).toHaveBeenCalledWith([
      { ...mockMeasurement, timestamp: new Date(mockMeasurement.timestamp) },
    ]);
  });

  it('should throw DatabaseError if createMany() fails', async () => {
    (MeasurementModel.bulkCreate as jest.Mock).mockRejectedValue(new DatabaseError("DB Error"));

    await expect(measurementService.createMany([mockMeasurement])).rejects.toThrow(DatabaseError);
  });

  it('should return filtered measurements', async () => {
    (MeasurementModel.findAll as jest.Mock).mockResolvedValue([
      { ...mockMeasurement, timestamp: new Date(mockMeasurement.timestamp) },
    ]);

    const result = await measurementService.findAll({ meterID: "meter-123" });

    expect(result).toEqual([
        {
          ...mockMeasurement,
          timestamp: new Date(mockMeasurement.timestamp).toISOString(), 
        },
    ]);
    expect(MeasurementModel.findAll).toHaveBeenCalled();
  });

  it('should throw DatabaseError if findAll() fails', async () => {
    (MeasurementModel.findAll as jest.Mock).mockRejectedValue(new DatabaseError("DB Error"));

    await expect(measurementService.findAll({ meterID: "meter-123" })).rejects.toThrow(DatabaseError);
  });

  it('should return measurement statistics', async () => {
    (MeasurementModel.findOne as jest.Mock).mockResolvedValue({
      count: 10,
      sum: 100,
      average: 10,
      min: 5,
      max: 15,
    });

    const result = await measurementService.getStats({});

    expect(result).toEqual({
      count: 10,
      sum: 100,
      average: 10,
      min: 5,
      max: 15,
    });
    expect(MeasurementModel.findOne).toHaveBeenCalled();
  });

  it('should throw DatabaseError if getStats() fails', async () => {
    (MeasurementModel.findOne as jest.Mock).mockRejectedValue(new DatabaseError("DB Error"));

    await expect(measurementService.getStats({})).rejects.toThrow(DatabaseError);
  });
});
