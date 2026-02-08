// src/pages/dashboard/diagnostic/2/index.tsx - MOBILE RESPONSIVE
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../lib/supabase';
import {
  FiArrowLeft, FiCheck, FiChevronRight, FiChevronLeft,
  FiShare2, FiMail, FiStar, FiFacebook,
  FiTwitter, FiLinkedin, FiExternalLink, FiRefreshCw,
  FiBarChart2, FiUsers, FiTarget, FiTrendingUp,
  FiMessageSquare, FiDroplet, FiHeart, FiGlobe,
  FiInstagram, FiEye, FiCreditCard, FiCheckCircle,
  FiHome, FiBell
} from 'react-icons/fi';
import { BsWhatsapp } from 'react-icons/bs';

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    value: string;
    color: string;
    description: string;
  }[];
}

interface DiagnosticProgress {
  id: string;
  answers: Record<number, string>;
  progress_percentage: number;
  current_question: number;
}

interface ColorScore {
  blue: number;
  black: number;
  red: number;
  green: number;
  purple: number;
  orange: number;
}

const questions: Question[] = [
  {
    id: 1,
    text: "How should people feel immediately after encountering your brand?",
    options: [
      {
        text: "Informed and confident in their decision",
        value: "A",
        color: "blue",
        description: "Blue - Trust & Strategy"
      },
      {
        text: "Impressed and elevated",
        value: "B",
        color: "black",
        description: "Black - Power & Premium"
      },
      {
        text: "Energized and ready to take action",
        value: "C",
        color: "red",
        description: "Red - Performance & Action"
      },
      {
        text: "Safe, supported, and reassured",
        value: "D",
        color: "green",
        description: "Green - Stability & Growth"
      },
      {
        text: "Inspired by what's possible",
        value: "E",
        color: "purple",
        description: "Purple - Vision & Innovation"
      },
      {
        text: "Excited to build, try, or experiment",
        value: "F",
        color: "orange",
        description: "Orange - Momentum & Creativity"
      }
    ]
  },
  {
    id: 2,
    text: "What best describes how your brand creates value?",
    options: [
      {
        text: "Clear thinking, insight, and structured guidance",
        value: "A",
        color: "blue",
        description: "Blue - Strategic Authority"
      },
      {
        text: "Superior quality, taste, or prestige",
        value: "B",
        color: "black",
        description: "Black - Premium Excellence"
      },
      {
        text: "Speed, execution, and results",
        value: "C",
        color: "red",
        description: "Red - Performance Driven"
      },
      {
        text: "Stability, consistency, and long-term benefit",
        value: "D",
        color: "green",
        description: "Green - Sustainable Growth"
      },
      {
        text: "Vision, originality, and future-focused ideas",
        value: "E",
        color: "purple",
        description: "Purple - Innovative Vision"
      },
      {
        text: "Creativity, momentum, and experimentation",
        value: "F",
        color: "orange",
        description: "Orange - Creative Momentum"
      }
    ]
  },
  {
    id: 3,
    text: "Which statement best reflects your ideal market position?",
    options: [
      {
        text: "We help people make smart, informed decisions",
        value: "A",
        color: "blue",
        description: "Blue - Strategic Guide"
      },
      {
        text: "We are premium, selective, and not for everyone",
        value: "B",
        color: "black",
        description: "Black - Exclusive Premium"
      },
      {
        text: "We help people move fast and win",
        value: "C",
        color: "red",
        description: "Red - Results Accelerator"
      },
      {
        text: "We are reliable partners for sustainable growth",
        value: "D",
        color: "green",
        description: "Green - Trusted Partner"
      },
      {
        text: "We see the future before others do",
        value: "E",
        color: "purple",
        description: "Purple - Future Leader"
      },
      {
        text: "We build, test, and adapt faster than most",
        value: "F",
        color: "orange",
        description: "Orange - Agile Builder"
      }
    ]
  },
  {
    id: 4,
    text: "How do you prefer your brand to be trusted?",
    options: [
      {
        text: "Through logic, clarity, and expertise",
        value: "A",
        color: "blue",
        description: "Blue - Expert Authority"
      },
      {
        text: "Through perception, polish, and status",
        value: "B",
        color: "black",
        description: "Black - Status Symbol"
      },
      {
        text: "Through proof, results, and performance",
        value: "C",
        color: "red",
        description: "Red - Proven Results"
      },
      {
        text: "Through dependability and consistency",
        value: "D",
        color: "green",
        description: "Green - Consistent Reliability"
      },
      {
        text: "Through ideas, vision, and thought leadership",
        value: "E",
        color: "purple",
        description: "Purple - Thought Leadership"
      },
      {
        text: "Through action, presence, and visibility",
        value: "F",
        color: "orange",
        description: "Orange - Visible Action"
      }
    ]
  },
  {
    id: 5,
    text: "Which pricing mindset fits your brand best?",
    options: [
      {
        text: "You're paying for insight and strategic clarity",
        value: "A",
        color: "blue",
        description: "Blue - Strategic Investment"
      },
      {
        text: "This is premium — and priced that way",
        value: "B",
        color: "black",
        description: "Black - Premium Pricing"
      },
      {
        text: "We justify price through speed and outcomes",
        value: "C",
        color: "red",
        description: "Red - Performance Pricing"
      },
      {
        text: "We grow value over time",
        value: "D",
        color: "green",
        description: "Green - Value Growth"
      },
      {
        text: "You're investing in what's next",
        value: "E",
        color: "purple",
        description: "Purple - Future Investment"
      },
      {
        text: "We start lean and scale fast",
        value: "F",
        color: "orange",
        description: "Orange - Agile Scaling"
      }
    ]
  },
  {
    id: 6,
    text: "What frustrates you most about competitors in your space?",
    options: [
      {
        text: "They lack depth or clear thinking",
        value: "A",
        color: "blue",
        description: "Blue - Strategic Clarity"
      },
      {
        text: "They look cheap or undifferentiated",
        value: "B",
        color: "black",
        description: "Black - Premium Differentiation"
      },
      {
        text: "They move too slowly",
        value: "C",
        color: "red",
        description: "Red - Speed Focus"
      },
      {
        text: "They chase trends without stability",
        value: "D",
        color: "green",
        description: "Green - Stable Foundation"
      },
      {
        text: "They think too small or play safe",
        value: "E",
        color: "purple",
        description: "Purple - Bold Vision"
      },
      {
        text: "They overthink instead of building",
        value: "F",
        color: "orange",
        description: "Orange - Action Oriented"
      }
    ]
  },
  {
    id: 7,
    text: "How would you describe your content style?",
    options: [
      {
        text: "Educational and insight-driven",
        value: "A",
        color: "blue",
        description: "Blue - Educational Authority"
      },
      {
        text: "Curated, polished, and premium",
        value: "B",
        color: "black",
        description: "Black - Premium Curation"
      },
      {
        text: "Direct, bold, and results-focused",
        value: "C",
        color: "red",
        description: "Red - Direct Results"
      },
      {
        text: "Calm, supportive, and growth-oriented",
        value: "D",
        color: "green",
        description: "Green - Supportive Growth"
      },
      {
        text: "Visionary, philosophical, and future-focused",
        value: "E",
        color: "purple",
        description: "Purple - Visionary Content"
      },
      {
        text: "Energetic, experimental, and fast-moving",
        value: "F",
        color: "orange",
        description: "Orange - Experimental Energy"
      }
    ]
  },
  {
    id: 8,
    text: "Who is your brand primarily built for?",
    options: [
      {
        text: "Decision-makers who value clarity",
        value: "A",
        color: "blue",
        description: "Blue - Strategic Decision Makers"
      },
      {
        text: "High-value clients who value status and quality",
        value: "B",
        color: "black",
        description: "Black - Premium Clients"
      },
      {
        text: "Achievers who want fast results",
        value: "C",
        color: "red",
        description: "Red - Results-Oriented Achievers"
      },
      {
        text: "Builders who value stability and longevity",
        value: "D",
        color: "green",
        description: "Green - Long-term Builders"
      },
      {
        text: "Visionaries and forward-thinkers",
        value: "E",
        color: "purple",
        description: "Purple - Future Visionaries"
      },
      {
        text: "Creators, founders, and doers",
        value: "F",
        color: "orange",
        description: "Orange - Action-oriented Creators"
      }
    ]
  },
  {
    id: 9,
    text: "What best describes your growth ambition?",
    options: [
      {
        text: "Become a trusted authority in my field",
        value: "A",
        color: "blue",
        description: "Blue - Authority Growth"
      },
      {
        text: "Become a premium leader in my category",
        value: "B",
        color: "black",
        description: "Black - Premium Leadership"
      },
      {
        text: "Scale fast and dominate performance metrics",
        value: "C",
        color: "red",
        description: "Red - Performance Domination"
      },
      {
        text: "Build a brand that lasts decades",
        value: "D",
        color: "green",
        description: "Green - Sustainable Legacy"
      },
      {
        text: "Shape culture and future conversations",
        value: "E",
        color: "purple",
        description: "Purple - Cultural Influence"
      },
      {
        text: "Build momentum and expand quickly",
        value: "F",
        color: "orange",
        description: "Orange - Rapid Expansion"
      }
    ]
  },
  {
    id: 10,
    text: "If your brand were remembered for ONE thing, what should it be?",
    options: [
      {
        text: "Clear thinking and strategic insight",
        value: "A",
        color: "blue",
        description: "Blue - Strategic Insight"
      },
      {
        text: "Power, prestige, and presence",
        value: "B",
        color: "black",
        description: "Black - Power Presence"
      },
      {
        text: "Action, results, and wins",
        value: "C",
        color: "red",
        description: "Red - Action Results"
      },
      {
        text: "Trust, consistency, and growth",
        value: "D",
        color: "green",
        description: "Green - Trusted Growth"
      },
      {
        text: "Vision, originality, and innovation",
        value: "E",
        color: "purple",
        description: "Purple - Innovative Vision"
      },
      {
        text: "Energy, creativity, and movement",
        value: "F",
        color: "orange",
        description: "Orange - Creative Energy"
      }
    ]
  }
];

