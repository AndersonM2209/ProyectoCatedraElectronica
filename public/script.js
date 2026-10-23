
const btnIzquierda = document.getElementById('btnIzquierda');
const btnDerecha = document.getElementById('btnDerecha');
const btnDetener = document.getElementById('btnDetener');

const btnManual = document.getElementById('btnManual');
const btnAutomatico = document.getElementById('btnAutomatico');

const estadoMotor = document.getElementById('estadoMotor');
const modoActual = document.getElementById('modo');
const distancia = document.getElementById('distancia');
const arduinoStatus = document.getElementById('arduinoStatus');
const estadoArduinoCard = document.getElementById('estadoArduinoCard');

// Enviar solicitudes POST a nuestra API
async function enviarComando(ruta, datos) {
    const respuesta = await fetch(ruta, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
        throw new Error(resultado.error || 'Error en la API');
    }

    return resultado;
}

// Controlar motor
async function controlarMotor(accion) {
    try {
        await enviarComando('/api/motor', { accion });
        await actualizarEstado();
    } catch (error) {
        alert(error.message);
    }
}

// Cambiar modo de operación
async function cambiarModo(modo) {
    try {
        await enviarComando('/api/modo', { modo });
        await actualizarEstado();
    } catch (error) {
        alert(error.message);
    }
}

// Consultar estado de la API
async function actualizarEstado() {
    try {
        const respuesta = await fetch('/api/estado');

        if (!respuesta.ok) {
            throw new Error('No se pudo consultar el estado');
        }

        const datos = await respuesta.json();

        estadoMotor.textContent = datos.motor;
        modoActual.textContent = datos.modo;
        distancia.textContent = datos.distancia;

        // Actualizar estado de conexión de Arduino
        if (datos.arduinoConectado) {
            arduinoStatus.textContent = 'Conectado';
            estadoArduinoCard.classList.add('conectado');
            estadoArduinoCard.classList.remove('desconectado');
        } else {
            arduinoStatus.textContent = 'Desconectado';
            estadoArduinoCard.classList.add('desconectado');
            estadoArduinoCard.classList.remove('conectado');
        }

        // Resaltar botón de modo activo
        if (datos.modo === 'automatico') {
            btnAutomatico.classList.add('activo');
            btnManual.classList.remove('activo');
        } else {
            btnManual.classList.add('activo');
            btnAutomatico.classList.remove('activo');
        }

        // Desactivar control manual en modo automático
        const esAutomatico = datos.modo === 'automatico';

        btnIzquierda.disabled = esAutomatico;
        btnDerecha.disabled = esAutomatico;
        btnDetener.disabled = esAutomatico;

    } catch (error) {
        console.error('Error al consultar la API:', error);
        estadoMotor.textContent = 'Sin conexión';
        if (arduinoStatus && estadoArduinoCard) {
            arduinoStatus.textContent = 'Desconectado (Sin servidor)';
            estadoArduinoCard.classList.add('desconectado');
            estadoArduinoCard.classList.remove('conectado');
        }
    }
}

// Eventos de los botones
btnIzquierda.addEventListener('click', () => {
    controlarMotor('izquierda');
});

btnDerecha.addEventListener('click', () => {
    controlarMotor('derecha');
});

btnDetener.addEventListener('click', () => {
    controlarMotor('detenido');
});

btnManual.addEventListener('click', () => {
    cambiarModo('manual');
});

btnAutomatico.addEventListener('click', () => {
    cambiarModo('automatico');
});

// Actualizar datos cada segundo
actualizarEstado();
setInterval(actualizarEstado, 1000);
