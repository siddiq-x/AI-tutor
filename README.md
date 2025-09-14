# 🎓 EduAI Hub - AI-Powered Educational Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7.1.5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.13-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-2.39.0-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</div>

<br />

**EduAI Hub** is a comprehensive AI-powered educational platform that provides intelligent tools for students and educators. Built with modern web technologies, it offers interactive quizzes, AI-powered doubt solving, plagiarism checking, assignment generation, and a personal vault system.

## ✨ Features

### 🧠 **AI-Powered Tools**
- **📝 Quiz Generator** - Dynamic quiz creation with topic-specific questions
- **🤖 AI Doubt Solver** - Contextual Q&A with note integration and subject detection
- **🔍 Plagiarism Checker** - Advanced text similarity analysis
- **📋 Assignment Maker** - Structured academic task generation
- **💾 Personal Vault** - Save and organize AI interactions

### 🎨 **User Experience**
- **🌓 Dark/Light Theme** - Seamless theme switching with persistence
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile
- **⚡ Fast Performance** - Lightning-fast loading with Vite
- **♿ Accessibility** - Built with Radix UI for inclusive design
- **🔔 Smart Notifications** - Toast system for user feedback

## 🚀 Tech Stack

### **Frontend Framework**
- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript 5.5.3** - Type-safe JavaScript for better development experience
- **Vite 7.1.5** - Lightning-fast build tool and development server

### **Styling & UI**
- **Tailwind CSS 3.4.13** - Utility-first CSS framework
- **Radix UI** - Comprehensive accessible component library
- **Lucide React 0.446.0** - Beautiful icon library (500+ icons)
- **next-themes** - Theme management system

### **Backend & Data**
- **Supabase 2.39.0** - Backend-as-a-Service providing:
  - PostgreSQL database
  - Authentication system
  - Real-time subscriptions
  - Row Level Security (RLS)

### **State Management**
- **React Context API** - Global state management
- **React Hook Form 7.53.0** - Performant form handling
- **Zod 3.23.8** - Schema validation for type safety

### **Development Tools**
- **ESLint 9.11.1** - Code linting and style enforcement
- **PostCSS + Autoprefixer** - CSS processing
- **TypeScript** - Static type checking

## 🏗️ Architecture

### **Component Structure**
```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (Shadcn/ui pattern)
│   ├── QuizGenerator.tsx
│   ├── DoubtSolver.tsx
│   ├── PlagiarismChecker.tsx
│   ├── AssignmentMaker.tsx
│   └── Vault.tsx
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/              # Custom hooks
│   └── use-toast.ts
├── lib/                # Utilities and configuration
│   ├── supabase.ts
│   ├── mockAuth.ts
│   └── utils.ts
└── App.tsx             # Main application component
```

### **AI Integration**
- **Mock-First Development** - Realistic AI simulation for offline development
- **Dynamic Response Generation** - Context-aware responses based on user input
- **Subject Detection** - Automatic topic classification (Math, Physics, Chemistry, Biology, History, Literature)
- **Graceful Fallbacks** - Seamless switching between mock and real AI APIs

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js 18+ 
- npm or yarn package manager

### **Quick Start**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eduai-hub.git
   cd eduai-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup** (Optional)
   ```bash
   cp .env.example .env
   # Add your Supabase credentials (optional - works with mocks)
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### **Environment Variables**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

*Note: The app works fully in demo mode without these credentials*

## 📱 Usage

### **Quiz Generator**
1. Navigate to Quiz Generator
2. Enter your desired topic (e.g., "Biology", "Physics", "Math")
3. Click "Generate Quiz" 
4. Answer questions and get instant feedback with explanations

### **AI Doubt Solver**
1. Go to AI Doubt Solver
2. Upload notes or paste study material
3. Ask specific questions about your content
4. Get detailed, subject-specific explanations
5. Save responses to your Vault

### **Plagiarism Checker**
1. Access Plagiarism Checker
2. Paste or upload text content
3. Get similarity analysis with detailed reports
4. Save reports for future reference

### **Personal Vault**
- Automatically saves AI interactions
- Browse by tool type or search content
- Export or delete saved items
- Persistent storage across sessions

## 🔧 Development

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### **Key Development Features**
- **Hot Module Replacement** - Instant updates during development
- **TypeScript Support** - Full type checking and IntelliSense
- **Component Library** - Reusable UI components with Storybook-like patterns
- **Mock API System** - Develop without backend dependencies

## 🎯 Key Technical Decisions

### **Why This Stack?**
- **React + TypeScript** - Type safety and modern development patterns
- **Vite** - Superior performance compared to Create React App
- **Tailwind CSS** - Rapid prototyping with consistent design system
- **Radix UI** - Accessibility-first component primitives
- **Supabase** - Full-stack solution with real-time capabilities

### **Mock-First Approach**
- **Offline Development** - No API dependencies during development
- **Realistic Simulation** - AI responses feel authentic with proper delays
- **Easy Testing** - Predictable mock data for reliable testing
- **Gradual Integration** - Simple migration from mocks to real APIs

## 🚀 Deployment

### **Production Build**
```bash
npm run build
```

### **Deployment Options**
- **Vercel** - Recommended for React apps
- **Netlify** - Great for static deployments
- **GitHub Pages** - Free hosting for public repositories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Radix UI** - For accessible component primitives
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icon library
- **Supabase** - For the backend infrastructure
- **Vite** - For the lightning-fast build tool

---

<div align="center">
  <p>Built with ❤️ for education and learning</p>
  <p>
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#️-installation--setup">Installation</a> •
    <a href="#-usage">Usage</a>
  </p>
</div>
