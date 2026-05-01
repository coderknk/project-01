const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://knk02:szwQ4YiTaqcqbzlv@ac-x2nxgok-shard-00-00.p6fglla.mongodb.net:27017,ac-x2nxgok-shard-00-01.p6fglla.mongodb.net:27017,ac-x2nxgok-shard-00-02.p6fglla.mongodb.net:27017/?ssl=true&replicaSet=atlas-dw5p9a-shard-0&authSource=admin&appName=Cluster0");
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
