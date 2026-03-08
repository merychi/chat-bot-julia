// La lista de todas las piezas que se van a ir rotando
const PIECES = [
    'assets/pieza-reina.png', 
    'assets/pieza-rey.png', 
    'assets/pieza-torre.png', 
    'assets/pieza-caballo.png'
];

let currentIndex = 0;
const chessImg = document.getElementById('chessPiece');

// Esto hace que cambie cada 4 segundos
setInterval(() => {
    // 1. Efecto de desvanecimiento (lo hacemos invisible)
    chessImg.style.opacity = 0;
    
    // 2. Esperamos 500ms (lo que dura la transición) y cambiamos la imagen
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % PIECES.length;
        chessImg.src = PIECES[currentIndex]; // Aquí cambiamos la imagen
        chessImg.style.opacity = 1; // Lo volvemos a mostrar
    }, 500);

}, 4000);