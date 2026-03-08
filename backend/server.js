const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// Aumentar timeout por si Ollama tarda en procesar
app.timeout = 120000; // 2 minutos

app.post('/api/chat', async (req, res) => {
    console.log('\n==================================================');
    console.log('📥 [NUEVA PETICIÓN DESDE EL FRONTEND]');
    
    try {
        let { historial, nuevoMensaje } = req.body;
        console.log(`👤 Usuario dice: "${nuevoMensaje}"`);

        // 1. Control estricto de Memoria de Contexto
        let historialRecortado = [];
        if (historial && historial.length > 0) {
            historialRecortado = historial.slice(-3); 
        }

        // 2. Armar el arreglo SIN el role: "system"
        const mensajesParaOllama = [
            ...historialRecortado,
            { role: "user", content: nuevoMensaje }
        ];

        console.log(`🧠 Enviando ${mensajesParaOllama.length} mensajes en contexto a Ollama...`);
        
        // 3. Petición a Ollama
        const startTime = Date.now();
        const ollamaResponse = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'Julia', 
                messages: mensajesParaOllama,
                stream: false 
            })
        });

        if (!ollamaResponse.ok) {
            throw new Error(`Fallo de Ollama: Status ${ollamaResponse.status}`);
        }

        const data = await ollamaResponse.json();
        let mensajeIA = data.message.content;
        
        const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`⏱️  Ollama respondió en ${timeTaken} segundos.`);

        // 4. Filtro final de limpieza
        mensajeIA = mensajeIA.replace(/¿[^?]*\?\s*$/g, "");
        mensajeIA = mensajeIA.trim();
        // 5. Preparar la respuesta para el Front-end
        const historialParaDevolver = [
            ...historial,
            { role: "user", content: nuevoMensaje },
            { role: "assistant", content: mensajeIA }
        ];

        console.log(`✨ Respuesta limpia enviada: "${mensajeIA.substring(0, 50)}..."`);
        console.log('==================================================\n');

        res.json({ 
            respuesta: mensajeIA,
            historialActualizado: historialParaDevolver 
        });

    } catch (error) {
        console.error('❌ Error crítico en el servidor:', error.message);
        res.status(500).json({ error: 'Error de conexión con el tablero de ajedrez local.' });
    }
});

app.listen(PORT, () => {
    console.log(`♔ Backend de Julia corriendo en http://localhost:${PORT}`);
});