import { Measurement, MeasurementFilter, MeasurementStats } from '../types/measurement';
import MeasurementModel from '../models/MeasurementModel';
import { Op, Sequelize } from 'sequelize';
import { DatabaseError } from '../utils/errors';

export class MeasurementService {
  // This is a placeholder implementation
  // In a real application, this would interact with a database

  /**
   * Create a single measurement record
   */
  public async create(measurement: Measurement): Promise<void> {
    try {
      const formattedMeasurement = {
        ...measurement,
        timestamp: new Date(measurement.timestamp), // ✅ Convert string to Date
      };
      await MeasurementModel.create(formattedMeasurement);
    } catch (error) {
      console.error('Error saving measurement:', error);
      throw new DatabaseError('Database error while saving measurement');
    }
  }

  /**
   * Create multiple measurement records
   */
  public async createMany(measurements: Measurement[]): Promise<void> {
    try {
      const formattedMeasurements = measurements.map(measurement => ({
        ...measurement,
        timestamp: new Date(measurement.timestamp), // ✅ Convert string to Date
      }));
      await MeasurementModel.bulkCreate(formattedMeasurements);
    } catch (error) {
      console.error('Error saving measurements:', error);
      throw new DatabaseError('Database error while saving measurements');
    }
  }

  /**
   * Find measurements based on filters
   */
  public async findAll(filter: MeasurementFilter): Promise<Measurement[]> {
    try {
      const whereClause: any = {};

      if (filter.startDate) {
        whereClause.timestamp = { [Op.gte]: new Date(filter.startDate) };
      }
      if (filter.endDate) {
        whereClause.timestamp = { ...whereClause.timestamp, [Op.lte]: new Date(filter.endDate) };
      }
      if (filter.meterID) {
        whereClause.meterID = filter.meterID;
      }
      if (filter.type) {
        whereClause.type = filter.type;
      }

      const page = filter.page ? Math.max(1, filter.page) : 1;
      const limit = filter.limit ? Math.max(1, filter.limit) : 10;
      const offset = (page - 1) * limit;

      const measurements = await MeasurementModel.findAll({
        where: whereClause,
        limit,
        offset,
        order: [['timestamp', 'DESC']],
      });

      return measurements.map((m) => ({
        id: m.id,
        timestamp: m.timestamp.toISOString(), 
        value: m.value,
        meterID: m.meterID,
        type: m.type,
      }));
    } catch (error) {
      console.error('Error retrieving measurements:', error);
      throw new DatabaseError('Database error while retrieving measurements');
    }
  }

  /**
   * Get statistics for measurements matching the filter
   */
  public async getStats(filter: MeasurementFilter): Promise<MeasurementStats> {
    try {
      const whereClause: any = {};

      if (filter.startDate) {
        whereClause.timestamp = { [Op.gte]: new Date(filter.startDate) };
      }
      if (filter.endDate) {
        whereClause.timestamp = { ...whereClause.timestamp, [Op.lte]: new Date(filter.endDate) };
      }
      if (filter.meterID) {
        whereClause.meterID = filter.meterID;
      }
      if (filter.type) {
        whereClause.type = filter.type;
      }

      const stats = await MeasurementModel.findOne({
        where: whereClause,
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.col('value')), 'count'],
          [Sequelize.fn('SUM', Sequelize.col('value')), 'sum'],
          [Sequelize.fn('AVG', Sequelize.col('value')), 'average'],
          [Sequelize.fn('MIN', Sequelize.col('value')), 'min'],
          [Sequelize.fn('MAX', Sequelize.col('value')), 'max'],
        ],
        raw: true,
      });

      return {
        count: stats ? Number((stats as any)['count']) : 0,
        sum: stats ? Number((stats as any)['sum']) : 0,
        average: stats ? Number((stats as any)['average']) : 0,
        min: stats ? Number((stats as any)['min']) : 0,
        max: stats ? Number((stats as any)['max']) : 0,
      };
    } catch (error) {
      console.error('Error retrieving statistics:', error);
      throw new DatabaseError('Database error while retrieving statistics');
    }
  }
}