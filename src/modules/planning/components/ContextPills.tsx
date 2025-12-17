"use client";

import { PlanContext } from "@/modules/planning/types";

interface ContextPillsProps {
  context: PlanContext;
}

export default function ContextPills({ context }: ContextPillsProps) {
  const pills: Array<{ label: string; value: string; icon: string }> = [];

  // Location
  if (context.location?.text) {
    pills.push({
      label: "Ubicación",
      value: context.location.text,
      icon: "📍",
    });
  }

  // Date and time
  if (context.event?.dateISO) {
    const fecha = new Date(context.event.dateISO);
    const fechaStr = fecha.toLocaleDateString("es-MX", {
      month: "short",
      day: "numeric",
    });
    pills.push({
      label: "Fecha",
      value: fechaStr,
      icon: "📅",
    });
  }

  if (context.event?.startTime && context.event?.endTime) {
    pills.push({
      label: "Horario",
      value: `${context.event.startTime} - ${context.event.endTime}`,
      icon: "🕐",
    });
  }

  // Group
  if (context.participants?.size) {
    let grupoText = `${context.participants.size} persona${
      context.participants.size > 1 ? "s" : ""
    }`;
    
    if (context.participants.isCouple) {
      grupoText = "Pareja";
    } else if (context.participants.kids && context.participants.kids > 0) {
      grupoText += " (con niños)";
    }

    pills.push({
      label: "Grupo",
      value: grupoText,
      icon: "👥",
    });
  }

  // Budget
  if (context.budget?.tier) {
    pills.push({
      label: "Presupuesto",
      value: context.budget.tier,
      icon: "💰",
    });
  }

  // Food preferences
  if (context.preferences?.cuisine && context.preferences.cuisine.length > 0) {
    pills.push({
      label: "Cocina",
      value: context.preferences.cuisine.slice(0, 2).join(", "),
      icon: "🍽️",
    });
  }

  // Mood
  if (context.preferences?.mood && context.preferences.mood.length > 0) {
    pills.push({
      label: "Ambiente",
      value: context.preferences.mood.slice(0, 2).join(", "),
      icon: "✨",
    });
  }

  if (pills.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary-50 to-pink-50 border-b border-gray-200 p-4">
      <div className="flex flex-wrap gap-2">
        {pills.map((pill, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm shadow-sm"
          >
            <span>{pill.icon}</span>
            <span className="font-medium text-gray-700">{pill.label}:</span>
            <span className="text-gray-600">{pill.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
