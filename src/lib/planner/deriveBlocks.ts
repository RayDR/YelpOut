import { PlanContext, PlanBlock, BlockType } from "@/modules/planning/types";

/**
 * Derive plan blocks based on time window, event type, and participants
 * Creates a structured itinerary with activities, meals, and other blocks
 */
export function deriveBlocks(context: PlanContext): PlanBlock[] {
  if (!context.event?.startTime || !context.event?.endTime) {
    return [];
  }

  const start = parseTime(context.event.startTime);
  const end = parseTime(context.event.endTime);
  const totalDuration = end - start; // in minutes

  const blocks: PlanBlock[] = [];

  // Determine block structure based on total duration
  if (totalDuration >= 480) {
    // 8+ hours (all day): breakfast → activity → lunch → activity → dinner
    blocks.push(
      createBlock("restaurant", "Breakfast", context.event.startTime, 60),
      createBlock("activity", "Morning Activity", addMinutes(context.event.startTime, 60), 120),
      createBlock("restaurant", "Lunch", addMinutes(context.event.startTime, 180), 90),
      createBlock("activity", "Afternoon Activity", addMinutes(context.event.startTime, 270), 120),
      createBlock("restaurant", "Dinner", addMinutes(context.event.startTime, 390), 90)
    );
  } else if (totalDuration >= 240) {
    // 4-8 hours: activity → meal → activity → dessert
    blocks.push(
      createBlock("activity", "Activity", context.event.startTime, totalDuration * 0.3),
      createBlock("restaurant", "Main Meal", addMinutes(context.event.startTime, totalDuration * 0.3), totalDuration * 0.35),
      createBlock("activity", "Activity", addMinutes(context.event.startTime, totalDuration * 0.65), totalDuration * 0.25),
      createBlock("dessert", "Dessert/Drinks", addMinutes(context.event.startTime, totalDuration * 0.9), totalDuration * 0.1)
    );
  } else if (totalDuration >= 180) {
    // 3-4 hours: activity → meal → dessert/after
    blocks.push(
      createBlock("activity", "Activity", context.event.startTime, totalDuration * 0.35),
      createBlock("restaurant", "Dinner/Lunch", addMinutes(context.event.startTime, totalDuration * 0.35), totalDuration * 0.45),
      createBlock("dessert", "Dessert/Drinks", addMinutes(context.event.startTime, totalDuration * 0.8), totalDuration * 0.2)
    );
  } else if (totalDuration >= 120) {
    // 2-3 hours: meal → dessert
    blocks.push(
      createBlock("restaurant", "Meal", context.event.startTime, totalDuration * 0.7),
      createBlock("dessert", "Coffee/Dessert", addMinutes(context.event.startTime, totalDuration * 0.7), totalDuration * 0.3)
    );
  } else {
    // < 2 hours: meal or activity only
    const type = isMealTime(start) ? "restaurant" : "activity";
    const label = type === "restaurant" ? "Meal" : "Activity";
    blocks.push(createBlock(type, label, context.event.startTime, totalDuration));
  }

  // Adjust based on group composition
  if (context.participants?.kids && context.participants.kids > 0) {
    // Prioritize family-friendly activities
    blocks.forEach((block) => {
      if (block.type === "activity") {
        block.label = "Family Activity";
      }
    });
  }

  if (context.participants?.isCouple) {
    // Romantic mood
    blocks.forEach((block) => {
      if (block.type === "restaurant") {
        block.label = "Romantic Dinner";
      }
    });
  }

  return blocks;
}

function createBlock(
  type: BlockType,
  label: string,
  startTime: string,
  durationMinutes: number
): PlanBlock {
  return {
    id: `${type}-${startTime}`,
    type,
    label,
    startTime,
    endTime: addMinutes(startTime, durationMinutes),
    durationMinutes: Math.round(durationMinutes),
    options: [],
  };
}

function parseTime(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function addMinutes(time: string, minutes: number): string {
  const totalMinutes = parseTime(time) + minutes;
  const hour = Math.floor(totalMinutes / 60) % 24;
  const minute = Math.round(totalMinutes % 60);
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

function isMealTime(minutesFromMidnight: number): boolean {
  // Breakfast: 7-11, Lunch: 11-15, Dinner: 18-22
  return (
    (minutesFromMidnight >= 7 * 60 && minutesFromMidnight <= 11 * 60) ||
    (minutesFromMidnight >= 11 * 60 && minutesFromMidnight <= 15 * 60) ||
    (minutesFromMidnight >= 18 * 60 && minutesFromMidnight <= 22 * 60)
  );
}
