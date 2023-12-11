const app = express();
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import connectToDB from "./config/db.connection.js";
import router from "./routers/userRouters.js";
import errorMiddleware from "./middleware/error.middleware.js";

app.use(express.json());
app.use(cookieParser());
//app.use(express.urlencoded({extended:true}))
app.use(express.urlencoded({extended:true}));
app.use(
  cors({
    origin: [process.env.FRONTED_URL],
    Credential: true,
  })
);

app.use(morgan("dev")); // by this we will know on console what is the user trying to access

// DB connection
connectToDB();


app.use("/", router);
// 3 module are yet to write

app.all("*", (req, res) => {
  res.status(404).send("OOPS!! 404 PAGE NOT FOUND");
});

// controller se error  userRoutes par aayega and then userRoutes se errorMiddleware ke pass ayega
app.use(errorMiddleware);

export default app;