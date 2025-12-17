# YelpOut - Documentación del Sistema

## 📋 Descripción General

YelpOut es una aplicación web inteligente de planificación de salidas que utiliza inteligencia artificial conversacional para ayudar a los usuarios a crear itinerarios personalizados. El sistema integra la API de Yelp para recomendar restaurantes, actividades y experiencias basadas en las preferencias del usuario.

**Versión:** 1.0.0-beta.1  
**Framework:** Next.js 14.2.35  
**Tecnología Principal:** React, TypeScript, Tailwind CSS

---

## ✨ Características Principales

### 1. **Conversación Inteligente con IA**
- Sistema de chat interactivo con flujo conversacional natural
- Detección automática de información en mensajes iniciales (fecha, hora, ubicación, tipo de evento)
- Soporte bilingüe completo (Español e Inglés)
- Chips de respuesta rápida contextual
- Detección de comandos especiales:
  - "go back" / "volver" - Regresa al paso anterior
  - "help" / "ayuda" - Muestra guía de ayuda
  - Detección de cambios: "change the time to 7pm"

### 2. **Extracción Inteligente de Contexto**
El sistema detecta automáticamente:
- **Tipo de evento:** cita romántica, celebración, familiar, amigos, graduación, negocios
- **Fecha:** "today", "tomorrow", "tonight", "this evening", "next Saturday"
- **Hora:** Formatos 12h y 24h, con clarificación AM/PM cuando es ambiguo
- **Ubicación:** Direcciones, códigos postales, nombres de ciudad
- **Duración:** "2 hours", "all day", "4 hours"
- **Presupuesto:** $ (económico), $$ (moderado), $$$ (alto), $$$$ (lujo)

### 3. **Planificación de Itinerarios**
- **Generación automática de plan en 3 bloques:**
  1. Actividad inicial (pre-cena o aperitivo)
  2. Cena principal (restaurante)
  3. Actividad final (postre, bar, entretenimiento)

- **Cálculo automático de tiempos:**
  - Asignación inteligente de duración por tipo de actividad
  - Recalculación automática al reordenar bloques
  - Validación de horarios vs. horarios de cierre de negocios

- **Drag & Drop para reordenar:**
  - Interfaz intuitiva con manejo visual
  - Recalculación automática de tiempos al mover bloques
  - Eliminación automática de bloques que excedan hora de cierre

### 4. **Integración con Yelp API**
- Búsqueda de negocios por categoría, ubicación y radio
- Filtrado por:
  - Precio ($, $$, $$$, $$$$)
  - Rating (mínimo 3.5 estrellas)
  - Distancia (radio configurable)
  - Horarios de apertura
  - Estado de apertura en fecha/hora seleccionada

- **Información de negocios:**
  - Nombre, dirección, teléfono
  - Calificación y número de reseñas
  - Fotos del negocio
  - Categorías y tipo de cocina
  - Horarios de operación
  - Rango de precios
  - URL de Yelp
  - *(Próximamente: Sistema de reservaciones)*

### 5. **Sistema de Alternativas**
- Cada bloque de itinerario incluye 3-5 opciones de negocios
- Botón "Change" para intercambiar opciones
- Sistema de rotación circular de alternativas
- Notificaciones toast cuando no hay más opciones disponibles
- Indicador "View alternatives" para ver todas las opciones

### 6. **Validaciones Inteligentes**
- **Filtrado por hora de cierre:**
  - Oculta negocios que cierran en <30 minutos
  - Muestra advertencia para negocios que cierran en <1 hora
  
- **Validación de tiempos:**
  - Evita seleccionar horas pasadas para "today"
  - Recalcula duración total del plan
  - Elimina bloques que excedan horarios de cierre

### 7. **Personalización y Preferencias**
- **Contexto editable:** Píldoras editables en la parte superior
- **Filtros disponibles:**
  - Tipo de evento
  - Ubicación con geolocalización
  - Fecha (selector de calendario)
  - Hora de inicio
  - Duración
  - Presupuesto
  - Tamaño de grupo (adultos, niños)
  - Mascots permitidas
  - Tipo de cocina
  - Ambiente deseado

