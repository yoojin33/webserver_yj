import mongoose from 'mongoose'

import dns from 'node:dns'
dns.setServers(['8.8.8.8', '1.1.1.1'])

const MONGODB_URI = process.env.MONGODB_URI

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
}
global.mongooseCache = cached

export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI 환경변수가 없습니다.')
  }

  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn

  if (!cached.promise || mongoose.connection.readyState === 0) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
    cached.conn = null
    throw error
  }

  return cached.conn
}
