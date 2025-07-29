# Workflow Tracker

A comprehensive mobile web application for tracking progress on dental practice tasks and stages with cloud-powered multi-user functionality.

## Features

- 📱 **Mobile-First Design**: Optimized for mobile devices with responsive design
- 📊 **Progress Tracking**: Visual dashboard with completion percentages
- ✅ **Task Management**: 17 dental practice tasks across 4 stages
- 🎉 **Celebration Modals**: Rewarding animations for milestone completion
- 📄 **PDF Export**: Generate and download progress reports
- 👥 **Multi-User Support**: Secure authentication with admin dashboard
- ☁️ **Cloud Backend**: Powered by Supabase for real-time data sync
- 🎨 **Professional Design**: Clean interface with medical theme

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd workflow-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   If you encounter issues with npm install, try:
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and package-lock.json
   rm -rf node_modules package-lock.json
   
   # Reinstall dependencies
   npm install
   ```

3. **Set up environment variables**
   - Copy the Supabase environment variables to your system
   - The app uses the following secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The app will automatically open in mobile view (max-width: 448px)

### Default User Accounts

- **Regular User**: 
  - Username: `dr.aditi`
  - Password: `spidey&maguna`

- **Admin User**:
  - Username: `admin` 
  - Password: `primum-non-nocere`

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Deployment

The app is configured for deployment on multiple platforms:

### Vercel (Recommended)
```bash
# Deploy with Vercel CLI
npx vercel --prod
```

### Netlify
```bash
# Build and deploy
npm run build
# Upload the dist/ folder to Netlify
```

### Manual Deployment
1. Run `npm run build`
2. Upload the `dist/` folder to your hosting provider
3. Configure your hosting to serve `index.html` for all routes

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Build Tool**: Vite
- **Animations**: Motion/React (formerly Framer Motion)
- **PDF Generation**: jsPDF + html2canvas
- **Icons**: Lucide React

## Project Structure

```
workflow-tracker/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── constants/       # Task data and constants
│   └── utils/           # Component utilities
├── supabase/functions/  # Supabase Edge Functions
├── utils/supabase/      # Supabase client configuration
├── styles/              # Global CSS and Tailwind config
└── App.tsx             # Main application component
```

## Key Features Explained

### Task Management
- 17 predefined dental practice tasks
- 4 progressive stages per task
- Stage locking mechanism (must complete previous stage)
- Real-time progress tracking

### Authentication System
- Secure login with predefined accounts
- Session management with automatic refresh
- Admin dashboard for user oversight
- Cloud-based user data storage

### Progress Export
- **Save & Refresh**: Exports PDF report and resets all progress
- **Refresh**: Resets progress without export
- Comprehensive monthly progress reports
- Professional PDF formatting

### Design System
- Blue, grey, and purple color palette
- Green reserved for completion states
- Glassmorphism UI elements
- Professional medical theme

## Troubleshooting

### Common Issues

1. **npm install fails**
   ```bash
   # Clear cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Build errors**
   ```bash
   # Check TypeScript errors
   npm run lint
   
   # Clean build
   rm -rf dist
   npm run build
   ```

3. **Supabase connection issues**
   - Verify environment variables are set correctly
   - Check Supabase project status
   - Ensure Edge Functions are deployed

4. **PDF export not working**
   - Ensure html2canvas and jsPDF are properly installed
   - Check browser console for errors
   - Try refreshing the page

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Ensure all dependencies are properly installed
4. Verify Supabase configuration

## License

This project is licensed under the MIT License - see the LICENSE file for details.