### 8. **Compartir Itinerario**
- Envío de itinerario completo por correo electrónico
- Incluye:
  - Resumen del evento
  - Todos los bloques con opciones seleccionadas
  - Direcciones y enlaces a Yelp
  - Tiempos de inicio y fin
  - Información de contacto de cada negocio

### 9. **Experiencia de Usuario**
- **Sistema de notificaciones toast:**
  - Éxito (verde)
  - Error (rojo)
  - Advertencia (naranja)
  - Información (azul)
  - Auto-cierre configurable

- **Interfaz responsive:**
  - Diseño adaptable para móvil y desktop
  - Tema oscuro profesional
  - Animaciones suaves con Framer Motion

- **Estados de carga:**
  - Indicadores durante búsquedas de API
  - Skeleton loaders para bloques
  - Mensajes de progreso

### 10. **Persistencia de Datos**
- Almacenamiento en sessionStorage:
  - Contexto de planificación
  - Historial de conversación
  - Mensajes del chat
  - Bloques del itinerario
  
- Recuperación automática al recargar página
- Historial navegable con "go back"

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
```
Frontend:
- Next.js 14.2.35 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animaciones)

Gestión de Estado:
- Zustand (estado global)
- React Hooks (estado local)
- Session Storage (persistencia)

Librerías UI:
- react-icons (iconografía)
- @dnd-kit (drag and drop)
- react-select (selectores)

APIs Externas:
- Yelp Fusion API
- Geocoding API (coordenadas)

Deployment:
- PM2 (process manager)
- Nginx (reverse proxy)
- Node.js 18+
```

### Estructura de Directorios
```
/forge/yelpout/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Página principal
│   │   ├── layout.tsx         # Layout raíz
│   │   └── api/               # API routes
│   │       ├── yelp/          # Proxy a Yelp API
│   │       ├── send-itinerary/
│   │       └── log/
│   │
│   ├── modules/               # Módulos funcionales
│   │   ├── chat/             # Sistema de chat
│   │   │   ├── components/   # MessageList, Composer, Chips
│   │   │   └── types/        # Message, ConversationStep
│   │   │
│   │   └── planning/         # Sistema de planificación
│   │       ├── components/   # ItineraryView, ContextPills
│   │       ├── services/     # PlanningService
│   │       └── types/        # PlanContext, PlanBlock, Place
│   │
│   ├── shared/               # Componentes compartidos
│   │   └── components/       # Header, Footer, ToastProvider
│   │
│   ├── lib/                  # Librerías y utilidades
│   │   ├── conversation/     # flow.ts - Lógica conversacional
│   │   ├── planner/         # deriveBlocks.ts, timeUtils.ts
│   │   ├── yelp/            # API client, normalize
│   │   ├── messages/        # Respuestas dinámicas
│   │   ├── geo/             # Geolocalización
│   │   └── i18n/            # Internacionalización
│   │
│   └── styles/              # Estilos globales
│
├── public/                   # Assets estáticos
├── ecosystem.config.js       # PM2 config
└── package.json
```

---

## 🔄 Flujo de Conversación

### 1. Inicio de Conversación
```
Usuario: "Plan a romantic dinner tonight in Dallas"
         ↓
Sistema detecta:
- eventType: "date"
- date: "2025-12-17" (tonight)
- location: "Dallas"
         ↓
Pregunta faltante: startTime
```

### 2. Secuencia de Preguntas
1. **eventType** (¿Qué tipo de salida?)
2. **location** (¿En qué ciudad?)
3. **date** (¿Qué fecha?)
4. **startTime** (¿A qué hora?)
5. **clarifyAmPm** (¿AM o PM?) - Solo si es ambiguo
6. **duration** (¿Cuánto tiempo?)
7. **groupSize** (¿Cuántas personas?)
8. **budget** (¿Qué presupuesto?)
9. **cuisine** (¿Tipo de comida?) - Opcional
10. **mood** (¿Qué ambiente?) - Opcional

### 3. Generación de Plan
```
Contexto completo → deriveBlocks()
                         ↓
                   3 bloques base:
                   - Appetizer/Activity
                   - Main Dinner
                   - Dessert/Activity
                         ↓
                  PlanningService.search()
                         ↓
                  Yelp API (búsqueda)
                         ↓
                  Filtrado y validación
                         ↓
                  Renderiza ItineraryView
```

