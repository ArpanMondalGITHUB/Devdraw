import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth.routess"
import { config } from "./config/config";
import { errorHandler } from "./middleware/auth.middleware";
dotenv.config();

const app = express();


app.use(cookieParser());
app.use(express.json());
app.use(cors(
    {
        origin: config.corsOrigin,
        credentials:true
    }
));


app.use("/api/v1/auth",authRoutes);

app.get('/',(req,res) => {
  res.send("Devdraw API is running");
});

app.get('/api/v1/health',(req,res) => {
  res.json({status:"ok"});
});

app.use(errorHandler);
export default app;