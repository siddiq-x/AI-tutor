import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  Target,
  ArrowLeft,
  Archive,
  Bot,
  FileEdit,
  UserCheck,
  MessageSquare,
  Edit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingStateWrapper, ContentCardSkeleton } from '@/components/LoadingSkeleton';

interface VaultItem {
  id: string;
  tool: string;
  prompt: string;
  response: string;
  created_at: string;
  // Legacy support
  question?: string;
  answer?: string;
}

interface VaultProps {
  onBack: () => void;
}

const toolIcons: Record<string, React.ReactNode> = {
  'AI Doubt Solver': <Bot className="w-4 h-4" />,
  'AI Assignment Maker': <FileEdit className="w-4 h-4" />,
  'Humanizer': <UserCheck className="w-4 h-4" />,
  'Quiz Generator': <Target className="w-4 h-4" />,
  'Legacy': <MessageSquare className="w-4 h-4" />,
};

const toolColors: Record<string, string> = {
  'AI Doubt Solver': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  'AI Assignment Maker': 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
  'Humanizer': 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
  'Quiz Generator': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
  'Legacy': 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300',
};

export function Vault({ onBack }: VaultProps) {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTool, setSelectedTool] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadVaultItems();
    }
  }, [user]);

  const loadVaultItems = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load saved plagiarism reports from localStorage
      const savedReports = JSON.parse(localStorage.getItem('plagiarismReports') || '[]');
      
      // Convert plagiarism reports to vault items
      const plagiarismItems: VaultItem[] = savedReports.map((report: any) => ({
        id: report.id,
        tool: 'Plagiarism Checker',
        prompt: `Plagiarism Check - ${report.percentage}% similarity (${report.riskLevel} risk)`,
        response: `Content: ${report.content.substring(0, 200)}${report.content.length > 200 ? '...' : ''}\n\nAnalysis: ${report.explanation}\n\nSimilarity: ${report.percentage}%\nRisk Level: ${report.riskLevel.toUpperCase()}`,
        created_at: report.timestamp
      }));

      // Mock vault items for demo (other tools)
      const mockItems: VaultItem[] = [
        {
          id: '1',
          tool: 'AI Doubt Solver',
          prompt: 'Explain quantum mechanics in simple terms',
          response: 'Quantum mechanics is the branch of physics that studies the behavior of matter and energy at the smallest scales...',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
        {
          id: '2',
          tool: 'Quiz Generator',
          prompt: 'Create a quiz about photosynthesis',
          response: 'Quiz: Photosynthesis\n\n1. What is the primary purpose of photosynthesis?\na) To produce oxygen\nb) To convert light energy into chemical energy...',
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        },
        {
          id: '3',
          tool: 'AI Assignment Maker',
          prompt: 'Create an assignment about climate change',
          response: 'Assignment: Climate Change Impact Analysis\n\nObjective: Students will analyze the various impacts of climate change...',
          created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        },
        {
          id: '4',
          tool: 'Humanizer',
          prompt: 'Humanize this AI-generated text about machine learning',
          response: 'You know, machine learning is actually pretty fascinating when you think about it. It\'s basically teaching computers to learn patterns...',
          created_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        }
      ];
      
      // Combine plagiarism reports with mock items and sort by date
      const allItems = [...plagiarismItems, ...mockItems].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setVaultItems(allItems);
    } catch (error) {
      console.error('Error loading vault items:', error);
      toast({
        title: "Error",
        description: "Failed to load vault items.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addVaultItem = async () => {
    if (!newPrompt.trim() || !newResponse.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in both prompt and response",
        variant: "destructive",
      });
      return;
    }

    try {
      // Since we're using mock mode, just add to localStorage and state
      const newItem: VaultItem = {
        id: Date.now().toString(),
        tool: 'Manual Entry',
        prompt: newPrompt.trim(),
        response: newResponse.trim(),
        created_at: new Date().toISOString()
      };

      setVaultItems(prev => [newItem, ...prev]);
      setNewPrompt('');
      setNewResponse('');
      setIsAdding(false);
      
      toast({
        title: "Added to vault",
        description: "Your entry has been saved successfully",
      });
    } catch (error) {
      console.error('Error adding vault item:', error);
      toast({
        title: "Error",
        description: "Failed to add item to vault",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      setVaultItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Deleted",
        description: "Item removed from vault",
      });
    } catch (error) {
      console.error('Error deleting vault item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const filteredItems = vaultItems.filter(item => {
    const matchesSearch = 
      item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.response.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tool.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTool = selectedTool === 'all' || item.tool === selectedTool;
    
    return matchesSearch && matchesTool;
  });

  const uniqueTools = Array.from(new Set(vaultItems.map(item => item.tool)));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
            <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20 mb-6 transition-colors">
              <Archive className="w-12 h-12 text-teal-600 dark:text-teal-400 transition-colors" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Your Vault</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed transition-colors">
              Access your saved AI responses, assignments, and study materials in one organized place
            </p>
          </div>

          {/* Search, Filter and Add */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search your vault..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={selectedTool}
                  onChange={(e) => setSelectedTool(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-md text-gray-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="all">All Tools</option>
                  {uniqueTools.map(tool => (
                    <option key={tool} value={tool}>{tool}</option>
                  ))}
                </select>
              </div>
              
              <Button
                onClick={() => setIsAdding(true)}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-6 py-2 rounded-xl transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </div>
          </div>

          {/* Add New Item Form */}
          {isAdding && (
            <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
                  <span className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Item
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAdding(false);
                      setNewPrompt('');
                      setNewResponse('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                    Prompt/Question
                  </label>
                  <Input
                    placeholder="Enter your prompt or question..."
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                    Response/Answer
                  </label>
                  <Textarea
                    placeholder="Enter the response or answer..."
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    className="min-h-24 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={addVaultItem}
                    className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save to Vault
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false);
                      setNewPrompt('');
                      setNewResponse('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vault Items */}
          <LoadingStateWrapper
            isLoading={isLoading}
            error={null}
            skeleton={
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <ContentCardSkeleton key={index} />
                ))}
              </div>
            }
            onRetry={loadVaultItems}
          >
            {filteredItems.length === 0 ? (
              <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors">
                <CardContent className="p-12 text-center">
                  <Archive className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {searchTerm || selectedTool !== 'all' ? 'No matching items found' : 'Your vault is empty'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {searchTerm || selectedTool !== 'all'
                      ? 'Try adjusting your search terms or filters'
                      : 'Start using AI tools to automatically save responses, or add items manually'
                    }
                  </p>
                  {!searchTerm && selectedTool === 'all' && (
                    <Button
                      onClick={() => setIsAdding(true)}
                      className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Item
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredItems.map((item) => (
                  <Card 
                    key={item.id}
                    className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors hover:shadow-xl hover:-translate-y-1 duration-300"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={`${toolColors[item.tool] || toolColors['Legacy']} flex items-center gap-1`}>
                            {toolIcons[item.tool] || toolIcons['Legacy']}
                            <span className="text-xs">{item.tool}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* Edit functionality not implemented */}}
                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-zinc-800"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteItem(item.id)}
                            className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm font-medium">Prompt</span>
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium leading-relaxed text-sm">
                          {truncateText(item.prompt)}
                        </p>
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-zinc-700 pt-4">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                          <span className="text-sm font-medium">Response</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                          {truncateText(item.response)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-zinc-800">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </LoadingStateWrapper>

          {/* Stats */}
          {vaultItems.length > 0 && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{vaultItems.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Items</div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{uniqueTools.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Tools Used</div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{filteredItems.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Filtered Results</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}