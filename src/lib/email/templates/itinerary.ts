import { PlanBlock } from "@/modules/planning/types";
import { translations, Language } from "@/lib/i18n/translations";

interface ItineraryEmailData {
  recipientEmail: string;
  planDate: string;
  eventType?: string;
  location?: string;
  groupSize?: string;
  blocks: PlanBlock[];
  language?: Language;
}

export function generateItineraryHTML(data: ItineraryEmailData): string {
  const { recipientEmail, planDate, eventType, location, groupSize, blocks, language = 'en' } = data;
  const t = translations[language];
  
  // Filter out skipped blocks
  const selectedBlocks = blocks.filter(block => block.selected && !block.skipped);
  
  // Get selected place for each block
  const blockDetails = selectedBlocks.map(block => {
    const selectedPlace = block.options.find(place => place.id === block.selected);
    return { block, place: selectedPlace };
  }).filter(item => item.place); // Only include blocks with a selected place

  const currentDate = new Date().toLocaleString(language === 'es' ? 'es-ES' : 'en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.email.title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9fafb;
      color: #1f2937;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 32px;
      font-weight: 700;
    }
    .header p {
      margin: 10px 0 0 0;
      color: #fee2e2;
      font-size: 16px;
    }
    .content {
      padding: 40px 20px;
    }
    .summary {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 20px;
      margin-bottom: 30px;
      border-radius: 8px;
    }
    .summary h2 {
      margin: 0 0 15px 0;
      color: #991b1b;
      font-size: 20px;
    }
    .summary-item {
      margin: 8px 0;
      color: #7f1d1d;
      font-size: 14px;
    }
    .summary-item strong {
      color: #991b1b;
    }
    .block {
      margin-bottom: 30px;
      border: 2px solid #fee2e2;
      border-radius: 12px;
      overflow: hidden;
    }
    .block-header {
      background-color: #fef2f2;
      padding: 15px 20px;
      border-bottom: 2px solid #fee2e2;
    }
    .block-title {
      margin: 0;
      color: #991b1b;
      font-size: 18px;
      font-weight: 600;
    }
    .block-time {
      margin: 5px 0 0 0;
      color: #dc2626;
      font-size: 14px;
    }
    .block-content {
      padding: 20px;
    }
    .place-name {
      margin: 0 0 10px 0;
      color: #1f2937;
      font-size: 22px;
      font-weight: 700;
    }
    .place-rating {
      display: inline-block;
      margin-right: 15px;
      color: #f59e0b;
      font-size: 16px;
      font-weight: 600;
    }
    .place-price {
      display: inline-block;
      color: #6b7280;
      font-size: 16px;
    }
    .place-categories {
      margin: 15px 0;
    }
    .category-tag {
      display: inline-block;
      background-color: #f3f4f6;
      color: #4b5563;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      margin: 4px 4px 4px 0;
    }
    .place-address {
      margin: 15px 0;
      color: #4b5563;
      font-size: 14px;
      line-height: 1.5;
    }
    .place-why {
      background-color: #fef3c7;
      border-left: 3px solid #f59e0b;
      padding: 12px 15px;
      margin: 15px 0;
      border-radius: 6px;
      color: #78350f;
      font-size: 14px;
      font-style: italic;
    }
    .buttons {
      margin-top: 20px;
      display: table;
      width: 100%;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      margin: 5px 10px 5px 0;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      text-align: center;
    }
    .button-yelp {
      background-color: #ef4444;
      color: #ffffff;
    }
    .button-map {
      background-color: #ffffff;
      color: #ef4444;
      border: 2px solid #ef4444;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px 20px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
      color: #6b7280;
      font-size: 13px;
    }
    .footer-logo {
      margin: 15px 0;
      color: #ef4444;
      font-size: 24px;
      font-weight: 700;
    }
    @media only screen and (max-width: 600px) {
      .header h1 { font-size: 24px; }
      .place-name { font-size: 18px; }
      .button { display: block; width: 100%; margin: 5px 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>${t.email.title}</h1>
      <p>${t.email.subtitle}</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Summary -->
      <div class="summary">
        <h2>📋 ${t.email.summary}</h2>
        ${eventType ? `<div class="summary-item"><strong>${t.email.event}:</strong> ${eventType}</div>` : ''}
        ${location ? `<div class="summary-item"><strong>${t.email.location}:</strong> ${location}</div>` : ''}
        ${planDate ? `<div class="summary-item"><strong>${t.email.date}:</strong> ${planDate}</div>` : ''}
        ${groupSize ? `<div class="summary-item"><strong>${t.email.group}:</strong> ${groupSize}</div>` : ''}
        <div class="summary-item"><strong>${t.email.generated}:</strong> ${currentDate}</div>
        <div class="summary-item"><strong>${t.email.totalStops}:</strong> ${blockDetails.length}</div>
      </div>

      <!-- Blocks -->
      ${blockDetails.map(({ block, place }) => {
        if (!place) return '';
        
        const yelpUrl = `https://www.yelp.com/biz/${place.id}`;
        const mapUrl = place.address 
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;

        return `
      <div class="block">
        <div class="block-header">
          <h3 class="block-title">${block.label}</h3>
          <p class="block-time">⏰ ${block.startTime} - ${block.endTime} (${block.durationMinutes} min)</p>
        </div>
        <div class="block-content">
          <h2 class="place-name">${place.name}</h2>
          <div>
            ${place.rating ? `<span class="place-rating">⭐ ${place.rating}</span>` : ''}
            ${place.price ? `<span class="place-price">${place.price}</span>` : ''}
          </div>
          
          ${place.categories && place.categories.length > 0 ? `
          <div class="place-categories">
            ${place.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
          </div>
          ` : ''}
          
          ${place.address ? `
          <div class="place-address">
            📍 ${place.address}
            ${place.distanceMeters ? `<br><small>${(place.distanceMeters / 1000).toFixed(1)} km ${t.place.distance}</small>` : ''}
          </div>
          ` : ''}
          
          ${place.why ? `
          <div class="place-why">
            💡 ${place.why}
          </div>
          ` : ''}
          
          <div class="buttons">
            <a href="${yelpUrl}" class="button button-yelp" target="_blank">${t.email.viewOnYelp}</a>
            <a href="${mapUrl}" class="button button-map" target="_blank">${t.email.openInMap}</a>
          </div>
        </div>
      </div>
        `;
      }).join('')}

      <!-- Call to Action -->
      <div style="text-align: center; margin-top: 40px; padding: 20px; background-color: #fef2f2; border-radius: 12px;">
        <p style="margin: 0 0 15px 0; color: #991b1b; font-size: 16px; font-weight: 600;">
          ${t.email.readyForAdventure}
        </p>
        <p style="margin: 0; color: #7f1d1d; font-size: 14px;">
          ${t.email.makeReservations}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-logo">YelpOut</div>
      <p>${t.email.conversationalPlanner}</p>
      <p style="margin-top: 15px;">
        <a href="https://www.yelp.com" style="color: #ef4444; text-decoration: none;">${t.email.poweredBy}</a>
      </p>
      <p style="margin-top: 10px; font-size: 11px; color: #9ca3af;">
        ${t.email.autoGenerated}
      </p>
      <p style="margin-top: 5px; font-size: 11px; color: #9ca3af;">
        ${t.email.notAffiliated}
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateItineraryText(data: ItineraryEmailData): string {
  const { planDate, eventType, location, groupSize, blocks, language = 'en' } = data;
  const t = translations[language];
  
  const selectedBlocks = blocks.filter(block => block.selected && !block.skipped);
  const blockDetails = selectedBlocks.map(block => {
    const selectedPlace = block.options.find(place => place.id === block.selected);
    return { block, place: selectedPlace };
  }).filter(item => item.place);

  const currentDate = new Date().toLocaleString(language === 'es' ? 'es-ES' : 'en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let text = `🎉 ${t.email.title.toUpperCase()}\n\n`;
  text += `═══════════════════════════════════════\n\n`;
  text += `📋 ${t.email.summary.toUpperCase()}\n\n`;
  
  if (eventType) text += `${t.email.event}: ${eventType}\n`;
  if (location) text += `${t.email.location}: ${location}\n`;
  if (planDate) text += `${t.email.date}: ${planDate}\n`;
  if (groupSize) text += `${t.email.group}: ${groupSize}\n`;
  text += `${t.email.generated}: ${currentDate}\n`;
  text += `${t.email.totalStops}: ${blockDetails.length}\n\n`;
  text += `═══════════════════════════════════════\n\n`;

  blockDetails.forEach(({ block, place }, index) => {
    if (!place) return;
    
    text += `${index + 1}. ${block.label.toUpperCase()}\n`;
    text += `⏰ ${block.startTime} - ${block.endTime} (${block.durationMinutes} min)\n\n`;
    text += `${place.name}\n`;
    
    if (place.rating || place.price) {
      text += `${place.rating ? `⭐ ${place.rating}` : ''} ${place.price || ''}\n`;
    }
    
    if (place.categories && place.categories.length > 0) {
      text += `${t.email.categories}: ${place.categories.join(', ')}\n`;
    }
    
    if (place.address) {
      text += `📍 ${place.address}\n`;
      if (place.distanceMeters) {
        text += `   ${(place.distanceMeters / 1000).toFixed(1)} km ${t.place.distance}\n`;
      }
    }
    
    if (place.why) {
      text += `💡 ${place.why}\n`;
    }
    
    text += `\n🔗 ${t.email.viewOnYelp}: https://www.yelp.com/biz/${place.id}\n`;
    
    const mapUrl = place.address 
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
    text += `🗺️  ${t.email.openInMap}: ${mapUrl}\n\n`;
    text += `───────────────────────────────────────\n\n`;
  });

  text += `\n${t.email.makeReservations}\n\n`;
  text += `YelpOut - ${t.email.conversationalPlanner}\n`;
  text += `${t.email.poweredBy}\n`;

  return text;
}
