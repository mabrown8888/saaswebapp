import mongoose, { Mongoose, Promise } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = {
        conn: null,
        promise: null
    };
}

// Optimization: if cache is there return cached connection and immediately exit
export const connectToDatabase = async () => {
    if (cached.conn) {
        console.log('Using cached database connection');
        return cached.conn;
    }

    if (!MONGODB_URL) {
        throw new Error('Missing MONGODB_URL');
    }

    if (!cached.promise) {
        console.log('Creating new database connection');
        cached.promise = mongoose.connect(MONGODB_URL, {
            dbName: 'imaginify',
            bufferCommands: false
        }).then((mongoose) => {
            console.log('Database connection established');
            return mongoose;
        }).catch((error) => {
            console.error('Error connecting to database:', error);
            throw error;
        });
    } else {
        console.log('Using existing connection promise');
    }

    cached.conn = await cached.promise;
    return cached.conn;
};
