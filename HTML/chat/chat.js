let historial = [];
let isTyping = false;

const messagesArea = document.getElementById('messagesArea');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// --- 3. Función para añadir mensajes al DOM ---
function renderizarMensaje(sender, text) {
    const bubble = document.createElement('div');
    bubble.className = `bubble ${sender === 'julia' ? 'julia' : 'user'}`;
    
    const contenidoRenderizado = sender === 'julia' ? marked.parse(text) : text;
    
    bubble.innerHTML = `
        <strong>${sender === 'julia' ? 'Julia' : 'Tú'}</strong>
        <div class="messageContent">${contenidoRenderizado}</div>
    `;
    
    messagesArea.appendChild(bubble);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

// --- 4. Función de envío al backend ---
async function handleSendMessage() {
    const mensaje = userInput.value.trim();
    if (!mensaje || isTyping) return;

    renderizarMensaje('user', mensaje);
    userInput.value = ''; // Limpiar input
    isTyping = true;
    sendButton.disabled = true;

    try {
        const res = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                historial: historial, 
                nuevoMensaje: mensaje 
            })
        });

        const data = await res.json();
        
        historial = data.historialActualizado;
        const ultimaRespuesta = historial[historial.length - 1].content;
        renderizarMensaje('julia', ultimaRespuesta);

    } catch (error) {
        console.error("Error al conectar con el backend:", error);
        renderizarMensaje('julia', "Error: No pude conectarme con el servidor.");
    } finally {
        isTyping = false;
        sendButton.disabled = false;
    }
}

// --- 5. Event Listeners ---
sendButton.addEventListener('click', handleSendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});