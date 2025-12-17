/**
 * Constants
 * Application-wide constants
 */

export const ROUTES = {
  HOME: '/',
  API: {
    RECOMMENDATIONS: '/api/yelp/recommendations',
  },
} as const;

export const ANIMATION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;
