"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiX } from "react-icons/fi";
import { useAppStore } from "@/lib/store/appStore";

interface FAQItem {
  question: string;
  answer: string;
  icon: string;
}

interface HelpFAQProps {
  onClose?: () => void;
}

export default function HelpFAQ({ onClose }: HelpFAQProps) {
  const { language } = useAppStore();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems: FAQItem[] = language === 'en' ? [
    {
      icon: "🚀",
      question: "How do I start?",
      answer: "Just tell me what you'd like to do! Use the quick-select cards or type naturally like 'Plan a romantic dinner tonight'. I'll guide you step by step."
    },
    {
      icon: "💬",
      question: "What questions will you ask?",
      answer: "I'll ask about event type, location, date & time, group size, budget, and preferences. You can skip optional questions anytime!"
    },
    {
      icon: "🔄",
      question: "Can I change my answers?",
      answer: "Absolutely! Use 'Go Back' or tell me: 'Change the time to 7pm'. Once you see your plan, click 'Refine' to adjust details."
    },
    {
      icon: "🔀",
      question: "What if I don't like a recommendation?",
      answer: "Each place has a 'Change' button. Click it to see alternatives until you find the perfect match!"
    },
    {
      icon: "📍",
      question: "How does location work?",
      answer: "Type a city name, say 'near me' (requires permission), or be specific like 'Downtown Manhattan'. I'll find the best places nearby."
    },
    {
      icon: "⏰",
      question: "Does timing matter?",
      answer: "Yes! I'm time-intelligent and adapt to morning/afternoon/evening/night. I also check business hours to avoid closed places."
    },
    {
      icon: "📧",
      question: "Can I save my plan?",
      answer: "Yes! Click 'Send Itinerary' to email yourself a formatted version with all details, links, and maps."
    },
    {
      icon: "🌐",
      question: "Can I switch languages?",
      answer: "Click the language toggle anytime to switch between English and Spanish. Your conversation stays intact!"
    }
  ] : [
    {
      icon: "🚀",
      question: "¿Cómo empiezo?",
      answer: "¡Solo dime qué quieres hacer! Usa las tarjetas o escribe naturalmente como 'Cena romántica esta noche'. Te guiaré paso a paso."
    },
    {
      icon: "💬",
      question: "¿Qué preguntas me harás?",
      answer: "Te preguntaré sobre tipo de evento, ubicación, fecha y hora, tamaño del grupo, presupuesto y preferencias. ¡Puedes saltar preguntas opcionales!"
    },
    {
      icon: "🔄",
      question: "¿Puedo cambiar mis respuestas?",
      answer: "¡Claro! Usa 'Volver' o dime: 'Cambia la hora a las 7pm'. Una vez que veas tu plan, haz clic en 'Refinar' para ajustar."
    },
    {
      icon: "🔀",
      question: "¿Qué pasa si no me gusta una recomendación?",
      answer: "Cada lugar tiene un botón 'Cambiar'. ¡Haz clic para ver alternativas hasta encontrar la perfecta!"
    },
    {
      icon: "📍",
      question: "¿Cómo funciona la ubicación?",
      answer: "Escribe una ciudad, di 'cerca de mí' (requiere permiso), o sé específico como 'Centro de Miami'. Encontraré los mejores lugares."
    },
    {
      icon: "⏰",
      question: "¿Importa el horario?",
      answer: "¡Sí! Soy inteligente con el tiempo y me adapto a mañana/tarde/noche. También verifico horarios para evitar lugares cerrados."
    },
    {
      icon: "📧",
      question: "¿Puedo guardar mi plan?",
      answer: "¡Sí! Haz clic en 'Enviar Itinerario' para recibir por correo una versión formateada con todos los detalles, links y mapas."
    },
    {
      icon: "🌐",
      question: "¿Puedo cambiar de idioma?",
      answer: "Haz clic en el botón de idioma en cualquier momento para cambiar entre inglés y español. ¡Tu conversación se mantiene!"
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {language === 'en' ? 'How it works' : 'Cómo funciona'}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>
      
      {faqItems.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <span className="flex items-center gap-2 text-left font-medium text-gray-900 dark:text-gray-100">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.question}</span>
            </span>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3 pt-0 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {item.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </motion.div>
  );
}
