import "dotenv/config"
import express from "express"
 import path from 'path';
 import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const PORT = process.env.PORT || 5000
import indexRouter from "./routes/index.js"
import authRouter from "./routes/auth.js"
import cors from "cors"

app.use(express.json())
app.use(cors());
app.use('/', indexRouter);
app.use('/', authRouter);
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'dist', 'index.html')); });


app.listen(PORT, ()=> console.log(`Server is listening in http://localhost:${PORT}`));