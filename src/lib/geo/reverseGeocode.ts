/**
 * Reverse Geocoding Utilities
 * Convert coordinates to city names - Expanded USA coverage
 */

// Reverse geocoding with expanded US city coverage
export function getCityFromCoordinates(lat: number, lng: number): string {
  // TEXAS - Dallas/Fort Worth Metroplex
  if (lat >= 32.5 && lat <= 33.3 && lng >= -97.5 && lng <= -96.0) {
    if (lat >= 33.1 && lng >= -96.9 && lng <= -96.7) return "Frisco, TX";
    if (lat >= 33.15 && lng >= -96.7 && lng <= -96.5) return "McKinney, TX";
    if (lat >= 33.0 && lat <= 33.1 && lng >= -96.8 && lng <= -96.6) return "Plano, TX";
    if (lat >= 33.08 && lng >= -96.7 && lng <= -96.6) return "Allen, TX";
    if (lat >= 32.95 && lat <= 33.0 && lng >= -96.75 && lng <= -96.65) return "Richardson, TX";
    if (lat >= 32.8 && lat <= 32.9 && lng >= -97.0 && lng <= -96.9) return "Irving, TX";
    if (lat >= 32.7 && lat <= 32.8 && lng >= -97.2 && lng <= -97.0) return "Arlington, TX";
    if (lng >= -97.5 && lng <= -97.2) return "Fort Worth, TX";
    if (lat >= 32.9 && lng >= -96.7 && lng <= -96.6) return "Garland, TX";
    return "Dallas, TX";
  }
  
  // TEXAS - Houston area
  if (lat >= 29.5 && lat <= 30.2 && lng >= -95.8 && lng <= -95.0) {
    if (lat >= 30.1) return "The Woodlands, TX";
    if (lng <= -95.6) return "Sugar Land, TX";
    return "Houston, TX";
  }
  
  // TEXAS - Austin area
  if (lat >= 30.1 && lat <= 30.6 && lng >= -98.0 && lng <= -97.5) {
    if (lat >= 30.45) return "Round Rock, TX";
    if (lng <= -97.8) return "Cedar Park, TX";
    return "Austin, TX";
  }
  
  // TEXAS - San Antonio
  if (lat >= 29.2 && lat <= 29.8 && lng >= -98.8 && lng <= -98.0) {
    if (lat >= 29.65 && lng >= -98.2) return "New Braunfels, TX";
    return "San Antonio, TX";
  }
  
  // TEXAS - El Paso
  if (lat >= 31.6 && lat <= 31.9 && lng >= -106.7 && lng <= -106.2) {
    return "El Paso, TX";
  }
  
  // CALIFORNIA - Los Angeles Metro
  if (lat >= 33.7 && lat <= 34.3 && lng >= -118.7 && lng <= -117.9) {
    if (lat > 34.1) return "Pasadena, CA";
    if (lng < -118.4) return "Santa Monica, CA";
    return "Los Angeles, CA";
  }
  
  // CALIFORNIA - San Francisco Bay Area
  if (lat >= 37.3 && lat <= 37.9 && lng >= -122.6 && lng <= -121.8) {
    if (lat > 37.7) return "Oakland, CA";
    if (lat < 37.4) return "San Jose, CA";
    return "San Francisco, CA";
  }
  
  // CALIFORNIA - San Diego
  if (lat >= 32.5 && lat <= 33.0 && lng >= -117.3 && lng <= -116.9) {
    return "San Diego, CA";
  }
  
  // NEW YORK - NYC Metro
  if (lat >= 40.5 && lat <= 40.9 && lng >= -74.3 && lng <= -73.7) {
    if (lat > 40.8) return "Bronx, NY";
    if (lat < 40.65) return "Brooklyn, NY";
    return "New York, NY";
  }
  
  // ILLINOIS - Chicago
  if (lat >= 41.6 && lat <= 42.1 && lng >= -88.0 && lng <= -87.5) {
    return "Chicago, IL";
  }
  
  // ARIZONA - Phoenix
  if (lat >= 33.3 && lat <= 33.7 && lng >= -112.3 && lng <= -111.8) {
    if (lat > 33.6) return "Scottsdale, AZ";
    return "Phoenix, AZ";
  }
  
  // PENNSYLVANIA - Philadelphia
  if (lat >= 39.8 && lat <= 40.1 && lng >= -75.3 && lng <= -74.9) {
    return "Philadelphia, PA";
  }
  
  // FLORIDA - Miami
  if (lat >= 25.7 && lat <= 26.1 && lng >= -80.5 && lng <= -80.1) {
    if (lat > 25.9) return "Fort Lauderdale, FL";
    return "Miami, FL";
  }
  
  // FLORIDA - Orlando
  if (lat >= 28.4 && lat <= 28.7 && lng >= -81.5 && lng <= -81.2) {
    return "Orlando, FL";
  }
  
  // GEORGIA - Atlanta
  if (lat >= 33.6 && lat <= 33.9 && lng >= -84.6 && lng <= -84.2) {
    return "Atlanta, GA";
  }
  
  // WASHINGTON - Seattle
  if (lat >= 47.4 && lat <= 47.8 && lng >= -122.5 && lng <= -122.2) {
    return "Seattle, WA";
  }
  
  // COLORADO - Denver
  if (lat >= 39.6 && lat <= 39.9 && lng >= -105.1 && lng <= -104.8) {
    return "Denver, CO";
  }
  
  // MASSACHUSETTS - Boston
  if (lat >= 42.2 && lat <= 42.5 && lng >= -71.2 && lng <= -70.9) {
    return "Boston, MA";
  }
  
  // NEVADA - Las Vegas
  if (lat >= 36.0 && lat <= 36.3 && lng >= -115.3 && lng <= -115.0) {
    return "Las Vegas, NV";
  }
  
  // OREGON - Portland
  if (lat >= 45.4 && lat <= 45.7 && lng >= -122.8 && lng <= -122.5) {
    return "Portland, OR";
  }
  
  return "Dallas, TX";
}

