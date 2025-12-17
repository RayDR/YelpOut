# Changelog

All notable changes to YelpOut will be documented in this file.

## [Beta 1.0.0] - 2025-12-17

### Features
- 🎯 Conversational AI planner for outings and celebrations
- 🌍 Multi-language support (English & Spanish)
- 🗺️ Geolocation integration for nearby recommendations
- 📅 Smart date/time detection (today, tomorrow, this weekend, specific days)
- 👥 Group size handling with range support (e.g., "3-5 people")
- 💰 Budget tier filtering (economical, moderate, upscale, luxury)
- 🍕 Cuisine preferences with multi-selection
- 🎭 Mood-based recommendations
- 📧 Email itinerary delivery
- 🔄 Dynamic plan modification (swap alternatives, skip blocks, reorder)
- ⏱️ Automatic time recalculation when reordering blocks
- 🎨 Theme support (light/dark mode)
- 🔊 Text-to-speech integration
- 📱 Fully responsive design (mobile, tablet, desktop)

### Event Types Supported
- Romantic dates
- Family outings
- Friends gatherings
- Graduations
- Celebrations (birthdays, anniversaries)
- Business meals

### AI Intelligence
- Automatic event type detection from natural language
- Context preservation during conversation
- Smart event type switching without losing existing information
- Emotional response system with contextual messages
- Help system for user guidance
- Complaint detection and logging
- Loop detection to prevent conversation cycles

### User Experience
- Animated logo that scales on scroll
- Privacy notice with GDPR compliance
- Conversation history with back navigation
- Editable context pills
- Alternative viewing for each block
- Drag-and-drop reordering (desktop)
- Up/down arrows for block reordering (mobile)
- Skip functionality for optional blocks

### Technical
- Built with Next.js 14
- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations
- Yelp Fusion API integration
- Session storage for state persistence
- PM2 process management
- Nginx reverse proxy ready

### Known Limitations
- Requires Yelp API key
- Email functionality optional (SMTP configuration needed)
- Geolocation requires user permission
- Limited to Yelp business data availability in user's area

## Future Enhancements (Roadmap)
- User accounts and saved itineraries
- Social sharing capabilities
- Calendar integration
- Uber/Lyft integration for transportation
- Weather-based recommendations
- Real-time availability checking
- Multi-day trip planning
- Cost estimator
- Group voting on options
- Dietary restrictions handling
