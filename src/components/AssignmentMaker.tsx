import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  FileEdit, 
  Upload, 
  Copy, 
  Save, 
  Loader2,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  File,
  Paperclip,
  ArrowLeft,
  Archive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LoadingStateWrapper, ContentCardSkeleton, AssignmentContentSkeleton } from '@/components/LoadingSkeleton';

interface AssignmentContent {
  title: string;
  vision: string;
  mission: string;
  keyPoints: string[];
  conclusion: string;
}

interface AssignmentMakerProps {
  onBack: () => void;
}

export function AssignmentMaker({ onBack }: AssignmentMakerProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<AssignmentContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF, DOC, DOCX, PPT, PPTX, or TXT file.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);

    // For demo purposes, we'll simulate text extraction
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setExtractedText(content);
      };
      reader.readAsText(file);
    } else {
      // Simulate extracted text for other file types
      setExtractedText(`[Extracted content from ${file.name}]\n\nThis is a placeholder for the actual document content that would be extracted from the uploaded ${file.type.includes('pdf') ? 'PDF' : file.type.includes('presentation') ? 'PowerPoint' : 'Word'} document. In a production environment, this would contain the actual text content from your uploaded file.`);
    }

    toast({
      title: "File uploaded successfully",
      description: `${file.name} has been processed and is ready for content generation.`,
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setExtractedText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const parseAssignmentContent = (response: string): AssignmentContent => {
    try {
      // Try to parse as JSON first
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback: Parse structured text
      const content: AssignmentContent = {
        title: '',
        vision: '',
        mission: '',
        keyPoints: [],
        conclusion: ''
      };

      const lines = response.split('\n').map(line => line.trim()).filter(line => line);
      let currentSection = '';

      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        
        if (lowerLine.includes('title:') || lowerLine.startsWith('title')) {
          content.title = line.replace(/^title:?\s*/i, '').replace(/^#+\s*/, '');
          currentSection = 'title';
        } else if (lowerLine.includes('vision:') || lowerLine.includes('vision statement')) {
          content.vision = line.replace(/^.*vision:?\s*/i, '').replace(/^#+\s*/, '');
          currentSection = 'vision';
        } else if (lowerLine.includes('mission:') || lowerLine.includes('mission statement')) {
          content.mission = line.replace(/^.*mission:?\s*/i, '').replace(/^#+\s*/, '');
          currentSection = 'mission';
        } else if (lowerLine.includes('key points') || lowerLine.includes('main points')) {
          currentSection = 'keyPoints';
        } else if (lowerLine.includes('conclusion:') || lowerLine.includes('conclusion')) {
          content.conclusion = line.replace(/^.*conclusion:?\s*/i, '').replace(/^#+\s*/, '');
          currentSection = 'conclusion';
        } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line)) {
          if (currentSection === 'keyPoints') {
            content.keyPoints.push(line.replace(/^[•\-*\d\.]\s*/, ''));
          }
        } else if (line && !line.startsWith('#')) {
          // Continue building current section
          if (currentSection === 'title' && !content.title) {
            content.title = line;
          } else if (currentSection === 'vision' && !content.vision) {
            content.vision = line;
          } else if (currentSection === 'mission' && !content.mission) {
            content.mission = line;
          } else if (currentSection === 'conclusion' && !content.conclusion) {
            content.conclusion = line;
          }
        }
      }

      // Fallback values if sections are empty
      if (!content.title) content.title = 'Generated Assignment Title';
      if (!content.vision) content.vision = 'Vision statement will be generated based on your requirements.';
      if (!content.mission) content.mission = 'Mission statement will be generated based on your requirements.';
      if (content.keyPoints.length === 0) content.keyPoints = ['Key point 1', 'Key point 2', 'Key point 3'];
      if (!content.conclusion) content.conclusion = 'Conclusion will be generated based on your requirements.';

      return content;
    } catch (error) {
      console.error('Error parsing assignment content:', error);
      return {
        title: 'Generated Assignment',
        vision: 'Vision statement based on your requirements.',
        mission: 'Mission statement based on your requirements.',
        keyPoints: ['Key point 1', 'Key point 2', 'Key point 3'],
        conclusion: 'Conclusion based on your requirements.'
      };
    }
  };

  const generateAssignment = async () => {
    if (!userPrompt.trim()) {
      toast({
        title: "Missing modification request",
        description: "Please enter your modification request to generate assignment content.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedContent(null);
    setError(null);
    setIsSaved(false);

    try {
      const basePrompt = extractedText 

      // Generate mock assignment content
      const mockContent: AssignmentContent = {
        title: `Assignment: ${userPrompt}`,
        vision: `This assignment aims to provide comprehensive understanding of ${userPrompt} through structured learning and practical application. Students will develop critical thinking skills while exploring key concepts and their real-world implications.`,
        mission: `To enable students to master the fundamental principles of ${userPrompt} and apply them effectively in academic and professional contexts. This assignment promotes analytical thinking, research skills, and clear communication.`,
        keyPoints: [
          `Understanding the core concepts and principles of ${userPrompt}`,
          `Analyzing different perspectives and approaches to the topic`,
          `Evaluating practical applications and case studies`,
          `Developing critical thinking and problem-solving skills`,
          `Creating well-structured arguments and presentations`,
          `Connecting theoretical knowledge with real-world scenarios`
        ],
        conclusion: `Through this assignment on ${userPrompt}, students will gain valuable insights and develop essential skills for their academic journey. The structured approach ensures comprehensive coverage of the topic while promoting independent learning and critical analysis. This foundation will serve students well in future coursework and professional endeavors.`
      };

      // If there's extracted text from a file, incorporate it
      if (extractedText) {
        mockContent.vision += ` The uploaded content provides additional context and depth to enhance the learning experience.`;
        mockContent.keyPoints.push(`Incorporating insights from the provided reference material`);
      }

      setGeneratedContent(mockContent);
      
      toast({
        title: "Assignment generated!",
        description: "Your assignment has been created successfully.",
      });

    } catch (error) {
      console.error('Error generating assignment:', error);
      setError('Failed to generate assignment content. Please try again.');
      toast({
        title: "Error",
        description: "Failed to generate assignment content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySection = (content: string, sectionName: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: `${sectionName} copied to clipboard.`,
    });
  };

  const copyAllContent = () => {
    if (!generatedContent) return;
    
    const fullContent = `${generatedContent.title}

VISION STATEMENT:
${generatedContent.vision}

MISSION STATEMENT:
${generatedContent.mission}

KEY POINTS:
${generatedContent.keyPoints.map(point => `• ${point}`).join('\n')}

CONCLUSION:
${generatedContent.conclusion}`;

    navigator.clipboard.writeText(fullContent);
    toast({
      title: "Copied!",
      description: "Complete assignment content copied to clipboard.",
    });
  };

  const saveToVault = async () => {
    console.log('Save to Vault clicked for Assignment Maker:', { user: user?.id, hasContent: !!generatedContent });
    
    if (!user) {
      console.error('No authenticated user found');
      toast({
        title: "Authentication required",
        description: "Please log in to save assignments to your vault.",
        variant: "destructive",
      });
      return;
    }

    if (!generatedContent) {
      console.error('No generated content to save');
      return;
    }

    setIsSaving(true);

    try {
      const fullContent = `${generatedContent.title}

VISION STATEMENT:
${generatedContent.vision}

MISSION STATEMENT:
${generatedContent.mission}

KEY POINTS:
${generatedContent.keyPoints.map(point => `• ${point}`).join('\n')}

CONCLUSION:
${generatedContent.conclusion}`;

      const vaultData = {
        user_id: user.id,
        tool: 'AI Assignment Maker',
        prompt: userPrompt,
        response: fullContent,
      };

      console.log('Attempting to save assignment to vault:', vaultData);

      const { data, error } = await supabase
        .from('vaults')
        .insert([vaultData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Successfully saved assignment to vault:', data);

      setIsSaved(true);
      toast({
        title: "Saved to Vault ✅",
        description: "Assignment has been saved to your vault.",
      });

    } catch (error) {
      console.error('Error saving assignment to vault:', error);
      
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

  const saveAssignment = () => {
    if (!generatedContent) return;
    
    const savedAssignments = JSON.parse(localStorage.getItem('savedAssignments') || '[]');
    const newAssignment = {
      id: Date.now().toString(),
      content: generatedContent,
      prompt: userPrompt,
      hasReference: !!uploadedFile,
      timestamp: new Date().toISOString(),
    };
    savedAssignments.push(newAssignment);
    localStorage.setItem('savedAssignments', JSON.stringify(savedAssignments));
    
    toast({
      title: "Saved!",
      description: "Assignment saved to your vault.",
    });
  };

  const clearAll = () => {
    setUploadedFile(null);
    setExtractedText('');
    setUserPrompt('');
    setGeneratedContent(null);
    setError(null);
    setIsSaved(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const retryGenerate = () => {
    setError(null);
    generateAssignment();
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
            <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 mb-6 transition-colors">
              <FileEdit className="w-12 h-12 text-purple-600 dark:text-purple-400 transition-colors" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">AI Assignment Maker</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed transition-colors">
              Generate structured assignment content with AI assistance. Optionally upload reference documents for enhanced results.
            </p>
          </div>

          {/* Main Input Section */}
          <LoadingStateWrapper
            isLoading={isLoading && !generatedContent}
            error={null}
            skeleton={<ContentCardSkeleton />}
          >
            <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors mb-6 content-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <FileText className="w-5 h-5" />
                  Modification Request / Prompt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Text Input */}
                <div>
                  <Label htmlFor="user-prompt" className="text-gray-700 dark:text-gray-200 text-base font-medium">
                    Describe what you want to create or modify
                  </Label>
                  <Textarea
                    id="user-prompt"
                    placeholder="e.g., 'Create a business plan for a sustainable energy startup with focus on solar power solutions' or 'Update the title, vision, and conclusion to focus on AI in Education'"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    className="min-h-40 mt-3 text-base bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {uploadedFile 
                        ? `Reference document: ${uploadedFile.name} will be used to enhance generation`
                        : 'Content will be generated from scratch based on your prompt'
                      }
                    </p>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {userPrompt.length}/2000
                    </span>
                  </div>
                </div>

                {/* Optional File Upload Button */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 text-sm border-2 border-dashed border-gray-300 dark:border-zinc-600 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                  >
                    <Paperclip className="w-4 h-4" />
                    Upload Reference Document (Optional)
                  </Button>
                  
                  {uploadedFile && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <File className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                        {uploadedFile.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/50"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Supported formats info */}
                {!uploadedFile && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg">
                    <strong>Supported formats:</strong> PDF, DOC, DOCX, PPT, PPTX, TXT • Max size: 10MB
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={generateAssignment}
                    disabled={isLoading || !userPrompt.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Assignment...
                      </>
                    ) : (
                      <>
                        <FileEdit className="w-5 h-5 mr-2" />
                        Generate New Assignment Content
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={clearAll}
                    className="px-6 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    Clear
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </LoadingStateWrapper>

          {/* Warning Banner */}
          {generatedContent && (
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800 transition-colors mb-6 content-fade-in">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                      AI-Generated Content Notice
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      This is AI-generated content. Please review and manually update your document. 
                      Direct file editing feature coming soon.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated Content */}
          {(generatedContent || (isLoading && userPrompt)) && (
            <LoadingStateWrapper
              isLoading={isLoading && !generatedContent}
              error={error}
              skeleton={<AssignmentContentSkeleton />}
              onRetry={retryGenerate}
            >
              {generatedContent && (
                <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors content-fade-in">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        Generated Assignment Content
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyAllContent}
                          className="hover:bg-gray-50 dark:hover:bg-zinc-800"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={saveToVault}
                          disabled={isSaving || isSaved}
                          className="hover:bg-gray-50 dark:hover:bg-zinc-800"
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
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Title */}
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Title</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copySection(generatedContent.title, 'Title')}
                          className="hover:bg-gray-200 dark:hover:bg-zinc-700"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                        {generatedContent.title}
                      </p>
                    </div>

                    {/* Vision Statement */}
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Vision Statement</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copySection(generatedContent.vision, 'Vision Statement')}
                          className="hover:bg-gray-200 dark:hover:bg-zinc-700"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                        {generatedContent.vision}
                      </p>
                    </div>

                    {/* Mission Statement */}
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Mission Statement</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copySection(generatedContent.mission, 'Mission Statement')}
                          className="hover:bg-gray-200 dark:hover:bg-zinc-700"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                        {generatedContent.mission}
                      </p>
                    </div>

                    {/* Key Points */}
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Key Points</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copySection(generatedContent.keyPoints.map(point => `• ${point}`).join('\n'), 'Key Points')}
                          className="hover:bg-gray-200 dark:hover:bg-zinc-700"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <ul className="space-y-2">
                        {generatedContent.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-200">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 shrink-0"></span>
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Conclusion */}
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Conclusion</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copySection(generatedContent.conclusion, 'Conclusion')}
                          className="hover:bg-gray-200 dark:hover:bg-zinc-700"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                        {generatedContent.conclusion}
                      </p>
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
                  </CardContent>
                </Card>
              )}
            </LoadingStateWrapper>
          )}
        </div>
      </div>
    </div>
  );
}