// Get nearby cities based on a known city
export function getNearbyCities(cityName: string): string[] {
  const lowerCity = cityName.toLowerCase();
  
  const cityGroups: Record<string, string[]> = {
    // TEXAS
    'frisco': ["Frisco, TX", "Plano, TX", "McKinney, TX"],
    'plano': ["Plano, TX", "Frisco, TX", "Richardson, TX"],
    'mckinney': ["McKinney, TX", "Frisco, TX", "Allen, TX"],
    'allen': ["Allen, TX", "Plano, TX", "McKinney, TX"],
    'richardson': ["Richardson, TX", "Plano, TX", "Dallas, TX"],
    'dallas': ["Dallas, TX", "Plano, TX", "Irving, TX"],
    'irving': ["Irving, TX", "Dallas, TX", "Arlington, TX"],
    'arlington': ["Arlington, TX", "Fort Worth, TX", "Irving, TX"],
    'fort worth': ["Fort Worth, TX", "Arlington, TX", "Grapevine, TX"],
    'houston': ["Houston, TX", "Sugar Land, TX", "The Woodlands, TX"],
    'austin': ["Austin, TX", "Round Rock, TX", "Cedar Park, TX"],
    'san antonio': ["San Antonio, TX", "New Braunfels, TX", "Boerne, TX"],
    
    // CALIFORNIA
    'los angeles': ["Los Angeles, CA", "Santa Monica, CA", "Pasadena, CA"],
    'la': ["Los Angeles, CA", "Santa Monica, CA", "Long Beach, CA"],
    'san francisco': ["San Francisco, CA", "Oakland, CA", "Berkeley, CA"],
    'sf': ["San Francisco, CA", "Oakland, CA", "San Jose, CA"],
    'san diego': ["San Diego, CA", "La Jolla, CA", "Carlsbad, CA"],
    'san jose': ["San Jose, CA", "Santa Clara, CA", "Sunnyvale, CA"],
    'sacramento': ["Sacramento, CA", "Elk Grove, CA", "Roseville, CA"],
    
    // NEW YORK
    'new york': ["New York, NY", "Brooklyn, NY", "Queens, NY"],
    'nyc': ["New York, NY", "Brooklyn, NY", "Manhattan, NY"],
    'manhattan': ["Manhattan, NY", "New York, NY", "Brooklyn, NY"],
    'brooklyn': ["Brooklyn, NY", "Queens, NY", "Manhattan, NY"],
    'buffalo': ["Buffalo, NY", "Niagara Falls, NY", "Rochester, NY"],
    
    // ILLINOIS
    'chicago': ["Chicago, IL", "Evanston, IL", "Oak Park, IL"],
    
    // ARIZONA
    'phoenix': ["Phoenix, AZ", "Scottsdale, AZ", "Tempe, AZ"],
    'scottsdale': ["Scottsdale, AZ", "Phoenix, AZ", "Tempe, AZ"],
    'tucson': ["Tucson, AZ", "Oro Valley, AZ", "Marana, AZ"],
    
    // PENNSYLVANIA
    'philadelphia': ["Philadelphia, PA", "King of Prussia, PA", "Camden, NJ"],
    'philly': ["Philadelphia, PA", "King of Prussia, PA", "Camden, NJ"],
    'pittsburgh': ["Pittsburgh, PA", "Oakland, PA", "Shadyside, PA"],
    
    // FLORIDA
    'miami': ["Miami, FL", "Miami Beach, FL", "Coral Gables, FL"],
    'orlando': ["Orlando, FL", "Winter Park, FL", "Kissimmee, FL"],
    'tampa': ["Tampa, FL", "St. Petersburg, FL", "Clearwater, FL"],
    'jacksonville': ["Jacksonville, FL", "Jacksonville Beach, FL", "St. Augustine, FL"],
    
    // GEORGIA
    'atlanta': ["Atlanta, GA", "Buckhead, GA", "Decatur, GA"],
    
    // WASHINGTON
    'seattle': ["Seattle, WA", "Bellevue, WA", "Redmond, WA"],
    'spokane': ["Spokane, WA", "Spokane Valley, WA", "Liberty Lake, WA"],
    
    // COLORADO
    'denver': ["Denver, CO", "Boulder, CO", "Aurora, CO"],
    'colorado springs': ["Colorado Springs, CO", "Manitou Springs, CO", "Fountain, CO"],
    
    // MASSACHUSETTS
    'boston': ["Boston, MA", "Cambridge, MA", "Brookline, MA"],
    
    // NEVADA
    'las vegas': ["Las Vegas, NV", "Henderson, NV", "North Las Vegas, NV"],
    
    // OREGON
    'portland': ["Portland, OR", "Beaverton, OR", "Lake Oswego, OR"],
    
    // MICHIGAN
    'detroit': ["Detroit, MI", "Royal Oak, MI", "Ann Arbor, MI"],
    
    // MINNESOTA
    'minneapolis': ["Minneapolis, MN", "St. Paul, MN", "Edina, MN"],
    
    // MISSOURI
    'kansas city': ["Kansas City, MO", "Overland Park, KS", "Independence, MO"],
    'st. louis': ["St. Louis, MO", "Clayton, MO", "University City, MO"],
    'saint louis': ["St. Louis, MO", "Clayton, MO", "University City, MO"],
    
    // OHIO
    'columbus': ["Columbus, OH", "Dublin, OH", "Worthington, OH"],
    'cleveland': ["Cleveland, OH", "Lakewood, OH", "Shaker Heights, OH"],
    
    // NORTH CAROLINA
    'charlotte': ["Charlotte, NC", "Matthews, NC", "Huntersville, NC"],
    'raleigh': ["Raleigh, NC", "Durham, NC", "Chapel Hill, NC"],
    
    // TENNESSEE
    'nashville': ["Nashville, TN", "Franklin, TN", "Brentwood, TN"],
    'memphis': ["Memphis, TN", "Germantown, TN", "Collierville, TN"],
    
    // WISCONSIN
    'milwaukee': ["Milwaukee, WI", "Madison, WI", "Wauwatosa, WI"],
  };
  
  for (const [key, cities] of Object.entries(cityGroups)) {
    if (lowerCity.includes(key)) {
      return cities;
    }
  }
  
  return ["Dallas, TX", "Plano, TX", "Frisco, TX"];
}
