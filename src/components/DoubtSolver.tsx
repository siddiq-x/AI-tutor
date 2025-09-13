import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Send, 
  Upload, 
  Copy, 
  Save, 
  Loader2,
  FileText,
  MessageSquare,
  CheckCircle,
  ArrowLeft,
  Archive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LoadingStateWrapper, ContentCardSkeleton, MessageSkeleton } from '@/components/LoadingSkeleton';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  saved?: boolean;
}

interface DoubtSolverProps {
  onBack: () => void;
}

export function DoubtSolver({ onBack }: DoubtSolverProps) {
  const [notes, setNotes] = useState('');
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingMessageId, setSavingMessageId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setNotes(content);
          setUploadedFile(file);
          toast({
            title: "File uploaded successfully",
            description: `${file.name} has been loaded.`,
          });
        };
        reader.readAsText(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a .txt file only.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast({
        title: "Please enter a question",
        description: "Type your doubt or question to get help.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Simulate AI response with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock AI response based on the question
      const mockResponses = [
        `Great question! Let me help you understand this concept better.\n\nBased on your question about "${question}", here's a detailed explanation:\n\n1. **Key Concept**: This relates to fundamental principles in the subject area.\n\n2. **Step-by-step breakdown**:\n   - First, we need to understand the basic definition\n   - Then, we can explore how it applies in practice\n   - Finally, we'll look at some examples\n\n3. **Practical Example**: Consider a real-world scenario where this concept is applied...\n\n4. **Common Mistakes**: Students often confuse this with similar concepts, so remember...\n\nWould you like me to elaborate on any specific part of this explanation?`,
        
        `Excellent question! This is a topic many students find challenging.\n\n**Understanding the Problem**:\nYour question touches on an important concept. Let me break it down:\n\n**Solution Approach**:\n1. Start by identifying the key components\n2. Apply the relevant formulas or principles\n3. Work through the steps systematically\n\n**Example**:\nLet's say we have a similar problem...\n\n**Tips for Success**:\n- Practice similar problems regularly\n- Make sure you understand the underlying theory\n- Don't hesitate to ask follow-up questions\n\nDoes this help clarify your doubt?`,
        
        `That's a thoughtful question! Let me provide a comprehensive answer.\n\n**Core Concept**:\nThe topic you're asking about is fundamental to understanding this subject.\n\n**Detailed Explanation**:\n- **Definition**: [Key definition related to your question]\n- **Applications**: This concept is used in various scenarios\n- **Related Topics**: This connects to other important concepts\n\n**Study Strategy**:\n1. Review the basic principles first\n2. Practice with simple examples\n3. Gradually work on more complex problems\n\n**Additional Resources**:\nI recommend reviewing your textbook chapter on this topic and practicing similar problems.\n\nFeel free to ask if you need clarification on any part!`
      ];

      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: randomResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setQuestion(''); // Clear question after successful submission

    } catch (error) {
      console.error('Error calling API:', error);
      
      let errorMessage = 'Failed to get AI response. Please try again.';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection.';
        }
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
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
      description: "Response copied to clipboard.",
    });
  };

  const saveToVault = async (messageId: string, content: string) => {
    console.log('Save to Vault clicked:', { messageId, user: user?.id, content: content.substring(0, 100) + '...' });
    
    if (!user) {
      console.error('No authenticated user found');
      toast({
        title: "Authentication required",
        description: "Please log in to save responses to your vault.",
        variant: "destructive",
      });
      return;
    }

    setSavingMessageId(messageId);

    try {
      // Prepare the data to save
      const vaultData = {
        user_id: user.id,
        tool: 'AI Doubt Solver',
        prompt: `Notes: ${notes}\n\nQuestion: ${question}`,
        response: content,
      };

      console.log('Attempting to save to vault:', vaultData);

      const { data, error } = await supabase
        .from('vaults')
        .insert([vaultData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Successfully saved to vault:', data);

      // Mark message as saved
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, saved: true } : msg
      ));

      toast({
        title: "Saved to Vault ✅",
        description: "Response has been saved to your vault.",
      });

    } catch (error) {
      console.error('Error saving to vault:', error);
      
      // Provide more specific error messages
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
      setSavingMessageId(null);
    }
  };

  const retrySubmit = () => {
    setError(null);
    handleSubmit();
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
            <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 mb-6 transition-colors">
              <Bot className="w-12 h-12 text-blue-600 dark:text-blue-400 transition-colors" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">AI Doubt Solver</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed transition-colors">
              Upload your notes and ask questions to get instant AI-powered explanations
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
                  Upload Notes & Ask Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="paste" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paste">Paste Notes</TabsTrigger>
                    <TabsTrigger value="upload">Upload File</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="paste" className="space-y-4">
                    <div>
                      <Label htmlFor="notes" className="text-gray-700 dark:text-gray-200">
                        Paste your notes here
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Paste your study notes, lecture content, or any text you want to ask questions about..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-32 mt-2 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="upload" className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload" className="text-gray-700 dark:text-gray-200">
                        Upload a text file (.txt)
                      </Label>
                      <div className="mt-2 flex items-center gap-4">
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".txt"
                          onChange={handleFileUpload}
                          className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                        />
                        <Button variant="outline" size="sm" className="shrink-0">
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                      {uploadedFile && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {uploadedFile.name} uploaded successfully
                        </p>
                      )}
                    </div>
                    {notes && (
                      <div>
                        <Label className="text-gray-700 dark:text-gray-200">File Content Preview</Label>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="min-h-32 mt-2 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div>
                  <Label htmlFor="question" className="text-gray-700 dark:text-gray-200">
                    Your Question
                  </Label>
                  <Textarea
                    id="question"
                    placeholder="What would you like to know about the notes? Ask your doubt here..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="min-h-24 mt-2 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                  />
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading || !notes.trim() || !question.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting Answer...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Ask AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </LoadingStateWrapper>

          {/* Chat Messages */}
          {(messages.length > 0 || isLoading) && (
            <LoadingStateWrapper
              isLoading={isLoading && messages.length === 0}
              error={error}
              skeleton={
                <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <MessageSquare className="w-5 h-5" />
                      Conversation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <MessageSkeleton isUser={true} />
                    <MessageSkeleton isUser={false} />
                  </CardContent>
                </Card>
              }
              onRetry={retrySubmit}
            >
              <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors content-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <MessageSquare className="w-5 h-5" />
                    Conversation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-xl ${
                        message.type === 'user'
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                          : 'bg-gray-50 dark:bg-zinc-800 border-l-4 border-green-500'
                      } content-fade-in`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {message.type === 'user' ? (
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">U</span>
                              </div>
                            ) : (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <Bot className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {message.type === 'user' ? 'You' : 'AI Assistant'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-200">
                            <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                          </div>
                        </div>
                        
                        {message.type === 'assistant' && (
                          <div className="flex gap-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(message.content)}
                              className="hover:bg-gray-200 dark:hover:bg-zinc-700"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => saveToVault(message.id, message.content)}
                              disabled={savingMessageId === message.id || message.saved}
                              className="hover:bg-gray-200 dark:hover:bg-zinc-700"
                            >
                              {savingMessageId === message.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : message.saved ? (
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <Archive className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Save to Vault Button - Only show for AI responses */}
                      {message.type === 'assistant' && !message.saved && (
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-zinc-700">
                          <Button
                            onClick={() => saveToVault(message.id, message.content)}
                            disabled={savingMessageId === message.id}
                            variant="outline"
                            size="sm"
                            className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-200 dark:border-teal-800 hover:from-teal-100 hover:to-cyan-100 dark:hover:from-teal-900/40 dark:hover:to-cyan-900/40 text-teal-700 dark:text-teal-300"
                          >
                            {savingMessageId === message.id ? (
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
                      {message.type === 'assistant' && message.saved && (
                        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-zinc-700">
                          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span>Saved to Vault ✅</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Loading message */}
                  {isLoading && messages.length > 0 && (
                    <MessageSkeleton isUser={false} />
                  )}
                </CardContent>
              </Card>
            </LoadingStateWrapper>
          )}
        </div>
      </div>
    </div>
  );
}