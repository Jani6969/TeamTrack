const express = require('express');
const cors = require('cors');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const reportRouter = require('./routes/reportRoutes');
const { managerReportRouter } = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Middleware imports
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Enable Cross-Origin Resource Sharing (CORS) for frontend
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl/Postman) or any localhost port
      if (!origin || origin.startsWith('http://localhost:') || origin === process.env.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Weekly Report Generator & Team Dashboard API is running healthy'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/reports', reportRouter);
app.use('/api/manager/reports', managerReportRouter);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Catch-all 404 handler for undefined endpoints
app.use(notFound);

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
