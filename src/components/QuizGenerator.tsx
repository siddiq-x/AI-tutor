import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Send, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  ArrowLeft,
  Clock,
  Trophy,
  Brain,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface QuizResult {
  questionId: number;
  selectedAnswer: string;
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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Dynamic quiz question generator based on topic
  const generateTopicQuestions = (topic: string, count: number): QuizQuestion[] => {
    const questions: QuizQuestion[] = [];

    // More specific topic-based question generation
    const getTopicSpecificQuestions = (topic: string) => {
      const topicLower = topic.toLowerCase();
      
      // Biology/Life Sciences
      if (topicLower.includes('biology') || topicLower.includes('life') || topicLower.includes('cell') || topicLower.includes('dna')) {
        return [
          {
            question: `What is the basic unit of life in ${topic}?`,
            options: ["Cell", "Atom", "Molecule", "Tissue"],
            answer: "Cell",
            explanation: `The cell is the fundamental unit of life and the basic building block of all living organisms.`
          },
          {
            question: `Which process is essential for energy production in living organisms studying ${topic}?`,
            options: ["Photosynthesis", "Cellular respiration", "Both A and B", "Neither A nor B"],
            answer: "Both A and B",
            explanation: `Both photosynthesis and cellular respiration are crucial for energy conversion in living systems.`
          },
          {
            question: `What carries genetic information in ${topic}?`,
            options: ["DNA", "RNA", "Proteins", "All of the above"],
            answer: "All of the above",
            explanation: `DNA stores genetic information, RNA helps express it, and proteins carry out cellular functions.`
          }
        ];
      }
      
      // Physics
      if (topicLower.includes('physics') || topicLower.includes('force') || topicLower.includes('energy') || topicLower.includes('motion')) {
        return [
          {
            question: `What is Newton's first law related to ${topic}?`,
            options: ["F = ma", "An object at rest stays at rest", "E = mc²", "P = mv"],
            answer: "An object at rest stays at rest",
            explanation: `Newton's first law states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force.`
          },
          {
            question: `In ${topic}, what is the unit of force?`,
            options: ["Newton", "Joule", "Watt", "Pascal"],
            answer: "Newton",
            explanation: `The Newton (N) is the SI unit of force, named after Sir Isaac Newton.`
          },
          {
            question: `What type of energy is associated with motion in ${topic}?`,
            options: ["Potential energy", "Kinetic energy", "Thermal energy", "Chemical energy"],
            answer: "Kinetic energy",
            explanation: `Kinetic energy is the energy possessed by an object due to its motion.`
          }
        ];
      }
      
      // Mathematics
      if (topicLower.includes('math') || topicLower.includes('algebra') || topicLower.includes('calculus') || topicLower.includes('geometry')) {
        return [
          {
            question: `In ${topic}, what is the value of π (pi) approximately?`,
            options: ["3.14159", "2.71828", "1.41421", "1.61803"],
            answer: "3.14159",
            explanation: `Pi (π) is approximately 3.14159, representing the ratio of a circle's circumference to its diameter.`
          },
          {
            question: `What is the derivative of x² in ${topic}?`,
            options: ["2x", "x²", "2", "x"],
            answer: "2x",
            explanation: `Using the power rule in calculus, the derivative of x² is 2x.`
          },
          {
            question: `In ${topic}, what is the Pythagorean theorem?`,
            options: ["a² + b² = c²", "a + b = c", "a² - b² = c²", "ab = c²"],
            answer: "a² + b² = c²",
            explanation: `The Pythagorean theorem states that in a right triangle, a² + b² = c², where c is the hypotenuse.`
          }
        ];
      }
      
      // History
      if (topicLower.includes('history') || topicLower.includes('war') || topicLower.includes('revolution') || topicLower.includes('ancient')) {
        return [
          {
            question: `What is a primary source in ${topic}?`,
            options: ["A textbook", "A firsthand account", "A Wikipedia article", "A documentary"],
            answer: "A firsthand account",
            explanation: `A primary source is an original document or firsthand account from the time period being studied.`
          },
          {
            question: `Why is chronology important in studying ${topic}?`,
            options: ["To understand cause and effect", "To memorize dates", "To pass exams", "To impress others"],
            answer: "To understand cause and effect",
            explanation: `Chronology helps historians understand how events influenced each other over time.`
          },
          {
            question: `What method do historians use to verify facts about ${topic}?`,
            options: ["Cross-referencing sources", "Guessing", "Using only one source", "Ignoring evidence"],
            answer: "Cross-referencing sources",
            explanation: `Historians verify facts by comparing multiple reliable sources and evidence.`
          }
        ];
      }
      
      // Chemistry
      if (topicLower.includes('chemistry') || topicLower.includes('chemical') || topicLower.includes('atom') || topicLower.includes('molecule')) {
        return [
          {
            question: `What is the smallest unit of an element in ${topic}?`,
            options: ["Atom", "Molecule", "Ion", "Compound"],
            answer: "Atom",
            explanation: `An atom is the smallest unit of an element that retains the chemical properties of that element.`
          },
          {
            question: `In ${topic}, what determines an element's identity?`,
            options: ["Number of protons", "Number of electrons", "Number of neutrons", "Atomic mass"],
            answer: "Number of protons",
            explanation: `The number of protons (atomic number) determines an element's identity and chemical properties.`
          },
          {
            question: `What type of bond involves sharing electrons in ${topic}?`,
            options: ["Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond"],
            answer: "Covalent bond",
            explanation: `Covalent bonds form when atoms share electrons to achieve stable electron configurations.`
          }
        ];
      }
      
      // Default generic questions for any topic
      return [
        {
          question: `What is the most effective way to learn about ${topic}?`,
          options: ["Active practice and application", "Passive reading only", "Memorization without understanding", "Avoiding difficult concepts"],
          answer: "Active practice and application",
          explanation: `Active learning through practice and real-world application is the most effective way to master ${topic}.`
        },
        {
          question: `When studying ${topic}, what should you do if you don't understand a concept?`,
          options: ["Skip it and move on", "Ask questions and seek help", "Memorize it anyway", "Give up completely"],
          answer: "Ask questions and seek help",
          explanation: `Asking questions and seeking help when confused is crucial for deep understanding of ${topic}.`
        },
        {
          question: `What makes someone proficient in ${topic}?`,
          options: ["Understanding fundamentals and regular practice", "Memorizing facts only", "Natural talent alone", "Avoiding challenges"],
          answer: "Understanding fundamentals and regular practice",
          explanation: `Proficiency in ${topic} comes from solid foundational knowledge combined with consistent practice.`
        }
      ];
    };

    const questionPool = getTopicSpecificQuestions(topic);

    // Generate the requested number of questions from the pool
    for (let i = 0; i < count; i++) {
      const baseQuestion = questionPool[i % questionPool.length];
      questions.push({
        ...baseQuestion,
        id: i + 1
      });
    }

    return questions;
  };

  const generateQuiz = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for the quiz.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate dynamic mock questions based on the topic
      const mockQuestions = generateTopicQuestions(topic, numQuestions);
      
      setQuestions(mockQuestions);
      toast({
        title: "Quiz generated!",
        description: `Generated ${mockQuestions.length} questions on ${topic}.`,
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
    setQuestionStartTime(Date.now());
  };

  const selectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const submitAnswer = () => {
    if (!selectedAnswer) {
      toast({
        title: "Answer required",
        description: "Please select an answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.answer;
    const timeSpent = Date.now() - questionStartTime;

    const result: QuizResult = {
      questionId: currentQuestion.id,
      selectedAnswer,
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
    setQuestionStartTime(0);
    setError(null);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const correctAnswers = results.filter(r => r.isCorrect).length;
  const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);

  // Debug logging
  console.log('Quiz Debug:', {
    quizStarted,
    questionsLength: questions.length,
    currentQuestionIndex,
    currentQuestion,
    hasOptions: currentQuestion?.options?.length,
    options: currentQuestion?.options
  });

  if (quizCompleted) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-green-700">Correct Answers</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.round((correctAnswers / questions.length) * 100)}%</div>
                <div className="text-sm text-blue-700">Score</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Math.round(totalTime / 1000)}s</div>
                <div className="text-sm text-purple-700">Total Time</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Review Your Answers</h3>
              {questions.map((question, index) => {
                const result = results[index];
                return (
                  <div key={question.id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      {result.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{question.question}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Your answer: <span className={result.isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {result.selectedAnswer}
                          </span>
                        </p>
                        {!result.isCorrect && (
                          <p className="text-sm text-green-600 mt-1">
                            Correct answer: {question.answer}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={resetQuiz} className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Take Another Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizStarted && questions.length > 0 && currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={resetQuiz}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Setup
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="w-32" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              {topic} Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-black rounded-lg">
              <h3 className="text-lg font-medium mb-4 text-white">{currentQuestion.question}</h3>
              <div className="space-y-3">
                <div className="text-xs text-gray-500 mb-2">
                  Debug: {currentQuestion?.options?.length || 0} options found
                </div>
                {currentQuestion?.options && Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0 ? (
                  currentQuestion.options.map((option, index) => (
                    <button
                      key={`option-${index}`}
                      onClick={() => selectAnswer(option)}
                      disabled={showAnswer}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 font-medium ${
                        selectedAnswer === option
                          ? showAnswer
                            ? option === currentQuestion.answer
                              ? 'bg-green-100 border-green-500 text-green-700 shadow-md'
                              : 'bg-red-100 border-red-500 text-red-700 shadow-md'
                            : 'bg-black border-black text-white shadow-md'
                          : showAnswer && option === currentQuestion.answer
                          ? 'bg-green-100 border-green-500 text-green-700 shadow-md'
                          : 'bg-black border-black text-white hover:bg-gray-800 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold mr-3 text-black">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option || 'Empty option'}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                    <div>No options available for this question.</div>
                    <div className="text-xs mt-2">
                      Debug info: 
                      <br />- Current question exists: {currentQuestion ? 'Yes' : 'No'}
                      <br />- Options property exists: {currentQuestion?.options ? 'Yes' : 'No'}
                      <br />- Options is array: {Array.isArray(currentQuestion?.options) ? 'Yes' : 'No'}
                      <br />- Options length: {currentQuestion?.options?.length || 0}
                      <br />- Options content: {JSON.stringify(currentQuestion?.options)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {showAnswer && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                <p className="text-blue-800">{currentQuestion.explanation}</p>
              </div>
            )}

            <div className="flex justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                Time: {Math.round((Date.now() - questionStartTime) / 1000)}s
              </div>
              {!showAnswer ? (
                <Button onClick={submitAnswer} disabled={!selectedAnswer}>
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={nextQuestion}>
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Quiz Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">Quiz Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter the topic for your quiz (e.g., Biology, History, Mathematics)"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="numQuestions">Number of Questions</Label>
              <Input
                id="numQuestions"
                type="number"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                className="mt-1"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <Button
            onClick={generateQuiz}
            disabled={isGenerating || !topic.trim()}
            className="w-full flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate Quiz
              </>
            )}
          </Button>

          {questions.length > 0 && !quizStarted && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Quiz Ready!</span>
                </div>
                <p className="text-green-600 mt-1">
                  Generated {questions.length} questions about {topic}
                </p>
              </div>
              <Button onClick={startQuiz} className="w-full flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Start Quiz
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
