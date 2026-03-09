let historial = [];
let isTyping = false;

const messagesArea = document.getElementById('messagesArea');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');
const thoughtElement = document.getElementById('thoughtValue');

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

    // A. Mostrar mensaje del usuario y limpiar input
    renderizarMensaje('user', mensaje);
    userInput.value = '';
    
    // B. Activar indicador de "pensando"
    isTyping = true;
    typingIndicator.style.display = 'flex';
    sendButton.disabled = true;

    try {
        const res = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ historial, nuevoMensaje: mensaje })
        });

        if (!res.ok) throw new Error("Error en el servidor");

        const data = await res.json();

        // D. Actualizar historial
        historial = data.historialActualizado;

        // E. Renderizar respuesta limpia
        if (data.respuesta) {
            renderizarMensaje('julia', data.respuesta);
        }

    } catch (error) {
        console.error("Error:", error);
        renderizarMensaje('julia', "Error: No pude conectarme con el servidor.");
    } finally {
        // F. Ocultar indicador y restaurar botones
        isTyping = false;
        typingIndicator.style.display = 'none';
        sendButton.disabled = false;
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
}

// --- 5. Event Listeners ---
sendButton.addEventListener('click', handleSendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});