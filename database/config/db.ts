import mongoose from 'mongoose';
import {
  UserModel,
  EquipmentModel,
  IotDeviceModel,
  TelemetryModel,
  OccupancyZoneModel,
  WorkOrderModel,
  AlertLogModel,
  RecommendationModel,
} from '../models/schemas';
import {
  usersStore,
  equipmentStore,
  iotDevicesStore,
  telemetryStore,
  occupancyStore,
  workOrdersStore,
  alertsLogStore,
  recommendationsStore,
} from '../models/store';

export interface DbConfig {
  uri: string;
  dbName: string;
}

export const dbConfig: DbConfig = {
  uri: process.env.MONGODB_URI || '',
  dbName: process.env.MONGODB_DB_NAME || 'facilityops_ai',
};

let isConnected = false;

export function isDbConnected(): boolean {
  return isConnected;
}

// Attach silent error handler to mongoose connection to avoid unhandled async connection errors
mongoose.connection.on('error', (err) => {
  isConnected = false;
});

export async function connectDatabase(): Promise<boolean> {
  if (isConnected) return true;

  const uri = process.env.MONGODB_URI || dbConfig.uri;

  if (uri && uri.trim() !== '' && !uri.includes('localhost') && !uri.includes('127.0.0.1')) {
    try {
      console.log('Attempting MongoDB connection...');
      await mongoose.connect(uri, {
        dbName: dbConfig.dbName,
        serverSelectionTimeoutMS: 2500, // 2.5s quick timeout for cloud container resilience
      });
      isConnected = true;
      console.log('Successfully connected to MongoDB.');

      // Seed initial data if database collections are empty
      await seedDatabaseIfEmpty();
      return true;
    } catch (error: any) {
      console.warn(`MongoDB connection unavailable (${error.message || 'Connection failed'}).`);
      console.log('Operating seamlessly on high-performance In-Memory Facility Operations Store.');
      isConnected = false;
      return false;
    }
  } else if (uri && (uri.includes('localhost') || uri.includes('127.0.0.1'))) {
    // If explicitly configured to localhost, attempt quick connection with fallback
    try {
      await mongoose.connect(uri, {
        dbName: dbConfig.dbName,
        serverSelectionTimeoutMS: 1500,
      });
      isConnected = true;
      console.log('Successfully connected to local MongoDB.');
      await seedDatabaseIfEmpty();
      return true;
    } catch (error: any) {
      console.log('Local MongoDB not running. Operating seamlessly on high-performance In-Memory Facility Operations Store.');
      isConnected = false;
      return false;
    }
  }

  console.log('MongoDB URI not configured. Operating seamlessly on high-performance In-Memory Facility Operations Store.');
  return false;
}

async function seedDatabaseIfEmpty() {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial users into MongoDB...');
      await UserModel.insertMany(usersStore as any[]);
    }

    const eqCount = await EquipmentModel.countDocuments();
    if (eqCount === 0) {
      console.log('Seeding initial equipment records into MongoDB...');
      await EquipmentModel.insertMany(equipmentStore as any[]);
    }

    const deviceCount = await IotDeviceModel.countDocuments();
    if (deviceCount === 0) {
      console.log('Seeding initial IoT devices into MongoDB...');
      await IotDeviceModel.insertMany(iotDevicesStore as any[]);
    }

    const telCount = await TelemetryModel.countDocuments();
    if (telCount === 0) {
      console.log('Seeding initial telemetry into MongoDB...');
      await TelemetryModel.insertMany(telemetryStore as any[]);
    }

    const occCount = await OccupancyZoneModel.countDocuments();
    if (occCount === 0) {
      console.log('Seeding initial occupancy zones into MongoDB...');
      await OccupancyZoneModel.insertMany(occupancyStore as any[]);
    }

    const woCount = await WorkOrderModel.countDocuments();
    if (woCount === 0) {
      console.log('Seeding initial work orders into MongoDB...');
      await WorkOrderModel.insertMany(workOrdersStore as any[]);
    }

    const alertCount = await AlertLogModel.countDocuments();
    if (alertCount === 0) {
      console.log('Seeding initial alert logs into MongoDB...');
      await AlertLogModel.insertMany(alertsLogStore as any[]);
    }

    const recCount = await RecommendationModel.countDocuments();
    if (recCount === 0) {
      console.log('Seeding initial recommendations into MongoDB...');
      await RecommendationModel.insertMany(recommendationsStore as any[]);
    }
  } catch (err: any) {
    console.warn('Seed database warning:', err.message);
  }
}


