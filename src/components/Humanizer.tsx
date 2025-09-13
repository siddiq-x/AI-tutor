import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  UserCheck, 
  Send, 
  Copy, 
  Save, 
  Loader2,
  FileText,
  Sparkles,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Archive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LoadingStateWrapper, ContentCardSkeleton } from '@/components/LoadingSkeleton';

interface HumanizerProps {
  onBack: () => void;
}

export function Humanizer({ onBack }: HumanizerProps) {
  const [inputContent, setInputContent] = useState('');
  const [humanizedContent, setHumanizedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const humanizeContent = (text: string): string => {
    // Simple humanization transformations
    let humanized = text;
    
    // Add conversational elements
    const conversationalStarters = [
      "You know, ",
      "Here's the thing - ",
      "Let me tell you, ",
      "Actually, ",
      "Honestly, "
    ];
    
    // Replace formal phrases with more casual ones
    const replacements = [
      { formal: "In conclusion", casual: "So basically" },
      { formal: "Furthermore", casual: "Plus" },
      { formal: "Additionally", casual: "Also" },
      { formal: "Therefore", casual: "So" },
      { formal: "However", casual: "But" },
      { formal: "Nevertheless", casual: "Still" },
      { formal: "Subsequently", casual: "Then" },
      { formal: "Consequently", casual: "As a result" },
      { formal: "It is important to note", casual: "Worth mentioning" },
      { formal: "It should be emphasized", casual: "The key thing is" }
    ];
    
    // Apply replacements
    replacements.forEach(({ formal, casual }) => {
      const regex = new RegExp(formal, 'gi');
      humanized = humanized.replace(regex, casual);
    });
    
    // Add some conversational flow
    const sentences = humanized.split('. ');
    if (sentences.length > 1) {
      // Add a conversational starter to the first sentence occasionally
      if (Math.random() > 0.7) {
        const starter = conversationalStarters[Math.floor(Math.random() * conversationalStarters.length)];
        sentences[0] = starter + sentences[0].toLowerCase();
      }
      
      // Join back with varied punctuation
      humanized = sentences.join('. ');
    }
    
    // Add some natural variations
    humanized = humanized.replace(/\. /g, (match, offset) => {
      // Occasionally use different sentence connectors
      if (Math.random() > 0.8) {
        const connectors = ['. And ', '. But ', '. Plus, '];
        return connectors[Math.floor(Math.random() * connectors.length)];
      }
      return match;
    });
    
    return humanized;
  };

  const handleHumanize = async () => {
    if (!inputContent.trim()) {
      toast({
        title: "Missing content",
        description: "Please paste the AI-generated content you want to humanize.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setHumanizedContent('');
    setError(null);
    setIsSaved(false);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Generate humanized version of the content
      const humanizedText = humanizeContent(inputContent);
      
      setHumanizedContent(humanizedText);
      toast({
        title: "Content humanized!",
        description: "Your content has been successfully humanized.",
      });

    } catch (error) {
      console.error('Error calling API:', error);
      setError('Failed to humanize content. Please try again.');
      toast({
        title: "Error",
        description: "Failed to humanize content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Humanized content copied to clipboard.",
    });
  };

  const saveToVault = async () => {
    console.log('Save to Vault clicked for Humanizer:', { user: user?.id, hasContent: !!humanizedContent });
    
    if (!user) {
      console.error('No authenticated user found');
      toast({
        title: "Authentication required",
        description: "Please log in to save content to your vault.",
        variant: "destructive",
      });
      return;
    }

    if (!humanizedContent) {
      console.error('No humanized content to save');
      return;
    }

    setIsSaving(true);

    try {
      const vaultData = {
        user_id: user.id,
        tool: 'Humanizer',
        prompt: inputContent,
        response: humanizedContent,
      };

      console.log('Attempting to save humanized content to vault:', vaultData);

      const { data, error } = await supabase
        .from('vaults')
        .insert([vaultData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Successfully saved humanized content to vault:', data);

      setIsSaved(true);
      toast({
        title: "Saved to Vault ✅",
        description: "Humanized content has been saved to your vault.",
      });

    } catch (error) {
      console.error('Error saving humanized content to vault:', error);
      
      let errorMessage = "Failed to save to vault. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMessage = "Permission denied. Please check your account access.";
        } else if (error.message.includes('network')) {
          errorMessage = "Network error. Please check your connection.";
        } else if (error.message.includes('quota')) {
          errorMessage = "Storage quota exceeded. Please contact support.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveContent = (content: string) => {
    const savedContent = JSON.parse(localStorage.getItem('savedHumanized') || '[]');
    const newContent = {
      id: Date.now().toString(),
      original: inputContent,
      humanized: content,
      timestamp: new Date().toISOString(),
    };
    savedContent.push(newContent);
    localStorage.setItem('savedHumanized', JSON.stringify(savedContent));
    
    toast({
      title: "Saved!",
      description: "Humanized content saved to your vault.",
    });
  };

  const clearAll = () => {
    setInputContent('');
    setHumanizedContent('');
    setError(null);
    setIsSaved(false);
  };

  const retryHumanize = () => {
    setError(null);
    handleHumanize();
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-black transition-colors duration-300 overflow-x-hidden box-border">
      <div className="w-full px-4 py-8">
        <div className="max-w-6xl mx-auto">
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
            <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 mb-6 transition-colors">
              <UserCheck className="w-12 h-12 text-orange-600 dark:text-orange-400 transition-colors" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">AI Content Humanizer</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed transition-colors">
              Transform AI-generated content into natural, human-like writing while preserving the original meaning
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <LoadingStateWrapper
              isLoading={false}
              error={null}
              skeleton={<ContentCardSkeleton />}
            >
              <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors content-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <FileText className="w-5 h-5" />
                    AI-Generated Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="input-content" className="text-gray-700 dark:text-gray-200">
                      Paste your AI-generated content here
                    </Label>
                    <Textarea
                      id="input-content"
                      placeholder="Paste the AI-generated text that you want to make sound more human and natural..."
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      className="min-h-64 mt-2 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleHumanize}
                      disabled={isLoading || !inputContent.trim()}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Humanizing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Humanize Content
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

            {/* Output Section */}
            <LoadingStateWrapper
              isLoading={isLoading}
              error={error}
              skeleton={<ContentCardSkeleton />}
              onRetry={retryHumanize}
            >
              <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors content-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <UserCheck className="w-5 h-5" />
                    Humanized Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!humanizedContent && !isLoading && (
                    <div className="min-h-64 flex items-center justify-center bg-gray-50 dark:bg-zinc-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-zinc-700">
                      <div className="text-center">
                        <ArrowRight className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                          Humanized content will appear here
                        </p>
                      </div>
                    </div>
                  )}

                  {humanizedContent && (
                    <>
                      <div className="min-h-64 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                        <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-200">
                          <pre className="whitespace-pre-wrap font-sans leading-relaxed">{humanizedContent}</pre>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(humanizedContent)}
                          className="flex-1 hover:bg-gray-50 dark:hover:bg-zinc-800"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Result
                        </Button>
                        <Button
                          variant="outline"
                          onClick={saveToVault}
                          disabled={isSaving || isSaved}
                          className="flex-1 hover:bg-gray-50 dark:hover:bg-zinc-800"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : isSaved ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                              Saved
                            </>
                          ) : (
                            <>
                              <Archive className="w-4 h-4 mr-2" />
                              Save to Vault
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Character Count */}
                      <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                        {humanizedContent.length} characters
                      </div>

                      {/* Save to Vault Button */}
                      {!isSaved && (
                        <div className="pt-4 border-t border-gray-200 dark:border-zinc-700">
                          <Button
                            onClick={saveToVault}
                            disabled={isSaving}
                            className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200 dark:border-teal-800 hover:from-teal-100 hover:to-cyan-100 dark:hover:from-teal-900/40 dark:hover:to-cyan-900/40 text-teal-700 dark:text-teal-300"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                💾 Save to Vault
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Saved indicator */}
                      {isSaved && (
                        <div className="pt-4 border-t border-gray-200 dark:border-zinc-700">
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span>Saved to Vault ✅</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </LoadingStateWrapper>
          </div>

          {/* Tips Section */}
          <Card className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800 transition-colors content-fade-in">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tips for Better Results</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Paste complete sentences or paragraphs for better context</li>
                    <li>• The tool works best with formal or technical AI-generated content</li>
                    <li>• Review the humanized content and make final adjustments if needed</li>
                    <li>• Use this for essays, articles, reports, and academic content</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}