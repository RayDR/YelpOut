import { NextRequest, NextResponse } from "next/server";
import { PlanContext } from "@/modules/planning/types";
import { BlockType, Place } from "@/modules/planning/types";
import { mockRecommendations } from "@/lib/yelp/mockRecommendations";
import { YelpClient } from "@/lib/yelp/yelpClient";
import { normalizeYelpBusiness } from "@/lib/yelp/normalize";

/**
 * Yelp Recommendations API Endpoint
 * Fetches business recommendations based on plan context and block type
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { context, blockType, limit = 3, language = 'en', excludeIds = [] } = body as {
      context: PlanContext;
      blockType: BlockType;
      limit?: number;
      language?: 'en' | 'es';
      excludeIds?: string[];
    };

    // Validate required information
    if (!context.location?.text) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    // Yelp API configurada - usando API real
    const useMock = false; // Cambiar a true para usar mock en desarrollo

    if (useMock) {
      // Use mock data for development
      const places = mockRecommendations(context, blockType, limit);
      return NextResponse.json({ places });
    }

    // Real Yelp API integration
    const apiKey = process.env.YELP_API_KEY;
    if (!apiKey) {
      throw new Error("YELP_API_KEY environment variable not configured");
    }

    const yelpClient = new YelpClient(apiKey);

    // Build search parameters based on block type
    const searchParams = buildYelpSearchParams(context, blockType);
    
    // Request MORE results from Yelp to have alternatives after filtering
    // Yelp can return up to 50 results per request
    searchParams.limit = Math.min(50, limit + excludeIds.length + 10);
    
    // Log the search params for debugging
    console.log('[Yelp API] Search params:', JSON.stringify(searchParams, null, 2));
    console.log('[Yelp API] Request details:', {
      blockType: blockType,
      mood: context.preferences?.mood,
      cuisine: context.preferences?.cuisine,
      hasAttributes: !!searchParams.attributes,
      hasTerm: !!searchParams.term,
      hasCategories: !!searchParams.categories
    });

    // Execute search
    let yelpResponse = await yelpClient.searchBusinesses(searchParams);
    
    // If no results and we have restrictive attributes, try without them
    if (yelpResponse.businesses.length === 0 && searchParams.attributes) {
      console.log('[Yelp Fallback] No results with attributes, retrying without:', searchParams.attributes);
      const fallbackParams = { ...searchParams };
      delete fallbackParams.attributes;
      yelpResponse = await yelpClient.searchBusinesses(fallbackParams);
    }
    
    // If still no results and we have a specific term, try with broader categories only
    if (yelpResponse.businesses.length === 0 && searchParams.term) {
      console.log('[Yelp Fallback] No results with term, retrying with categories only');
      const fallbackParams = { ...searchParams };
      delete fallbackParams.term;
      delete fallbackParams.attributes;
      yelpResponse = await yelpClient.searchBusinesses(fallbackParams);
    }

    // Normalize results to our internal format
    let places = yelpResponse.businesses
      .map((business) => normalizeYelpBusiness(business, language));
    
    // Filter out already shown places
    if (excludeIds.length > 0) {
      places = places.filter(place => !excludeIds.includes(place.id));
    }
    
    // Return only the requested limit
    const finalPlaces = places.slice(0, limit);
    

    return NextResponse.json({ 
      places: finalPlaces,
      recommendations: finalPlaces // Alias for compatibility
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

/**
 * Build Yelp search parameters from context and block type
 * Maps internal plan context to Yelp API search parameters
 */
