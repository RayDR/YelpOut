/**
 * Help and meta conversation responses for YelpOut
 * Detects and responds to questions about the system itself
 */

import { Language } from "@/lib/i18n/translations";

interface HelpResponse {
  detected: boolean;
  response: string;
  type?: 'howTo' | 'about' | 'creator' | 'yelp' | 'features' | 'privacy' | 'general';
}

// Keywords that trigger help responses (case-insensitive)
const helpKeywords = {
  // How to use
  howTo: {
    en: [
      'how', 'help', 'use', 'usarlo', 'usar', 'work', 'works', 'start', 'guide', 'tutorial', 'instructions',
      'how do i', 'how to', 'como uso', 'como usarlo', 'como funciona', 'como usar'
    ],
    es: [
      'cómo', 'como', 'ayuda', 'usar', 'usarlo', 'funciona', 'empezar', 'guía', 'instrucciones', 'tutorial',
      'como uso', 'como usarlo', 'como funciona', 'como usar', 'que hago', 'k hago'
    ]
  },
  // About the system - WHO ARE YOU / WHAT DO YOU DO
  about: {
    en: [
      'what is this', 'what does', 'yelpout', 'this app', 'purpose', 'tell me about',
      'who are you', 'who r u', 'what are you', 'what r u', 'what do you do', 'what u do',
      'introduce yourself', 'about you', 'who is this', 'what is yelpout'
    ],
    es: [
      'qué es', 'que es', 'yelpout', 'esta app', 'propósito', 'cuéntame', 'cuentame', 'sobre',
      'quien eres', 'quién eres', 'q eres', 'que eres', 'qué haces', 'que haces', 'k haces',
      'presentate', 'sobre ti', 'quien es', 'que es yelpout'
    ]
  },
  // Creator info
  creator: {
    en: [
      'who made', 'who created', 'who built', 'developer', 'creator', 'domoforge',
      'who developed', 'who owns', 'author', 'maker'
    ],
    es: [
      'quién hizo', 'quien hizo', 'quién creó', 'quien creo', 'desarrollador', 'creador', 'domoforge',
      'quien desarrollo', 'quien es el dueño', 'autor', 'creador'
    ]
  },
  // Yelp info
  yelp: {
    en: [
      'what is yelp', 'yelp', 'where data', 'recommendations come from', 'data source',
      'where from', 'where do you get'
    ],
    es: [
      'qué es yelp', 'que es yelp', 'yelp', 'de dónde', 'de donde', 'datos', 'recomendaciones',
      'fuente de datos', 'de donde sacas', 'donde consigues'
    ]
  },
  // Features - WHAT CAN YOU DO
  features: {
    en: [
      'what can', 'features', 'capabilities', 'can you', 'options', 'what do you offer',
      'what can you do', 'what u can do', 'abilities', 'functions'
    ],
    es: [
      'qué puede', 'que puede', 'características', 'capacidades', 'puedes', 'opciones',
      'qué puedes hacer', 'que puedes hacer', 'k puedes hacer', 'funciones', 'habilidades'
    ]
  },
  // Privacy
  privacy: {
    en: [
      'privacy', 'data', 'safe', 'secure', 'information', 'tracking', 'my data',
      'is it safe', 'security'
    ],
    es: [
      'privacidad', 'datos', 'seguro', 'información', 'rastreo', 'seguimiento', 'mis datos',
      'es seguro', 'seguridad'
    ]
  }
};