const colorInfo = {
  blue: {
    name: "Blue",
    fullName: "Trust & Strategy",
    hex: "#0A2540",
    description: "Signals authority, trust, intelligence, and long-term stability. Positions your brand as a credible leader people can rely on—especially in high-stakes decisions.",
    brands: ["Facebook", "IBM", "PayPal", "Dell"],
    emotion: "Trust, competence, intelligence",
    positioning: "Strategic authority with structured guidance",
    actionSteps: [
      "Establish thought leadership through whitepapers",
      "Develop case studies showcasing strategic wins",
      "Create educational content series",
      "Build authority through speaking engagements"
    ]
  },
  black: {
    name: "Black",
    fullName: "Power & Premium",
    hex: "#000000",
    description: "Represents power, sophistication, and exclusivity. Creates premium perception and positions your brand as selective and high-value.",
    brands: ["Apple", "Mercedes", "Chanel", "Nike"],
    emotion: "Power, sophistication, luxury",
    positioning: "Premium excellence and selective appeal",
    actionSteps: [
      "Refine packaging and unboxing experience",
      "Develop premium pricing strategy",
      "Create exclusive content for high-value clients",
      "Build referral-only programs"
    ]
  },
  red: {
    name: "Red",
    fullName: "Performance & Action",
    hex: "#DC2626",
    description: "Communicates energy, action, and results. Signals a brand that moves fast, delivers outcomes, and drives performance.",
    brands: ["Netflix", "YouTube", "Coca-Cola", "Target"],
    emotion: "Energy, action, urgency",
    positioning: "Performance-driven results accelerator",
    actionSteps: [
      "Showcase results through data dashboards",
      "Implement fast response customer service",
      "Create time-limited offers",
      "Highlight speed and efficiency in marketing"
    ]
  },
  green: {
    name: "Green",
    fullName: "Stability & Growth",
    hex: "#059669",
    description: "Represents stability, growth, and trustworthiness. Perfect for brands focused on sustainability, reliability, and long-term partnerships.",
    brands: ["Starbucks", "Spotify", "Whole Foods", "Xbox"],
    emotion: "Stability, growth, harmony",
    positioning: "Sustainable growth and trusted partnership",
    actionSteps: [
      "Develop long-term partnership programs",
      "Create evergreen educational content",
      "Build community around shared values",
      "Implement loyalty programs"
    ]
  },
  purple: {
    name: "Purple",
    fullName: "Vision & Innovation",
    hex: "#7C3AED",
    description: "Signals creativity, vision, and innovation. Positions your brand as forward-thinking, original, and intellectually sophisticated.",
    brands: ["Twitch", "Yahoo", "Cadbury", "Hallmark"],
    emotion: "Creativity, wisdom, luxury",
    positioning: "Visionary innovation and thought leadership",
    actionSteps: [
      "Publish future-focused trend reports",
      "Host innovation workshops",
      "Create visionary content series",
      "Build partnerships with innovative companies"
    ]
  },
  orange: {
    name: "Orange",
    fullName: "Momentum & Creativity",
    hex: "#EA580C",
    description: "Communicates energy, creativity, and momentum. Perfect for brands that are dynamic, experimental, and focused on rapid progress.",
    brands: ["Amazon", "Fanta", "SoundCloud", "Harley-Davidson"],
    emotion: "Energy, creativity, enthusiasm",
    positioning: "Creative momentum and agile execution",
    actionSteps: [
      "Launch rapid prototyping projects",
      "Create interactive content experiences",
      "Build community challenges and contests",
      "Develop co-creation programs with customers"
    ]
  }
};

