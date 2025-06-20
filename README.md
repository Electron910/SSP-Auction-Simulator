### `README.md`
# SSP Ad Auction Simulator (TypeScript)

A full-stack Supply Side Platform (SSP) simulator built with TypeScript, featuring real-time WebSocket updates and programmatic advertising auctions with multiple Demand Side Platforms (DSPs).

## 🚀 Features

- **Real-time Ad Auction Engine**: WebSocket-powered live updates
- **TypeScript Implementation**: Full type safety across frontend and backend
- **DSP Management**: Create and manage DSPs with targeting rules
- **Live Analytics Dashboard**: Real-time metrics and performance tracking
- **Ad Request Logging**: Monitor all ad requests with instant updates
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Unit Testing**: Jest test suite for auction logic

## 🛠️ Tech Stack

### Backend
- Node.js with Express.js (TypeScript)
- SQLite database
- WebSocket for real-time updates
- RESTful API architecture
- Jest for testing

### Frontend
- React with TypeScript
- Vite for fast development
- Recharts for data visualization
- WebSocket client for live updates
- Axios for API communication

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ssp-auction-simulator.git
cd ssp-auction-simulator

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## 🚀 Running the Application

### 1. Start the Backend Server (Development)
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:3001` with WebSocket support

### 2. Start the Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:3000`

## 🏗️ Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

## 🧪 Running Tests

```bash
cd backend
npm test
```

## 📱 Using the Application

### Dashboard
- View real-time statistics with live updates
- Monitor DSP performance as it happens
- Send test ad requests and see instant results

### Ad Requests
- Watch new requests appear in real-time
- Filter by status with live counters
- See winning DSPs and bid amounts instantly

### DSP Manager
- Create and edit DSPs with immediate effect
- Configure targeting rules
- Updates reflected across all connected clients

### Analytics
- Live-updating charts and metrics
- Real-time CPM trends
- Instant performance insights

## 🔍 API Endpoints

### POST /ad-request
Create a new ad request and run auction
```typescript
interface AdRequest {
  publisherId: string;
  geo: string;
  device: string;
  userId?: string;
}
```

### GET /admin/ad-requests
Fetch all historical ad requests

### GET /admin/dsps
List all configured DSPs

### GET /admin/analytics
Get real-time analytics summary

### POST /admin/dsps
Create a new DSP

### PUT /admin/dsps/:id
Update existing DSP configuration

## 🌐 WebSocket Events

### Client receives:
- `ad_request`: New ad request processed
- `dsp_update`: DSP created or updated
- `analytics_update`: Analytics data changed

## 🏗️ Architecture

### Real-time Updates
1. All API mutations trigger WebSocket broadcasts
2. Connected clients receive instant updates
3. UI components refresh automatically
4. No polling required for live data

### Type Safety
- Full TypeScript coverage
- Shared type definitions
- Compile-time error checking
- Enhanced IDE support

## 🔐 Security Considerations

- Input validation with TypeScript types
- Parameterized database queries
- CORS configuration for production
- WebSocket connection security

## 🚢 Deployment

### Backend Deployment (Heroku/Render)
1. Set up environment variables
2. Configure WebSocket support
3. Deploy using Git integration

### Frontend Deployment (Vercel/Netlify)
1. Build the production bundle
2. Configure API proxy
3. Set WebSocket endpoint

## 📝 Type Definitions

The project includes comprehensive TypeScript definitions for:
- API requests and responses
- Database models
- WebSocket messages
- UI component props
- Service interfaces

## 🔄 Real-time Features

- Live ad request notifications
- Instant DSP performance updates
- Real-time analytics refresh
- Synchronized multi-client updates
- Connection status indicators

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

Your Name - [Neelisetty Dhanush](neelisettydhanush456@gmail.com)

Project Link: [https://github.com/yourusername/ssp-auction-simulator](https://github.com/yourusername/ssp-auction-simulator)

## Key Improvements in the TypeScript Version:

1. **Full Type Safety**: Every function, API call, and component is fully typed
2. **Real-time WebSocket Updates**: No more polling - instant updates across all connected clients
3. **Better Developer Experience**: IDE autocomplete, compile-time error checking
4. **Shared Type Definitions**: Frontend and backend share the same type definitions
5. **Unit Testing**: Jest tests for core auction logic
6. **Production Ready**: Build scripts for optimized production deployment
7. **Live Notifications**: Visual feedback for real-time events
8. **Connection Management**: Automatic WebSocket reconnection
9. **Type-safe API Client**: Axios with full TypeScript support
10. **Modern React Patterns**: Using hooks and functional components with TypeScript

The application now provides a truly real-time experience with WebSocket updates, making it feel much more professional and responsive. All data updates are instantly reflected across all connected clients without any manual refresh needed.