function buildYelpSearchParams(
  context: PlanContext,
  blockType: BlockType
): {
  location?: string;
  latitude?: number;
  longitude?: number;
  term?: string;
  categories?: string;
  price?: string;
  radius?: number;
  limit?: number;
  attributes?: string;
} {
  const params: any = {
    limit: 10,
  };
  
  // Extract hour from start time to determine time of day
  const getTimeOfDay = (): 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' => {
    if (!context.event?.startTime) return 'midday';
    const hour = parseInt(context.event.startTime.split(':')[0]);
    if (hour >= 6 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 15) return 'midday';
    if (hour >= 15 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };
  
  const timeOfDay = getTimeOfDay();
  const hasKids = context.participants?.kids && context.participants.kids > 0;
  const isFamily = context.event?.type === 'family' || hasKids;
  
  // Use coordinates if available, otherwise use location text
  if (context.location?.lat && context.location?.lng) {
    params.latitude = context.location.lat;
    params.longitude = context.location.lng;
  } else {
    params.location = context.location!.text!;
  }

  // Add radius if available
  if (context.location?.radiusKm) {
    params.radius = Math.round(context.location.radiusKm * 1000); // Convert to meters
  }

  // Add price filter if available (Yelp expects 1-4)
  if (context.budget?.tier && context.budget.tier !== "NA") {
    const priceLevel = context.budget.tier.replace(/\$/g, "").length;
    // Validate price is between 1-4
    if (priceLevel >= 1 && priceLevel <= 4) {
      params.price = priceLevel.toString();
    }
  }

  // Map mood to Yelp attributes
  // Yelp supports attributes like: hot_and_new, request_a_quote, reservation, waitlist_reservation, cashback,
  // deals, gender_neutral_restrooms, open_to_all, wheelchair_accessible, dogs_allowed, bike_parking
  const attributes: string[] = [];
  
  // Prioritize kids-friendly if there are kids
  if (context.participants?.kids && context.participants.kids > 0) {
    attributes.push("wheelchair_accessible"); // Often correlates with family-friendly
  }
  
  // Prioritize pet-friendly if bringing pets
  if (context.participants?.pets) {
    attributes.push("dogs_allowed");
  }
  
  if (context.preferences?.mood && context.preferences.mood.length > 0) {
    context.preferences.mood.forEach(mood => {
      switch (mood) {
        case "romantic":
          // Romantic places typically allow reservations
          attributes.push("reservation");
          break;
        case "quiet":
          // Quiet places - no specific attribute but we can filter by not being hot_and_new
          break;
        case "lively":
        case "fun":
          // Lively places might be hot and new
          attributes.push("hot_and_new");
          break;
        case "upscale":
        case "fancy":
          // Upscale places typically have reservations
          attributes.push("reservation");
          break;
        case "family":
          // Family-friendly
          attributes.push("wheelchair_accessible");
          break;
      }
    });
  }
  
  // Add group-related attributes
  if (context.participants?.size && context.participants.size > 4) {
    // Large groups might need reservations
    attributes.push("reservation");
  }
  
  // Join attributes if any were added
  if (attributes.length > 0) {
    params.attributes = attributes.join(',');
  }

  // Configure categories and terms based on block type AND time of day
  switch (blockType) {
    case "activity":
      // Map activity preferences to Yelp categories based on time
      if (timeOfDay === 'morning') {
        params.categories = "parks,museums,galleries,aquariums,farms";
        params.term = isFamily ? "morning family activities" : "morning activities";
      } else if (timeOfDay === 'midday' || timeOfDay === 'afternoon') {
        params.categories = isFamily 
          ? "playgrounds,arcades,museums,aquariums,zoos,parks"
          : "museums,galleries,tours,activities";
        params.term = isFamily ? "family entertainment" : "entertainment activities";
      } else {
        // Evening/night
        params.categories = isFamily 
          ? "arcades,bowling,mini_golf"
          : "bars,lounges,theaters,comedy_clubs,nightlife";
        params.term = isFamily ? "family evening activities" : "evening entertainment nightlife";
      }
      
      if (context.participants?.pets) {
        params.term = (params.term || "activities") + " dog-friendly";
      }
      break;

    case "restaurant":
    case "lunch":
    case "dinner":
      // TIME-BASED MEAL RECOMMENDATIONS
      if (timeOfDay === 'morning') {
        // BREAKFAST/BRUNCH (6am-11am)
        params.categories = "breakfast_brunch,cafes,bagels,donuts,coffee";
        const breakfastTerms = ["breakfast", "brunch"];
        if (isFamily) breakfastTerms.push("family-friendly");
        params.term = breakfastTerms.join(" ");
      } else if (timeOfDay === 'midday') {
        // LUNCH (11am-3pm)
        params.categories = "restaurants,sandwiches,delis,cafes,lunch";
        const lunchTerms = ["lunch"];
        if (isFamily) lunchTerms.push("family-friendly casual");
        
        // Add cuisine if specified
        if (context.preferences?.cuisine && context.preferences.cuisine.length > 0) {
          lunchTerms.push(...context.preferences.cuisine);
        }
        params.term = lunchTerms.join(" ");
      } else if (timeOfDay === 'afternoon') {
        // LIGHT MEALS/SNACKS (3pm-6pm)
        params.categories = "cafes,sandwiches,snacks,bakeries";
        params.term = isFamily ? "family-friendly cafe snacks" : "light meal cafe";
      } else if (timeOfDay === 'evening') {
        // DINNER (6pm-10pm)
        if (isFamily) {
          params.categories = "restaurants,pizza,italian,mexican,burgers";
          params.term = "family-friendly dinner casual dining";
        } else if (context.preferences?.mood?.includes('romantic')) {
          params.categories = "restaurants,finedining,italian,french,steakhouses";
          params.term = "romantic dinner fine dining";
        } else {
          params.categories = "restaurants,dinner";
          const dinnerTerms = ["dinner"];
          
          // Add mood
          if (context.preferences?.mood && context.preferences.mood.length > 0) {
            context.preferences.mood.forEach(mood => {
              if (mood === 'upscale' || mood === 'fancy') dinnerTerms.push("upscale");
              if (mood === 'casual') dinnerTerms.push("casual");
              if (mood === 'lively') dinnerTerms.push("lively");
            });
          }
          
          // Add cuisine
          if (context.preferences?.cuisine && context.preferences.cuisine.length > 0) {
            dinnerTerms.push(...context.preferences.cuisine);
          }
          
          params.term = dinnerTerms.join(" ");
        }
      } else {
        // LATE NIGHT (10pm+)
        params.categories = isFamily 
          ? "diners,pizza,burgers"
          : "diners,bars,pubs,latenight";
        params.term = isFamily ? "family dining" : "late night food";
      }
      
      if (context.participants?.pets) {
        params.term = (params.term || "restaurant") + " dog-friendly patio";
      }
      break;

    case "dessert":
    case "coffee":
      // TIME-BASED DESSERT/COFFEE RECOMMENDATIONS
      if (timeOfDay === 'morning') {
        // Morning: Coffee shops, bakeries
        params.categories = "coffee,coffeeshops,bakeries,bagels,donuts";
        params.term = "coffee bakery breakfast pastries";
      } else if (timeOfDay === 'midday' || timeOfDay === 'afternoon') {
        // Afternoon: Ice cream, cafes, pastries
        params.categories = "icecream,gelato,coffeeshops,bakeries,desserts,juicebars";
        params.term = isFamily 
          ? "ice cream family-friendly dessert"
          : "ice cream coffee dessert";
      } else {
        // Evening/Night: Dessert bars, specialty cafes, gelato
        params.categories = isFamily
          ? "icecream,gelato,desserts,bakeries"
          : "desserts,gelato,coffeeshops,dessertbars,patisserie";
        params.term = isFamily
          ? "family dessert ice cream"
          : "specialty dessert coffee";
      }
      break;

    case "after":
      // After-hours activities (bars, lounges)
      if (isFamily) {
        // Families shouldn't get bars - redirect to ice cream or dessert
        params.categories = "icecream,arcades,bowling";
        params.term = "family evening entertainment";
      } else {
        params.categories = "bars,lounges,cocktailbars,wine_bars,pubs";
        
        const barTerms: string[] = [];
        if (context.preferences?.mood && context.preferences.mood.length > 0) {
          context.preferences.mood.forEach(mood => {
            if (mood === 'romantic') barTerms.push("romantic lounge");
            if (mood === 'lively' || mood === 'fun') barTerms.push("lively nightlife");
            if (mood === 'upscale' || mood === 'fancy') barTerms.push("upscale cocktail bar");
            if (mood === 'casual') barTerms.push("casual pub");
          });
        }
        
        params.term = barTerms.length > 0 ? barTerms.join(" ") : "cocktails drinks";
      }
      break;
  }

  return params;
}
