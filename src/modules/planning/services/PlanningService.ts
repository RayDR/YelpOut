/**
 * Planning Service
 * Business logic for plan generation
 * 
 * Note: For now this wraps the existing deriveBlocks function.
 * Future refactor will move all logic here.
 */

import { PlanContext, PlanBlock, BlockType } from '../types';
import { deriveBlocks } from '@/lib/planner/deriveBlocks';

export class PlanningService {
  /**
   * Derives plan blocks based on context
   * Currently delegates to existing deriveBlocks implementation
   */
  static deriveBlocks(context: PlanContext): PlanBlock[] {
    return deriveBlocks(context);
  }

  /**
   * Fetches recommendations for a block
   */
  static async fetchRecommendations(
    context: PlanContext,
    blockType: BlockType,
    language: 'en' | 'es' = 'en',
    limit: number = 3
  ) {
    try {
      const response = await fetch('/api/yelp/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, blockType, language, limit }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return { places: [] };
    }
  }
}
