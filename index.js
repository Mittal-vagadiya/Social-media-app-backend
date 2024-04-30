import express from "express";
import "dotenv/config";
import { connection } from "./Connection/dbConnection.js";
import routes from "./Routes/routes.js";
import path from "path";

const port = process.env.PORT || 7000;

const app = express();
app.use(express.json());

app.use("/", routes);

const dirname = path.resolve();
app.use("/uploads", express.static(path.join(dirname, "/uploads")));

app.listen(port, () => {
  connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
  });

  console.log("App Is Runnig on Port", port);
});
