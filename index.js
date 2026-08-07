import "dotenv/config"
import express from "express"
const app = express()
const PORT = process.env.PORT || 5000
import indexRouter from "./routes/index.js"
import authRouter from "./routes/auth.js"
import cors from "cors"

app.use(express.json())
app.use(cors());
app.use('/', indexRouter);
app.use('/', authRouter);


app.listen(PORT, ()=> console.log(`Server is listening in http://localhost:${PORT}`));