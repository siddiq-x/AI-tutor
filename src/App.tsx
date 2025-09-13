import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileButton } from '@/components/ProfileButton';
import { StudentBadge } from '@/components/StudentBadge';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/components/LandingPage';
import { Login } from '@/components/Login';
import { DoubtSolver } from '@/components/DoubtSolver';
import { Humanizer } from '@/components/Humanizer';
import { PlagiarismChecker } from '@/components/PlagiarismChecker';
import { QuizGenerator } from '@/components/QuizGenerator';
import { AssignmentMaker } from '@/components/AssignmentMaker';
import { Vault } from '@/components/Vault';
import { DashboardSkeleton, LoadingStateWrapper } from '@/components/LoadingSkeleton';
import { 
  Bot, 
  Target, 
  FileEdit, 
  UserCheck, 
  Search, 
  Archive,
  ArrowLeft,
  Home,
  Sparkles
} from 'lucide-react';
import './App.css';

type Page = 'landing' | 'login' | 'dashboard' | 'doubt-solver' | 'quiz-generator' | 'assignment-maker' | 'humanizer' | 'plagiarism-checker' | 'vault';

interface FeatureCard {
  id: Page;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  darkColor: string;
  gradient: string;
  darkGradient: string;
}

const features: FeatureCard[] = [
  {
    id: 'doubt-solver',
    title: 'AI Doubt Solver',
    description: 'Ask your doubts and get answers instantly with AI assistance.',
    icon: <Bot className="w-8 h-8" />,
    color: 'text-blue-600',
    darkColor: 'dark:text-blue-400',
    gradient: 'from-blue-500 to-blue-600',
    darkGradient: 'dark:from-blue-600 dark:to-blue-700'
  },
  {
    id: 'quiz-generator',
    title: 'Quiz Generator',
    description: 'Generate custom quizzes on any topic to test your knowledge.',
    icon: <Target className="w-8 h-8" />,
    color: 'text-green-600',
    darkColor: 'dark:text-green-400',
    gradient: 'from-green-500 to-green-600',
    darkGradient: 'dark:from-green-600 dark:to-green-700'
  },
  {
    id: 'assignment-maker',
    title: 'Assignment Maker',
    description: 'Create structured assignments and projects with AI guidance.',
    icon: <FileEdit className="w-8 h-8" />,
    color: 'text-purple-600',
    darkColor: 'dark:text-purple-400',
    gradient: 'from-purple-500 to-purple-600',
    darkGradient: 'dark:from-purple-600 dark:to-purple-700'
  },
  {
    id: 'humanizer',
    title: 'Humanizer',
    description: 'Transform AI-generated content to sound more natural and human-like.',
    icon: <UserCheck className="w-8 h-8" />,
    color: 'text-orange-600',
    darkColor: 'dark:text-orange-400',
    gradient: 'from-orange-500 to-orange-600',
    darkGradient: 'dark:from-orange-600 dark:to-orange-700'
  },
  {
    id: 'plagiarism-checker',
    title: 'Plagiarism Checker',
    description: 'Check your content for originality and avoid plagiarism issues.',
    icon: <Search className="w-8 h-8" />,
    color: 'text-red-600',
    darkColor: 'dark:text-red-400',
    gradient: 'from-red-500 to-red-600',
    darkGradient: 'dark:from-red-600 dark:to-red-700'
  },
  {
    id: 'vault',
    title: 'Vault',
    description: 'Save and organize your favorite AI-generated content and responses.',
    icon: <Archive className="w-8 h-8" />,
    color: 'text-indigo-600',
    darkColor: 'dark:text-indigo-400',
    gradient: 'from-indigo-500 to-indigo-600',
    darkGradient: 'dark:from-indigo-600 dark:to-indigo-700'
  }
];

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const { user } = useAuth();

  useEffect(() => {
    if (!user && currentPage !== 'landing' && currentPage !== 'login') {
      setCurrentPage('landing');
    }
  }, [user, currentPage]);

  const handleLandingToDashboard = () => setCurrentPage('dashboard');
  const handleLandingToLogin = () => setCurrentPage('login');
  const handleLoginBack = () => setCurrentPage('landing');
  const handleLoginSuccess = () => setCurrentPage('dashboard');
  const handleBack = () => setCurrentPage('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onGetStarted={handleLandingToDashboard} onLogin={handleLandingToLogin} />;
      case 'login':
        return <Login onBack={handleLoginBack} onSuccess={handleLoginSuccess} />;
      case 'dashboard':
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-all duration-500">
            {/* Fixed Header */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                  {/* Profile Button - Top Left */}
                  <ProfileButton />
                  
                  {/* Student Badge - Center */}
                  <div className="hidden sm:block">
                    <StudentBadge size="sm" />
                  </div>
                  
                  {/* Theme Toggle and Logout - Top Right */}
                  <ThemeToggle />
                </div>
              </div>
            </div>

            {/* Main Content with top padding to account for fixed header */}
            <div className="w-full px-4 py-8 pt-20 sm:pt-24">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                    EduAI Hub
                  </h1>
                </div>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed transition-colors">
                  Your complete AI-powered educational toolkit. From solving doubts to checking plagiarism, 
                  we've got everything you need for academic success.
                </p>
              </div>

              {/* Student Badge for mobile - Below header */}
              <div className="sm:hidden flex justify-center mb-8">
                <StudentBadge size="lg" />
              </div>

              {/* Features Grid */}
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {features.map((feature) => (
                    <Card 
                      key={feature.id}
                      className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] cursor-pointer"
                      onClick={() => setCurrentPage(feature.id)}
                    >
                      <CardHeader className="pb-4">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.gradient} dark:${feature.darkGradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <div className="text-white">
                            {feature.icon}
                          </div>
                        </div>
                        <CardTitle className={`text-xl font-bold ${feature.color} dark:${feature.darkColor} group-hover:text-opacity-80 transition-colors`}>
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'doubt-solver':
        return <DoubtSolver onBack={handleBack} />;
      case 'quiz-generator':
        return <QuizGenerator onBack={handleBack} />;
      case 'assignment-maker':
        return <AssignmentMaker onBack={handleBack} />;
      case 'humanizer':
        return <Humanizer onBack={handleBack} />;
      case 'plagiarism-checker':
        return <PlagiarismChecker onBack={handleBack} />;
      case 'vault':
        return <Vault onBack={handleBack} />;
      default:
        return <LandingPage onGetStarted={handleLandingToDashboard} onLogin={handleLandingToLogin} />;
    }
  };

  return renderPage();
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
