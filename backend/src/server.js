import app from "./app/app.js";
import dotenv from "dotenv";
dotenv.config();
import sequelize from "./config/sequelize.js";
import {} from "./models/index.model.js";

const port = process.env.PORT || 5000;

async function startSerevr() {
  try {
    // await sequelize.sync({ alter: true });
    // console.log("Database table berhasil dibuat");

    app.listen(port, () => {
      console.log(`Server runnin in http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

startSerevr();
