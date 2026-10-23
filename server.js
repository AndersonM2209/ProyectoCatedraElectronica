
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'img')));

// Cabeceras CORS para permitir peticiones desde Arduino/ESP32 o herramientas externas
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Estado inicial del sistema
let estado = {
    proyecto: 'Control de Giro con Sensor',
    dispositivo: 'Arduino UNO R4 WiFi',
    motor: 'detenido',
    modo: 'manual',
    distancia: 0
};

// Función para calcular el estado del motor en modo automático
function calcularMotorAutomatico(distancia) {
    if (distancia >= 10 && distancia <= 25) {
        return 'derecha';
    } else if (distancia >= 26 && distancia <= 40) {
        return 'izquierda';
    } else {
        return 'detenido';
    }
}

// Consultar estado actual
app.get('/api/estado', (req, res) => {
    res.json(estado);
});

// Control manual del motor
app.post('/api/motor', (req, res) => {
    const { accion } = req.body;

    if (estado.modo !== 'manual') {
        return res.status(409).json({
            error: 'El motor está en modo automático'
        });
    }

    if (!['izquierda', 'derecha', 'detenido'].includes(accion)) {
        return res.status(400).json({
            error: 'Acción no válida'
        });
    }

    estado.motor = accion;

    res.json({
        mensaje: 'Comando recibido',
        estado
    });
});

// Cambiar modo de operación
app.post('/api/modo', (req, res) => {
    const { modo } = req.body;

    if (!['manual', 'automatico'].includes(modo)) {
        return res.status(400).json({
            error: 'Modo no válido'
        });
    }

    estado.modo = modo;

    if (modo === 'manual') {
        estado.motor = 'detenido';
    } else {
        // En automático, evaluar de inmediato según la distancia actual
        estado.motor = calcularMotorAutomatico(estado.distancia);
    }

    res.json({
        mensaje: 'Modo actualizado',
        estado
    });
});

// Endpoint para que Arduino/ESP32 (o la web) actualice la lectura de distancia
app.post(['/api/distancia', '/api/sensor', '/api/arduino'], (req, res) => {
    const valor = req.body.distancia ?? req.body.cm ?? req.body.dist ?? req.query.distancia ?? req.query.cm;
    const d = parseFloat(valor);

    if (isNaN(d)) {
        return res.status(400).json({
            error: 'Distancia no válida'
        });
    }

    estado.distancia = Math.round(d * 10) / 10;

    // Si el Arduino reporta directamente el motor, o si la API lo calcula en automático
    if (req.body.motor && ['izquierda', 'derecha', 'detenido'].includes(req.body.motor)) {
        estado.motor = req.body.motor;
    } else if (estado.modo === 'automatico') {
        estado.motor = calcularMotorAutomatico(estado.distancia);
    }

    res.json({
        mensaje: 'Lectura de sensor actualizada',
        estado
    });
});

// Compatibilidad GET para microcontroladores con librerías HTTP simples
app.get(['/api/distancia', '/api/sensor', '/api/arduino'], (req, res) => {
    const valor = req.query.distancia ?? req.query.cm ?? req.query.val;
    if (valor !== undefined) {
        const d = parseFloat(valor);
        if (!isNaN(d) && d >= 0) {
            estado.distancia = Math.round(d * 10) / 10;
            if (estado.modo === 'automatico') {
                estado.motor = calcularMotorAutomatico(estado.distancia);
            }
        }
    }
    res.json(estado);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