### 4. Modificaciones Post-Generación
- **Cambio de opción:** Rotación de alternativas
- **Reordenar bloques:** Drag & drop + recalcular tiempos
- **Editar contexto:** Píldoras editables
- **Skip bloque:** Marcar como omitido
- **Cambios conversacionales:** "Change time to 8pm"

---

## 🔧 Componentes Principales

### `page.tsx` - Controlador Principal
**Responsabilidades:**
- Gestión de estado global de conversación
- Coordinación entre chat e itinerario
- Detección de comandos especiales
- Persistencia en sessionStorage
- Lógica de "go back"

**Funciones clave:**
- `handleSendMessage()` - Procesa mensajes del usuario
- `handleContextUpdate()` - Actualiza contexto
- `handlePlanReady()` - Inicia generación de plan
- `handleSwap()` - Intercambia opciones
- `handleReorder()` - Reordena bloques

### `flow.ts` - Motor Conversacional
**Responsabilidades:**
- Define secuencia de preguntas
- Extrae información de mensajes
- Valida respuestas
- Detecta cambios en contexto

**Funciones clave:**
- `extractInitialInfo()` - Primera pasada de extracción
- `parseUserResponse()` - Parsea respuestas por pregunta
- `detectChangeRequest()` - Detecta cambios post-plan
- `getNextQuestion()` - Determina siguiente pregunta
- `hasAllRequiredInfo()` - Valida completitud

### `deriveBlocks.ts` - Generador de Itinerarios
**Responsabilidades:**
- Crea estructura de bloques del plan
- Asigna duraciones por tipo de evento
- Calcula tiempos de inicio/fin
- Define categorías de búsqueda

**Función principal:**
```typescript
deriveBlocks(context: PlanContext): PlanBlock[]
```

### `timeUtils.ts` - Utilidades de Tiempo
**Funciones:**
- `parseTimeToMinutes()` - Convierte "14:00" → 840 minutos
- `formatMinutesToTime()` - Convierte 840 → "2:00 PM"
- `formatTime12Hour()` - Formatea 24h a 12h
- `checkClosingTime()` - Valida contra horarios de cierre
- `filterByClosingTime()` - Filtra negocios próximos a cerrar
- `recalculateTimes()` - Recalcula tiempos de bloques
- `shouldRemoveBlock()` - Valida si bloque excede cierre

### `ItineraryView.tsx` - Vista del Plan
**Características:**
- Renderiza bloques con drag & drop
- Muestra opciones con carrusel de alternativas
- Botones de acción (Change, Skip, Select)
- Advertencias de cierre inminente
- Indicador de estado (loading, error, skipped)

### `ToastProvider.tsx` - Sistema de Notificaciones
**Características:**
- 4 tipos de toast (success, error, warning, info)
- Auto-cierre configurable
- Posición fija top-right
- Animaciones con Framer Motion
- Contexto React para uso global

---

## 🌐 API y Servicios

### Yelp Fusion API

**Endpoints utilizados:**

1. **Business Search**
```
GET /v3/businesses/search
Parámetros:
- term: Categoría de búsqueda
- location: Ciudad o coordenadas
- radius: Radio en metros
- price: Rango de precios (1,2,3,4)
- open_at: Timestamp Unix (filtro por apertura)
- sort_by: Criterio de ordenamiento
- limit: Máximo de resultados
```

2. **Business Details** (Próximamente)
```
GET /v3/businesses/{id}
Obtiene información detallada de un negocio
```

3. **Bookings** (Planificado)
```
GET /v3/bookings/{business_id}/openings
Verifica disponibilidad de reservaciones
Parámetros:
- covers: Número de personas
- date: Fecha en formato YYYY-MM-DD
- time: Hora en formato HH:MM
```

### Servicios Internos

**PlanningService**
```typescript
class PlanningService {
  static async search(params: SearchParams): Promise<Place[]>
  static async generatePlan(context: PlanContext): Promise<PlanBlock[]>
}
```

**GeocodingService**
```typescript
getCityFromCoordinates(lat: number, lng: number): Promise<string>
getNearbyCities(city: string): string[]
```

---

## 📱 Guía de Usuario

### Inicio Rápido

