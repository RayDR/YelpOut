"use client";

import { useAppStore } from "@/lib/store/appStore";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function Footer() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {/* Credits */}
          <div className="text-center md:text-left">
            <p className="font-medium text-gray-700 dark:text-gray-300">
              YelpOut © {currentYear}
            </p>
            <p className="text-xs mt-1">
              {language === 'en' 
                ? 'Powered by Yelp Fusion API' 
                : 'Impulsado por Yelp Fusion API'}
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.yelp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              {language === 'en' ? 'Visit Yelp' : 'Visitar Yelp'}
            </a>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).showPrivacyNotice) {
                  (window as any).showPrivacyNotice();
                }
              }}
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {language === 'en' ? 'Privacy Notice' : 'Aviso de Privacidad'}
            </button>
          </div>

          {/* Made with */}
          <div className="text-center md:text-right text-xs">
            <p>
              {language === 'en' ? 'Made with' : 'Hecho con'}{' '}
              <span className="text-red-500">❤️</span>{' '}
              {language === 'en' ? 'by' : 'por'}{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                DomoForge
              </span>
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 text-xs text-center text-gray-500 dark:text-gray-500">
          {language === 'en' 
            ? 'YelpOut is not affiliated with Yelp Inc. All business information is provided by the Yelp Fusion API.' 
            : 'YelpOut no está afiliado con Yelp Inc. Toda la información de negocios es proporcionada por Yelp Fusion API.'}
        </div>
      </div>
    </footer>
  );
}
