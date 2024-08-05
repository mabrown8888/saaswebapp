import mongoose, { Mongoose, Promise } from 'mongoose'

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose

if (!cached) {
    cached = (global as any).mongoose = {
        conn: null, promise: null
    }
}

// optimzation: if cache is there return cached connection and immediately exit
export const connectToDatabase = async () => {
    if (cached.conn) return cached.conn; // checking if already have cached conn - if so return cached.conn (optimization)

    if (!MONGODB_URL) throw new Error('Missing MONGODB_URL'); // If not try to make new conn to MONGODB

    cached.promise = cached.promise ||
        mongoose.connect(MONGODB_URL,
            { dbName: 'imaginify', bufferCommands: false })

    cached.conn = await cached.promise;
}


