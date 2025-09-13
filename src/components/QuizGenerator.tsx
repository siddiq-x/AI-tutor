import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle,
  Trophy,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Loader2,
  BookOpen,
  Timer,
  Award
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingStateWrapper, ContentCardSkeleton, QuizQuestionSkeleton, ResultsSkeleton } from '@/components/LoadingSkeleton';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface QuizResult {
  questionIndex: number;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

interface QuizGeneratorProps {
  onBack: () => void;
}

export function QuizGenerator({ onBack }: QuizGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [totalStartTime, setTotalStartTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const parseQuizResponse = (response: string): QuizQuestion[] => {
    try {
      // Try to parse as JSON first
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback: Parse structured text format
      const questions: QuizQuestion[] = [];
      const questionBlocks = response.split(/(?=\d+\.|Question \d+)/i).filter(block => block.trim());

      for (const block of questionBlocks) {
        const lines = block.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length < 6) continue; // Need at least question + 4 options + answer

        const questionLine = lines.find(line => 
          line.match(/^\d+\./) || line.toLowerCase().includes('question')
        );
        
        if (!questionLine) continue;

        const question = questionLine.replace(/^\d+\.\s*/, '').replace(/^Question \d+:\s*/i, '');
        const options: string[] = [];
        let answer = '';
        let explanation = '';

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // Extract options (A), B), C), D) or a), b), c), d)
          if (line.match(/^[A-Da-d][\)\.]/)) {
            options.push(line.replace(/^[A-Da-d][\)\.]\s*/, ''));
          }
          
          // Extract answer
          if (line.toLowerCase().includes('answer:') || line.toLowerCase().includes('correct:')) {
            answer = line.split(':')[1]?.trim() || '';
            // Extract just the letter if it's in format "Answer: A"
            const answerMatch = answer.match(/[A-Da-d]/);
            if (answerMatch && options.length >= 4) {
              const answerIndex = answerMatch[0].toLowerCase().charCodeAt(0) - 97;
              if (answerIndex >= 0 && answerIndex < options.length) {
                answer = options[answerIndex];
              }
            }
          }
          
          // Extract explanation
          if (line.toLowerCase().includes('explanation:')) {
            explanation = line.split(':').slice(1).join(':').trim();
          }
        }

        if (question && options.length >= 4 && answer) {
          questions.push({
            question,
            options: options.slice(0, 4),
            answer,
            explanation: explanation || 'No explanation provided.'
          });
        }
      }

      return questions;
    } catch (error) {
      console.error('Error parsing quiz response:', error);
      return [];
    }
  };

  const generateQuiz = async () => {
    if (!topic.trim()) {
      toast({
        title: "Please enter a topic",
        description: "Enter a subject or topic to generate quiz questions.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate mock quiz questions based on the topic
      const mockQuestions: QuizQuestion[] = [];
      
      for (let i = 0; i < numQuestions; i++) {
        const questionTemplates = [
          {
            question: `What is a fundamental concept in ${topic}?`,
            options: [
              "Basic principle A",
              "Basic principle B", 
              "Basic principle C",
              "Basic principle D"
            ],
            answer: "Basic principle A",
            explanation: `This is the correct answer because it represents the core foundation of ${topic}.`
          },
          {
            question: `Which of the following best describes ${topic}?`,
            options: [
              "Definition A - incorrect",
              "Definition B - correct", 
              "Definition C - incorrect",
              "Definition D - incorrect"
            ],
            answer: "Definition B - correct",
            explanation: `This definition accurately captures the essence of ${topic} and its key characteristics.`
          },
          {
            question: `In ${topic}, what is the most important factor to consider?`,
            options: [
              "Factor 1",
              "Factor 2", 
              "Factor 3 (correct)",
              "Factor 4"
            ],
            answer: "Factor 3 (correct)",
            explanation: `Factor 3 is crucial because it directly impacts the outcomes in ${topic} applications.`
          },
          {
            question: `How does ${topic} relate to real-world applications?`,
            options: [
              "Application method A",
              "Application method B (best answer)", 
              "Application method C",
              "Application method D"
            ],
            answer: "Application method B (best answer)",
            explanation: `This method is most effective because it combines theoretical knowledge with practical implementation.`
          },
          {
            question: `What would be the result if you apply ${topic} principles incorrectly?`,
            options: [
              "Positive outcome",
              "Negative outcome (correct)", 
              "No change",
              "Unpredictable result"
            ],
            answer: "Negative outcome (correct)",
            explanation: `Incorrect application typically leads to negative results, which is why proper understanding is essential.`
          }
        ];

        const template = questionTemplates[i % questionTemplates.length];
        mockQuestions.push({
          question: `${i + 1}. ${template.question}`,
          options: template.options,
          answer: template.answer,
          explanation: template.explanation
        });
      }

      setQuestions(mockQuestions);
      toast({
        title: "Quiz generated!",
        description: `${mockQuestions.length} questions ready. Click "Start Quiz" to begin.`,
      });

    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('Failed to generate quiz. Please try again.');
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowAnswer(false);
    setResults([]);
    setTotalStartTime(Date.now());
    setQuestionStartTime(Date.now());
  };

  const submitAnswer = () => {
    if (!selectedAnswer) {
      toast({
        title: "No answer selected",
        description: "Please select an answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const timeSpent = Date.now() - questionStartTime;
    const isCorrect = selectedAnswer === currentQuestion.answer;

    const result: QuizResult = {
      questionIndex: currentQuestionIndex,
      selectedAnswer,
      correctAnswer: currentQuestion.answer,
      isCorrect,
      timeSpent
    };

    setResults(prev => [...prev, result]);
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowAnswer(false);
      setQuestionStartTime(Date.now());
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowAnswer(false);
    setResults([]);
    setQuizStarted(false);
    setQuizCompleted(false);
    setTopic('');
    setError(null);
  };

  const retryGenerate = () => {
    setError(null);
    generateQuiz();
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const correctAnswers = results.filter(r => r.isCorrect).length;
  const totalTime = quizCompleted ? results.reduce((sum, r) => sum + r.timeSpent, 0) : 0;

  // Quiz Setup Phase
  if (!quizStarted && questions.length === 0) {
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
              <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 mb-6 transition-colors">
                <Target className="w-12 h-12 text-green-600 dark:text-green-400 transition-colors" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">AI Quiz Generator</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed transition-colors">
                Generate custom MCQ quizzes on any topic and test your knowledge with timed questions
              </p>
            </div>

            {/* Quiz Setup */}
            <LoadingStateWrapper
              isLoading={isGenerating}
              error={error}
              skeleton={<ContentCardSkeleton />}
              onRetry={retryGenerate}
            >
              <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors content-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <BookOpen className="w-5 h-5" />
                    Create Your Quiz
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="topic" className="text-gray-700 dark:text-gray-200">
                      Quiz Topic
                    </Label>
                    <Input
                      id="topic"
                      placeholder="e.g. Photosynthesis, Python Loops, World War II"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="mt-2 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="num-questions" className="text-gray-700 dark:text-gray-200">
                      Number of Questions: {numQuestions}
                    </Label>
                    <div className="mt-2 flex items-center gap-4">
                      <input
                        type="range"
                        id="num-questions"
                        min="1"
                        max="10"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="text-sm text-gray-600 dark:text-gray-300 min-w-[60px] text-center">
                        {numQuestions} MCQs
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={generateQuiz}
                    disabled={isGenerating || !topic.trim()}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4 mr-2" />
                        Generate Quiz
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </LoadingStateWrapper>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Ready to Start
  if (!quizStarted && questions.length > 0) {
    return (
      <div className="w-full min-h-screen bg-gray-100 dark:bg-black transition-colors duration-300 overflow-x-hidden box-border">
        <div className="w-full px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 mb-6 transition-colors">
                <Trophy className="w-12 h-12 text-green-600 dark:text-green-400 transition-colors" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Quiz Ready!</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 transition-colors">
                {questions.length} questions on <span className="font-semibold text-green-600 dark:text-green-400">{topic}</span>
              </p>
            </div>

            <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors content-fade-in">
              <CardContent className="p-8 text-center">
                <div className="mb-8">
                  <div className="text-6xl font-bold text-green-600 dark:text-green-400 mb-2">{questions.length}</div>
                  <div className="text-gray-600 dark:text-gray-300">Questions Ready</div>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={startQuiz}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
                  >
                    <Timer className="w-4 h-4 mr-2" />
                    Start Quiz
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={resetQuiz}
                    className="px-8 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Completed
  if (quizCompleted) {
    return (
      <div className="w-full min-h-screen bg-gray-100 dark:bg-black transition-colors duration-300 overflow-x-hidden box-border">
        <div className="w-full px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex p-6 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 mb-6 transition-colors">
                <Award className="w-12 h-12 text-green-600 dark:text-green-400 transition-colors" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Quiz Complete!</h1>
            </div>

            {/* Final Score */}
            <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors mb-6 content-fade-in">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="text-6xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {correctAnswers}/{questions.length}
                  </div>
                  <div className="text-xl text-gray-600 dark:text-gray-300">Final Score</div>
                  <div className="text-lg text-gray-500 dark:text-gray-400 mt-2">
                    {Math.round((correctAnswers / questions.length) * 100)}% Correct
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{correctAnswers}</div>
                    <div className="text-gray-600 dark:text-gray-300">Correct</div>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{questions.length - correctAnswers}</div>
                    <div className="text-gray-600 dark:text-gray-300">Incorrect</div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatTime(totalTime)}</div>
                    <div className="text-gray-600 dark:text-gray-300">Total Time</div>
                  </div>
                </div>

                <Button 
                  onClick={resetQuiz}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Take Another Quiz
                </Button>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors content-fade-in">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Question Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">
                          Question {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {formatTime(result.timeSpent)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <div>Your answer: <span className={result.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{result.selectedAnswer}</span></div>
                      {!result.isCorrect && (
                        <div>Correct answer: <span className="text-green-600 dark:text-green-400">{result.correctAnswer}</span></div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz
  return (
    <div className="w-full min-h-screen bg-gray-100 dark:bg-black transition-colors duration-300 overflow-x-hidden box-border">
      <div className="w-full px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Clock className="w-4 h-4" />
                {formatTime(Date.now() - questionStartTime)}
              </div>
            </div>
            <Progress 
              value={((currentQuestionIndex + 1) / questions.length) * 100} 
              className="h-2"
            />
          </div>

          {/* Question Card */}
          <LoadingStateWrapper
            isLoading={false}
            error={null}
            skeleton={<QuizQuestionSkeleton />}
          >
            <Card className="bg-white dark:bg-zinc-900 backdrop-blur-sm border-0 shadow-lg dark:shadow-white/10 transition-colors content-fade-in">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-white leading-relaxed">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup 
                  value={selectedAnswer} 
                  onValueChange={setSelectedAnswer}
                  disabled={showAnswer}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === currentQuestion.answer;
                    
                    let optionClass = "p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800";
                    
                    if (showAnswer) {
                      if (isCorrect) {
                        optionClass += " border-green-500 bg-green-50 dark:bg-green-900/20";
                      } else if (isSelected && !isCorrect) {
                        optionClass += " border-red-500 bg-red-50 dark:bg-red-900/20";
                      } else {
                        optionClass += " border-gray-200 dark:border-zinc-700";
                      }
                    } else {
                      optionClass += isSelected 
                        ? " border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                        : " border-gray-200 dark:border-zinc-700";
                    }

                    return (
                      <div key={index} className={optionClass}>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <label 
                            htmlFor={`option-${index}`} 
                            className="flex-1 cursor-pointer text-gray-900 dark:text-white"
                          >
                            {option}
                          </label>
                          {showAnswer && isCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          )}
                          {showAnswer && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </RadioGroup>

                {showAnswer && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 animate-in slide-in-from-top-2 duration-300 content-fade-in">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">Explanation</div>
                        <div className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                          {currentQuestion.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {!showAnswer ? (
                    <Button 
                      onClick={submitAnswer}
                      disabled={!selectedAnswer}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Answer
                    </Button>
                  ) : (
                    <Button 
                      onClick={nextQuestion}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                    >
                      {currentQuestionIndex < questions.length - 1 ? (
                        <>
                          Next Question
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          View Results
                          <Trophy className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </LoadingStateWrapper>
        </div>
      </div>
    </div>
  );
}