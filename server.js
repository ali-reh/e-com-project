import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Only listen locally, Vercel will manage the execution in production
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// THIS IS CRITICAL: Vercel needs the default export
export default app;