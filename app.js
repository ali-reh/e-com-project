import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors'; // Added to allow frontend requests

// Import your combined router
import apiRouter from './src/routes/index.js'; 

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors()); 
app.use(express.json());
app.use(cookieParser());

// MOUNT ALL ROUTES
// Since your index.js already uses '/api/products', 
// mounting it at '/' keeps the paths exactly as defined.
app.use('/', apiRouter); 

// Static files
app.use(express.static(path.resolve(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

export default app;