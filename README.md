# Balloon Designer Pro

A sophisticated web platform for balloon design businesses, leveraging AI-powered analytics to streamline creative workflows and business operations.

## Features

- **Design Creation:** Create and manage balloon designs with an intuitive interface
- **Inventory Management:** Track balloon inventory with status indicators (in-stock, low-stock, out-of-stock)
- **Production Tracking:** Monitor the production status of balloon designs
- **Order Management:** Place and track orders for balloons and accessories
- **User Management:** Role-based access control (admin, designer, inventory manager)
- **AI-Powered Analysis:** Analyze designs to determine balloon requirements

## Recent Enhancements - Kid-Friendly Balloon Ordering

We've added a simplified balloon ordering interface designed to be easy enough for a 5th grader to use. This feature:

- **Simplified UI:** Uses kid-friendly language and emoji indicators
- **Direct Ordering:** Allows ordering balloons directly from the inventory check screen
- **Clear Status:** Shows inventory availability with easy-to-understand indicators
- **Streamlined Workflow:** "Order More Balloons" button appears when inventory is insufficient

### How it Works

1. **Check Inventory:** Users can see if balloons are available in their chosen colors and sizes
2. **Order More:** If balloons are unavailable or low in stock, they can click "Order More Balloons" 
3. **Simple Form:** The ordering form uses simple language and requires minimal information
4. **Confirmation:** After ordering, users receive a friendly confirmation message

## API Endpoints

### Auth Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - Logout a user

### Design Routes
- `GET /api/designs` - Get all designs for current user
- `GET /api/designs/:id` - Get a design by ID
- `POST /api/designs` - Create a new design
- `PATCH /api/designs/:id` - Update a design
- `DELETE /api/designs/:id` - Delete a design
- `POST /api/designs/:id/check-inventory` - Check inventory for a design
- `POST /api/designs/:id/create-production` - Create a production request

### Inventory Routes
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:id` - Get an inventory item by ID
- `GET /api/inventory/color/:color` - Get inventory items by color
- `POST /api/inventory` - Create a new inventory item
- `PATCH /api/inventory/:id` - Update an inventory item
- `POST /api/inventory/check-availability` - Check inventory availability

### Accessory Routes
- `GET /api/accessories` - Get all accessories
- `GET /api/accessories/:id` - Get an accessory by ID
- `POST /api/accessories` - Create a new accessory
- `PATCH /api/accessories/:id` - Update an accessory
- `POST /api/accessories/:accessoryId/add-to-design/:designId` - Add an accessory to a design
- `GET /api/accessories/design/:designId` - Get accessories for a design

### Production Routes
- `GET /api/production/design/:designId` - Get all productions for a design
- `GET /api/production/:id` - Get a production by ID
- `POST /api/production` - Create a new production
- `PATCH /api/production/:id` - Update a production
- `PATCH /api/production/:id/complete` - Complete a production

### Order Routes
- `GET /api/orders` - Get all orders
- `GET /api/orders/design/:designId` - Get orders for a design
- `GET /api/orders/:id` - Get an order by ID
- `POST /api/orders` - Create a new order
- `POST /api/orders/:id/items` - Add an item to an order
- `PATCH /api/orders/:id` - Update an order
- `POST /api/orders/balloon` - Create a kid-friendly balloon order (simplified)

### Upload Routes
- `POST /api/upload/design` - Upload a design image
- `POST /api/upload/analyze` - Upload and analyze a design image
- `DELETE /api/upload/:filename` - Delete a file

## Technology Stack

- **Frontend:** React with TypeScript
- **Backend:** Node.js with Express
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Session-based with Passport.js
- **File Upload:** Multer
- **AI Analysis:** OpenAI integration

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up the database with `npm run db:push`
4. Start the application with `npm run dev`

## Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/balloon_designer
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_session_secret
```