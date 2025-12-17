import { Place, BlockType } from "@/modules/planning/types";
import { PlanContext } from "@/modules/planning/types";

/**
 * Mock Yelp recommendations for development and testing
 * Returns placeholder places with the Place structure
 * Uses clearly fake data - NOT real ratings or businesses
 */
export function mockRecommendations(
  context: PlanContext,
  blockType: BlockType,
  count: number = 3
): Place[] {
  const location = context.location?.text || "Dallas";
  const places: Place[] = [];

  // Generate mock places based on block type
  for (let i = 0; i < count; i++) {
    places.push(generateFakePlace(blockType, i, location, context));
  }

  return places;
}

function generateFakePlace(
  blockType: BlockType,
  index: number,
  location: string,
  context: PlanContext
): Place {
  const baseId = `${blockType}-${index}-${Date.now()}`;

  switch (blockType) {
    case "activity":
      return generateActivity(baseId, index, location, context);
    case "restaurant":
      return generateRestaurant(baseId, index, location, context);
    case "dessert":
      return generateDessert(baseId, index, location, context);
    case "after":
      return generateAfter(baseId, index, location, context);
    default:
      return generateGeneric(baseId, index, location);
  }
}

function generateActivity(
  id: string,
  index: number,
  location: string,
  context: PlanContext
): Place {
  const activities = [
    {
      name: "Adventure Zone Arcade",
      categories: ["Arcade", "Entertainment", "Games"],
      why: "Gran variedad de juegos y ambiente divertido",
    },
    {
      name: "Skyline Cinema IMAX",
      categories: ["Cinema", "Movies", "Entertainment"],
      why: "Última tecnología IMAX y estrenos recientes",
    },
    {
      name: "Green Trails Park",
      categories: ["Park", "Outdoor", "Nature"],
      why: "Perfecto para actividades al aire libre y picnics",
    },
  ];

  const activity = activities[index % activities.length];

  return {
    id,
    name: activity.name,
    categories: activity.categories,
    rating: undefined, // No inventar ratings
    price: context.budget?.tier || "$$",
    distanceMeters: 2000 + index * 1000,
    address: `${1000 + index * 100} Main St, ${location}`,
    url: `https://example.com/${id}`,
    phone: "+1-555-0100",
    photos: [],
    why: activity.why,
  };
}

function generateRestaurant(
  id: string,
  index: number,
  location: string,
  context: PlanContext
): Place {
  const restaurants = [
    {
      name: "Bella Italia Trattoria",
      categories: ["Italian", "Restaurant", "Pasta"],
      why: "Auténtica cocina italiana con ambiente acogedor",
    },
    {
      name: "Taco Fiesta Cantina",
      categories: ["Mexican", "Restaurant", "Tacos"],
      why: "Sabores tradicionales y margaritas artesanales",
    },
    {
      name: "Sakura Sushi House",
      categories: ["Japanese", "Sushi", "Asian"],
      why: "Sushi fresco y rolls innovadores",
    },
  ];

  const restaurant = restaurants[index % restaurants.length];

  return {
    id,
    name: restaurant.name,
    categories: restaurant.categories,
    rating: undefined, // No inventar ratings
    price: context.budget?.tier || "$$",
    distanceMeters: 1500 + index * 800,
    address: `${2000 + index * 100} Dining Blvd, ${location}`,
    url: `https://example.com/${id}`,
    phone: "+1-555-0200",
    photos: [],
    why: restaurant.why,
  };
}

function generateDessert(
  id: string,
  index: number,
  location: string,
  context: PlanContext
): Place {
  const desserts = [
    {
      name: "Sweet Dreams Bakery",
      categories: ["Bakery", "Dessert", "Café"],
      why: "Postres artesanales y café especializado",
    },
    {
      name: "Gelato Paradise",
      categories: ["Ice Cream", "Gelato", "Dessert"],
      why: "Gelato italiano auténtico con sabores únicos",
    },
    {
      name: "Chocolate Haven",
      categories: ["Chocolate", "Dessert", "Café"],
      why: "Especialidad en chocolate belga y postres gourmet",
    },
  ];

  const dessert = desserts[index % desserts.length];

  return {
    id,
    name: dessert.name,
    categories: dessert.categories,
    rating: undefined, // No inventar ratings
    price: context.budget?.tier === "$$$$" ? "$$$" : context.budget?.tier || "$",
    distanceMeters: 1000 + index * 500,
    address: `${3000 + index * 100} Sweet Lane, ${location}`,
    url: `https://example.com/${id}`,
    phone: "+1-555-0300",
    photos: [],
    why: dessert.why,
  };
}

function generateAfter(
  id: string,
  index: number,
  location: string,
  context: PlanContext
): Place {
  const afters = [
    {
      name: "Midnight Lounge",
      categories: ["Lounge", "Bar", "Cocktails"],
      why: "Cócteles artesanales y música en vivo",
    },
    {
      name: "Starlight Rooftop",
      categories: ["Rooftop", "Bar", "Views"],
      why: "Vistas panorámicas y ambiente sofisticado",
    },
    {
      name: "The Jazz Corner",
      categories: ["Jazz Club", "Music", "Bar"],
      why: "Jazz en vivo y ambiente íntimo",
    },
  ];

  const after = afters[index % afters.length];

  return {
    id,
    name: after.name,
    categories: after.categories,
    rating: undefined, // No inventar ratings
    price: context.budget?.tier || "$$",
    distanceMeters: 2500 + index * 700,
    address: `${4000 + index * 100} Night Ave, ${location}`,
    url: `https://example.com/${id}`,
    phone: "+1-555-0400",
    photos: [],
    why: after.why,
  };
}

function generateGeneric(id: string, index: number, location: string): Place {
  return {
    id,
    name: `Generic Place ${index + 1}`,
    categories: ["General"],
    rating: undefined,
    price: "$$",
    distanceMeters: 3000,
    address: `${5000 + index * 100} Generic St, ${location}`,
    url: `https://example.com/${id}`,
    phone: "+1-555-0500",
    photos: [],
    why: "Opción genérica de respaldo",
  };
}
