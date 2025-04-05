# Project Requirements Document (Balloon App)

## 1. Project Overview

The Balloon App is a Canva-style web-based platform designed for small to mid-sized businesses in the balloon design industry. The platform streamlines the entire workflow for balloon artists—from initial design creation through to production planning and inventory management. Using a drag-and-drop interface, users can create custom balloon designs by placing predefined balloon clusters onto uploaded images or blank canvases. The app automatically tracks balloon quantities by size and color.

This application optimizes business operations by merging intuitive design creation with smart inventory tracking and practical production planning. Its key objectives are to simplify the design process, reduce errors in material estimation, streamline production planning with ready-to-use production forms, and provide actionable business insights via a real-time analytics dashboard.

## 2. In-Scope vs. Out-of-Scope

### In-Scope:

- Canva-style drag-and-drop interface for creating balloon designs by placing predefined balloon clusters onto canvases
- Background image upload support for standard formats (JPEG, PNG, GIF, WebP)
- Predefined balloon cluster templates with realistic rendering (no visible numbers)
- Standard cluster composition of 13 balloons (2 x 16-inch and 11 x 11-inch) with multiple preset styles
- Real-time data table showing balloon counts by size and color
- Automatic calculation of material requirements as clusters are added to designs
- Integrated inventory management system to track balloon stocks by color and size
- Production planning tools that generate comprehensive production forms
- Secure user account management with different roles and customizable permissions
- Responsive design ensuring accessibility across devices
- Payment gateway integration (e.g., Stripe) for secure transactions

### Out-of-Scope:

- Integration with external third-party inventory systems
- Multi-language support beyond English (for future updates)
- Extensive customization of branding elements
- Advanced AI-driven product recommendations
- Mobile app native development; focus remains on responsive web platform

## 3. User Flow

A new user begins by signing up with a secure account creation process and selecting a role (Designer, Inventory Manager, or Admin). Once logged in, the user lands on a clean, minimalistic dashboard with a side navigation menu.

From the dashboard, they access the design canvas which features:

- A sidebar containing various predefined balloon cluster templates
- A main canvas area for design composition
- Tools to upload background images
- A color selection palette

Users can drag and drop balloon cluster templates onto the canvas, position them precisely, and customize their colors. As clusters are added, a real-time data table updates to show counts of balloons by size and color. Users can save designs, which automatically updates inventory requirements.

The production planning module then compiles all necessary material requirements and generates a ready-to-use production form. Additionally, users can view a real-time sales analytics dashboard to track key metrics.

## 4. Core Features

### Drag-and-Drop Design Interface:

- Canvas workspace similar to Canva for creating designs
- Sidebar with draggable balloon cluster templates
- Background image upload and positioning
- Precise placement of balloon clusters on the canvas
- Real-time balloon count tracking by size and color

### Balloon Cluster Templates:

- Standard cluster composition: 13 balloons per cluster (2 x 16-inch and 11 x 11-inch)
- Visually realistic balloon representations (no numbers visible)
- Multiple preset styles (classic cluster, arch, column, etc.)
- Color customization options

### Secure User Accounts & Roles:

- Registration, login, and role-based access (Admin, Designer, Inventory Manager)
- Custom permissions for each role with appropriate restrictions

### Design Management:

- Save and retrieve designs with client information
- Track historical changes and update production forms in real-time

### Inventory Management System:

- Track balloon inventory by color and size with automatic updates
- Customizable low-stock thresholds and automated alerts

### Production Planning Module:

- Generate detailed production forms listing required materials
- Include accessories (starbursts, pearl garlands, LED lights) and estimated production times
- Manual override options for material calculations

### Real-Time Analytics Dashboard:

- Visual dashboard showing key business metrics
- CSV export tools for reporting and analysis

### Payment Integration:

- Secure integration with Stripe to handle transactions

## 5. Tech Stack & Tools

### Frontend:

- Next.js 14
- TypeScript
- Tailwind CSS for styling
- shadcn/UI and Radix UI for UI components
- Lucide Icons for iconography
- React DnD or react-beautiful-dnd for drag-and-drop functionality

### Backend & Storage:

- Supabase for database, authentication, and storage
- Real-time data synchronization using Supabase Realtime

### Rendering Technology:

- SVG or Canvas-based rendering for realistic balloon clusters

### Development & Collaboration Tools:

- Replit as the online IDE for frontend development
- Cursor AI for backend assistance
- Integration with Lovable.dev for component generation

## 6. Implementation Plan

### Phase 1: Create drag-and-drop interface with balloon cluster templates

- Implement basic canvas with drag-and-drop functionality
- Create balloon cluster components with realistic styling
- Setup project saving and authentication

### Phase 2: Implement image upload and background positioning

- Build image upload functionality
- Add controls for background positioning and opacity
- Implement color customization for balloon clusters

### Phase 3: Connect to Supabase for data persistence and user authentication

- Set up Supabase database schema
- Implement authentication flow
- Create real-time data synchronization

### Phase 4: Develop inventory and production page integrations

- Build inventory management system
- Create production form generation
- Develop analytics dashboard

## 7. Non-Functional Requirements

### Performance:

- Responsive user interactions with minimal delay
- Efficient handling of drag-and-drop operations
- Optimized image handling

### Security:

- Secure authentication and access control
- Secure image uploads and data transactions
- Data privacy best practices

### Usability:

- Clean, minimalistic interface with intuitive navigation
- Responsive design for cross-device compatibility

### Scalability:

- Efficient handling of increasing users and design uploads

## 8. Known Issues & Potential Pitfalls

### Performance Constraints:

- Complex balloon cluster rendering might affect performance on low-end devices
- High-resolution image uploads could lead to processing delays

### API Rate Limits:

- Supabase API call limits for real-time updates and synchronization

### Cross-Device Compatibility:

- Ensuring drag-and-drop functionality works consistently across devices

### Data Synchronization:

- Maintaining consistency between design, inventory, and production modules