interface DiagnosticResult {
  id: string;
  user_id: string;
  diagnostic_id: number;
  diagnostic_name: string;
  score: number;
  result_data: any;
  completed_at: string;
  is_completed: boolean;
}

export default function ColorPowerMatrixDiagnostic() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [colorScores, setColorScores] = useState<ColorScore>({
    blue: 0,
    black: 0,
    red: 0,
    green: 0,
    purple: 0,
    orange: 0
  });
  const [primaryColor, setPrimaryColor] = useState<keyof ColorScore | null>(null);
  const [secondaryColor, setSecondaryColor] = useState<keyof ColorScore | null>(null);
  const [hasExistingResult, setHasExistingResult] = useState(false);
  const [existingResult, setExistingResult] = useState<DiagnosticResult | null>(null);
  const [userName, setUserName] = useState('');
  const [progress, setProgress] = useState<DiagnosticProgress | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    console.log('Starting user check for Color Power Matrix...');
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
        .eq('diagnostic_id', 2)
        .eq('is_completed', true)
        .single();
      
      if (resultError && resultError.code !== 'PGRST116') {
        console.error('Existing result error:', resultError);
      }
      
      if (existingResult) {
        console.log('Existing Color Power result found:', existingResult);
        setHasExistingResult(true);
        setExistingResult(existingResult);
        setShowResults(true);
        setTotalScore(existingResult.score);
        setColorScores(existingResult.result_data?.color_scores || { blue: 0, black: 0, red: 0, green: 0, purple: 0, orange: 0 });
        setPrimaryColor(existingResult.result_data?.primary_color || null);
        setSecondaryColor(existingResult.result_data?.secondary_color || null);
        setLoading(false);
        return;
      } else {
        console.log('No existing Color Power result found');
      }
      
      // Check for existing progress
      const { data: progressData, error: progressError } = await supabase
        .from('diagnostic_progress')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('diagnostic_id', 2)
        .single();
      
      if (progressError && progressError.code !== 'PGRST116') {
        console.error('Progress fetch error:', progressError);
      }
      
      if (progressData) {
        console.log('Progress found:', progressData);
        setProgress(progressData);
        const savedAnswers = progressData.answers as Record<number, string> || {};
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

  const handleAnswer = async (questionId: number, color: string) => {
    if (saving) return;
    
    setSaving(true);
    const newAnswers = { ...answers, [questionId]: color };
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

  const saveProgress = async (answers: Record<number, string>) => {
    if (!user) {
      console.error('No user for saving progress');
      return;
    }
    
    const progressPercentage = Math.round((Object.keys(answers).length / questions.length) * 100);
    const currentQuestionNum = Object.keys(answers).length;
    
    const progressData = {
      user_id: user.id,
      diagnostic_id: 2,
      diagnostic_name: 'Color Power Matrix',
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

  const calculateResults = (answers: Record<number, string>) => {
    console.log('Calculating color results with answers:', answers);
    
    const scores: ColorScore = {
      blue: 0,
      black: 0,
      red: 0,
      green: 0,
      purple: 0,
      orange: 0
    };
    
    // Calculate scores - each answer adds 10 points to the chosen color
    Object.values(answers).forEach(color => {
      if (color in scores) {
        scores[color as keyof ColorScore] += 10;
      }
    });
    
    console.log('Color scores calculated:', scores);
    setColorScores(scores);
    
    // Find primary and secondary colors
    const sortedEntries = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([color]) => color as keyof ColorScore);
    
    const primary = sortedEntries[0];
    const secondary = sortedEntries[1];
    
    console.log('Primary color:', primary);
    console.log('Secondary color:', secondary);
    
    setPrimaryColor(primary);
    setSecondaryColor(secondary);
    
    // Calculate total score (score of primary color)
    const totalScore = scores[primary];
    console.log('Total score:', totalScore);
    setTotalScore(totalScore);
    
    setShowResults(true);
    
    // Save final results
    saveFinalResults(scores, primary, secondary, answers);
  };

  const getPositioning = (primary: keyof ColorScore, secondary: keyof ColorScore): string => {
    const combinations: Record<string, string> = {
      'blue_purple': 'Visionary Authority',
      'blue_black': 'Strategic Premium',
      'blue_red': 'Strategic Performance',
      'blue_green': 'Strategic Growth',
      'blue_orange': 'Strategic Innovation',
      'black_blue': 'Premium Authority',
      'black_red': 'Premium Performance',
      'black_green': 'Premium Legacy',
      'black_purple': 'Luxury Innovation',
      'black_orange': 'Premium Creativity',
      'red_blue': 'Performance Authority',
      'red_black': 'Performance Premium',
      'red_green': 'Performance Growth',
      'red_purple': 'Performance Innovation',
      'red_orange': 'Dynamic Performance',
      'green_blue': 'Growth Authority',
      'green_black': 'Growth Premium',
      'green_red': 'Growth Performance',
      'green_purple': 'Sustainable Innovation',
      'green_orange': 'Creative Growth',
      'purple_blue': 'Innovative Authority',
      'purple_black': 'Innovative Premium',
      'purple_red': 'Innovative Performance',
      'purple_green': 'Innovative Growth',
      'purple_orange': 'Creative Innovation',
      'orange_blue': 'Creative Authority',
      'orange_black': 'Creative Premium',
      'orange_red': 'Creative Performance',
      'orange_green': 'Creative Growth',
      'orange_purple': 'Visionary Creativity'
    };
    
    return combinations[`${primary}_${secondary}`] || `${colorInfo[primary].fullName} with ${colorInfo[secondary].fullName}`;
  };

  const getColorPalette = (primary: keyof ColorScore, secondary: keyof ColorScore) => {
    const primaryInfo = colorInfo[primary];
    const secondaryInfo = colorInfo[secondary];
    
    return {
      primary: {
        name: primaryInfo.name,
        hex: primaryInfo.hex,
        description: primaryInfo.description
      },
      secondary: {
        name: secondaryInfo.name,
        hex: secondaryInfo.hex,
        description: secondaryInfo.description
      },
      neutral: '#FFFFFF',
      accent: primary === 'blue' ? '#D4AF37' : '#6B7280'
    };
  };

  const saveFinalResults = async (scores: ColorScore, primary: keyof ColorScore, secondary: keyof ColorScore, answers: Record<number, string>) => {
    if (!user) {
      console.error('No user for saving final results');
      return;
    }
    
    console.log('Starting to save final color results...');
    setLoading(true);
    
    try {
      const positioning = getPositioning(primary, secondary);
      const primaryInfo = colorInfo[primary];
      const secondaryInfo = colorInfo[secondary];
      const palette = getColorPalette(primary, secondary);
      
      console.log('Positioning:', positioning);
      console.log('Primary info:', primaryInfo);
      console.log('Secondary info:', secondaryInfo);
      
      const resultData = {
        primary_color: primary,
        secondary_color: secondary,
        color_scores: scores,
        primary_hex: primaryInfo.hex,
        secondary_hex: secondaryInfo.hex,
        primary_description: primaryInfo.description,
        secondary_description: secondaryInfo.description,
        positioning: positioning,
        palette: palette,
        color_psychology: {
          primary_emotion: primaryInfo.emotion,
          secondary_emotion: secondaryInfo.emotion,
          primary_positioning: primaryInfo.positioning,
          secondary_positioning: secondaryInfo.positioning
        },
        brand_references: {
          primary_brands: primaryInfo.brands,
          secondary_brands: secondaryInfo.brands
        },
        timestamp: new Date().toISOString()
      };
      
      console.log('Result data to save:', resultData);
      
      // Save diagnostic result
      const { data: diagnosticData, error: diagnosticError } = await supabase
        .from('user_diagnostics')
        .upsert({
          user_id: user.id,
          diagnostic_id: 2,
          diagnostic_name: 'Color Power Matrix',
          score: scores[primary],
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
        .update({
          brand_score: scores[primary],
          brand_stage: positioning,
          last_diagnostic_at: new Date().toISOString(),
          diagnostic_count: diagnosticCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
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
        .eq('diagnostic_id', 2);
      
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
            diagnostic: 'Color Power Matrix',
            score: scores[primary],
            primary_color: primary,
            secondary_color: secondary,
            positioning: positioning
          },
          diagnostic_id: 2,
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
          diagnostic_id: 2,
          score: scores[primary],
          result_data: resultData,
          taken_at: new Date().toISOString()
        })
        .select();
      
      if (historyError) {
        console.error('History save error:', historyError);
        // Don't throw, just log
      }
      
      console.log('History saved:', historyData);
      
      alert('Color Power results saved successfully! You can now view them in your dashboard.');
      
    } catch (error) {
      console.error('Error saving final results:', error);
      alert('There was an error saving your results. Please try again or contact support.');
    } finally {
      setLoading(false);
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
      console.log('Starting Color Power test retake...');
      
      // Clear progress
      const { error: progressError } = await supabase
        .from('diagnostic_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('diagnostic_id', 2);
      
      if (progressError) {
        console.error('Progress clear error:', progressError);
      }
      
      // Clear existing results
      const { error: diagnosticError } = await supabase
        .from('user_diagnostics')
        .delete()
        .eq('user_id', user.id)
        .eq('diagnostic_id', 2);
      
      if (diagnosticError) {
        console.error('Diagnostic clear error:', diagnosticError);
      }
      
      console.log('Reset state');
      // Reset state
      setAnswers({});
      setShowResults(false);
      setCurrentQuestion(0);
      setTotalScore(0);
      setColorScores({ blue: 0, black: 0, red: 0, green: 0, purple: 0, orange: 0 });
      setPrimaryColor(null);
      setSecondaryColor(null);
      setHasExistingResult(false);
      setExistingResult(null);
      setProgress(null);
      
      // Add activity
      const { error: activityError } = await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: 'test_retaken',
          metadata: { diagnostic: 'Color Power Matrix' },
          diagnostic_id: 2,
          created_at: new Date().toISOString()
        });
      
      if (activityError) {
        console.error('Activity error:', activityError);
      }
      
      alert('Color Power test reset successfully! You can now retake it.');
      
    } catch (error) {
      console.error('Error retaking test:', error);
      alert('There was an error resetting the test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform: string) => {
    if (!primaryColor) return;
    
    const primaryInfo = colorInfo[primaryColor];
    const shareText = `I just discovered my brand's power color is ${primaryInfo.name} (${primaryInfo.fullName}) with the Color Power Matrix! Find your brand's true colors → ${window.location.origin}`;
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(shareText)}`,
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
          metadata: { platform: platform, diagnostic: 'Color Power Matrix' },
          diagnostic_id: 2,
          created_at: new Date().toISOString()
        })
        .then(({ error }) => {
          if (error) console.error('Share save error:', error);
        });
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-600';
      case 'black': return 'bg-gray-900';
      case 'red': return 'bg-red-600';
      case 'green': return 'bg-green-600';
      case 'purple': return 'bg-purple-600';
      case 'orange': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const getTextColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'black': return 'text-gray-900';
      case 'red': return 'text-red-600';
      case 'green': return 'text-green-600';
      case 'purple': return 'text-purple-600';
      case 'orange': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getBorderColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'border-blue-200';
      case 'black': return 'border-gray-300';
      case 'red': return 'border-red-200';
      case 'green': return 'border-green-200';
      case 'purple': return 'border-purple-200';
      case 'orange': return 'border-orange-200';
      default: return 'border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 30) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const answeredCount = Object.keys(answers).length;
    
    return (
      <div className="min-h-screen bg-[#FAF0FF] px-3 py-4 sm:px-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-1 sm:space-x-2 text-purple-600 hover:text-purple-700 mb-3"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Color Power Matrix</h1>
                <p className="text-gray-600 text-xs sm:text-sm">Question {currentQuestion + 1} of {questions.length}</p>
              </div>
              {saving && (
                <span className="text-xs sm:text-sm text-gray-500">Saving...</span>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="mb-4 sm:mb-6">
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                <span>{answeredCount}/{questions.length} answered</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Question Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
            {hasExistingResult ? (
              <div className="text-center py-4 sm:py-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FiCheckCircle className="text-green-600 text-lg sm:text-xl" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold mb-2 px-2">You've Already Completed This Test!</h2>
                <p className="text-gray-600 text-sm sm:text-base mb-2">
                  Your primary color:{' '}
                  <span className="font-bold">
                    {colorInfo[(existingResult?.result_data?.primary_color as keyof typeof colorInfo) ?? 'blue'].name}
                  </span>
                </p>
                <div className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4 ${getScoreColor(existingResult?.score || 0)} ${getScoreBgColor(existingResult?.score || 0)}`}>
                  Score: {existingResult?.score}/100
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <button
                    onClick={handleRetakeTest}
                    disabled={loading}
                    className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading ? 'Resetting...' : 'Retake Test'}
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full py-2.5 sm:py-3 bg-white border border-purple-300 text-purple-600 rounded-lg sm:rounded-xl font-semibold hover:bg-purple-50 transition text-sm sm:text-base"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-bold mb-2">Question {question.id}:</h2>
                  <p className="text-gray-700 text-base sm:text-lg">{question.text}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(question.id, option.color)}
                      disabled={saving}
                      className={`text-left p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                        answers[question.id] === option.color
                          ? `${getBorderColorClass(option.color)} bg-opacity-10 ${
                              option.color === 'blue' ? 'bg-blue-50' :
                              option.color === 'black' ? 'bg-gray-50' :
                              option.color === 'red' ? 'bg-red-50' :
                              option.color === 'green' ? 'bg-green-50' :
                              option.color === 'purple' ? 'bg-purple-50' : 'bg-orange-50'
                            }`
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      } disabled:opacity-50`}
                    >
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg ${getColorClass(option.color)} flex items-center justify-center flex-shrink-0`}>
                          <FiDroplet className="text-white w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm sm:text-base truncate">{option.text}</div>
                          <div className={`text-xs sm:text-sm ${getTextColorClass(option.color)} font-medium mt-1`}>
                            {option.description}
                          </div>
                        </div>
                        {answers[question.id] === option.color && (
                          <FiCheck className="text-green-500 mt-1 flex-shrink-0 w-4 h-4" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Navigation */}
                <div className="flex justify-between mt-6 sm:mt-8">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0 || saving}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm ${
                      currentQuestion === 0 ? 'text-gray-400' : 'text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <FiChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Previous</span>
                  </button>
                  
                  <button
                    onClick={handleNext}
                    disabled={!answers[question.id] || currentQuestion === questions.length - 1 || saving}
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm ${
                      !answers[question.id]
                        ? 'text-gray-400'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                    }`}
                  >
                    <span>{currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}</span>
                    <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Test Info */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">About This Diagnostic</h3>
            <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
              The Color Power Matrix identifies the primary color your brand should dominate with, 
              based on positioning, audience psychology, industry context, and brand intent—not personal preference.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-purple-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <div className="font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm">Scoring Mechanism</div>
                <ul className="text-xs sm:text-sm space-y-1">
                  <li className="flex items-center space-x-1 sm:space-x-2">
                    <FiCheck className="text-green-500 w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Each answer assigns +10 points to one color</span>
                  </li>
                  <li className="flex items-center space-x-1 sm:space-x-2">
                    <FiCheck className="text-green-500 w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Highest score = Primary Brand Color</span>
                  </li>
                  <li className="flex items-center space-x-1 sm:space-x-2">
                    <FiCheck className="text-green-500 w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Second highest = Supporting Color</span>
                  </li>
                </ul>
              </div>
              <div className="bg-purple-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <div className="font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm">Color Psychology</div>
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                  {Object.entries(colorInfo).slice(0, 6).map(([color, info]) => (
                    <div key={color} className="flex items-center space-x-1 sm:space-x-2">
                      <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getColorClass(color)}`}></div>
                      <span className="text-xs">{info.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!primaryColor || !secondaryColor) return null;
    
    const primaryInfo = colorInfo[primaryColor];
    const secondaryInfo = colorInfo[secondaryColor];
    const palette = getColorPalette(primaryColor, secondaryColor);
    const positioning = getPositioning(primaryColor, secondaryColor);
    const progress = (totalScore / 100) * 100;
    
    return (
      <div className="min-h-screen bg-[#FAF0FF] px-3 py-4 sm:px-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-1 sm:space-x-2 text-purple-600 hover:text-purple-700 mb-3 sm:mb-4"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Back to Dashboard</span>
            </button>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Your Color Power Matrix Results</h1>
                <p className="text-gray-600 text-sm sm:text-base truncate">{userName}, discover your brand's true colors</p>
              </div>
              <div className="flex space-x-2 w-full md:w-auto mt-2 sm:mt-0">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 md:flex-none px-3 py-2 bg-white border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                >
                  <FiShare2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleRetakeTest}
                  disabled={loading}
                  className="flex-1 md:flex-none px-3 py-2 bg-white border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm disabled:opacity-50"
                >
                  <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Retake</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Results */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Primary Color Result */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                  <h2 className="text-lg sm:text-xl font-bold">Primary Brand Color</h2>
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg ${getColorClass(primaryColor)}`}></div>
                    <span className="font-semibold text-sm sm:text-base">{primaryInfo.name}</span>
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${
                    primaryColor === 'blue' ? 'bg-blue-50' :
                    primaryColor === 'black' ? 'bg-gray-50' :
                    primaryColor === 'red' ? 'bg-red-50' :
                    primaryColor === 'green' ? 'bg-green-50' :
                    primaryColor === 'purple' ? 'bg-purple-50' : 'bg-orange-50'
                  }`}>
                    <div className="font-bold mb-1.5 sm:mb-2 text-sm sm:text-base">
                      Your dominant brand color is {primaryInfo.name} — the color of {primaryInfo.fullName}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700">{primaryInfo.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold mb-2 text-sm sm:text-base">What this color signals:</h3>
                    <p className="text-gray-700 text-xs sm:text-sm">{primaryInfo.emotion}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold mb-2 text-sm sm:text-base">Positioning Direction:</h3>
                    <p className="text-gray-700 text-xs sm:text-sm">{primaryInfo.positioning}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-bold mb-2 text-sm sm:text-base">Global Brand References:</h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {primaryInfo.brands.map((brand, i) => (
                        <div key={i} className="px-2 py-1 bg-gray-100 rounded-lg text-xs">
                          {brand}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {isProUser ? (
                    <div>
                      <h3 className="font-bold mb-2 text-sm sm:text-base">Action Steps:</h3>
                      <ul className="space-y-1.5 sm:space-y-2">
                        {primaryInfo.actionSteps.map((step, i) => (
                          <li key={i} className="flex items-start space-x-1.5 sm:space-x-2">
                            <FiCheck className="text-green-500 mt-0.5 flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-gray-700 text-xs sm:text-sm">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                      <p className="text-xs sm:text-sm mb-2">
                        Upgrade to Pro to see detailed action steps for your {primaryInfo.name} brand color.
                      </p>
                      <button
                        onClick={() => router.push('/dashboard?section=billing')}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded text-xs sm:text-sm font-semibold hover:shadow-lg transition"
                      >
                        Upgrade to Pro
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Supporting Color & Palette */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Complete Color System</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                  {/* Supporting Color */}
                  <div>
                    <h3 className="font-bold mb-3 text-sm sm:text-base">Supporting Color</h3>
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg ${getColorClass(secondaryColor)}`}></div>
                      <div>
                        <div className="font-bold text-sm sm:text-base">{secondaryInfo.name}</div>
                        <div className="text-xs sm:text-sm text-gray-600">{secondaryInfo.fullName}</div>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
                      {secondaryInfo.description}
                    </p>
                    <div className="text-xs sm:text-sm">
                      <div className="font-semibold mb-1">Positioning Combination:</div>
                      <div className="text-purple-600 font-bold">{positioning}</div>
                    </div>
                  </div>
                  
                  {/* Color Palette */}
                  <div>
                    <h3 className="font-bold mb-3 text-sm sm:text-base">Color Palette</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded" style={{ backgroundColor: palette.primary.hex }}></div>
                          <div className="min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">Primary</div>
                            <div className="text-xs text-gray-600 truncate">{palette.primary.hex}</div>
                          </div>
                        </div>
                        <div className="text-xs font-mono truncate ml-2">{palette.primary.hex}</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded" style={{ backgroundColor: palette.secondary.hex }}></div>
                          <div className="min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">Secondary</div>
                            <div className="text-xs text-gray-600 truncate">{palette.secondary.hex}</div>
                          </div>
                        </div>
                        <div className="text-xs font-mono truncate ml-2">{palette.secondary.hex}</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded border border-gray-300" style={{ backgroundColor: palette.neutral }}></div>
                          <div className="min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">Neutral</div>
                            <div className="text-xs text-gray-600 truncate">Clean white for contrast</div>
                          </div>
                        </div>
                        <div className="text-xs font-mono truncate ml-2">{palette.neutral}</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded" style={{ backgroundColor: palette.accent }}></div>
                          <div className="min-w-0">
                            <div className="font-medium text-xs sm:text-sm truncate">Accent</div>
                            <div className="text-xs text-gray-600 truncate">For highlights & CTAs</div>
                          </div>
                        </div>
                        <div className="text-xs font-mono truncate ml-2">{palette.accent}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Usage Guidance */}
                <div className="mt-6 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl">
                  <h4 className="font-bold mb-1.5 sm:mb-2 text-sm sm:text-base">Usage Guidance</h4>
                  <ul className="text-xs sm:text-sm space-y-0.5 sm:space-y-1">
                    <li>• Use <strong>{palette.primary.name}</strong> for headers, logos, and core brand assets</li>
                    <li>• Use <strong>{palette.secondary.name}</strong> for supporting elements and secondary messaging</li>
                    <li>• Use <strong>white</strong> for breathing space and contrast</li>
                    <li>• Use the <strong>accent color</strong> sparingly for highlights and calls-to-action</li>
                  </ul>
                </div>
              </div>
              
              {/* Score Breakdown */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Score Breakdown</h2>
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(colorScores).map(([color, score]) => (
                    <div key={color} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${getColorClass(color)}`}></div>
                        <span className="font-medium text-xs sm:text-sm capitalize truncate">{color}</span>
                        <span className="text-xs text-gray-600 truncate hidden sm:inline">
                          {color === primaryColor ? '🏆 Primary' : 
                           color === secondaryColor ? '🥈 Secondary' : ''}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                        <div className="w-20 sm:w-24 md:w-32 bg-gray-200 rounded-full h-1.5 sm:h-2">
                          <div
                            className={`h-1.5 sm:h-2 rounded-full ${getColorClass(color)}`}
                            style={{ width: `${(score / 100) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-sm sm:text-base w-8 text-right">{score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Share Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h3 className="font-bold mb-3 text-sm sm:text-base">Share Your Results</h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-2.5 sm:p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex flex-col items-center justify-center"
                  >
                    <FiTwitter className="text-lg sm:text-xl mb-1" />
                    <span className="text-xs">Twitter</span>
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="p-2.5 sm:p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex flex-col items-center justify-center"
                  >
                    <FiLinkedin className="text-lg sm:text-xl mb-1" />
                    <span className="text-xs">LinkedIn</span>
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="p-2.5 sm:p-3 bg-blue-200 text-blue-800 rounded-lg hover:bg-blue-300 transition flex flex-col items-center justify-center"
                  >
                    <FiFacebook className="text-lg sm:text-xl mb-1" />
                    <span className="text-xs">Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="p-2.5 sm:p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition flex flex-col items-center justify-center"
                  >
                    <BsWhatsapp className="text-lg sm:text-xl mb-1" />
                    <span className="text-xs">WhatsApp</span>
                  </button>
                </div>
              </div>
              
              {/* Positioning & Authority */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <FiTarget className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-bold mb-1.5 sm:mb-2 text-sm sm:text-base">Brand Positioning</h3>
                <div className="text-base sm:text-lg font-bold text-purple-600 mb-2 sm:mb-3">{positioning}</div>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  This color combination positions your brand as {primaryInfo.fullName.toLowerCase()} 
                  with {secondaryInfo.fullName.toLowerCase()} elements.
                </p>
                <button
                  onClick={() => router.push('/dashboard/diagnostic/6')}
                  className="w-full py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition text-xs sm:text-sm"
                >
                  Run Positioning Clarity Diagnostic
                </button>
              </div>
              
              {/* Other Diagnostics */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h3 className="font-bold mb-3 text-sm sm:text-base">Continue Your Brand Journey</h3>
                <div className="space-y-2 sm:space-y-3">
                  <button
                    onClick={() => router.push('/dashboard/diagnostic/1')}
                    className="w-full text-left p-2.5 sm:p-3 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-lg transition flex items-center space-x-2 sm:space-x-3"
                  >
                    <FiBarChart2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-xs sm:text-sm truncate">BrandPawa Score</span>
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/diagnostic/3')}
                    className="w-full text-left p-2.5 sm:p-3 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-lg transition flex items-center space-x-2 sm:space-x-3"
                  >
                    <FiHeart className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-xs sm:text-sm truncate">Brand Personality</span>
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/diagnostic/4')}
                    className="w-full text-left p-2.5 sm:p-3 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-lg transition flex items-center space-x-2 sm:space-x-3"
                  >
                    <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-xs sm:text-sm truncate">Logo Identity</span>
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/diagnostic/7')}
                    className="w-full text-left p-2.5 sm:p-3 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-lg transition flex items-center space-x-2 sm:space-x-3"
                  >
                    <FiGlobe className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-xs sm:text-sm truncate">Authority Score</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Color Psychology Reference */}
          <div className="mt-6 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Color Psychology Reference</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(colorInfo).map(([color, info]) => (
                <div key={color} className="border border-gray-200 rounded-lg sm:rounded-xl p-3">
                  <div className={`w-full h-10 sm:h-12 rounded-lg mb-2 ${getColorClass(color)}`}></div>
                  <div className="font-bold text-xs sm:text-sm mb-1 truncate">{info.name}</div>
                  <div className="text-xs text-gray-600 mb-1 line-clamp-2">{info.fullName}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">{info.emotion}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full mx-2 sm:mx-4">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Share Your Color Results</h3>
              <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-6">
                Share your brand's power color and challenge others to discover theirs!
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-3 sm:p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex flex-col items-center justify-center"
                >
                  <FiTwitter className="text-lg sm:text-xl sm:text-2xl mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm">Twitter</span>
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="p-3 sm:p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex flex-col items-center justify-center"
                >
                  <FiLinkedin className="text-lg sm:text-xl sm:text-2xl mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm">LinkedIn</span>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="p-3 sm:p-4 bg-blue-200 text-blue-800 rounded-lg hover:bg-blue-300 transition flex flex-col items-center justify-center"
                >
                  <FiFacebook className="text-lg sm:text-xl sm:text-2xl mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="p-3 sm:p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition flex flex-col items-center justify-center"
                >
                  <BsWhatsapp className="text-lg sm:text-xl sm:text-2xl mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm">WhatsApp</span>
                </button>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
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
          <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading diagnostic...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return renderResults();
  }

  return renderQuestion();
}
