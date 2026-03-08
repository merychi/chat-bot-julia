const express = require('express');
const cors = require('cors');

const app = express();

// Permitir que el frontend en React se conecte sin bloqueos
app.use(cors());
app.use(express.json());

// Puerto donde correrá nuestro backend
const PORT = 3001; 

app.post('/api/chat', async (req, res) => {
    try {
        let { historial, nuevoMensaje } = req.body;

        // 1. Agregar el nuevo mensaje del usuario al historial
        historial.push({ role: "user", content: nuevoMensaje });

        // 2. Control de Memoria de Contexto (Máximo 6 mensajes para no saturar)
        if (historial.length > 6) {
            historial = historial.slice(-6);
        }

        // 3. Petición al cerebro local (Ollama)
        const ollamaResponse = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'Julia', 
                messages: historial,
                stream: false 
            })
        });

        if (!ollamaResponse.ok) {
            throw new Error('Fallo en la respuesta de Ollama');
        }

        const data = await ollamaResponse.json();
        let mensajeIA = data.message.content;

        // 4. Filtro de limpieza (Elimina las alucinaciones de "servicio al cliente")
        mensajeIA = mensajeIA.replace(/¿Hay algo más que te gustaría saber( sobre ajedrez)?\??/gi, "");
        mensajeIA = mensajeIA.replace(/¿Te gustaría ver un ejemplo( en el tablero)?\??/gi, "");
        mensajeIA = mensajeIA.trim();

        // 5. Devolver la respuesta limpia y el historial actualizado a React
        historial.push({ role: "assistant", content: mensajeIA });
        res.json({ 
            respuesta: mensajeIA,
            historialActualizado: historial 
        });

    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Error al conectar con el tablero.' });
    }
});

app.listen(PORT, () => {
    console.log(`♔ Backend de Julia corriendo en http://localhost:${PORT}`);
});
