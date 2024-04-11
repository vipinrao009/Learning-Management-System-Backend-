const app = express();
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import connectToDB from "./config/db.connection.js";
import router from "./routers/userRouters.js";
import course from "./routers/courseRouter.js";
import payment from "./routers/paymentRouters.js"
import errorMiddleware from "./middleware/error.middleware.js";


app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({extended:true}));
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
  })
);

app.use(morgan("dev")); // by this we will know on console what is the user trying to access

// DB connection
connectToDB();


app.use("/api/v1/user", router);
app.use("/",course)
app.use("/",payment)
// 3 module are yet to write

app.all("*", (req, res) => {
  res.status(404).send("OOPS!! 404 PAGE NOT FOUND");
});

// controller se error  userRoutes par aayega and then userRoutes se errorMiddleware ke pass ayega
app.use(errorMiddleware);

export default app;

// import express from "express";
// import cors from "cors";
// import morgan from "morgan";
// import cookieParser from "cookie-parser";

// import connectToDB from "./config/db.connection.js";
// import router from "./routers/userRouters.js";
// import courseRouter from "./routers/courseRouter.js";
// import paymentRouter from "./routers/paymentRouters.js";
// import errorMiddleware from "./middleware/error.middleware.js";

// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(cors({
//   origin: [process.env.FRONTEND_URL], 
//   credentials: true 
// }));
// app.use(morgan("dev")); 

// connectToDB();

// app.use("/api/v1/user", router);
// app.use("/", courseRouter);
// app.use("/", paymentRouter);

// app.all("*", (req, res) => {
//   res.status(404).send("OOPS!! 404 PAGE NOT FOUND");
// });

// app.use(errorMiddleware);

// export default app;