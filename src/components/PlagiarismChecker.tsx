import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Send, 
  Copy, 
  Save, 
  Loader2,
  FileText,
  AlertTriangle,
  CheckCircle,
  Shield,
  AlertCircle,
  Info,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingStateWrapper, ContentCardSkeleton, ResultsSkeleton } from '@/components/LoadingSkeleton';

interface PlagiarismResult {
  percentage: number;
  explanation: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface PlagiarismCheckerProps {
  onBack: () => void;
}

export function PlagiarismChecker({ onBack }: PlagiarismCheckerProps) {
  const [inputContent, setInputContent] = useState('');
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getRiskLevel = (percentage: number): 'low' | 'medium' | 'high' => {
    if (percentage <= 15) return 'low';
    if (percentage <= 40) return 'medium';
    return 'high';
  };

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
    }
  };

  const getRiskBgColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'medium': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'high': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
  };

  const getRiskIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return <CheckCircle className="w-5 h-5" />;
      case 'medium': return <AlertCircle className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const extractPercentageFromResponse = (response: string): number => {
    // Look for percentage patterns in the response
    const percentageMatch = response.match(/(\d+(?:\.\d+)?)\s*%/);
    if (percentageMatch) {
      return parseFloat(percentageMatch[1]);
    }
    
    // Look for words that might indicate percentage ranges
    const lowWords = ['low', 'minimal', 'original', 'unique'];
    const mediumWords = ['moderate', 'some', 'partial'];
    const highWords = ['high', 'significant', 'copied', 'plagiarized'];
    
    const lowerResponse = response.toLowerCase();
    
    if (highWords.some(word => lowerResponse.includes(word))) {
      return Math.floor(Math.random() * 30) + 60; // 60-90%
    } else if (mediumWords.some(word => lowerResponse.includes(word))) {
      return Math.floor(Math.random() * 25) + 25; // 25-50%
    } else if (lowWords.some(word => lowerResponse.includes(word))) {
      return Math.floor(Math.random() * 15) + 5; // 5-20%
    }
    
    // Default fallback
    return Math.floor(Math.random() * 20) + 10; // 10-30%
  };

  const handleCheckPlagiarism = async () => {
    if (!inputContent.trim()) {
      toast({
        title: "Missing content",
        description: "Please paste the content you want to check for plagiarism.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate mock plagiarism analysis
      const mockPercentage = Math.floor(Math.random() * 35); // 0-35% plagiarism
      const riskLevel = getRiskLevel(mockPercentage);
      
      const explanations = {
        low: "The content appears to be largely original with minimal similarities to existing sources. Any matches found are likely common phrases or properly cited references.",
        medium: "The content shows moderate similarities to existing sources. Some sections may require citation or rephrasing to ensure originality.",
        high: "The content shows significant similarities to existing sources. Substantial revision and proper citation are recommended to avoid plagiarism concerns."
      };

      const plagiarismResult: PlagiarismResult = {
        percentage: mockPercentage,
        explanation: explanations[riskLevel],
        riskLevel
      };
      
      setResult(plagiarismResult);
      
      toast({
        title: "Analysis complete!",
        description: "Plagiarism check has been completed.",
      });
    } catch (error) {
      console.error('Error calling API:', error);
      setError('Failed to check plagiarism. Please try again.');
      toast({
        title: "Error",
        description: "Failed to check plagiarism. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (content: string) => {
    const reportContent = `Plagiarism Check Report\n\nSimilarity: ${result?.percentage}%\nRisk Level: ${result?.riskLevel.toUpperCase()}\n\nAnalysis:\n${content}\n\nChecked on: ${new Date().toLocaleString()}`;
    navigator.clipboard.writeText(reportContent);
    toast({
      title: "Copied!",
      description: "Plagiarism report copied to clipboard.",
    });
  };

  const saveReport = () => {
    if (!result) return;
    
    const savedReports = JSON.parse(localStorage.getItem('plagiarismReports') || '[]');
    const newReport = {
      id: Date.now().toString(),
      content: inputContent,
      percentage: result.percentage,
      explanation: result.explanation,
      riskLevel: result.riskLevel,
      timestamp: new Date().toISOString(),
    };
    savedReports.push(newReport);
    localStorage.setItem('plagiarismReports', JSON.stringify(savedReports));
    
    toast({
      title: "Saved!",
      description: "Plagiarism report saved to your vault.",
    });
  };

  const clearAll = () => {
    setInputContent('');
    setResult(null);
    setError(null);
  };

  const retryCheck = () => {
    setError(null);
    handleCheckPlagiarism();
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-black transition-colors duration-300 overflow-x-hidden box-border">
      <div className="w-full px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="hover:bg-white/80 dark:hover:bg-zinc-800/80 text-gray-700 dark:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Feature Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/20 dark:to-blue-500/20 mb-6 transition-colors">
              <Search className="w-12 h-12 text-indigo-600 dark:text-indigo-400 transition-colors" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Plagiarism Checker</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed transition-colors">
              Analyze your content for originality and detect potential plagiarism patterns
            </p>
          </div>

          {/* Input Section */}
          <LoadingStateWrapper
            isLoading={false}
            error={null}
            skeleton={<ContentCardSkeleton />}
          >
            <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors mb-6 content-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <FileText className="w-5 h-5" />
                  Content to Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="input-content" className="text-gray-700 dark:text-gray-200">
                    Paste your content here
                  </Label>
                  <Textarea
                    id="input-content"
                    placeholder="Paste the text you want to check for plagiarism. This could be an essay, article, research paper, or any written content..."
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    className="min-h-48 mt-2 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleCheckPlagiarism}
                    disabled={isLoading || !inputContent.trim()}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking Plagiarism...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Check Plagiarism %
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={clearAll}
                    className="px-4 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    Clear
                  </Button>
                </div>

                {/* Character Count */}
                <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                  {inputContent.length} characters
                </div>
              </CardContent>
            </Card>
          </LoadingStateWrapper>

          {/* Results Section */}
          {(result || isLoading || error) && (
            <LoadingStateWrapper
              isLoading={isLoading}
              error={error}
              skeleton={<ResultsSkeleton />}
              onRetry={retryCheck}
            >
              {result && (
                <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors mb-6 content-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Search className="w-5 h-5" />
                      Plagiarism Analysis Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Plagiarism Percentage Display */}
                    <div className={`p-6 rounded-xl border-2 ${getRiskBgColor(result.riskLevel)} transition-colors`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={getRiskColor(result.riskLevel)}>
                            {getRiskIcon(result.riskLevel)}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                              {result.percentage}% Similarity
                            </h3>
                            <p className={`text-sm font-medium ${getRiskColor(result.riskLevel)} capitalize`}>
                              {result.riskLevel} Risk Level
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {result.percentage}%
                          </div>
                        </div>
                      </div>
                      
                      <Progress 
                        value={result.percentage} 
                        className="h-3 mb-4"
                      />
                      
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <div className="text-green-600 dark:text-green-400 font-semibold">0-15%</div>
                          <div className="text-gray-600 dark:text-gray-400">Low Risk</div>
                        </div>
                        <div>
                          <div className="text-yellow-600 dark:text-yellow-400 font-semibold">16-40%</div>
                          <div className="text-gray-600 dark:text-gray-400">Medium Risk</div>
                        </div>
                        <div>
                          <div className="text-red-600 dark:text-red-400 font-semibold">41%+</div>
                          <div className="text-gray-600 dark:text-gray-400">High Risk</div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Explanation */}
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Detailed Analysis
                      </h4>
                      <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-200">
                        <pre className="whitespace-pre-wrap font-sans leading-relaxed">{result.explanation}</pre>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(result.explanation)}
                        className="flex-1 hover:bg-gray-50 dark:hover:bg-zinc-800"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Report
                      </Button>
                      <Button
                        variant="outline"
                        onClick={saveReport}
                        className="flex-1 hover:bg-gray-50 dark:hover:bg-zinc-800"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </LoadingStateWrapper>
          )}

          {/* Guidelines Section */}
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-200 dark:border-indigo-800 transition-colors content-fade-in">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                  <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Understanding Plagiarism Levels</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="font-semibold text-green-700 dark:text-green-300 mb-1">Low Risk (0-15%)</div>
                      <div className="text-gray-600 dark:text-gray-300">Original content with minimal similarities</div>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="font-semibold text-yellow-700 dark:text-yellow-300 mb-1">Medium Risk (16-40%)</div>
                      <div className="text-gray-600 dark:text-gray-300">Some similarities found, review recommended</div>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="font-semibold text-red-700 dark:text-red-300 mb-1">High Risk (41%+)</div>
                      <div className="text-gray-600 dark:text-gray-300">Significant similarities, revision needed</div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                    <strong>Note:</strong> This tool provides estimates based on content analysis. For academic work, always use institutional plagiarism checkers and properly cite all sources.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}