import app from './app.js';
import dotenv from 'dotenv';
dotenv.config();
const PORT = Number(process.env.PORT) || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
export default app;
//# sourceMappingURL=server.js.map