import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Dashboard Feature Card Skeleton
export function FeatureCardSkeleton() {
  return (
    <Card className="group cursor-pointer transition-all duration-300 border-0 bg-white dark:bg-zinc-900 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4">
        <div className="inline-flex p-4 rounded-2xl bg-gray-100 dark:bg-zinc-800 mb-4">
          <Skeleton className="w-8 h-8" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4" />
        <div className="flex items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="w-4 h-4 ml-2" />
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard Grid Skeleton
export function DashboardSkeleton() {
  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-black transition-colors duration-300 overflow-x-hidden box-border">
      <div className="w-full px-4 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <Skeleton className="h-12 w-64" />
          </div>
          <Skeleton className="h-6 w-96 mx-auto mb-2" />
          <Skeleton className="h-6 w-80 mx-auto" />
        </div>

        {/* Feature Cards Grid Skeleton */}
        <div className="w-full mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {Array.from({ length: 6 }).map((_, index) => (
              <FeatureCardSkeleton key={index} />
            ))}
          </div>
        </div>

        {/* Stats Section Skeleton */}
        <div className="w-full mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="text-center p-6 bg-white dark:bg-zinc-900 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-zinc-700/20">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Quiz Question Skeleton
export function QuizQuestionSkeleton() {
  return (
    <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors">
      <CardHeader>
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-4/5" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="p-4 rounded-lg border-2 border-gray-200 dark:border-zinc-700">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-4 h-4 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          </div>
        ))}
        <Skeleton className="h-12 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

// Form Input Skeleton
export function FormInputSkeleton({ rows = 1 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className={`w-full rounded-lg ${rows > 1 ? `h-${Math.min(rows * 6, 48)}` : 'h-10'}`} />
    </div>
  );
}

// Content Card Skeleton
export function ContentCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-5 h-5" />
          <Skeleton className="h-6 w-48" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

// Message/Chat Skeleton
export function MessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`p-4 rounded-xl ${isUser ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-zinc-800'}`}>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        {!isUser && (
          <div className="flex gap-2 shrink-0">
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="w-8 h-8 rounded" />
          </div>
        )}
      </div>
    </div>
  );
}

// Assignment Content Skeleton
export function AssignmentContentSkeleton() {
  return (
    <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-20 h-8 rounded" />
            <Skeleton className="w-16 h-8 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title Section */}
        <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="w-8 h-8 rounded" />
          </div>
          <Skeleton className="h-4 w-full" />
        </div>

        {/* Vision Section */}
        <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="w-8 h-8 rounded" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* Mission Section */}
        <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="w-8 h-8 rounded" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Key Points Section */}
        <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="w-8 h-8 rounded" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-start gap-2">
                <Skeleton className="w-2 h-2 rounded-full mt-2" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Conclusion Section */}
        <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="w-8 h-8 rounded" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}

// Progress/Results Skeleton
export function ResultsSkeleton() {
  return (
    <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-6 w-40" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Result Display */}
        <div className="p-6 rounded-xl border-2 border-gray-200 dark:border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-5" />
              <div>
                <Skeleton className="h-8 w-24 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-12 w-16" />
          </div>
          <Skeleton className="h-3 w-full mb-4" />
          <div className="grid grid-cols-3 gap-4 text-center">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <Skeleton className="h-4 w-12 mx-auto mb-1" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded" />
          <Skeleton className="h-10 flex-1 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

// Loading State Component with Error Handling
export function LoadingStateWrapper({ 
  isLoading, 
  error, 
  children, 
  skeleton,
  onRetry 
}: {
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
  skeleton: React.ReactNode;
  onRetry?: () => void;
}) {
  if (error) {
    return (
      <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex p-4 bg-red-100 dark:bg-red-900/20 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Something went wrong
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            {error || 'An unexpected error occurred. Please try again.'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
            >
              Try Again
            </button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <>{skeleton}</>;
  }

  return <>{children}</>;
}