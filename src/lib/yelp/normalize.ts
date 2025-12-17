import { Place } from "@/modules/planning/types";
import { YelpBusiness } from "./yelpClient";
import { translations, Language } from "@/lib/i18n/translations";

/**
 * Normaliza un negocio de Yelp al formato Place interno
 */
export function normalizeYelpBusiness(business: YelpBusiness, language: Language = 'en', why?: string): Place {
  return {
    id: business.id,
    name: business.name,
    categories: business.categories.map((cat) => cat.title),
    rating: business.rating,
    price: business.price,
    distanceMeters: Math.round(business.distance),
    address: business.location.display_address.join(", "),
    url: business.url,
    phone: business.display_phone,
    photos: business.image_url ? [business.image_url] : [],
    reviewCount: business.review_count,
    why: why || generateWhyText(business, language),
  };
}

/**
 * Genera texto "por qué encaja" basado en atributos del negocio
 */
function generateWhyText(business: YelpBusiness, language: Language): string {
  const t = translations[language];
  const reasons: string[] = [];

  if (business.rating >= 4.5) {
    reasons.push(t.place.excellentRating);
  }

  if (business.review_count > 500) {
    reasons.push(t.place.veryPopular);
  }

  if (business.categories.length > 0) {
    const mainCategory = business.categories[0].title;
    reasons.push(`${t.place.specialtyIn} ${mainCategory}`);
  }

  return reasons.join(", ") || t.place.recommendedOption;
}
