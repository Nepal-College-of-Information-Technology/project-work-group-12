# TableTap Backend API

A comprehensive restaurant management system backend built with Node.js, Express, MongoDB, and Socket.IO.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Real-time Communication**: Socket.IO for live updates and notifications
- **Order Management**: Complete order lifecycle from placement to completion
- **Menu Management**: Dynamic menu with availability tracking
- **Table Management**: QR code generation and table status tracking
- **Analytics**: Comprehensive sales and performance analytics
- **Notifications**: Real-time notification system for all roles

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Validation**: Joi
- **QR Codes**: qrcode library
- **Security**: Helmet, CORS, Rate Limiting

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update environment variables in `.env`

5. Seed the database:
   ```bash
   npm run seed
   ```

6. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Menu Management
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get single menu item
- `POST /api/menu` - Create menu item (Admin)
- `PUT /api/menu/:id` - Update menu item (Admin)
- `DELETE /api/menu/:id` - Delete menu item (Admin)
- `PATCH /api/menu/:id/availability` - Toggle availability (Admin/Chef)

### Order Management
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (Staff)
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (Staff)
- `DELETE /api/orders/:id` - Cancel order

### Table Management
- `GET /api/tables` - Get all tables (Staff)
- `GET /api/tables/:id` - Get single table
- `GET /api/tables/qr/:qrCode` - Get table by QR code
- `POST /api/tables` - Create table (Admin)
- `PUT /api/tables/:id` - Update table (Admin)
- `PATCH /api/tables/:id/status` - Update table status (Staff)

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification (Staff)
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `POST /api/notifications/custom` - Send custom notification

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics (Admin)
- `GET /api/analytics/sales` - Sales analytics (Admin)
- `GET /api/analytics/menu-performance` - Menu performance (Admin)
- `GET /api/analytics/customers` - Customer analytics (Admin)

### QR Codes
- `POST /api/qr/generate/:tableId` - Generate QR code (Admin)
- `GET /api/qr/:tableId` - Get QR code (Staff)
- `GET /api/qr/validate/:qrCode` - Validate QR code
- `POST /api/qr/generate-bulk` - Generate bulk QR codes (Admin)

## Socket.IO Events

### Client to Server
- `join_table` - Customer joins table
- `order_update` - Order status update
- `service_request` - Customer service request
- `chef_update` - Chef notifications
- `waiter_update` - Waiter notifications
- `admin_broadcast` - Admin messages

### Server to Client
- `new_order` - New order notification
- `order_status_update` - Order status change
- `order_confirmed` - Order confirmed
- `order_ready` - Order ready for pickup
- `customer_seated` - Customer seated notification
- `service_request` - Service request notification

## User Roles

### Admin
- Full system access
- Analytics and reporting
- User and menu management
- Table configuration

### Waiter
- Order management
- Table status updates
- Customer service
- Notifications

### Chef
- Order preparation
- Menu availability
- Kitchen notifications
- Time estimation

### Customer
- Menu browsing
- Order placement
- Real-time tracking
- Service requests

## Security Features

- JWT authentication
- Role-based authorization
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers
- Password hashing

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests

### Database Models
- **User**: Authentication and user management
- **MenuItem**: Menu items with customizations
- **Order**: Order management and tracking
- **Table**: Table configuration and QR codes
- **Notification**: Real-time notifications

## Environment Variables

```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/tabletap
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
RESTAURANT_WIFI_SSID=TableTap_Premium
RESTAURANT_WIFI_PASSWORD=Welcome2024
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - see LICENSE file for details