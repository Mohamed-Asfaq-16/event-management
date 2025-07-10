# Event Management System

A full-stack web application for managing and discovering events with admin and user roles.

## Features

### Admin Features
- Create and manage events
- View event history
- Delete events
- Admin-only access control

### User Features
- View all available events
- Register for events via external links
- User-friendly interface

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access control

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- Modern CSS with responsive design

## Project Structure

```
event-management-app/
├── server.js              # Express server
├── package.json           # Backend dependencies
├── .env                   # Environment variables
├── client/                # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── UserDashboard.js
│   │   │   └── ComposeEvent.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/event-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

3. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

## Usage

### Admin Workflow
1. Register a new account
2. Login with admin credentials
3. Access admin dashboard
4. Create new events with title, poster, description, and registration link
5. View and manage posted events
6. Delete events if needed

### User Workflow
1. Register a new account
2. Login with user credentials
3. Browse available events
4. Click "Register Now" to access external registration forms

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile

### Events (Admin)
- `POST /api/events` - Create new event
- `GET /api/admin/events` - Get admin's events
- `DELETE /api/events/:id` - Delete event

### Events (Public)
- `GET /api/events` - Get all events

## Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['admin', 'user']),
  createdAt: Date
}
```

### Event Schema
```javascript
{
  title: String,
  poster: String,
  description: String,
  registrationLink: String,
  createdBy: ObjectId (ref: User),
  createdAt: Date
}
```

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Input validation and sanitization
- Role-based access control
- CORS configuration

## Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to Heroku, Vercel, or similar platform

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to Netlify, Vercel, or similar platform
3. Update API base URL in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for educational or commercial purposes.

## Support

For support or questions, please open an issue in the repository. 