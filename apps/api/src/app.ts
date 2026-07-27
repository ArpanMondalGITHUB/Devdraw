import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authrouter from "../src/routes/auth"

dotenv.config()

const app = express()

app.use(cors(
    {
        origin: "http://localhost:5173/"
    }
));
app.use(express.json())

app.use("/api",authrouter)

app.get('/',(req,res) => {
  res.send("Devdraw API is running")
});

app.get('/api/health',(req,res) => {
  res.json({status:"ok"})
});

export default app;