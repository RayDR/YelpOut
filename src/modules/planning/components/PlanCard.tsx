"use client";

import { useState } from "react";
import { Place } from "@/modules/planning/types";
import { motion, AnimatePresence } from "framer-motion";
import { FiGlobe, FiMapPin, FiCheck, FiRefreshCw } from "react-icons/fi";

interface PlanCardProps {
  place: Place;
  blockLabel: string;
  onSwap?: () => void;
  onSelect?: () => void;
  onReserve?: () => void;
  isSwapping?: boolean;
  isSelected?: boolean;
}

export default function PlanCard({ 
  place, 
  blockLabel, 
  onSwap, 
  onSelect, 
  onReserve,
  isSwapping = false,
  isSelected = false 
}: PlanCardProps) {
  const [showReviews, setShowReviews] = useState(false);
  const [reviewsStayOpen, setReviewsStayOpen] = useState(false);
  const yelpUrl = `https://www.yelp.com/biz/${place.id}`;
  const mapUrl = place.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}` : null;
  
  const handleMouseEnterReviews = () => {
    setShowReviews(true);
  };
  
  const handleMouseLeaveReviews = () => {
    if (!reviewsStayOpen) {
      setShowReviews(false);
    }
  };
  
  const handleMouseEnterTooltip = () => {
    setReviewsStayOpen(true);
  };
  
  const handleMouseLeaveTooltip = () => {
    setReviewsStayOpen(false);
    setShowReviews(false);
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{place.name}</h4>
            
            {/* Website Link */}
            {place.url && (
              <a
                href={place.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                title="Visit website"
              >
                <FiGlobe className="w-4 h-4" />
              </a>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            {place.rating && (
              <div 
                className="relative"
                onMouseEnter={handleMouseEnterReviews}
                onMouseLeave={handleMouseLeaveReviews}
              >
                <span className="text-yellow-500 dark:text-yellow-400 font-medium cursor-help">
                  ★ {place.rating}
                </span>
                
                {/* Reviews Tooltip */}
                <AnimatePresence>
                  {showReviews && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onMouseEnter={handleMouseEnterTooltip}
                      onMouseLeave={handleMouseLeaveTooltip}
                      className="absolute z-50 bottom-full left-0 mb-2 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-xl min-w-[200px] max-w-[300px]"
                    >
                      <div className="font-semibold mb-1">{place.reviewCount || 0} reviews</div>
                      <a 
                        href={yelpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 hover:text-blue-200 underline"
                      >
                        Ver en Yelp →
                      </a>
                      <div className="absolute -bottom-1 left-3 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            {place.price && <span className="text-gray-600 dark:text-gray-400">{place.price}</span>}
          </div>
        </div>
        
        {/* Image - Click to open Yelp */}
        {place.photos && place.photos.length > 0 && (
          <a
            href={yelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={place.photos[0]}
              alt={place.name}
              className="w-20 h-20 object-cover rounded-lg ml-3 hover:opacity-80 transition-opacity cursor-pointer"
              title="Ver en Yelp"
            />
          </a>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex flex-wrap gap-1">
          {place.categories.map((cat, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Address - Click to open Maps */}
        {place.address && (
          <a
            href={mapUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
          >
            <FiMapPin className="w-3.5 h-3.5" />
            <span>{place.address}</span>
          </a>
        )}

        {place.distanceMeters && (
          <p className="text-gray-500 dark:text-gray-400">
            {(place.distanceMeters / 1000).toFixed(1)} km away
          </p>
        )}

        {place.why && (
          <p className="text-primary-600 dark:text-primary-400 italic mt-2">
            💡 {place.why}
          </p>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        {/* Change Button with animation */}
        {onSwap && !isSelected && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSwap}
            disabled={isSwapping}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <motion.div
              animate={isSwapping ? { rotate: 360 } : { rotate: 0 }}
              transition={isSwapping ? { duration: 0.8, repeat: Infinity, ease: "linear" } : {}}
            >
              <FiRefreshCw className="w-4 h-4" />
            </motion.div>
            <span>Change</span>
          </motion.button>
        )}
        
        {/* Select Button with checkmark animation */}
        {onSelect && !isSelected && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelect}
            className="flex-1 px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <span>Select</span>
          </motion.button>
        )}
        
        {/* Selected State */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
            >
              <FiCheck className="w-5 h-5" />
            </motion.div>
            <span>Selected</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
