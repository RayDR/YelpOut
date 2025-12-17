"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlanBlock } from "@/modules/planning/types";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useAppStore } from "@/lib/store/appStore";
import { useToast } from "@/shared";
import PlanCard from "./PlanCard";
import SendItineraryModal from "./SendItineraryModal";
import { recalculateTimes, shouldRemoveBlock, checkClosingTime, parseTimeToMinutes } from "@/lib/planner/timeUtils";
import { FiMenu, FiAlertTriangle } from "react-icons/fi";

// Helper function to convert 24-hour time to 12-hour AM/PM format
function formatTime12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

interface ItineraryViewProps {
  blocks: PlanBlock[];
  onSwap: (blockId: string, currentIndex: number) => void;
  onSelect: (blockId: string, placeId: string) => void;
  onRefine: () => void;
  onReorder?: (newBlocks: PlanBlock[]) => void;
  onUndoSwap?: () => void;
  onResetAlternatives?: (blockId: string) => void;
  lastSwap?: { blockId: string; index: number; previousOption: any } | null;
  viewingAlternatives?: Record<string, boolean>;
  onViewAlternatives?: (blockId: string) => void;
  onItinerarySent?: () => void;
  onSkip?: (blockId: string) => void;
  planContext?: {
    eventType?: string;
    location?: string;
    date?: string;
    groupSize?: string;
    startTime?: string;
  };
}

interface SortableBlockProps {
  block: PlanBlock;
  blockIndex: number;
  totalBlocks: number;
  viewingAlternatives: Record<string, boolean>;
  onSwap: (blockId: string, currentIndex: number) => void;
  onSelect: (blockId: string, placeId: string) => void;
  onViewAlternatives?: (blockId: string) => void;
  onSkip?: (blockId: string) => void;
  onRefine: () => void;
  onResetAlternatives?: (blockId: string) => void;
  onMoveUp?: (blockId: string) => void;
  onMoveDown?: (blockId: string) => void;
  language: string;
  t: any;
}

