import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Define TypeScript interface for Measurement
interface MeasurementAttributes {
  id: string;
  timestamp: Date;
  value: number;
  meterID: string;
  type: 'production' | 'consumption';
}

// Allow `id` to be optional when creating new records
interface MeasurementCreationAttributes extends Optional<MeasurementAttributes, 'id'> {}

class MeasurementModel extends Model<MeasurementAttributes, MeasurementCreationAttributes> implements MeasurementAttributes {
  public id!: string;
  public timestamp!: Date;
  public value!: number;
  public meterID!: string;
  public type!: 'production' | 'consumption';
}

MeasurementModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    meterID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('production', 'consumption'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Measurement',
    tableName: 'measurements',
    timestamps: false,
  }
);

export default MeasurementModel;
