# Balloon Designer Pro

## Overview

Balloon Designer Pro is a sophisticated web platform designed for balloon design businesses, offering AI-powered analytics to streamline creative workflows and business operations. The application provides a complete solution for design creation, inventory management, production tracking, and order processing with a kid-friendly ordering interface.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and maintainability
- **Styling**: Tailwind CSS for utility-first styling with shadcn/UI and Radix UI components
- **State Management**: React Context for authentication and design state, React Query for server state
- **Drag & Drop**: React DnD for interactive balloon cluster placement on canvas
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript for API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication with bcrypt for password hashing
- **File Upload**: Multer for handling design image uploads
- **Architecture Pattern**: Transitioning from monolithic storage to repository pattern for better maintainability

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema**: Strongly typed schema definitions with Zod validation
- **Migration**: Drizzle Kit for database migrations

## Key Components

### Design System
- **Canvas Editor**: Interactive drag-and-drop interface for balloon cluster placement
- **Element System**: Balloon clusters with customizable colors, sizes, and positions
- **Background Support**: Image upload capability for design backgrounds
- **Real-time Preview**: Live updates of material requirements as designs change

### Inventory Management
- **Stock Tracking**: Real-time inventory levels by color and size
- **Status Indicators**: Visual indicators (in-stock, low-stock, out-of-stock)
- **Automated Checking**: Design-based inventory verification
- **Kid-Friendly Ordering**: Simplified interface for easy balloon ordering

### Production Planning
- **Material Calculation**: Automatic balloon requirement calculations
- **Production Forms**: Generated forms based on design specifications
- **Status Tracking**: Production workflow management
- **Scheduling**: Production planning with calendar integration

### User Management
- **Role-Based Access**: Admin, Designer, and Inventory Manager roles
- **Session Management**: Secure session-based authentication
- **Profile Management**: User account and preference management

## Data Flow

1. **Design Creation**: Users upload background images and place balloon clusters on canvas
2. **Inventory Verification**: System checks available balloon stock against design requirements
3. **Order Processing**: If inventory is insufficient, users can order missing balloons
4. **Production Planning**: Once inventory is confirmed, production forms are generated
5. **Analytics**: Real-time tracking of designs, inventory levels, and production status

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **@dnd-kit/***: Modern drag-and-drop functionality

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

### Authentication & Security
- **bcryptjs**: Password hashing
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite development server with HMR
- **Database**: Neon serverless PostgreSQL for development
- **File Storage**: Local file system for uploads during development

### Production Environment
- **Build Process**: Vite builds client, ESBuild bundles server
- **Static Assets**: Served from dist/public directory
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Session Storage**: PostgreSQL-backed session store

### Configuration
- **Environment Variables**: Database URL, session secrets, API keys
- **TypeScript Configuration**: Shared types between client and server
- **Path Aliases**: Simplified imports with @ and @shared prefixes

## Changelog
- July 08, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.