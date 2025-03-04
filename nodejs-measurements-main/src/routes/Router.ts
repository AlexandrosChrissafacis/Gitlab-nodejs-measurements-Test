import { Router } from "express";
import { MeasurementController } from "../controllers/MeasurementController";
import { MeasurementService } from "../services/MeasurementService";

const router = Router();
const measurementService = new MeasurementService();
const measurementController = new MeasurementController(measurementService);

//POST / CREATE
/**
 * @swagger
 * /api/measurements:
 *   post:
 *     summary: Add a new measurement
 *     description: Accepts a new measurement and stores it in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-03-04T12:00:00Z"
 *               value:
 *                 type: number
 *                 example: 5.6
 *               meterID:
 *                 type: string
 *                 example: "meter-123"
 *               type:
 *                 type: string
 *                 example: "consumption"
 *     responses:
 *       201:
 *         description: Measurement successfully added
 *       400:
 *         description: Invalid input
 */
router.post("/measurements", (req, res) =>
  measurementController.create(req, res)
);

//GET ALL (filtered)
/**
 * @swagger
 * /api/measurements:
 *   get:
 *     summary: Retrieve energy measurements
 *     description: Fetch energy measurements with optional filtering and pagination.
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Start date for filtering (ISO 8601 format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: End date for filtering (ISO 8601 format)
 *       - in: query
 *         name: meterID
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by meter ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ["production", "consumption"]
 *         required: false
 *         description: Filter by measurement type
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Successfully retrieved measurements
 *       400:
 *         description: Invalid request parameters
 */
router.get('/measurements', (req, res) => measurementController.getAll(req, res));

// GET STATS (filtered)
/**
 * @swagger
 * /api/measurements/stats:
 *   get:
 *     summary: Retrieve measurement statistics
 *     description: Fetch aggregated statistics (count, sum, average, min, max) for measurements with optional filtering.
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Start date for filtering (ISO 8601 format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: End date for filtering (ISO 8601 format)
 *       - in: query
 *         name: meterID
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by meter ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ["production", "consumption"]
 *         required: false
 *         description: Filter by measurement type
 *     responses:
 *       200:
 *         description: Successfully retrieved statistics
 *       400:
 *         description: Invalid request parameters
 */
router.get('/measurements/stats', (req, res) => measurementController.getStats(req, res));

export const measurementRoutes = router;
