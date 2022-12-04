const mogoose = require("mongoose");

const connectDB = async () => {
  try {
    await mogoose.connect(process.env.DATABASE_URI);
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
