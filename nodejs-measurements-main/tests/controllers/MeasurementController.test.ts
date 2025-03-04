import request from 'supertest';
import express from 'express';
import { MeasurementController } from '../../src/controllers/MeasurementController';
import { MeasurementService } from '../../src/services/MeasurementService';
import { ValidationError } from '../../src/utils/errors';

// Mock MeasurementService
const mockMeasurementService = {
  create: jest.fn(),
  createMany: jest.fn(),
  findAll: jest.fn(),
  getStats: jest.fn(),
};

// Create an Express app for testing
const app = express();
app.use(express.json());

// Set up controller and routes
const measurementController = new MeasurementController(mockMeasurementService as unknown as MeasurementService);
app.post('/api/measurements', (req, res) => measurementController.create(req, res));
app.get('/api/measurements', (req, res) => measurementController.getAll(req, res));
app.get('/api/measurements/stats', (req, res) => measurementController.getStats(req, res));

describe('MeasurementController', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); 
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  // Test POST 
  describe('POST /api/measurements', () => {
    it('should create a measurement successfully', async () => {
      const mockMeasurement = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        timestamp: "2025-03-04T12:00:00Z",
        value: 10,
        meterID: "meter-123",
        type: "production",
      };

      jest.spyOn(mockMeasurementService, 'create').mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/measurements')
        .send(mockMeasurement);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        success: true,
        message: "Measurement created successfully",
        id: mockMeasurement.id,
      });
      expect(mockMeasurementService.create).toHaveBeenCalledWith(mockMeasurement);
    });

    it('should return validation error for invalid measurement', async () => {
      const invalidMeasurement = {
        timestamp: "invalid-date",
        value: -10,
        meterID: "",
        type: "invalid-type",
      };

      jest.spyOn(mockMeasurementService, 'create').mockRejectedValue(new ValidationError("Invalid meter ID"));

      const res = await request(app)
        .post('/api/measurements')
        .send(invalidMeasurement);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: "Invalid meter ID",
      });
    });
  });

  // Test GET ALL *
  describe('GET /api/measurements', () => {
    it('should return a list of measurements', async () => {
      const mockMeasurements = [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          timestamp: "2025-03-04T12:00:00Z",
          value: 10,
          meterID: "meter-123",
          type: "production",
        },
      ];

      jest.spyOn(mockMeasurementService, 'findAll').mockResolvedValue(mockMeasurements);

      const res = await request(app).get('/api/measurements');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockMeasurements });
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(mockMeasurementService, 'findAll').mockRejectedValue(new Error("Database error"));

      const res = await request(app).get('/api/measurements');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, message: "Internal server error" });
    });
  });

  // Test GET STATS
  describe('GET /api/measurements/stats', () => {
    it('should return measurement statistics', async () => {
      const mockStats = {
        count: 10,
        sum: 100,
        average: 10,
        min: 5,
        max: 15,
      };

      jest.spyOn(mockMeasurementService, 'getStats').mockResolvedValue(mockStats);

      const res = await request(app).get('/api/measurements/stats');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: mockStats });
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(mockMeasurementService, 'getStats').mockRejectedValue(new Error("Database error"));

      const res = await request(app).get('/api/measurements/stats');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ success: false, message: "Internal server error" });
    });
  });
});
