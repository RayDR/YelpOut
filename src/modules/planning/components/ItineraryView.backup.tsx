"use client";

import { useState } from "react";
import { PlanBlock } from "@/modules/planning/types";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useAppStore } from "@/lib/store/appStore";
import PlanCard from "./PlanCard";
import SendItineraryModal from "./SendItineraryModal";

interface ItineraryViewProps {
  blocks: PlanBlock[];
  onSwap: (blockId: string, currentIndex: number) => void;
  onSelect: (blockId: string, placeId: string) => void;
  onRefine: () => void;
  viewingAlternatives?: Record<string, boolean>;
  onViewAlternatives?: (blockId: string) => void;
  onItinerarySent?: () => void;
  onSkip?: (blockId: string) => void;
  planContext?: {
    eventType?: string;
    location?: string;
    date?: string;
    groupSize?: string;
  };
}

export default function ItineraryView({ 
  blocks, 
  onSwap, 
  onSelect, 
  onRefine,
  viewingAlternatives = {},
  onViewAlternatives,
  onItinerarySent,
  onSkip,
  planContext
}: ItineraryViewProps) {
  const [showSendModal, setShowSendModal] = useState(false);
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  
  // Check if all blocks have a selection or are skipped
  const allBlocksHandled = blocks.every(block => block.selected || block.skipped);
  
  // Category-based validation: check each category has at least one selected OR all are skipped
  const validateCategories = () => {
    const meals = blocks.filter(b => ['restaurant', 'romanticDinner', 'lunch', 'dinner'].includes(b.type));
    const desserts = blocks.filter(b => ['dessert', 'coffee'].includes(b.type));
    const activities = blocks.filter(b => ['activity', 'familyActivity', 'after'].includes(b.type));
    
    // A category is valid if: no blocks exist, OR at least one is selected, OR all are skipped
    const isCategoryValid = (categoryBlocks: typeof blocks) => {
      if (categoryBlocks.length === 0) return true;
      const allSkipped = categoryBlocks.every(b => b.skipped);
      const hasSelected = categoryBlocks.some(b => b.selected);
      return allSkipped || hasSelected;
    };
    
    return {
      hasMeal: isCategoryValid(meals),
      hasDessert: isCategoryValid(desserts),
      hasActivity: isCategoryValid(activities),
      missingCategories: [
        ...(!isCategoryValid(meals) ? ['meal'] : []),
        ...(!isCategoryValid(desserts) ? ['dessert'] : []),
        ...(!isCategoryValid(activities) ? ['activity'] : [])
      ]
    };
  };
  
  const categoryValidation = validateCategories();
  const allCategoriesValid = categoryValidation.hasMeal && categoryValidation.hasDessert && categoryValidation.hasActivity;
  
  if (blocks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">{t('plan.searching')}</p>
        <p className="text-sm mt-2">Complete the information to see your itinerary</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('plan.title')}</h2>
        <button
          onClick={onRefine}
          className="px-4 py-2 border-2 border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all font-medium"
        >
          {t('plan.refine')}
        </button>
      </div>

      {blocks.map((block, blockIndex) => (
        <div key={block.id} className="border-l-4 border-primary-500 dark:border-primary-400 pl-4">
          <div className="mb-3 flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{block.label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {block.startTime} - {block.endTime} ({block.durationMinutes} min)
              </p>
            </div>
            {/* Skip button in title area */}
            {!block.selected && onSkip && (
              <button
                onClick={() => onSkip(block.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  block.skipped
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {block.skipped ? `↶ ${t('plan.unskip')}` : t('plan.skip')}
              </button>
            )}
          </div>

          {/* Show skipped message instead of content */}
          {block.skipped ? (
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              <p className="text-gray-600 dark:text-gray-400 italic">
                ✓ {t('plan.skipped')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {block.isLoading ? (
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <p>{t('plan.searching')}</p>
                  </div>
                </div>
              ) : block.hasError || block.options.length === 0 ? (
                <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-orange-800 dark:text-orange-300 font-medium mb-2">
                    {t('plan.noResults') || 'No se encontraron opciones disponibles'}
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mb-4">
                    {t('plan.noResultsHint') || 'Intenta ajustar tus preferencias o ubicación'}
                  </p>
                  <button
                    onClick={onRefine}
                    className="px-4 py-2 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors font-medium"
                  >
                    {t('plan.adjustPreferences') || 'Ajustar preferencias'}
                  </button>
                </div>
              ) : block.selected && !viewingAlternatives[block.id] ? (
              // Show only selected option with ability to view alternatives
              <>
                {block.options
                  .filter((place) => place.id === block.selected)
                  .map((place) => (
                    <PlanCard
                      key={place.id}
                      place={place}
                      blockLabel={block.label}
                      onSwap={() => {
                        if (onViewAlternatives) {
                          onViewAlternatives(block.id);
                        }
                      }}
                      onReserve={() => {
                        // Priority: phone > url > Yelp page
                        if (place.phone) {
                          window.open(`tel:${place.phone}`);
                        } else if (place.url) {
                          window.open(place.url, '_blank');
                        } else {
                          // Fallback to Yelp page (construct from place.id which is Yelp ID)
                          window.open(`https://www.yelp.com/biz/${place.id}`, '_blank');
                        }
                      }}
                    />
                  ))}
                {onViewAlternatives && (
                  <button
                    onClick={() => onViewAlternatives(block.id)}
                    className="w-full py-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors"
                  >
                    View alternatives
                  </button>
                )}
              </>
            ) : (
              // Show all options for selection
              <>
                {viewingAlternatives[block.id] ? (
                  // Viewing all alternatives
                  <>
                    {block.options.map((place, placeIndex) => (
                      <PlanCard
                        key={place.id}
                        place={place}
                        blockLabel={block.label}
                        onSwap={() => onSwap(block.id, placeIndex)}
                        onSelect={() => {
                          onSelect(block.id, place.id);
                          if (onViewAlternatives) {
                            // Hide alternatives after selection
                            onViewAlternatives(block.id);
                          }
                        }}
                        isSwapping={(place as any).isSwapping || false}
                        isSelected={place.id === block.selected}
                      />
                    ))}
                    {onViewAlternatives && (
                      <button
                        onClick={() => onViewAlternatives(block.id)}
                        className="w-full py-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium transition-colors"
                      >
                        {t('plan.hideAlternatives')}
                      </button>
                    )}
                  </>
                ) : (
                  // Show only first 3 options initially
                  <>
                    {block.options.slice(0, 3).map((place, placeIndex) => (
                      <PlanCard
                        key={place.id}
                        place={place}
                        blockLabel={block.label}
                        onSwap={() => onSwap(block.id, placeIndex)}
                        onSelect={() => onSelect(block.id, place.id)}
                        isSwapping={(place as any).isSwapping || false}
                        isSelected={place.id === block.selected}
                      />
                    ))}
                    {block.options.length > 3 && onViewAlternatives && (
                      <button
                        onClick={() => onViewAlternatives(block.id)}
                        className="w-full py-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors"
                      >
                        {t('plan.viewAlternatives')}
                      </button>
                    )}
                  </>
                )}
              </>
            )}
            </div>
          )}
        </div>
      ))}

      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
        {!allBlocksHandled && (
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3">
            {t('plan.selectAllFirst')}
          </p>
        )}
        {allBlocksHandled && !allCategoriesValid && (
          <div className="text-center text-sm text-orange-600 dark:text-orange-400 mb-3 space-y-1">
            <p className="font-medium">{t('plan.missingCategories') || 'Please select at least one from each category:'}</p>
            {categoryValidation.missingCategories.map(cat => (
              <p key={cat} className="text-xs">
                • {t(`plan.missing.${cat}`) || `At least one ${cat}`}
              </p>
            ))}
          </div>
        )}
        <p className="text-primary-800 dark:text-primary-300 font-medium mb-3 text-center">
          {t('plan.ready')}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setShowSendModal(true)}
            disabled={!allBlocksHandled || !allCategoriesValid}
            className="px-8 py-4 bg-primary-600 dark:bg-primary-500 text-white rounded-xl hover:bg-primary-700 dark:hover:bg-primary-600 transition-all font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {t('plan.sendItinerary')}
          </button>
        </div>
      </div>

      <SendItineraryModal 
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        blocks={blocks}
        planContext={planContext}
        onSentSuccess={() => {
          if (onItinerarySent) {
            onItinerarySent();
          }
        }}
      />
    </div>
  );
}
