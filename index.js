import express from "express";
import 'dotenv/config'
import { connection } from "./Connection/dbConnection.js";
import routes from "./Routes/routes.js";

const port = process.env.PORT || 7000;

const app = express();
app.use(express.json());

app.use('/',routes)

app.listen(port, () =>{
    connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
      });
      
    console.log("App Is Runnig on Port", port);
})