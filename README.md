# Control de Giro con Sensor — EAI441 (IoT)

> **Proyecto de Cátedra:** Sistema Ciberfísico IoT de control bidireccional de motor DC mediante sensor ultrasónico y supervisión remota en la nube.  
> **Institución:** Universidad Don Bosco (UDB) — Facultad de Ingeniería  
> **Materia:** Electrónica Aplicada al Internet de las Cosas (EAI441)  
> **Docente:** Ing. Rene Antonio Burgos Castro  

---

## 🌐 Enlaces del Proyecto

- 🚀 **Despliegue en Vivo (Render):** [https://proyectocatedraelectronica.onrender.com/](https://proyectocatedraelectronica.onrender.com/)
- 💻 **Repositorio GitHub:** [https://github.com/AndersonM2209/ProyectoCatedraElectronica](https://github.com/AndersonM2209/ProyectoCatedraElectronica)
- 🔌 **Simulación en Tinkercad:** [Ver circuito interactivo](https://www.tinkercad.com/things/elwyCemcAzF-proyecto-de-catedra-2?sharecode=rt_yxvxbkT3F6r8L_CVzDrwe97kjH1oui9g4qMdltHc)

---

## 📋 Descripción General

Este proyecto implementa una solución completa de **Internet de las Cosas (IoT)** que vincula el sensado físico y accionamiento de potencia con una plataforma web en la nube. El sistema permite operar un motor de corriente directa (DC) en dos modos:

1. **Modo Automático:** La dirección de rotación del motor se calcula y conmuta en tiempo real según la distancia física detectada por el sensor ultrasónico HC-SR04 hacia un obstáculo.
2. **Modo Manual:** El operador supervisa la telemetría del sensor y controla directamente el giro del motor (Izquierda, Derecha, Detener) desde el panel de control web.

La comunicación entre el dispositivo físico y la nube se realiza a través de **HTTPS/SSL** empleando un microcontrolador **Arduino UNO R4 WiFi**, interactuando con un servidor **Node.js + Express** desplegado en Render.

---

## 🏗️ Arquitectura del Sistema

El flujo de información se estructura en una arquitectura distribuida de 3 niveles:

```text
[ Dispositivo Físico IoT ]
  • Arduino UNO R4 WiFi
  • Sensor Ultrasónico HC-SR04
  • Puente H L293D + Motor DC
  • LEDs Indicadores de Giro (Pin 8 y Pin 9)
             │
             │ HTTPS (puerto 443) / JSON
             ▼
[ Servidor Backend en la Nube (Render) ]
  • Node.js & Express API REST
  • Gestión central de estado en memoria
  • Detección de Heartbeat del Arduino (<= 5s)
             ▲
             │ Peticiones Fetch / Polling asíncrono
             │
[ Cliente / Interfaz Web ]
  • Dashboard HTML5 / CSS3 responsivo
  • Monitoreo de distancia y estado en tiempo real
  • Botones de control manual y alternancia de modo
```

---

## ⚙️ Reglas de Operación y Lógica de Decisión

### 1. Modo Automático (Guiado por Proximidad)
| Rango de Distancia | Sentido del Motor | Indicador LED | Estado L293D |
| :--- | :--- | :--- | :--- |
| **10 cm a 25 cm** | **Giro a la Derecha** | LED Verde (Pin 8) ON | `IN1 = HIGH`, `IN2 = LOW`, `ENA = 255` |
| **> 25 cm a 40 cm** | **Giro a la Izquierda** | LED Rojo (Pin 9) ON | `IN1 = LOW`, `IN2 = HIGH`, `ENA = 255` |
| **< 10 cm o > 40 cm / Sin eco** | **Detenido** | Ambos LEDs OFF | `IN1 = LOW`, `IN2 = LOW`, `ENA = 0` |

### 2. Modo Manual (Control Directo)
- **Girar a la Izquierda:** Activa rotación antihoraria del motor de forma continua.
- **Girar a la Derecha:** Activa rotación horaria del motor de forma continua.
- **Detener:** Frena inmediatamente la salida del puente H.
- **Telemetría continua:** La distancia física del sensor HC-SR04 continúa actualizándose y mostrándose en el tablero web en todo momento sin alterar la acción fijada.

---

## 🔌 Conexiones de Hardware y Pines

| Pin Arduino | Componente / Módulo | Descripción / Función |
| :--- | :--- | :--- |
| **A0** | HC-SR04 (`Trig`) | Pulso de disparo ultrasónico (10 µs) |
| **A1** | HC-SR04 (`Echo`) | Captura de tiempo de vuelo del eco acústico |
| **D5 (PWM)** | L293D (`Pin 1 - ENA`) | Control de velocidad / habilitación PWM (255) |
| **D6** | L293D (`Pin 2 - IN1`) | Dirección de giro (Alto = Derecha) |
| **D7** | L293D (`Pin 7 - IN2`) | Dirección de giro (Alto = Izquierda) |
| **D8** | LED Giro Derecha | Indicador lumínico de giro horario |
| **D9** | LED Giro Izquierda | Indicador lumínico de giro antihorario |
| **5V / GND** | L293D (`Vcc1`), HC-SR04 | Alimentación lógica digital de control |
| **Batería 9V** | L293D (`Vcc2 - Pin 8`) | Alimentación de potencia dedicada para el motor DC (GND común) |

---

## 📡 API REST (Endpoints)

| Método | Endpoint | Descripción | Formato / Parámetros |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/estado` | Retorna el estado global del sistema y si el Arduino está conectado (heartbeat < 5s). | JSON |
| `POST` | `/api/motor` | Asigna acción manual al motor (`{"accion": "izquierda" | "derecha" | "detenido"}`). | JSON Body |
| `POST` | `/api/modo` | Conmuta el modo de trabajo (`{"modo": "manual" | "automatico"}`). | JSON Body |
| `POST` | `/api/arduino` | Endpoint de telemetría para que el Arduino reporte distancia y estado. | `{"distancia": float, "motor": string}` |

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- [Node.js](https://nodejs.org/) v18 o superior.
- [Arduino IDE](https://www.arduino.cc/en/software) con el paquete de placas **Arduino UNO R4 WiFi** instalado.

### 1. Clonar el Repositorio
```bash
git clone https://github.com/AndersonM2209/ProyectoCatedraElectronica.git
cd ProyectoCatedraElectronica
```

### 2. Instalar Dependencias del Servidor
```bash
npm install
```

### 3. Iniciar el Servidor Web
```bash
npm start
```
El servidor arrancará localmente en `http://localhost:3000`.

### 4. Cargar el Firmware en el Arduino
1. Abre el sketch en Arduino IDE.
2. Ingresa tu red WiFi y contraseña en:
   ```cpp
   const char* ssid = "TU_NOMBRE_WIFI";
   const char* password = "TU_PASSWORD";
   ```
3. Verifica que la variable `servidor` apunte a `proyectocatedraelectronica.onrender.com` (o la IP local si realizas pruebas internas).
4. Conecta tu Arduino UNO R4 WiFi por USB y presiona **Subir**.

---

## 👥 Integrantes del Equipo

| Nombre Completo | Carnet |
| :--- | :--- |
| **Anderson Alfredo Escobar Morán** | `EM251400` |
| **David Alexander Franco Rivera** | `FR250101` |
| **Edwin Daniel Leiva Barrera** | `LB250368` |
| **Jorge Luis Lugo González** | `LG242867` |

---

## 📄 Licencia

Este proyecto fue desarrollado con fines educativos para la cátedra de **Electrónica Aplicada al Internet de las Cosas (EAI441)** en la **Universidad Don Bosco**.