const responses = {
  howTo: {
    en: `__FAQ_COMPONENT__`,
    es: `__FAQ_COMPONENT__`
  },
  about: {
    en: `🎯 **About YelpOut:**

I'm an **AI-powered conversational planner** that helps you create perfect outings through natural chat!

**What makes me special:**
• 🗣️ **Natural Conversation** - Chat like you would with a friend
• 🧠 **Context-Aware** - I remember everything you tell me
• ⏰ **Time-Intelligent** - Morning suggestions differ from evening
• 📧 **Email Itineraries** - Get your plan delivered beautifully
• 🗺️ **Real Data** - Powered by Yelp's extensive database
• 🌐 **Bilingual** - Fluent in English and Spanish
• 🎙️ **Voice Features** - Listen to me or talk to me!

I analyze your preferences and create customized itineraries with:
✓ Restaurant recommendations with ratings & prices
✓ Activity suggestions based on your group
✓ Optimal time allocation
✓ Distance calculations
✓ Direct links to reserve or get directions

Let's plan something amazing! 🎉`,
    es: `🎯 **Sobre YelpOut:**

Soy un **planificador conversacional con IA** que te ayuda a crear salidas perfectas a través de chat natural!

**Qué me hace especial:**
• 🗣️ **Conversación Natural** - Chatea como lo harías con un amigo
• 🧠 **Consciente del Contexto** - Recuerdo todo lo que me dices
• ⏰ **Inteligente con el Tiempo** - Sugerencias matutinas difieren de las nocturnas
• 📧 **Itinerarios por Email** - Recibe tu plan bellamente diseñado
• 🗺️ **Datos Reales** - Impulsado por la extensa base de datos de Yelp
• 🌐 **Bilingüe** - Fluido en inglés y español
• 🎙️ **Funciones de Voz** - ¡Escúchame o háblame!

Analizo tus preferencias y creo itinerarios personalizados con:
✓ Recomendaciones de restaurantes con ratings y precios
✓ Sugerencias de actividades según tu grupo
✓ Asignación óptima de tiempo
✓ Cálculos de distancia
✓ Enlaces directos para reservar o obtener direcciones

¡Planeemos algo increíble! 🎉`
  },
  creator: {
    en: `👨‍💻 **About the Creator:**

I was created by **DomoForge**, a technology development team passionate about building intelligent solutions.

**Project Details:**
• **Developer:** DomoForge
• **Year:** 2024-2025
• **Purpose:** Competition project showcasing AI + Yelp integration
• **License:** MIT (Open Source)
• **Contact:** support@domoforge.com
• **Live at:** https://yelpout.domoforge.com

**Built with:**
• Next.js 14 & React 18
• TypeScript
• TailwindCSS
• Yelp Fusion API
• Framer Motion

DomoForge believes in creating tools that make life easier through natural conversation and intelligent recommendations. This project combines cutting-edge web technologies with thoughtful UX design!

Want to contribute? Check out the [GitHub repository](https://github.com/domoforge/yelpout) 🚀`,
    es: `👨‍💻 **Sobre el Creador:**

Fui creado por **DomoForge**, un equipo de desarrollo tecnológico apasionado por construir soluciones inteligentes.

**Detalles del Proyecto:**
• **Desarrollador:** DomoForge
• **Año:** 2024-2025
• **Propósito:** Proyecto de competencia mostrando integración IA + Yelp
• **Licencia:** MIT (Código Abierto)
• **Contacto:** support@domoforge.com
• **En vivo:** https://yelpout.domoforge.com

**Construido con:**
• Next.js 14 & React 18
• TypeScript
• TailwindCSS
• Yelp Fusion API
• Framer Motion

DomoForge cree en crear herramientas que faciliten la vida a través de conversación natural y recomendaciones inteligentes. ¡Este proyecto combina tecnologías web de vanguardia con diseño UX reflexivo!

¿Quieres contribuir? Revisa el [repositorio en GitHub](https://github.com/domoforge/yelpout) 🚀`
  },
  yelp: {
    en: `🔍 **About Yelp & Our Data:**

**Yelp** is a platform with over 250 million reviews of local businesses worldwide!

**What YelpOut uses from Yelp:**
• 📊 **Business Information** - Names, addresses, phone numbers
• ⭐ **User Ratings** - Real reviews from millions of people
• 💰 **Price Levels** - Budget indicators ($ to $$$$)
• 📸 **Photos** - Visual previews of venues
• 🗂️ **Categories** - Cuisine types, activity categories
• 📍 **Locations** - Coordinates and distances

**Why Yelp?**
• Most comprehensive local business database
• Trusted by millions of users
• Real-time availability data
• Constantly updated reviews

YelpOut is powered by the **Yelp Fusion API** but is **not affiliated with or endorsed by Yelp Inc.** We're an independent project using their amazing API!

All business data comes directly from Yelp - I just help you discover the perfect places for your outing! 🎯`,
    es: `🔍 **Sobre Yelp y Nuestros Datos:**

**Yelp** es una plataforma con más de 250 millones de reseñas de negocios locales en todo el mundo!

**Lo que YelpOut usa de Yelp:**
• 📊 **Información de Negocios** - Nombres, direcciones, teléfonos
• ⭐ **Calificaciones** - Reseñas reales de millones de personas
• 💰 **Niveles de Precio** - Indicadores de presupuesto ($ a $$$$)
• 📸 **Fotos** - Vistas previas visuales de lugares
• 🗂️ **Categorías** - Tipos de cocina, categorías de actividades
• 📍 **Ubicaciones** - Coordenadas y distancias

**¿Por qué Yelp?**
• Base de datos más completa de negocios locales
• Confiado por millones de usuarios
• Datos de disponibilidad en tiempo real
• Reseñas constantemente actualizadas

YelpOut funciona con la **API Yelp Fusion** pero **no está afiliado ni respaldado por Yelp Inc.** ¡Somos un proyecto independiente usando su increíble API!

Todos los datos de negocios vienen directamente de Yelp - ¡yo solo te ayudo a descubrir los lugares perfectos para tu salida! 🎯`
  },
  features: {
    en: `✨ **What I Can Do:**

**Planning Features:**
• 🎯 **Smart Itineraries** - Complete day plans with timing
• 🍽️ **Restaurant Recommendations** - Based on time, mood, budget
• 🎪 **Activity Suggestions** - Entertainment, museums, parks
• 🍰 **Dessert & After-hours** - Coffee shops, bars, lounges
• ⏰ **Time-Aware** - Morning gets breakfast, evening gets fine dining
• 💰 **Budget Control** - Filter by price level
• 🌍 **Location-Based** - Find places near you

**Interaction Features:**
• 💬 **Natural Chat** - Talk to me like a friend
• 🎤 **Voice Input** - Say it instead of typing
• 🔊 **Text-to-Speech** - Listen to my responses
• 🌐 **Bilingual** - Switch between English/Spanish anytime
• 🔙 **Undo/Redo** - Changed your mind? Go back!
• 📧 **Email Plans** - Get beautiful HTML itineraries

**Smart Features:**
• 🧠 **Context Memory** - I remember your preferences
• 🔄 **Easy Refinement** - Adjust any detail with one click
• ⏭️ **Skip Options** - Don't want dessert? Skip it!
• 👥 **Group-Aware** - Family plans differ from dates
• 🐕 **Pet-Friendly** - Find dog-friendly places
• 🌙 **Dark Mode** - Easy on the eyes

What would you like to explore? 🚀`,
    es: `✨ **Lo Que Puedo Hacer:**

**Funciones de Planificación:**
• 🎯 **Itinerarios Inteligentes** - Planes completos con horarios
• 🍽️ **Recomendaciones de Restaurantes** - Según hora, ambiente, presupuesto
• 🎪 **Sugerencias de Actividades** - Entretenimiento, museos, parques
• 🍰 **Postres y After-hours** - Cafeterías, bares, lounges
• ⏰ **Consciente del Tiempo** - Mañana da desayuno, noche da fine dining
• 💰 **Control de Presupuesto** - Filtra por nivel de precio
• 🌍 **Basado en Ubicación** - Encuentra lugares cerca de ti

**Funciones de Interacción:**
• 💬 **Chat Natural** - Háblame como a un amigo
• 🎤 **Entrada de Voz** - Dilo en lugar de escribir
• 🔊 **Texto a Voz** - Escucha mis respuestas
• 🌐 **Bilingüe** - Cambia entre inglés/español cuando quieras
• 🔙 **Deshacer** - ¿Cambiaste de opinión? ¡Regresa!
• 📧 **Planes por Email** - Recibe itinerarios HTML hermosos

**Funciones Inteligentes:**
• 🧠 **Memoria de Contexto** - Recuerdo tus preferencias
• 🔄 **Refinamiento Fácil** - Ajusta cualquier detalle con un clic
• ⏭️ **Opciones de Saltar** - ¿No quieres postre? ¡Sáltalo!
• 👥 **Consciente del Grupo** - Planes familiares difieren de citas
• 🐕 **Pet-Friendly** - Encuentra lugares que aceptan perros
• 🌙 **Modo Oscuro** - Fácil para la vista

¿Qué te gustaría explorar? 🚀`
  },
  privacy: {
    en: `🔒 **Privacy & Security:**

**Your data is safe with me!**

**What I DON'T do:**
• ❌ No tracking or analytics
• ❌ No cookies for tracking
• ❌ No selling your data
• ❌ No third-party data sharing
• ❌ No permanent storage

**What I DO:**
• ✅ Store conversation temporarily in your browser only
• ✅ Use your location only when you give permission
• ✅ Send emails only when you request it
• ✅ Clear data when you close the session
• ✅ Encrypt API communication (HTTPS)

**Your Control:**
• 📱 All data stays in your browser (sessionStorage)
• 🗑️ Data clears when you close the tab
• 🔐 No account required, no passwords
• 📧 Email addresses used only for sending itineraries
• 🌍 Location used only for finding nearby places

**About Yelp Data:**
When you get recommendations, I query Yelp's API with your location and preferences. Yelp may log these searches according to their privacy policy.

**Questions?** Check our privacy notice at the bottom of the page or email support@domoforge.com

Your privacy matters! 🛡️`,
    es: `🔒 **Privacidad y Seguridad:**

**¡Tus datos están seguros conmigo!**

**Lo que NO hago:**
• ❌ No rastreo ni analíticas
• ❌ No cookies de rastreo
• ❌ No vendo tus datos
• ❌ No comparto datos con terceros
• ❌ No almacenamiento permanente

**Lo que SÍ hago:**
• ✅ Guardo conversación temporalmente solo en tu navegador
• ✅ Uso tu ubicación solo cuando das permiso
• ✅ Envío emails solo cuando lo solicitas
• ✅ Limpio datos cuando cierras la sesión
• ✅ Encripto comunicación API (HTTPS)

**Tu Control:**
• 📱 Todos los datos están en tu navegador (sessionStorage)
• 🗑️ Los datos se borran al cerrar la pestaña
• 🔐 No requiere cuenta, no contraseñas
• 📧 Emails usados solo para enviar itinerarios
• 🌍 Ubicación usada solo para encontrar lugares cercanos

**Sobre Datos de Yelp:**
Cuando obtienes recomendaciones, consulto la API de Yelp con tu ubicación y preferencias. Yelp puede registrar estas búsquedas según su política de privacidad.

**¿Preguntas?** Revisa nuestro aviso de privacidad al final de la página o email a support@domoforge.com

¡Tu privacidad importa!`
  },
  general: {
    en: `I didn't quite understand that.

Try asking:
• "How to use this" - Step-by-step guide
• "What can you do" - All features  
• "Who are you" - Learn about me
• "Who created this" - Meet the developer
• "What is Yelp" - Data sources
• "Privacy" - Security & data info

Or start planning! Examples:
• "Plan a romantic dinner tonight"
• "Family outing this Saturday"
• "Coffee with friends tomorrow"

I'll guide you through the rest!`,
    es: `No entendí muy bien eso.

Intenta preguntar:
• "Cómo usar esto" - Guía paso a paso
• "Qué puedes hacer" - Todas las funciones
• "Quién eres" - Aprende sobre mí
• "Quién creó esto" - Conoce al desarrollador
• "Qué es Yelp" - Fuentes de datos
• "Privacidad" - Info de seguridad y datos

¡O empieza a planear! Ejemplos:
• "Planea una cena romántica esta noche"
• "Salida familiar este sábado"
• "Café con amigos mañana"

¡Te guiaré en el resto!`
  }
};

