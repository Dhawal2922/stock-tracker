import mongoose from "mongoose";
import { cache } from "react";

const MONGODB_URI = process.env.MONGODB_URI ;

declare global {
    var mongooseCache : {
        conn : typeof mongoose | null;
        promise : Promise<typeof mongoose> | null
    }
}

let cached = global.mongooseCache;

if (!cached){
    cached = global.mongooseCache = {conn : null , promise : null} ;
}

export const connecToDatabase = async () => {
    if(!MONGODB_URI) throw new Error ('MongoDB URI must be set')

    if(cached.conn ) return cached.conn;
    if(!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI , {bufferCommands : false})
    }


    try {
        cached.conn = await cached.promise; 
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    console.log(`Connected to Databse ${process.env.NODE_ENV} -  ${MONGODB_URI}`)
    return cached.conn;
}