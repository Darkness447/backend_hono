import mongoose from "mongoose";

export default async function dbConnection(){
    await mongoose.connect(process.env.MONGO_URI as string)
    console.log("connected successfully ....")
}