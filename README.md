# 🧩 Kanban Board – React + NestJS + MongoDB

## 🎯 Descripción

Aplicación **Kanban** inspirada en Trello, desarrollada con **React** y **NestJS**, que permite gestionar tareas en tiempo real con soporte para **drag & drop** y sincronización mediante **Socket.io**.  
Utiliza **MongoDB** para almacenar tableros, columnas y tarjetas.

---

## ⚙️ Tecnologías Principales

### Frontend
- ⚛️ **React + Vite**
- 🎨 **TailwindCSS**
- 🧱 **@dnd-kit** para drag & drop
- 🔁 **React Query** para sincronización de datos
- 🌐 **Socket.io-client** para tiempo real

### Backend
- 🧠 **NestJS**
- 🗄️ **MongoDB con Mongoose**
- ⚡ **Socket.io** para comunicación bidireccional
- 🔧 **Dotenv** para configuración de variables de entorno

---

## 🧰 Requisitos Previos

- Node.js 18+
- MongoDB corriendo localmente (`mongodb://localhost:27017/kanban`)
- NPM o Yarn

---

## 🖥️ Terminal 1 — Backend

```bash
cd backend
npm install
npm run start:dev
```

## El backend se ejecutará en:

```bash
http://localhost:3000
```

##🖥️ Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```
##El frontend estará disponible en:

```bash
http://localhost:5173
```

##🌱 Generar Datos Iniciales (Seed)

Antes de usar la aplicación, necesitas generar datos de ejemplo (semilla) para que el tablero tenga columnas y tarjetas.

###1️⃣ Llama al endpoint de seed

Abre tu navegador o Postman y entra a:
```bash
GET http://localhost:3000/api/seed
```

Esto creará:

Un tablero nuevo en MongoDB.

Sus columnas por defecto (To Do, In Progress, Done).

Varias tarjetas de ejemplo.

###2️⃣ Copia el boardId devuelto

La respuesta será algo así:
```json
{
  "message": "Seed ejecutado correctamente",
  "boardId": "670123abc456def789012345"
}
```

👉 Copia el valor del boardId, porque lo necesitarás en el frontend.

3️⃣ Pega el boardId en el archivo App.tsx

Abre el archivo:
```bash
frontend/src/App.tsx
```

Y reemplaza la línea que contiene el boardId por el que copiaste del seed:

```typescript
import Board from "./components/Board";
import "./App.css";

function App() {

  // 👇 REEMPLAZAR ESTE ID POR EL QUE TE DEVOLVIÓ EL SEED
  const boardId = "670123abc456def789012345";

  return (
    <div className="bg-gray-299/50 rounded-xl backdrop-blur-sm shadow-2xl shadow-black/80">
      <Board boardId={boardId} />
    </div>
  );
}

export default App;
```

Guarda los cambios y recarga el frontend.
Ahora deberías ver el tablero cargado con las columnas y tarjetas generadas 🎉

🧠 Qué se Logró

- ✅ Visualización del tablero con columnas y tarjetas.
- ✅ Mover tarjetas entre columnas con drag & drop fluido (@dnd-kit).
- ✅ Sincronización de cambios en tiempo real con Socket.io.
- ✅ Creación de nuevas tarjetas por columna.
- ✅ Eliminación de tarjetas individualmente.

🚧 Lo que Falta

-❌ Integración con N8N para exportar el backlog por correo en formato CSV.
-❌ Edición de columnas y tarjetas.
❌ Seed automático al iniciar el backend (actualmente debe ejecutarse manualmente).

🔹 En esta versión, el seed debe ejecutarse manualmente una sola vez, y el boardId copiado debe reemplazarse en el archivo App.tsx del frontend.

🙏 Nota Final

Por razones de tiempo, la integración con N8N y el seed automático no se completaron, pero la aplicación está completamente funcional en drag & drop, creación, eliminación y sincronización en tiempo real.

Gracias por revisar este proyecto 💙
Se dejó documentado y estructurado para facilitar su continuación e integración futura.
