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

// SVG Icons
const icons = {
  summary: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="5" width="18" height="2" rx="1" fill="white"/><rect x="3" y="11" width="18" height="2" rx="1" fill="white"/><rect x="3" y="17" width="18" height="2" rx="1" fill="white"/></svg>`,
  people: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="9" cy="7" r="4" fill="#dc2626"/><path d="M3 20c0-3.87 3.13-7 7-7h4c3.87 0 7 3.13 7 7" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/><circle cx="17" cy="7" r="3" fill="#dc2626"/></svg>`,
  location: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#dc2626"/><circle cx="12" cy="9" r="2.5" fill="white"/></svg>`,
  calendar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="15" rx="2" stroke="#dc2626" stroke-width="2" fill="none"/><path d="M3 10h18" stroke="#dc2626" stroke-width="2"/><path d="M8 4v4M16 4v4" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/></svg>`,
  clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#dc2626" stroke-width="2" fill="none"/><path d="M12 7v5l3 3" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/></svg>`,
  star: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f59e0b"/></svg>`,
  globe: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#6b7280" stroke-width="2" fill="none"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#6b7280" stroke-width="2"/></svg>`,
  mapPin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#6b7280" stroke-width="2" fill="none"/><circle cx="12" cy="10" r="3" stroke="#6b7280" stroke-width="2" fill="none"/></svg>`,
  phone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" fill="white"/></svg>`,
  directions: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="#10b981"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#10b981" stroke-width="2" fill="none"/></svg>`,
  info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#f59e0b" stroke-width="2" fill="none"/><path d="M12 16v-4M12 8h.01" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/></svg>`,
  stops: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="5" r="2" fill="#dc2626"/><circle cx="12" cy="12" r="2" fill="#dc2626"/><circle cx="12" cy="19" r="2" fill="#dc2626"/><path d="M12 7v3M12 14v3" stroke="#dc2626" stroke-width="2"/></svg>`,
  generated: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#dc2626" stroke-width="2" fill="none"/><path d="M12 6v6l4 2" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/></svg>`,
};

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
      background: #ffffff;
      border: 2px solid #ef4444;
      margin-bottom: 30px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    }
    .summary-header {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      padding: 12px 20px;
      text-align: center;
    }
    .summary-header h2 {
      margin: 0;
      color: #ffffff;
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .summary-grid {
      display: table;
      width: 100%;
      background-color: #ffffff;
    }
    .summary-row {
      display: table-row;
    }
    .summary-label {
      display: table-cell;
      color: #dc2626;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 12px 20px;
      border-bottom: 1px solid #fee2e2;
      width: 35%;
      vertical-align: middle;
    }
    .summary-label svg {
      display: inline-block;
      vertical-align: middle;
      margin-right: 6px;
    }
    .summary-value {
      display: table-cell;
      color: #1f2937;
      font-size: 14px;
      font-weight: 600;
      padding: 12px 20px;
      border-bottom: 1px solid #fee2e2;
      vertical-align: middle;
    }
    .block {
      margin-bottom: 30px;
      border: 2px solid #fee2e2;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
    .block-header {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      padding: 16px 24px;
      border-bottom: 2px solid #fee2e2;
    }
    .block-title-section {
      margin-bottom: 12px;
    }
    .block-sequence {
      color: #dc2626;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      margin: 0 0 4px 0;
      letter-spacing: 0.5px;
    }
    .block-title {
      margin: 0;
      color: #991b1b;
      font-size: 20px;
      font-weight: 700;
    }
    .block-time {
      background-color: white;
      border: 2px solid #fee2e2;
      border-radius: 8px;
      padding: 8px 12px;
      color: #dc2626;
      font-size: 13px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .block-time svg {
      flex-shrink: 0;
    }
    .block-content {
      padding: 24px;
    }
    .place-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .place-name {
      flex: 1;
      min-width: 200px;
      margin: 0;
      color: #1f2937;
      font-size: 22px;
      font-weight: 700;
      line-height: 1.3;
    }
    .place-rating {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background-color: #fef3c7;
      color: #78350f;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 700;
    }
    .place-rating svg {
      flex-shrink: 0;
    }
    .place-price {
      display: inline-flex;
      align-items: center;
      background-color: #f3f4f6;
      color: #4b5563;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
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
      margin: 16px 0;
      padding: 14px;
      background-color: #f9fafb;
      border-left: 3px solid #10b981;
      border-radius: 8px;
      color: #1f2937;
      font-size: 14px;
      line-height: 1.6;
    }
    .place-address-line {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 6px;
    }
    .place-address-line:last-child {
      margin-bottom: 0;
    }
    .place-address svg {
      flex-shrink: 0;
      margin-top: 2px;
    }
    .place-address strong {
      color: #059669;
      font-weight: 600;
    }
    .place-why {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-left: 4px solid #f59e0b;
      padding: 14px 16px;
      margin: 16px 0;
      border-radius: 8px;
      color: #78350f;
      font-size: 14px;
      line-height: 1.6;
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }
    .place-why svg {
      flex-shrink: 0;
      margin-top: 2px;
    }
    .action-section {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #f3f4f6;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .button-small {
      display: inline-block;
      padding: 8px 16px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .button-yelp {
      background-color: #f3f4f6;
      color: #4b5563;
      border: 1px solid #e5e7eb;
    }
    .button-yelp:hover {
      background-color: #e5e7eb;
      color: #1f2937;
    }
    .button-map {
      background-color: #f3f4f6;
      color: #4b5563;
      border: 1px solid #e5e7eb;
    }
    .button-map:hover {
      background-color: #e5e7eb;
      color: #1f2937;
    }
    .button-reserve {
      padding: 10px 20px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: #ffffff !important;
      border: none;
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
      margin-left: auto;
    }
    .button-reserve:hover {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
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
      .action-section { 
        justify-content: flex-start;
      }
      .button-small {
        flex: 0 0 auto;
      }
      .button-reserve {
        width: 100%;
        margin-left: 0;
        margin-top: 8px;
        text-align: center;
      }
      .place-header { 
        flex-direction: column; 
        align-items: flex-start; 
      }
      .summary-label, .summary-value {
        display: block;
        width: 100%;
        padding: 10px 16px;
      }
      .summary-label {
        border-bottom: none;
        padding-bottom: 4px;
      }
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
        <div class="summary-header">
          <h2>${icons.summary} ${t.email.summary}</h2>
        </div>
        <div class="summary-grid">
          ${eventType ? `
          <div class="summary-row">
            <div class="summary-label">${t.email.event}</div>
            <div class="summary-value">${eventType}</div>
          </div>` : ''}
          ${groupSize ? `
          <div class="summary-row">
            <div class="summary-label">${icons.people} ${t.email.group}</div>
            <div class="summary-value">${groupSize}</div>
          </div>` : ''}
          ${location ? `
          <div class="summary-row">
            <div class="summary-label">${icons.location} ${t.email.location}</div>
            <div class="summary-value">${location}</div>
          </div>` : ''}
          ${planDate ? `
          <div class="summary-row">
            <div class="summary-label">${icons.calendar} ${t.email.date}</div>
            <div class="summary-value">${planDate}</div>
          </div>` : ''}
          <div class="summary-row">
            <div class="summary-label">${icons.stops} ${t.email.totalStops}</div>
            <div class="summary-value">${blockDetails.length}</div>
          </div>
          <div class="summary-row">
            <div class="summary-label">${icons.generated} ${t.email.generated}</div>
            <div class="summary-value">${currentDate}</div>
          </div>
        </div>
      </div>

      <!-- Blocks -->
      ${blockDetails.map(({ block, place }, index) => {
        if (!place) return '';
        
        const yelpUrl = `https://www.yelp.com/biz/${place.id}`;
        const mapUrl = place.address 
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
        
        const phoneUrl = place.phone ? `tel:${place.phone}` : null;
        
        // Activity sequence label
        const activityLabels: { [key: string]: string[] } = {
          'en': ['First Activity', 'Second Activity', 'Third Activity', 'Fourth Activity', 'Fifth Activity'],
          'es': ['Primera Actividad', 'Segunda Actividad', 'Tercera Actividad', 'Cuarta Actividad', 'Quinta Actividad']
        };
        const activityLabel = activityLabels[language as string]?.[index] || `Activity ${index + 1}`;

        return `
      <div class="block">
        <div class="block-header">
          <div class="block-title-section">
            <p class="block-sequence">${activityLabel}</p>
            <h3 class="block-title">${block.label}</h3>
          </div>
          <div class="block-time">
            ${icons.clock}
            <span>${block.startTime} - ${block.endTime}</span>
          </div>
        </div>
        <div class="block-content">
          <div class="place-header">
            <h2 class="place-name">${place.name}</h2>
            ${place.rating ? `<span class="place-rating">${icons.star} ${place.rating}</span>` : ''}
            ${place.price ? `<span class="place-price">${place.price}</span>` : ''}
          </div>
          
          ${place.categories && place.categories.length > 0 ? `
          <div class="place-categories">
            ${place.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
          </div>
          ` : ''}
          
          ${place.address ? `
          <div class="place-address">
            <div class="place-address-line">
              ${icons.location}
              <div>
                <strong>${language === 'es' ? 'Dirección' : 'Address'}:</strong><br>
                ${place.address}
                ${place.distanceMeters ? `<br><small style="color: #6b7280;">${(place.distanceMeters / 1000).toFixed(1)} km ${t.place.distance}</small>` : ''}
              </div>
            </div>
            ${phoneUrl ? `
            <div class="place-address-line">
              ${icons.phone}
              <div>
                <strong>${language === 'es' ? 'Teléfono' : 'Phone'}:</strong> <a href="${phoneUrl}" style="color: #059669; text-decoration: none;">${place.phone}</a>
              </div>
            </div>
            ` : ''}
            <div class="place-address-line">
              ${icons.directions}
              <div>
                <strong>${language === 'es' ? 'Cómo llegar' : 'Get Directions'}:</strong> <a href="${mapUrl}" style="color: #059669; text-decoration: none;" target="_blank">${language === 'es' ? 'Abrir en Google Maps' : 'Open in Google Maps'}</a>
              </div>
            </div>
          </div>
          ` : ''}
          
          ${place.why ? `
          <div class="place-why">
            ${icons.info}
            <div>${place.why}</div>
          </div>
          ` : ''}
          
          <div class="action-section">
            <a href="${yelpUrl}" class="button-small button-yelp" target="_blank">Yelp</a>
            <a href="${mapUrl}" class="button-small button-map" target="_blank">Map</a>
            ${phoneUrl ? `<a href="${phoneUrl}" class="button-small button-reserve">${language === 'es' ? 'Reservar' : 'Reserve'}</a>` : ''}
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
