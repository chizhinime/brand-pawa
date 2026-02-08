// src/pages/dashboard/diagnostic/1/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../lib/supabase';
import {
  FiArrowLeft, FiCheck, FiChevronRight, FiChevronLeft,
  FiShare2, FiMail, FiStar, FiFacebook,
  FiTwitter, FiLinkedin, FiExternalLink, FiRefreshCw,
  FiBarChart2, FiUsers, FiTarget, FiTrendingUp,
  FiMessageSquare, FiDroplet, FiHeart, FiGlobe,
  FiInstagram, FiEye, FiCreditCard, FiCheckCircle
} from 'react-icons/fi';
import { BsWhatsapp } from 'react-icons/bs';

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    value: 'yes' | 'somewhat' | 'no';
    points: number;
  }[];
}

interface Pillar {
  name: string;
  questions: number[];
  score: number;
  maxScore: number;
  description: string;
  actionSteps: string[];
}

interface DiagnosticProgress {
  id: string;
  answers: Record<number, number>;
  progress_percentage: number;
  current_question: number;
}

const questions: Question[] = [
  {
    id: 1,
    text: "When people hear your brand name, do they instantly connect it with a specific solution, feeling, or category?",
    options: [
      { text: "Yes", value: "yes", points: 10 },
      { text: "Somewhat", value: "somewhat", points: 5 },
      { text: "No", value: "no", points: 0 }
    ]
  },
  {
    id: 2,
    text: "Does your brand have a clear promise or transformation that sets you apart from competitors?",
    options: [
      { text: "Yes", value: "yes", points: 10 },
      { text: "It needs work", value: "somewhat", points: 5 },
      { text: "No", value: "no", points: 0 }
    ]
  },
  {
    id: 3,
    text: "Is your visual identity (logo, colors, design style) consistent across all platforms?",
    options: [
      { text: "Yes", value: "yes", points: 10 },
      { text: "Inconsistently", value: "somewhat", points: 5 },
      { text: "No", value: "no", points: 0 }
    ]
  },
  {
    id: 4,
    text: "Do people discover and reach out to you because of your online presence?",
    options: [
      { text: "Yes", value: "yes", points: 10 },
      { text: "Occasionally", value: "somewhat", points: 5 },
      { text: "No", value: "no", points: 0 }
    ]
  },
  {
    id: 5,
    text: "Does your website or landing page instantly communicate what you do, who it's for, and why it matters?",
    options: [
      { text: "Yes", value: "yes", points: 10 },
      { text: "Needs clarity", value: "somewhat", points: 5 },
      { text: "No", value: "no", points: 0 }
    ]
  },
  {
    id: 6,
    text: "Is your social media strategically aligned to attract the audience you want — not just active?",
    options: [
      { text: "Yes", value: "yes", points: 10 },
      { text: "Somewhat", value: "somewhat", points: 5 },
      { text: "No", value: "no", points: 0 }
    ]
  },
  {
    id: 7,
    text: "Do people recommend you because they clearly understand and trust your value?",
    options: [
      { text: "Yes", value: "yes", points: 10 },
      { text: "Rarely", value: "somewhat", points: 5 },
      { text: "No", value: "no", points: 0 }
    ]
  },
  {
    id: 8,
    text: "Can your audience describe your brand in one clear sentence without confusion?",
    options: [
      { text: "Yes", value: "yes", points: 10 },
      { text: "Not always", value: "somewhat", points: 5 },
      { text: "No", value: "no", points: 0 }
    ]
  },
  {
    id: 9,
    text: "Do you have a structured system for creating and distributing content that nurtures leads into clients?",
    options: [
      { text: "Yes", value: "yes", points: 10 },
      { text: "Partially", value: "somewhat", points: 5 },
      { text: "No", value: "no", points: 0 }
    ]
  },
  {
    id: 10,
    text: "Is your brand currently generating paying clients, partnerships, or speaking opportunities?",
    options: [
      { text: "Yes", value: "yes", points: 10 },
      { text: "Not enough", value: "somewhat", points: 5 },
      { text: "No", value: "no", points: 0 }
    ]
  }
];

