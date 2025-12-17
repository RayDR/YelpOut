"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store/appStore";
import { PlanBlock } from "@/modules/planning/types";

interface SendItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: PlanBlock[];
  planContext?: {
    eventType?: string;
    location?: string;
    date?: string;
    groupSize?: string;
  };
  onSentSuccess?: () => void;
}

export default function SendItineraryModal({ 
  isOpen, 
  onClose, 
  blocks, 
  planContext,
  onSentSuccess 
}: SendItineraryModalProps) {
  const { language } = useAppStore();
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        title: 'Send Itinerary',
        emailLabel: 'Email Address',
        emailPlaceholder: 'your@email.com',
        preview: 'Preview:',
        cancel: 'Cancel',
        send: 'Send',
        sending: 'Sending...',
        success: 'Email Sent Successfully!',
        checkInbox: 'Check your inbox',
        errorEmail: 'Please enter a valid email',
        errorSend: 'Error sending email'
      },
      es: {
        title: 'Enviar Itinerario',
        emailLabel: 'Correo Electrónico',
        emailPlaceholder: 'tu@correo.com',
        preview: 'Vista previa:',
        cancel: 'Cancelar',
        send: 'Enviar',
        sending: 'Enviando...',
        success: '¡Correo Enviado!',
        checkInbox: 'Revisa tu bandeja de entrada',
        errorEmail: 'Por favor ingresa un correo válido',
        errorSend: 'Error al enviar correo'
      }
    };
    return translations[language]?.[key] || key;
  };

  const handleSend = async () => {
    if (!email) {
      setError(t('errorEmail'));
      return;
    }

    setIsSending(true);
    setError(null);
    
    try {
      const response = await fetch('/api/send-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          planDate: planContext?.date,
          eventType: planContext?.eventType,
          location: planContext?.location,
          groupSize: planContext?.groupSize,
          blocks: blocks,
          language: language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || t('errorSend'));
      }

      setSent(true);
      
      // Don't clear session - let user keep the plan
      // Just notify success and close after delay
      setTimeout(() => {
        onClose();
        setSent(false);
        setEmail("");
        if (onSentSuccess) {
          onSentSuccess();
        }
      }, 2500);
      
    } catch (err) {
      console.error('Send error:', err);
      setError(err instanceof Error ? err.message : t('errorSend'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {t('title')}
        </h2>

        {!sent ? (
          <>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('emailLabel')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder={t('emailPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                disabled={isSending}
              />
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-5 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">{t('preview')}</p>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
                {blocks
                  .filter(block => block.selected && !block.skipped)
                  .map(block => {
                    const place = block.options.find(p => p.id === block.selected);
                    if (!place) return null;
                    return (
                      <div key={block.id} className="pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{block.label}</div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">{block.startTime} - {block.endTime}</div>
                        <div className="text-gray-700 dark:text-gray-300 mt-1">{place.name}</div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isSending}
                className="flex-1 px-5 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSend}
                disabled={isSending || !email}
                className="flex-1 px-5 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? t('sending') : t('send')}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="text-6xl mb-4 text-green-500">✓</div>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t('success')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('checkInbox')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