/**
 * Fix common typos in user input
 */
function fixCommonTypos(message: string): string {
  const typoMap: { [key: string]: string } = {
    // Spanish typos
    'k': 'que',
    'q': 'que',
    'xq': 'porque',
    'pq': 'porque',
    'tmb': 'tambien',
    'tb': 'tambien',
    'hola': 'hola',
    'komo': 'como',
    'kien': 'quien',
    'eres': 'eres',
    'haces': 'haces',
    'acer': 'hacer',
    'aser': 'hacer',
    'haora': 'ahora',
    'ahora': 'ahora',
    
    // English typos
    'u': 'you',
    'r': 'are',
    'ur': 'your',
    'plz': 'please',
    'thx': 'thanks',
    'wat': 'what',
    'wut': 'what',
    'wht': 'what',
    'hw': 'how',
    'hlp': 'help',
    'pls': 'please',
  };
  
  let fixed = message.toLowerCase();
  
  // Replace whole word typos
  Object.entries(typoMap).forEach(([typo, correct]) => {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    fixed = fixed.replace(regex, correct);
  });
  
  return fixed;
}

/**
 * Detect if user is asking for help or meta information
 */
export function detectHelpQuery(message: string, language: Language = 'en'): HelpResponse {
  // Fix common typos first
  const fixedMessage = fixCommonTypos(message);
  const lowerMessage = fixedMessage.toLowerCase();
  
  // Check each category
  for (const [category, keywords] of Object.entries(helpKeywords)) {
    const categoryKeywords = keywords[language];
    const hasMatch = categoryKeywords.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
    
    if (hasMatch) {
      return {
        detected: true,
        response: responses[category as keyof typeof responses][language],
        type: category as any
      };
    }
  }
  
  // Check if it's a meta question but we didn't match specifics
  // Return "I didn't understand" with suggestions
  if (isMetaQuestion(fixedMessage)) {
    return {
      detected: true,
      response: responses.general[language],
      type: 'general'
    };
  }
  
  return {
    detected: false,
    response: ''
  };
}

/**
 * Check if message is a meta question (not planning related)
 */
export function isMetaQuestion(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  const metaPatterns = [
    /^(what|how|who|tell|explain|describe)/i,
    /\b(help|ayuda|about|sobre|creator|creador|yelp|you|eres|haces)\b/i,
    /\?(what|how|who|qué|cómo|quién|que|como|quien)/i,
    /^(quien|quién|who|what|qué|que|como|cómo|how)/i,
  ];
  
  return metaPatterns.some(pattern => pattern.test(lowerMessage));
}
