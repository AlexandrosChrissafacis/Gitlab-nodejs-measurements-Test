import { Request, Response } from 'express';
import { MeasurementService } from '../services/MeasurementService';
import { validateMeasurement } from '../utils/validators';
import { Measurement, MeasurementFilter } from '../types/measurement';
import { ValidationError } from '../utils/errors';

export class MeasurementController {
  private measurementService: MeasurementService;

  constructor(measurementService: MeasurementService) {
    this.measurementService = measurementService;
  }

  // Create measurement(s)
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      
      // Handle both single measurement and array of measurements
      if (Array.isArray(data)) {
        const validMeasurements: Measurement[] = [];
        const errors: { index: number; message: string }[] = [];

        for (let i = 0; i < data.length; i++) {
          try {
            const validMeasurement = validateMeasurement(data[i]);
            validMeasurements.push(validMeasurement);
          } catch (error) {
            if (error instanceof ValidationError) {
              errors.push({
                index: i,
                message: error.message
              });
            } else {
              throw error;
            }
          }
        }

        if (errors.length > 0 && validMeasurements.length === 0) {
          res.status(400).json({ 
            success: false, 
            message: 'All measurements failed validation', 
            errors 
          });
          return;
        }

        await this.measurementService.createMany(validMeasurements);
        
        res.status(201).json({
          success: true,
          message: `Created ${validMeasurements.length} measurements`,
          failedCount: errors.length,
          errors: errors.length > 0 ? errors : undefined
        });
      } else {
        // Single measurement
        const validMeasurement = validateMeasurement(data);
        await this.measurementService.create(validMeasurement);
        res.status(201).json({
          success: true,
          message: 'Measurement created successfully',
          id: validMeasurement.id
        });
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        console.error('Error creating measurement:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Get all measurements (with filters)
  public async getAll(req: Request, res: Response): Promise<void> {
    try {
      // Use helper method to get filters
      const filters = this.parseFilters(req.query);
      const measurements = await this.measurementService.findAll(filters);

      res.status(200).json({ success: true, data: measurements });
    } catch (error) {
      console.error('Error retrieving measurements:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  //Get stats (filtered)
  public async getStats(req: Request, res: Response): Promise<void> {
    try {
      // Use helper method to get filters
      const filters = this.parseFilters(req.query);
      const stats = await this.measurementService.getStats(filters);
      
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      console.error('Error retrieving measurement statistics:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  //Helper method for filtering
  private parseFilters(query: any): MeasurementFilter {
    const { startDate, endDate, meterID, type, page, limit } = query;
    return {
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      meterID: meterID ? String(meterID) : undefined,
      type: type ? (String(type) as 'production' | 'consumption') : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };
  }
}