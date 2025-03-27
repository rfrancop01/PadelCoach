# 🎾 PadelCoach

**PadelCoach** es una plataforma de gestión deportiva centrada en entrenadores y alumnos de pádel, con potencial para adaptarse a otros deportes técnicos. El objetivo es facilitar la organización de sesiones, seguimiento de progresos y comunicación entre entrenador y jugador, todo desde una herramienta moderna, sencilla y funcional.

---

## 🚀 Objetivo del proyecto

- Centralizar la gestión de clases de pádel para entrenadores.
- Permitir a los alumnos consultar horarios, ubicaciones, y sesiones asignadas.
- Crear una herramienta realista y útil, que sirva como portfolio técnico y pueda evolucionar a una solución SaaS.

---

## 🧱 Estructura del proyecto

```
PadelCoach/
├── client/               # React + Vite (Frontend)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/               # Flask + PostgreSQL (Backend)
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── config.py
│   ├── run.py
│   └── requirements.txt
│
├── docker-compose.yml    # Orquestador de servicios
├── .gitignore
└── README.md
```

---

## 🧠 Funcionalidades previstas (MVP)

### Entrenador
- Crear y gestionar sesiones
- Asociar alumnos a sesiones
- Registrar asistencia y observaciones
- Ver calendario y dashboard resumen

### Alumno
- Iniciar sesión
- Consultar próximas sesiones y ubicación
- Leer notas del entrenador
- Ver su historial

---

## 🐳 Servicios con Docker

- PostgreSQL como base de datos persistente
- Flask API conectada al contenedor de PostgreSQL
- Frontend React ejecutado por separado (dev mode con Vite)

---

## 🛠️ Stack tecnológico

- **Frontend:** React + Vite + Bootstrap o Tailwind
- **Backend:** Python + Flask
- **Base de datos:** PostgreSQL
- **ORM:** SQLAlchemy
- **Autenticación:** JWT (previsto)
- **Contenedores:** Docker + Docker Compose

---

## 🔄 Roadmap de desarrollo

|  ##Fase                  |  ##Estado       |  ##Tareas incluidas                                                                 |
|--------------------------|----------------|--------------------------------------------------------------------------------------|
| **1. Setup del entorno** | ✅ Completado   | Crear carpetas `client/`, `server/`, `.gitignore`, repo Git, subir a GitHub         |
| **2. Docker + PostgreSQL** | ⏳ En progreso | Crear `docker-compose.yml`, levantar base de datos, conectar con Flask              |
| **3. Backend Flask**     | ⏳ Pendiente    | Crear modelos, rutas, controladores, autenticación con JWT                          |
| **4. Frontend React**    | ⏳ Pendiente    | Login, panel por rol, calendario, gestión de sesiones                               |
| **5. Mejoras y despliegue** | ⏳ Pendiente | Mapa (OpenStreetMap), clima (opcional), despliegue en Railway / Render / Vercel     |

---

## ✍️ Autor

Desarrollado por [Ricardo Francop](https://github.com/rfrancop01) como proyecto personal para aprendizaje y portfolio profesional.

---

¡Gracias por visitar el repo! ⭐️
