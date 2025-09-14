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
  Loader2,
  FileText,
  MessageSquare,
  CheckCircle,
  ArrowLeft,
  Archive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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

      // Generate dynamic mock AI response based on the actual question and notes
      const generateDynamicResponse = (userQuestion: string, userNotes: string) => {
        const questionLower = userQuestion.toLowerCase();
        
        // Detect subject/topic based on keywords
        let subject = 'general';
        let subjectIcon = '📚';
        
        if (questionLower.includes('math') || questionLower.includes('equation') || questionLower.includes('formula') || questionLower.includes('calculate') || /\d+/.test(questionLower)) {
          subject = 'mathematics';
          subjectIcon = '🔢';
        } else if (questionLower.includes('physics') || questionLower.includes('force') || questionLower.includes('energy') || questionLower.includes('motion')) {
          subject = 'physics';
          subjectIcon = '⚡';
        } else if (questionLower.includes('chemistry') || questionLower.includes('reaction') || questionLower.includes('element') || questionLower.includes('compound')) {
          subject = 'chemistry';
          subjectIcon = '🧪';
        } else if (questionLower.includes('biology') || questionLower.includes('cell') || questionLower.includes('organism') || questionLower.includes('dna')) {
          subject = 'biology';
          subjectIcon = '🧬';
        } else if (questionLower.includes('history') || questionLower.includes('war') || questionLower.includes('ancient') || questionLower.includes('century')) {
          subject = 'history';
          subjectIcon = '📜';
        } else if (questionLower.includes('english') || questionLower.includes('literature') || questionLower.includes('poem') || questionLower.includes('essay')) {
          subject = 'literature';
          subjectIcon = '📖';
        }
        
        // Extract key terms from the question
        const keyTerms = userQuestion.split(' ').filter(word => 
          word.length > 3 && 
          !['what', 'how', 'why', 'when', 'where', 'which', 'that', 'this', 'with', 'from', 'they', 'have', 'been', 'will', 'would', 'could', 'should'].includes(word.toLowerCase())
        ).slice(0, 3);
        
        // Check if notes contain relevant information
        const hasRelevantNotes = userNotes.trim().length > 10;
        const notesContext = hasRelevantNotes ? `\n\n**Based on your notes**, I can see you're studying ${subject}. ` : '';
        
        return `${subjectIcon} **Great question about ${subject}!**

**Your Question**: "${userQuestion}"
${notesContext}
**Detailed Answer**:

${keyTerms.length > 0 ? `🔍 **Key Terms**: ${keyTerms.join(', ')}` : ''}

**Explanation**:
${subject === 'mathematics' ? 
  `Let me break down this mathematical concept step by step:

1. **Understanding the Problem**: ${userQuestion.includes('solve') ? 'This appears to be a problem-solving question' : 'This involves mathematical reasoning'}
2. **Approach**: Start by identifying what you know and what you need to find
3. **Method**: Apply the relevant mathematical principles or formulas
4. **Solution Steps**: Work through systematically, checking each step

**Example**: If we consider a similar problem, we would...` :

subject === 'physics' ?
  `Here's how to understand this physics concept:

1. **Physical Principle**: This relates to fundamental laws of physics
2. **Real-world Application**: You can observe this in everyday situations
3. **Mathematical Relationship**: The underlying equations help us quantify this
4. **Problem-solving Strategy**: Break complex problems into simpler parts

**Key Insight**: Remember that physics connects mathematical relationships with physical reality.` :

subject === 'chemistry' ?
  `Let me explain this chemistry concept:

1. **Chemical Principle**: This involves understanding molecular behavior
2. **Reaction Mechanism**: Consider how atoms and molecules interact
3. **Practical Applications**: This concept is used in real chemical processes
4. **Safety Considerations**: Always remember proper lab procedures

**Memory Tip**: Try to visualize the molecular level interactions.` :

subject === 'biology' ?
  `Here's the biological explanation:

1. **Biological System**: This relates to how living organisms function
2. **Cellular Level**: Understanding what happens at the cellular level
3. **Evolutionary Context**: How this trait or process evolved
4. **Health Implications**: Why this is important for organism survival

**Study Tip**: Connect this concept to examples you can observe in nature.` :

subject === 'history' ?
  `Let me provide historical context:

1. **Historical Background**: Understanding the time period and circumstances
2. **Key Figures**: Important people involved in these events
3. **Cause and Effect**: How events led to consequences
4. **Historical Significance**: Why this matters in the broader historical narrative

**Analysis Tip**: Always consider multiple perspectives on historical events.` :

subject === 'literature' ?
  `Here's the literary analysis:

1. **Literary Elements**: Consider themes, symbols, and literary devices
2. **Author's Intent**: What message was the author trying to convey?
3. **Historical Context**: How the time period influenced the work
4. **Personal Interpretation**: What does this mean to you as a reader?

**Reading Strategy**: Look for patterns and connections throughout the text.` :

  `Here's a comprehensive explanation:

1. **Core Concept**: Let me break down the fundamental idea
2. **Key Components**: The essential elements you need to understand
3. **Practical Application**: How this applies in real situations
4. **Common Challenges**: Areas where students typically struggle

**Study Approach**: Connect new information to what you already know.`}

${hasRelevantNotes ? `\n**Connection to Your Notes**: I can see from your notes that this relates to the material you're studying. The key connection is how this concept builds upon the foundation you've already established.` : ''}

**Next Steps**:
- ${subject === 'mathematics' ? 'Practice similar problems to reinforce the method' : 'Review related concepts to build connections'}
- ${hasRelevantNotes ? 'Cross-reference this with your notes for deeper understanding' : 'Take notes on this explanation for future reference'}
- Feel free to ask follow-up questions for clarification

**Would you like me to elaborate on any specific part of this explanation?** 🤔`;
      };

      const dynamicResponse = generateDynamicResponse(question, notes);

      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: dynamicResponse,
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

      // Since we're using mock mode, just save to localStorage
      const vaultItems = JSON.parse(localStorage.getItem('vaultItems') || '[]');
      const newVaultItem = {
        ...vaultData,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      vaultItems.unshift(newVaultItem);
      localStorage.setItem('vaultItems', JSON.stringify(vaultItems));
      
      const data = [newVaultItem];
      const error = null;

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