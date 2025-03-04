import { ValidationError } from '../../src/utils/errors';
import { validateMeasurement } from '../../src/utils/validators';

describe('Measurement Validation', () => {
  it('should validate a correct measurement', () => {
    const validData = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      timestamp: "2025-03-04T12:00:00Z",
      value: 10,
      meterID: "meter-123",
      type: "production",
    };

    expect(validateMeasurement(validData)).toEqual(validData);
  });

  it('should throw an error for missing fields', () => {
    const invalidData = { value: 10 };

    expect(() => validateMeasurement(invalidData)).toThrow(ValidationError);
  });

  it('should throw an error for invalid timestamp', () => {
    const invalidData = { 
      id: "550e8400-e29b-41d4-a716-446655440000",
      timestamp: "invalid-date",
      value: 10,
      meterID: "meter-123",
      type: "production",
    };

    expect(() => validateMeasurement(invalidData)).toThrow("Invalid timestamp format");
  });

  it('should throw an error for negative values', () => {
    const invalidData = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      timestamp: "2025-03-04T12:00:00Z",
      value: -5,
      meterID: "meter-123",
      type: "production",
    };
  
    expect(() => validateMeasurement(invalidData)).toThrow("Value must be a positive number");
  });
  
  it('should throw an error for empty meterID', () => {
    const invalidData = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      timestamp: "2025-03-04T12:00:00Z",
      value: 10,
      meterID: " ",
      type: "production",
    };
  
    expect(() => validateMeasurement(invalidData)).toThrow("Invalid meter ID");
  });
  
  it('should throw an error for invalid type', () => {
    const invalidData = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      timestamp: "2025-03-04T12:00:00Z",
      value: 10,
      meterID: "meter-123",
      type: "invalid-type",
    };
  
    expect(() => validateMeasurement(invalidData)).toThrow("Type must be either \"production\" or \"consumption\"");
  });
});
