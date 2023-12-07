import mongoose from "mongoose";

mongoose.set("strictQuery", false); //strictQuery => if i sent unrelevent data to db then don't throw error

const connectToDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI || `mongodb://localhost:27017/LMS`);

    if (connection) {
      console.log(`DB is connected ${connection.host}`);
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

export default connectToDB;