function SortableBlock({
  block,
  blockIndex,
  totalBlocks,
  viewingAlternatives,
  onSwap,
  onSelect,
  onViewAlternatives,
  onSkip,
  onRefine,
  onResetAlternatives,
  onMoveUp,
  onMoveDown,
  language,
  t
}: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Check if selected place is closing soon
  let closingWarning: string | null = null;
  if (block.selected && block.options) {
    const selectedPlace = block.options.find(opt => opt.id === block.selected);
    if (selectedPlace) {
      const blockStartMinutes = parseTimeToMinutes(block.startTime);
      const { closingSoon, minutesUntilClose } = checkClosingTime(selectedPlace, blockStartMinutes);
      if (closingSoon) {
        closingWarning = language === 'en' 
          ? `⚠️ Closes in ${minutesUntilClose} minutes`
          : `⚠️ Cierra en ${minutesUntilClose} minutos`;
      }
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-l-4 border-primary-500 dark:border-primary-400 pl-4 mb-6"
    >
      <div className="mb-3 flex justify-between items-start gap-3">
        <div className="flex items-center gap-2 flex-1">
          {/* Mobile: Arrow buttons for reordering */}
          <div className="flex md:hidden flex-col gap-1">
            <button
              onClick={() => onMoveUp?.(block.id)}
              disabled={blockIndex === 0}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={() => onMoveDown?.(block.id)}
              disabled={blockIndex === totalBlocks - 1}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {/* Desktop: Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="hidden md:block cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <FiMenu className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{block.label}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatTime12Hour(block.startTime)} - {formatTime12Hour(block.endTime)} ({block.durationMinutes} min)
            </p>
            {closingWarning && (
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1 mt-1">
                <FiAlertTriangle className="w-4 h-4" />
                {closingWarning}
              </p>
            )}
          </div>
        </div>
        {/* Skip button */}
        {!block.selected && onSkip && (
          <button
            onClick={() => onSkip(block.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
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
            // Show only selected option
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
                      if (place.phone) {
                        window.open(`tel:${place.phone}`);
                      } else if (place.url) {
                        window.open(place.url, '_blank');
                      } else {
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
                  {t('plan.viewAlternatives')}
                </button>
              )}
            </>
          ) : (
            // Show options for selection
            <>
              {viewingAlternatives[block.id] ? (
                // All alternatives
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
                // First 3 options
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
                  {onResetAlternatives && (
                    <button
                      onClick={() => onResetAlternatives(block.id)}
                      className="w-full py-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {language === 'en' ? 'Reset Alternatives' : 'Resetear Alternativas'}
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ItineraryView({ 
  blocks, 
  onSwap, 
  onSelect, 
  onRefine,
  onReorder,
  onUndoSwap,
  onResetAlternatives,
  lastSwap,
  viewingAlternatives = {},
  onViewAlternatives,
  onItinerarySent,
  onSkip,
  planContext
}: ItineraryViewProps) {
  const [showSendModal, setShowSendModal] = useState(false);
  const [localBlocks, setLocalBlocks] = useState(blocks);
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const { showToast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync with parent blocks
  if (blocks !== localBlocks) {
    setLocalBlocks(blocks);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localBlocks.findIndex(block => block.id === active.id);
      const newIndex = localBlocks.findIndex(block => block.id === over.id);

      let reorderedBlocks = arrayMove(localBlocks, oldIndex, newIndex);

      // Recalculate times
      const startTime = planContext?.startTime || reorderedBlocks[0]?.startTime || '12:00 PM';
      reorderedBlocks = recalculateTimes(reorderedBlocks, startTime);

      // Check and remove blocks that exceed closing time
      const validBlocks: PlanBlock[] = [];
      const removedBlocks: PlanBlock[] = [];

      reorderedBlocks.forEach(block => {
        if (shouldRemoveBlock(block)) {
          removedBlocks.push(block);
        } else {
          validBlocks.push(block);
        }
      });

      if (removedBlocks.length > 0) {
        const removedNames = removedBlocks.map(b => b.label).join(', ');
        showToast(
          language === 'en'
            ? `Removed ${removedNames} - would exceed closing time`
            : `Eliminado ${removedNames} - excedería horario de cierre`,
          'warning'
        );
      }

      setLocalBlocks(validBlocks);
      if (onReorder) {
        onReorder(validBlocks);
      }
    }
  };

  const handleSwapWithToast = async (blockId: string, currentIndex: number) => {
    try {
      await onSwap(blockId, currentIndex);
    } catch (error) {
      showToast(
        language === 'en'
          ? 'Failed to load alternatives. Please try again.'
          : 'No se pudieron cargar alternativas. Intenta de nuevo.',
        'error'
      );
    }
  };

  // Handle moving block up (mobile)
  const handleMoveUp = (blockId: string) => {
    const currentIndex = localBlocks.findIndex(block => block.id === blockId);
    if (currentIndex > 0) {
      let reorderedBlocks = arrayMove(localBlocks, currentIndex, currentIndex - 1);
      
      // Recalculate times
      const startTime = planContext?.startTime || reorderedBlocks[0]?.startTime || '12:00 PM';
      reorderedBlocks = recalculateTimes(reorderedBlocks, startTime);

      // Check and remove blocks that exceed closing time
      const validBlocks: PlanBlock[] = [];
      const removedBlocks: PlanBlock[] = [];

      reorderedBlocks.forEach(block => {
        if (shouldRemoveBlock(block)) {
          removedBlocks.push(block);
        } else {
          validBlocks.push(block);
        }
      });

      if (removedBlocks.length > 0) {
        const removedNames = removedBlocks.map(b => b.label).join(', ');
        showToast(
          language === 'en'
            ? `Removed ${removedNames} - would exceed closing time`
            : `Eliminado ${removedNames} - excedería horario de cierre`,
          'warning'
        );
      }

      setLocalBlocks(validBlocks);
      if (onReorder) {
        onReorder(validBlocks);
      }
    }
  };

  // Handle moving block down (mobile)
  const handleMoveDown = (blockId: string) => {
    const currentIndex = localBlocks.findIndex(block => block.id === blockId);
    if (currentIndex < localBlocks.length - 1) {
      let reorderedBlocks = arrayMove(localBlocks, currentIndex, currentIndex + 1);
      
      // Recalculate times
      const startTime = planContext?.startTime || reorderedBlocks[0]?.startTime || '12:00 PM';
      reorderedBlocks = recalculateTimes(reorderedBlocks, startTime);

      // Check and remove blocks that exceed closing time
      const validBlocks: PlanBlock[] = [];
      const removedBlocks: PlanBlock[] = [];

      reorderedBlocks.forEach(block => {
        if (shouldRemoveBlock(block)) {
          removedBlocks.push(block);
        } else {
          validBlocks.push(block);
        }
      });

      if (removedBlocks.length > 0) {
        const removedNames = removedBlocks.map(b => b.label).join(', ');
        showToast(
          language === 'en'
            ? `Removed ${removedNames} - would exceed closing time`
            : `Eliminado ${removedNames} - excedería horario de cierre`,
          'warning'
        );
      }

      setLocalBlocks(validBlocks);
      if (onReorder) {
        onReorder(validBlocks);
      }
    }
  };

  // Check if all blocks have a selection or are skipped
  const allBlocksHandled = localBlocks.every(block => block.selected || block.skipped);

  // Category validation
  const validateCategories = () => {
    const meals = localBlocks.filter(b => ['restaurant', 'romanticDinner', 'lunch', 'dinner'].includes(b.type));
    const desserts = localBlocks.filter(b => ['dessert', 'coffee'].includes(b.type));
    const activities = localBlocks.filter(b => ['activity', 'familyActivity', 'after'].includes(b.type));

    const isCategoryValid = (categoryBlocks: typeof localBlocks) => {
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

  if (localBlocks.length === 0) {
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

      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
        <FiMenu className="w-4 h-4 hidden md:inline" />
        <svg className="w-4 h-4 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
        <span className="hidden md:inline">{language === 'en' ? 'Drag to reorder activities' : 'Arrastra para reorganizar actividades'}</span>
        <span className="md:hidden">{language === 'en' ? 'Use arrows to reorder activities' : 'Usa las flechas para reorganizar actividades'}</span>
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localBlocks.map(b => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {localBlocks.map((block, blockIndex) => (
            <SortableBlock
              key={block.id}
              block={block}
              blockIndex={blockIndex}
              totalBlocks={localBlocks.length}
              viewingAlternatives={viewingAlternatives}
              onSwap={handleSwapWithToast}
              onSelect={onSelect}
              onViewAlternatives={onViewAlternatives}
              onSkip={onSkip}
              onRefine={onRefine}
              onResetAlternatives={onResetAlternatives}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              language={language}
              t={t}
            />
          ))}
        </SortableContext>
      </DndContext>

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
        blocks={localBlocks}
        planContext={planContext}
        onSentSuccess={() => {
          if (onItinerarySent) {
            onItinerarySent();
          }
        }}
      />
      
      {/* Undo Swap Button - Floating */}
      {lastSwap && onUndoSwap && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 right-6 z-50"
        >
          <button
            onClick={onUndoSwap}
            className="flex items-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            {language === 'en' ? 'Undo Change' : 'Deshacer Cambio'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
