# 🦷 Workflow Tracker

A comprehensive **mobile web application** for tracking progress on dental practice tasks and stages with **cloud-powered multi-user functionality**.

![Workflow Tracker](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎯 **Core Functionality**
- **Stage-based Task Management** - 4 progressive stages with 17 specialized dental practice tasks
- **Smart Progress Tracking** - Real-time completion monitoring with visual feedback
- **Celebration System** - Reward modals and animations for stage completions
- **PDF Export** - Monthly progress reports with "Save & Refresh" functionality
- **Mobile-First Design** - Optimized for touch interfaces and mobile workflows

### 🔐 **Authentication & Security**
- **Secure Login System** - Username/password protection with session management
- **Multi-User Support** - Predefined accounts for staff and admin access
- **Role-Based Access** - Admin dashboard for monitoring all users' progress
- **24-Hour Sessions** - Automatic token expiration for security

### ☁️ **Cloud Integration**
- **Supabase Backend** - Enterprise-grade database and authentication
- **Real-Time Sync** - Automatic progress saving and cross-device synchronization
- **Local Fallback** - Works offline with localStorage backup
- **Admin Monitoring** - Complete oversight of all user progress

### 🎨 **Professional Design**
- **Medical Theme** - Clean, professional interface with tooth icon branding
- **Glassmorphism UI** - Modern card-based design with subtle animations
- **3-Color Palette** - Blue, grey, purple with green completion states
- **Responsive Layout** - Seamless experience across all device sizes

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Supabase account** (for cloud functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/workflow-tracker.git
   cd workflow-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase** (optional - works with local storage fallback)
   - Create a new Supabase project
   - Update `/utils/supabase/info.tsx` with your project details
   - Deploy the edge functions:
     ```bash
     supabase functions deploy server --project-ref your-project-id
     ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔑 Default Accounts

The application comes with two predefined accounts:

### 👩‍⚕️ **User Account**
- **Username:** `dr.aditi`
- **Password:** `spidey&maguna`
- **Access:** Full task management and progress tracking

### 🛡️ **Admin Account**
- **Username:** `admin`
- **Password:** `primum-non-nocere`
- **Access:** Admin dashboard with all users' progress monitoring

## 📋 Task Structure

### **17 Specialized Dental Practice Tasks:**

| Task | Stage 1 | Stage 2 | Stage 3 | Stage 4 |
|------|---------|---------|---------|---------|
| New OPD | 13 items | 3 items | 3 items | - |
| Old OPD | 10 items | 4 items | 3 items | 1 item |
| Scaling | 6 items | 3 items | - | - |
| Composites | 6 items | 4 items | - | - |
| RCT | 6 items | 4 items | 1 item | - |
| Crown | 6 items | 3 items | 1 item | - |
| Surgical 8 | 3 items | 2 items | - | - |
| Non-Surgical 8 | 3 items | 1 item | - | - |
| Routine Extraction | 6 items | 2 items | - | - |
| Single Implant | 2 items | 2 items | 1 item | 1 item |
| Denture | 1 item | 1 item | 1 item | 1 item |
| RPD | 1 item | 2 items | - | - |
| Smile Designing | 1 item | 2 items | 2 items | 1 item |
| Orthodontics | 1 item | 1 item | 2 items | 1 item |
| Invisalign | - | 1 item | 2 items | 1 item |
| FMR | - | - | 1 item | 1 item |
| All-on-4 Implants | - | - | 1 item | 1 item |

### **Stage Progression Rules:**
- Users must complete **all tasks** in a stage before advancing
- Stage tabs unlock progressively
- Celebration modals trigger on stage completion
- Special reward modal for Stage 2 completion

## 🏗️ Architecture

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS 4.0** for styling
- **Motion** for smooth animations
- **ShadCN/UI** component library

### **Backend**
- **Supabase Edge Functions** with Hono web framework
- **PostgreSQL** database with KV store abstraction
- **Authentication** with session-based tokens
- **Real-time sync** with automatic fallback

### **Key Components**
```
├── App.tsx                    # Main application logic
├── components/
│   ├── Dashboard.tsx          # Progress visualization
│   ├── Checklist.tsx          # Task management interface
│   ├── Login.tsx              # Authentication component
│   ├── AdminDashboard.tsx     # Admin monitoring panel
│   └── ui/                    # ShadCN component library
├── supabase/functions/server/ # Backend API endpoints
└── utils/supabase/            # API client and configuration
```

## 📱 Deployment

### **Vercel** (Recommended)
```bash
npm run build
vercel --prod
```

### **Netlify**
```bash
npm run build
netlify deploy --prod --dir=dist
```

### **Supabase Edge Functions**
```bash
supabase functions deploy server --project-ref your-project-id
```

## 🔧 Development

### **Available Scripts**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### **Environment Variables**
```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏥 About

**Workflow Tracker** is designed specifically for dental practice management, providing a comprehensive solution for tracking progress across multiple stages of dental procedures and administrative tasks. The application emphasizes:

- **Patient Care Excellence** through structured workflow management
- **Team Collaboration** with multi-user progress tracking
- **Professional Development** through systematic skill progression
- **Practice Efficiency** with real-time monitoring and reporting

## 📞 Support

For support, email support@workflowtracker.com or create an issue in this repository.

---

**Built with ❤️ for dental professionals worldwide** 🦷✨