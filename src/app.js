import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

import usersRouter from "./routes/users.router.js";
import petsRouter from "./routes/pets.router.js";
import adoptionsRouter from "./routes/adoption.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import mocksRouter from "./routes/mocks.router.js";
import { specs, swaggerUi } from "./config/swagger.js";

const app = express();
const PORT = process.env.PORT;
const connection = mongoose.connect(process.env.MONGO_URI);

app.use(express.json());
app.use(cookieParser());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api/users", usersRouter);
app.use("/api/pets", petsRouter);
app.use("/api/adoptions", adoptionsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/mocks", mocksRouter);

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
    console.error('Error:', error);
    
    // Error de validación de MongoDB
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            error: 'Datos de entrada inválidos',
            details: error.message
        });
    }
    
    // Error de casting de MongoDB (ID inválido)
    if (error.name === 'CastError') {
        return res.status(400).json({
            status: 'error',
            error: 'ID inválido'
        });
    }
    
    // Error de JWT
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            error: 'Token inválido'
        });
    }
    
    // Error genérico del servidor
    res.status(500).json({
        status: 'error',
        error: 'Error interno del servidor'
    });
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