export default function BrandPawaScoreDiagnostic() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [hasExistingResult, setHasExistingResult] = useState(false);
  const [existingResult, setExistingResult] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [progress, setProgress] = useState<DiagnosticProgress | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    console.log('Starting user check...');
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    
    if (error || !authUser) {
      console.error('Auth error or no user:', error);
      router.push('/');
      return;
    }
    
    console.log('User authenticated:', authUser.id);
    setUser(authUser);
    
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (profileError) {
        console.error('Profile fetch error:', profileError);
        
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .upsert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
            plan: 'free',
            brand_score: 0,
            brand_stage: 'Weak Pawa',
            diagnostic_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Profile creation error:', createError);
        } else {
          console.log('Profile created:', newProfile);
          setUserName(newProfile.full_name || authUser.email?.split('@')[0] || 'User');
          setIsProUser(newProfile.plan === 'pro' || newProfile.plan === 'enterprise');
        }
      } else {
        console.log('Profile found:', profile);
        setUserName(profile.full_name || authUser.email?.split('@')[0] || 'User');
        setIsProUser(profile.plan === 'pro' || profile.plan === 'enterprise');
      }
      
      // Check for existing completed result
      const { data: existingResult, error: resultError } = await supabase
        .from('user_diagnostics')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('diagnostic_id', 1)
        .eq('is_completed', true)
        .single();
      
      if (resultError && resultError.code !== 'PGRST116') {
        console.error('Existing result error:', resultError);
      }
      
      if (existingResult) {
        console.log('Existing result found:', existingResult);
        setHasExistingResult(true);
        setExistingResult(existingResult);
        setShowResults(true);
        setTotalScore(existingResult.score);
        setPillars(existingResult.result_data?.pillars || []);
        setLoading(false);
        return;
      } else {
        console.log('No existing result found');
      }
      
      // Check for existing progress
      const { data: progressData, error: progressError } = await supabase
        .from('diagnostic_progress')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('diagnostic_id', 1)
        .single();
      
      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Progress fetch error:', progressError);
      }
      
      if (progressData) {
        console.log('Progress found:', progressData);
        setProgress(progressData);
        const savedAnswers = progressData.answers as Record<number, number> || {};
        setAnswers(savedAnswers);
        
        // Set current question based on progress
        const answeredCount = Object.keys(savedAnswers).length;
        console.log('Answered questions:', answeredCount);
        
        if (answeredCount > 0 && answeredCount < questions.length) {
          setCurrentQuestion(answeredCount);
        } else if (answeredCount === questions.length) {
          // All questions answered but results not shown
          console.log('All questions answered, calculating results...');
          calculateResults(savedAnswers);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in checkUser:', error);
      setLoading(false);
    }
  };

  const handleAnswer = async (questionId: number, points: number) => {
    if (saving) return;
    
    setSaving(true);
    const newAnswers = { ...answers, [questionId]: points };
    setAnswers(newAnswers);
    
    // Save progress
    await saveProgress(newAnswers);
    
    // Auto-advance after delay
    setTimeout(() => {
      setSaving(false);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        console.log('All questions answered, calculating final results...');
        calculateResults(newAnswers);
      }
    }, 300);
  };

  const saveProgress = async (answers: Record<number, number>) => {
    if (!user) {
      console.error('No user for saving progress');
      return;
    }
    
    const progressPercentage = Math.round((Object.keys(answers).length / questions.length) * 100);
    const currentQuestionNum = Object.keys(answers).length;
    
    const progressData = {
      user_id: user.id,
      diagnostic_id: 1,
      answers: answers,
      progress_percentage: progressPercentage,
      current_question: currentQuestionNum,
      updated_at: new Date().toISOString()
    };
    
    try {
      console.log('Saving progress:', progressData);
      const { error } = await supabase
        .from('diagnostic_progress')
        .upsert(progressData, { 
          onConflict: 'user_id,diagnostic_id'
        });
      
      if (error) {
        console.error('Error saving progress:', error);
        throw error;
      }
      
      console.log('Progress saved successfully');
    } catch (error) {
      console.error('Error in saveProgress:', error);
    }
  };

  const calculateResults = (answers: Record<number, number>) => {
    console.log('Calculating results with answers:', answers);
    const total = Object.values(answers).reduce((sum, points) => sum + points, 0);
    console.log('Total score:', total);
    setTotalScore(total);
    
    // Calculate pillars
    const pillarDefinitions: Omit<Pillar, 'score'>[] = [
      {
        name: 'Positioning & Recognition',
        questions: [1, 8],
        maxScore: 20,
        description: 'How clearly your brand is positioned and recognized in the market',
        actionSteps: [
          'Define a clear positioning statement',
          'Create consistent brand messaging',
          'Audit how competitors position themselves'
        ]
      },
      {
        name: 'Messaging & Promise',
        questions: [2, 6],
        maxScore: 20,
        description: 'Clarity and distinctiveness of your brand promise and messaging',
        actionSteps: [
          'Refine your unique value proposition',
          'Develop a messaging framework',
          'Test messaging with your target audience'
        ]
      },
      {
        name: 'Identity & Presence',
        questions: [3, 5],
        maxScore: 20,
        description: 'Visual consistency and online presence effectiveness',
        actionSteps: [
          'Audit all visual assets for consistency',
          'Optimize website for instant clarity',
          'Create brand guidelines document'
        ]
      },
      {
        name: 'Influence & Perception',
        questions: [4, 7],
        maxScore: 20,
        description: 'Brand influence, trust, and recommendation factor',
        actionSteps: [
          'Build thought leadership content',
          'Implement a referral program',
          'Collect and showcase testimonials'
        ]
      },
      {
        name: 'Growth & Conversion',
        questions: [9, 10],
        maxScore: 20,
        description: 'Systems for lead nurturing and revenue generation',
        actionSteps: [
          'Create a content distribution system',
          'Develop conversion optimization strategy',
          'Set up CRM and lead scoring'
        ]
      }
    ];

    const calculatedPillars = pillarDefinitions.map(pillar => {
      const pillarScore = pillar.questions.reduce((sum, qId) => sum + (answers[qId] || 0), 0);
      return { ...pillar, score: pillarScore };
    });

    console.log('Calculated pillars:', calculatedPillars);
    setPillars(calculatedPillars);
    setShowResults(true);
    
    // Save final results
    saveFinalResults(total, calculatedPillars, answers);
  };

  const saveFinalResults = async (score: number, pillars: Pillar[], answers: Record<number, number>) => {
    if (!user) {
      console.error('No user for saving final results');
      return;
    }
    
    console.log('Starting to save final results...');
    setLoading(true);
    
    try {
      const stage = getScoreStage(score);
      console.log('Score stage:', stage);
      
      const resultData = {
        pillars: pillars,
        overall_score: score,
        stage: stage.name,
        tagline: stage.tagline,
        diagnosis: stage.diagnosis,
        next_step: stage.nextStep,
        answers: answers,
        timestamp: new Date().toISOString()
      };
      
      console.log('Result data to save:', resultData);
      
      // Save diagnostic result
      const { data: diagnosticData, error: diagnosticError } = await supabase
        .from('user_diagnostics')
        .upsert({
          user_id: user.id,
          diagnostic_id: 1,
          diagnostic_name: 'BrandPawa Score',
          score: score,
          answers: answers,
          result_data: resultData,
          is_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id,diagnostic_id'
        })
        .select();
      
      if (diagnosticError) {
        console.error('Diagnostic save error:', diagnosticError);
        throw diagnosticError;
      }
      
      console.log('Diagnostic saved successfully:', diagnosticData);
      
      // Get current diagnostic count
      const { data: existingDiagnostics, error: countError } = await supabase
        .from('user_diagnostics')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_completed', true);
      
      if (countError) {
        console.error('Count error:', countError);
      }
      
      const diagnosticCount = existingDiagnostics?.length || 0;
      console.log('Diagnostic count:', diagnosticCount);
      
      // Update user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          brand_score: score,
          brand_stage: stage.name,
          last_diagnostic_at: new Date().toISOString(),
          diagnostic_count: diagnosticCount,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
        .select();
      
      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }
      
      console.log('Profile updated successfully:', profileData);
      
      // Clear progress
      const { error: progressError } = await supabase
        .from('diagnostic_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('diagnostic_id', 1);
      
      if (progressError) {
        console.error('Progress clear error:', progressError);
        // Don't throw, just log
      }
      
      console.log('Progress cleared');
      
      // Add activity
      const { data: activityData, error: activityError } = await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: 'test_completed',
          metadata: {
            diagnostic: 'BrandPawa Score',
            score: score,
            stage: stage.name
          },
          diagnostic_id: 1,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (activityError) {
        console.error('Activity save error:', activityError);
        // Don't throw, just log
      }
      
      console.log('Activity saved:', activityData);
      
      // Add to score history
      const { data: historyData, error: historyError } = await supabase
        .from('brand_score_history')
        .insert({
          user_id: user.id,
          diagnostic_id: 1,
          score: score,
          result_data: resultData,
          taken_at: new Date().toISOString()
        })
        .select();
      
      if (historyError) {
        console.error('History save error:', historyError);
        // Don't throw, just log
      }
      
      console.log('History saved:', historyData);
      
      alert('Results saved successfully! You can now view them in your dashboard.');
      
    } catch (error) {
      console.error('Error saving final results:', error);
      alert('There was an error saving your results. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreStage = (score: number) => {
    if (score >= 81) {
      return {
        name: 'Dominant Pawa',
        tagline: 'Your brand commands attention. Now scale it to command markets.',
        diagnosis: 'Your brand is clear, trusted, and already producing results. The challenge now is expansion and authority at scale.',
        nextStep: 'Focus on: Thought leadership, Partnerships, Market expansion, Global positioning',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      };
    } else if (score >= 61) {
      return {
        name: 'Active Pawa',
        tagline: 'You\'re not just seen — you\'re starting to be felt.',
        diagnosis: 'You have recognition, presence, and some conversion. The missing piece is alignment and systems.',
        nextStep: 'Refine: Content strategy, Authority positioning, Conversion systems',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      };
    } else if (score >= 31) {
      return {
        name: 'Emerging Pawa',
        tagline: 'You have sparks of power, but they\'re scattered. It\'s time to channel them.',
        diagnosis: 'You\'re visible, but inconsistent. Your audience can\'t yet trust or recognize your brand at scale.',
        nextStep: 'Strengthen: Brand message, Consistency across platforms, Clear value articulation',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      };
    } else {
      return {
        name: 'Weak Pawa',
        tagline: 'Invisible doesn\'t mean powerless — but right now, nobody can feel your brand.',
        diagnosis: 'Your brand lacks foundational clarity. Messaging, identity, or visibility is either missing or unclear.',
        nextStep: 'Start with clarity: Who are you? What do you do? Who exactly do you serve?',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRetakeTest = async () => {
    if (!user) {
      alert('Please log in to retake the test.');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Starting test retake...');
      
      // Clear progress
      const { error: progressError } = await supabase
        .from('diagnostic_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('diagnostic_id', 1);
      
      if (progressError) {
        console.error('Progress clear error:', progressError);
      }
      
      // Clear existing results
      const { error: diagnosticError } = await supabase
        .from('user_diagnostics')
        .delete()
        .eq('user_id', user.id)
        .eq('diagnostic_id', 1);
      
      if (diagnosticError) {
        console.error('Diagnostic clear error:', diagnosticError);
      }
      
      console.log('Reset state');
      // Reset state
      setAnswers({});
      setShowResults(false);
      setCurrentQuestion(0);
      setTotalScore(0);
      setPillars([]);
      setHasExistingResult(false);
      setExistingResult(null);
      setProgress(null);
      
      // Add activity
      const { error: activityError } = await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: 'test_retaken',
          metadata: { diagnostic: 'BrandPawa Score' },
          diagnostic_id: 1,
          created_at: new Date().toISOString()
        });
      
      if (activityError) {
        console.error('Activity error:', activityError);
      }
      
      alert('Test reset successfully! You can now retake it.');
      
    } catch (error) {
      console.error('Error retaking test:', error);
      alert('There was an error resetting the test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform: string) => {
    const stage = getScoreStage(totalScore);
    const shareText = `I just ran my BrandPawa Score diagnostic and discovered I have ${stage.name} (${totalScore}/100)! Find out your brand's true power → ${window.location.origin}`;
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    }
    
    // Save share to database
    if (user) {
      supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: 'share',
          metadata: { platform: platform, diagnostic: 'BrandPawa Score' },
          diagnostic_id: 1,
          created_at: new Date().toISOString()
        })
        .then(({ error }) => {
          if (error) console.error('Share save error:', error);
        });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 81) return 'text-green-600';
    if (score >= 61) return 'text-blue-600';
    if (score >= 31) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 81) return 'bg-green-100';
    if (score >= 61) return 'bg-blue-100';
    if (score >= 31) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const answeredCount = Object.keys(answers).length;
    
    return (
      <div className="min-h-screen bg-[#FAF0FF] p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-4"
            >
              <FiArrowLeft />
              <span className="text-sm">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">BrandPawa Score™</h1>
                <p className="text-gray-600 text-sm">Question {currentQuestion + 1} of {questions.length}</p>
              </div>
              {saving && (
                <span className="text-sm text-gray-500">Saving...</span>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{answeredCount}/{questions.length} answered</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            {hasExistingResult ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="text-green-600 text-2xl" />
                </div>
                <h2 className="text-xl font-bold mb-2">You've Already Completed This Test!</h2>
                <p className="text-gray-600 mb-4">
                  Your score: <span className={`text-3xl font-bold ${getScoreColor(existingResult.score)}`}>
                    {existingResult.score}/100
                  </span>
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleRetakeTest}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Resetting...' : 'Retake Test'}
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full py-3 bg-white border border-purple-300 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-bold mb-2">Question {question.id}:</h2>
                  <p className="text-gray-700 text-lg">{question.text}</p>
                </div>
                
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(question.id, option.points)}
                      disabled={saving}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        answers[question.id] === option.points
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      } disabled:opacity-50`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{option.text}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{option.points} pts</span>
                          {answers[question.id] === option.points && (
                            <FiCheck className="text-green-500" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Navigation */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0 || saving}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                      currentQuestion === 0 ? 'text-gray-400' : 'text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <FiChevronLeft />
                    <span>Previous</span>
                  </button>
                  
                  <button
                    onClick={handleNext}
                    disabled={!answers[question.id] || currentQuestion === questions.length - 1 || saving}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                      !answers[question.id]
                        ? 'text-gray-400'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                    }`}
                  >
                    <span>{currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}</span>
                    <FiChevronRight />
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Test Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold mb-3">About This Diagnostic</h3>
            <p className="text-gray-600 text-sm mb-4">
              Measures your brand's foundational strength across 10 critical areas. Each question is worth 10 points.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Yes = 10 pts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Somewhat = 5 pts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">No = 0 pts</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FiCheck className="text-green-500" />
                  <span className="text-sm">Overall Score</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCheck className="text-green-500" />
                  <span className="text-sm">Stage Diagnosis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCheck className="text-green-500" />
                  <span className="text-sm">Action Plan</span>
                </div>
              </div>
            </div>
            
            {/* Debug button - remove in production */}
            {debugMode && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <button
                  onClick={async () => {
                    const { data } = await supabase
                      .from('user_diagnostics')
                      .select('*')
                      .eq('user_id', user?.id);
                    console.log('Current diagnostics:', data);
                  }}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  Debug: Check DB
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    const stage = getScoreStage(totalScore);
    const progress = (totalScore / 100) * 100;
    
    return (
      <div className="min-h-screen bg-[#FAF0FF] p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-4"
            >
              <FiArrowLeft />
              <span className="text-sm">Back to Dashboard</span>
            </button>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Your BrandPawa Score Results</h1>
                <p className="text-gray-600">{userName}, here's your brand's power analysis</p>
              </div>
              <div className="flex space-x-3 mt-4 md:mt-0">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-4 py-2 bg-white border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition flex items-center space-x-2"
                >
                  <FiShare2 />
                  <span className="hidden sm:inline">Share</span>
                </button>
                <button
                  onClick={handleRetakeTest}
                  disabled={loading}
                  className="px-4 py-2 bg-white border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition flex items-center space-x-2 disabled:opacity-50"
                >
                  <FiRefreshCw />
                  <span className="hidden sm:inline">Retake</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Score Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overall Score */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Overall BrandPawa Score</h2>
                    <p className="text-gray-600">Your brand's power pulse check</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-center">
                    <div className="text-5xl md:text-6xl font-bold text-purple-600">{totalScore}<span className="text-2xl md:text-3xl text-gray-400">/100</span></div>
                    <div className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${stage.color} ${stage.bgColor}`}>
                      {stage.name}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Score Breakdown</span>
                      <span>{totalScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${stage.bgColor}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${stage.bgColor}`}>
                    <div className="font-bold mb-1">{stage.tagline}</div>
                    <p className="text-sm text-gray-700">{stage.diagnosis}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold mb-2">Next Step:</h3>
                    <p className="text-gray-700">{stage.nextStep}</p>
                  </div>
                </div>
              </div>
              
              {/* Pillar Breakdown */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Pillar Breakdown</h2>
                  {!isProUser && (
                    <span className="text-sm bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                      Pro Feature
                    </span>
                  )}
                </div>
                
                <div className="space-y-4">
                  {pillars.map((pillar, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold">{pillar.name}</h3>
                          <p className="text-sm text-gray-600">{pillar.description}</p>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {pillar.score}<span className="text-lg text-gray-400">/{pillar.maxScore}</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
                            style={{ width: `${(pillar.score / pillar.maxScore) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {isProUser ? (
                        <div>
                          <h4 className="font-semibold mb-2 text-sm">Action Steps:</h4>
                          <ul className="text-sm space-y-1">
                            {pillar.actionSteps.map((step, i) => (
                              <li key={i} className="flex items-start space-x-2">
                                <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
                          <p className="text-sm mb-2">
                            Upgrade to Pro to see detailed action steps.
                          </p>
                          <button
                            onClick={() => router.push('/dashboard?section=billing')}
                            className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded text-sm font-semibold hover:shadow-lg transition"
                          >
                            Upgrade to Pro
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Share Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold mb-4">Share Your Results</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex flex-col items-center justify-center"
                  >
                    <FiTwitter className="text-xl mb-1" />
                    <span className="text-xs">Twitter</span>
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex flex-col items-center justify-center"
                  >
                    <FiFacebook className="text-xl mb-1" />
                    <span className="text-xs">Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="p-3 bg-blue-200 text-blue-800 rounded-lg hover:bg-blue-300 transition flex flex-col items-center justify-center"
                  >
                    <FiLinkedin className="text-xl mb-1" />
                    <span className="text-xs">LinkedIn</span>
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition flex flex-col items-center justify-center"
                  >
                    <BsWhatsapp className="text-xl mb-1" />
                    <span className="text-xs">WhatsApp</span>
                  </button>
                </div>
              </div>
              
              {/* Next Steps */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="font-bold mb-4">Next Steps</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/tools/guides')}
                    className="w-full text-left p-3 bg-white/20 hover:bg-white/30 rounded-lg transition"
                  >
                    <div className="font-semibold">40-Day Brand Guide</div>
                    <div className="text-xs opacity-90">Comprehensive roadmap</div>
                  </button>
                  <button 
                    onClick={() => router.push('/tools/monetization')}
                    className="w-full text-left p-3 bg-white/20 hover:bg-white/30 rounded-lg transition"
                  >
                    <div className="font-semibold">Brand To Sell 101</div>
                    <div className="text-xs opacity-90">Monetization strategy</div>
                  </button>
                  <button 
                    onClick={() => window.open('https://calendly.com/brandpawa', '_blank')}
                    className="w-full text-left p-3 bg-white/20 hover:bg-white/30 rounded-lg transition"
                  >
                    <div className="font-semibold">Book a Call</div>
                    <div className="text-xs opacity-90">1:1 strategy session</div>
                  </button>
                </div>
              </div>
              
              {/* More Tests */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold mb-4">Continue Your Journey</h3>
                <div className="space-y-3">
                  {[
                    { id: '2', name: 'Color Power', icon: <FiDroplet /> },
                    { id: '3', name: 'Brand Personality', icon: <FiHeart /> },
                    { id: '7', name: 'Positioning', icon: <FiMessageSquare /> },
                  ].map((diag) => (
                    <button
                      key={diag.id}
                      onClick={() => router.push(`/dashboard/diagnostic/${diag.id}`)}
                      className="w-full text-left p-3 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-lg transition flex items-center space-x-3"
                    >
                      {diag.icon}
                      <span className="font-medium">{diag.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Live Score Wall */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Live BrandPawa Score Wall</h3>
              <span className="text-sm text-purple-600">Recent Test-Takers</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'Alex', score: 85, test: 'BrandPawa' },
                { name: 'Sarah', score: 72, test: 'Color' },
                { name: 'James', score: 91, test: 'Positioning' },
                { name: 'Maria', score: 65, test: 'BrandPawa' },
              ].map((item, i) => (
                <div key={i} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <div className="font-bold text-purple-600 text-sm">{item.name}</div>
                  <div className="text-2xl font-bold">{item.score}<span className="text-lg text-gray-500">/100</span></div>
                  <div className="text-xs text-gray-600">{item.test}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Share Your Results</h3>
              <p className="text-gray-600 text-sm mb-6">
                Share your score and challenge others!
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex flex-col items-center justify-center"
                >
                  <FiTwitter className="text-2xl mb-2" />
                  <span className="text-sm">Twitter</span>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex flex-col items-center justify-center"
                >
                  <FiFacebook className="text-2xl mb-2" />
                  <span className="text-sm">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="p-4 bg-blue-200 text-blue-800 rounded-lg hover:bg-blue-300 transition flex flex-col items-center justify-center"
                >
                  <FiLinkedin className="text-2xl mb-2" />
                  <span className="text-sm">LinkedIn</span>
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition flex flex-col items-center justify-center"
                >
                  <BsWhatsapp className="text-2xl mb-2" />
                  <span className="text-sm">WhatsApp</span>
                </button>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF0FF] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading diagnostic...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return renderResults();
  }

  return renderQuestion();
}