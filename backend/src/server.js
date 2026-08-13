import app from "./app/app.js";
import dotenv from "dotenv";
dotenv.config();
import sequelize from "./config/sequelize.js";
import { ensureFakeGpsColumns } from "./config/autoMigrate.js";
import {} from "./models/index.model.js";

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    try {
      await sequelize.sync({ alter: false });
      await ensureFakeGpsColumns();
      console.log("Database table berhasil disinkronisasi");
    } catch (syncErr) {
      console.log(
        "Sync error (non-fatal, server tetap start):",
        syncErr.message,
      );
    }

    app.listen(port, () => {
      console.log(`Server running in http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

startServer();