1. **Mensaje inicial con toda la información:**
```
"Plan a romantic dinner tonight at 7pm in Dallas with budget $$"
```

2. **O responde paso a paso:**
```
Sistema: "What type of outing are you planning?"
Usuario: "A romantic date"
Sistema: "In what city?"
Usuario: "Dallas, TX"
... etc
```

3. **Comandos útiles:**
- "go back" - Regresa al paso anterior
- "help" - Muestra guía de ayuda
- "change time to 8pm" - Modifica un valor
- "use my location" - Usa geolocalización

### Modificación del Plan

1. **Reordenar actividades:**
   - Arrastra el ícono ☰ para mover bloques
   - Los tiempos se recalculan automáticamente

2. **Cambiar opciones:**
   - Click en "Change" para ver siguiente opción
   - Click en "View alternatives" para ver todas

3. **Omitir actividad:**
   - Click en "Skip" para marcar como omitido
   - El tiempo se recalcula sin este bloque

4. **Editar contexto:**
   - Click en píldoras superiores (ubicación, fecha, etc.)
   - Modifica valores y el plan se actualizará

### Envío por Email

1. Completa tu plan
2. Selecciona opciones para cada bloque
3. Click en botón de email (ícono sobre)
4. Ingresa dirección de email
5. Recibe itinerario completo en tu correo

---

## 🚀 Características Próximas

### En Desarrollo
- ✅ Sistema de cambios conversacionales ("change time to X")
- ✅ Detección de "tonight", "this evening", etc.
- ✅ Mejora en tiempos (formato 12h correcto)
- ✅ Etiquetas dinámicas para actividades
- 🔄 Corrección de reviewCount desde API
- 🔄 Sistema de reservaciones con Yelp Bookings

### Planificado
- 📋 Modo multi-día (planes de fin de semana)
- 📋 Integración con Google Calendar
- 📋 Compartir plan por link público
- 📋 Guardar planes favoritos
- 📋 Recomendaciones basadas en historial
- 📋 Integración con servicios de transporte (Uber/Lyft)
- 📋 Calculadora de costos estimados
- 📋 Sistema de reviews y feedback

---

## 🐛 Solución de Problemas

### El sistema pregunta información que ya proporcioné
**Solución:** Asegúrate de usar palabras clave reconocibles:
- "tonight" en lugar de "esta noche"
- "7pm" en lugar de "a las 7"
- Nombres de ciudad con estado: "Dallas, TX"

### Los tiempos del plan no coinciden
**Solución:** El sistema ahora usa formato 12h correctamente. Si persiste:
1. Recarga la página (F5)
2. Usa formato explícito: "7:00 PM"

### No aparecen opciones de negocios
**Causas posibles:**
- Sin conexión a internet
- API de Yelp no disponible
- Ubicación demasiado específica
- Horario fuera de operación

**Solución:** 
1. Verifica conexión
2. Usa ciudad más general
3. Cambia horario del plan

### "No alternatives available"
**Causa:** Se agotaron las opciones disponibles para ese bloque
**Solución:** Cambia filtros (presupuesto, ubicación, hora)

---

## 📄 Licencia y Contacto

**Proyecto:** YelpOut  
**Versión:** 1.0.0-beta.1  
**Estado:** Beta - Desarrollo Activo

**Tecnologías Principales:**
- Next.js 14
- React 18
- TypeScript
- Yelp Fusion API

**Deployment:**
- PM2 (proceso ID: 2)
- Puerto: 3010
- Nginx reverse proxy

---

## 📝 Notas de Versión

### v1.0.0-beta.1 (Actual)
- ✅ Sistema conversacional bilingüe completo
- ✅ Drag & drop para reordenar bloques
- ✅ Validación de horarios de cierre
- ✅ Sistema de toasts para notificaciones
- ✅ Detección inteligente de cambios
- ✅ Comando "go back" funcional
- ✅ Extracción mejorada de fecha/hora
- ✅ Formato correcto de tiempos (12h)
- ✅ Etiquetas dinámicas de actividades
- 🔄 Sistema de reservaciones (en progreso)

### Próximo Release (v1.1.0)
- Sistema de reservaciones con Yelp
- Corrección completa de reviewCount
- Mejoras en UX móvil
- Optimización de performance
