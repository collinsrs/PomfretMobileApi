import Express from 'express';
import cors from 'cors';

const corsOrigins = {
    origin: [
        'https://core.innerva.io',
        'https://pomfretcard.com',
        'http://localhost:3000',
        'http://localhost:9999',
    ],
};


const api = Express();
api.use(cors(corsOrigins));
export default api;