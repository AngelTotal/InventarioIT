# Sistema de Inventario TI - Enterprise

Aplicación web moderna para la gestión de activos de TI, desarrollada con React y Vite.

## Características

- **Dashboard**: Vista general de estado, alertas y métricas.
- **Inventario**: Gestión de activos (Hardware, Periféricos, Componentes).
- **Control de Acceso**: Login seguro (Simulado) y roles de usuario.
- **Diseño**: Interfaz moderna (Dark Mode) con glassmorphism.

## Tecnologías

- **Frontend**: React 18 + Vite
- **Estilos**: Vanilla CSS Moderno (CSS Variables, Flexbox/Grid)
- **Navegación**: React Router 6
- **Iconos**: Lucide React

## Instrucciones de Instalación

1.  Instalar dependencias:
    ```bash
    npm install
    ```

2.  Iniciar servidor de desarrollo:
    ```bash
    npm run dev
    ```

3.  Abrir en el navegador:
    Acceder a la URL mostrada (usualmente `http://localhost:5173`).

## Credenciales de Acceso (Demo)

- **Usuario**: `admin`
- **Contraseña**: `admin`

## Estructura del Proyecto

- `/src/pages`: Vistas principales (Dashboard, Login, Inventario).
- `/src/components`: Componentes reutilizables.
- `/src/layouts`: Estructuras de página (Sidebar, Topbar).
- `/src/context`: Manejo de estado global (Auth).
- `/src/styles`: Estilos globales y temas.

## Próximos Pasos (Backend)

La aplicación está lista para conectarse a una API REST real. Actualmente utiliza `AuthContext` y datos mock para demostración.
Para producción, se recomienda implementar un backend en Node.js/Express o Python conectando a PostgreSQL.
