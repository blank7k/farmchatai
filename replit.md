# FarmBot Kerala - AI Assistant for Kerala Farmers

## Overview

FarmBot Kerala is a ChatGPT-like conversational interface designed specifically for Kerala farmers. The application provides a mobile-first, farmer-friendly platform that offers AI-powered agricultural assistance in both English and Malayalam. The system includes features for AI chat, smart farming suggestions, weather monitoring, market price tracking, and community interaction.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **PWA Support**: Service worker implementation for offline functionality

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with proper error handling and logging middleware
- **Development**: Hot reload with Vite integration in development mode

### Data Storage Solutions
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured via Neon serverless)
- **Schema**: Centralized schema definitions in `/shared` directory
- **Migration**: Drizzle Kit for database migrations and schema management
- **Development Storage**: In-memory storage implementation for development/testing

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **User Identification**: UUID-based farmer profiles stored in localStorage
- **Security**: CORS handling and request validation

### Core Features Architecture

#### AI Chat System
- **Provider**: OpenAI API integration with GPT-5 model
- **Context Awareness**: Farmer profile-based contextual responses
- **Voice Support**: Web Speech API for voice input and text-to-speech output
- **Multilingual**: English and Malayalam language support

#### Smart Suggestions Engine
- **AI-Generated**: Proactive farming advice based on farmer profile and seasonal data
- **Task Management**: Priority-based suggestion system with completion tracking
- **Personalization**: Crop-specific and location-aware recommendations

#### Weather Integration
- **Real-time Data**: Weather API integration for Kerala districts
- **Farming Advice**: Weather-based agricultural recommendations
- **Forecast Display**: Multi-day weather predictions with farming implications

#### Market Price System
- **Live Pricing**: Real-time market price tracking for Kerala crops
- **Trend Analysis**: Price movement indicators and market insights
- **District-wise Data**: Location-specific market information

#### Community Platform
- **Discussion Forums**: Farmer-to-farmer knowledge sharing
- **Content Management**: Post creation, likes, and reply system
- **Topic Organization**: Hashtag-based content categorization

### Mobile-First Design
- **Responsive Layout**: Tailwind CSS breakpoints for mobile optimization
- **Touch Interactions**: Large, farmer-friendly buttons and touch targets
- **Offline Capability**: Service worker for offline farming tips and core functionality
- **Performance**: Optimized bundle size and lazy loading

### Theme System
- **Dark/Light Mode**: Complete theme switching with CSS custom properties
- **Kerala-Inspired Colors**: Agricultural green and orange color scheme
- **Accessibility**: High contrast ratios and semantic color naming

### Internationalization
- **Language Support**: English and Malayalam with easy extensibility
- **Translation System**: Custom translation hook with parameter interpolation
- **Cultural Adaptation**: Kerala-specific farming terminology and practices

## External Dependencies

### AI and Language Processing
- **OpenAI API**: GPT-5 model for conversational AI and farming advice generation
- **Web Speech API**: Browser-native voice recognition and text-to-speech

### Database and Storage
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations and schema management

### UI and Styling
- **Radix UI**: Accessible primitive components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### Development and Build
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundling for production

### Utilities and Tools
- **TanStack Query**: Server state management and caching
- **Zod**: Runtime type validation and schema parsing
- **date-fns**: Date manipulation and formatting

### Kerala-Specific Data
- **District Information**: 14 Kerala districts with climate and geographical data
- **Crop Calendar**: Traditional Kerala farming seasons and crop rotation data
- **Land Types**: Kerala-specific land classifications (coastal, midland, highland)
- **Local Practices**: Integration of traditional Kerala farming methods