# Workflow Tracker

A mobile web application for tracking progress on dental practice tasks and stages with Supabase backend integration.

## Features

- **Mobile-first Design**: Optimized for mobile devices with responsive layout
- **Task Management**: Organize dental practice tasks across 4 progressive stages
- **Progress Tracking**: Visual progress indicators and analytics
- **Multi-user Support**: Individual user accounts with secure authentication
- **PDF Export**: Generate comprehensive progress reports
- **Real-time Sync**: Supabase backend integration with local fallback
- **Insights Dashboard**: Analytics and personalized recommendations

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4
- **Backend**: Supabase (Edge Functions, Database, Auth)
- **Deployment**: Vercel
- **Charts**: Recharts
- **PDF Generation**: jsPDF + html2canvas
- **Icons**: Lucide React

## Deployment on Vercel

### Prerequisites

1. **Vercel Account**: Create an account at [vercel.com](https://vercel.com)
2. **Supabase Project**: Set up your Supabase project
3. **Environment Variables**: Configure the required environment variables

### Environment Variables

Set these environment variables in your Vercel dashboard:

```bash
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional App Configuration
VITE_APP_NAME="Workflow Tracker"
VITE_APP_VERSION="1.0.0"
NODE_ENV=production
```

### Deploy Steps

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd workflow-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build locally to test**:
   ```bash
   npm run build
   npm run preview
   ```

4. **Deploy to Vercel**:
   
   **Option A: Using Vercel CLI**
   ```bash
   npm install -g vercel
   vercel
   ```
   
   **Option B: Using Vercel Dashboard**
   - Connect your GitHub repository
   - Set environment variables
   - Deploy automatically

5. **Configure Supabase**:
   - Update your Supabase project settings
   - Add your Vercel domain to allowed origins
   - Ensure edge functions are deployed

### Build Configuration

The application includes:
- **Optimized build** with code splitting and tree shaking
- **PWA support** with service worker and manifest
- **Error boundaries** for production resilience
- **Fallback modes** for offline functionality

### Troubleshooting

#### Common Deployment Issues

1. **Build Failures**:
   ```bash
   # Clear cache and reinstall
   npm run clean
   npm install
   ```

2. **Environment Variables Not Working**:
   - Ensure variables start with `VITE_` prefix
   - Rebuild after adding new environment variables
   - Check Vercel environment variable configuration

3. **Supabase Connection Issues**:
   - Verify project ID and anon key
   - Check Supabase edge function deployment
   - Review CORS settings in Supabase

4. **Asset Loading Issues**:
   - All assets are now embedded as SVG components
   - No external asset dependencies

#### Performance Optimization

1. **Lighthouse Score**: The app is optimized for high Lighthouse scores
2. **Code Splitting**: Automatic vendor and utility code splitting
3. **Caching**: Proper cache headers for static assets
4. **Minification**: CSS and JS are minified in production

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

- **Frontend**: Single Page Application (SPA) with React Router
- **State Management**: React hooks and local state
- **Authentication**: Supabase Auth with session management
- **Data Storage**: Supabase PostgreSQL with real-time subscriptions
- **Offline Support**: Local storage fallback for offline functionality

## Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is licensed under the MIT License - see the LICENSE file for details.