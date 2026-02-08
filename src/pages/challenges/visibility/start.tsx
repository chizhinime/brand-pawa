// src/pages/challenges/visibility/start.tsx - OPTIMIZED
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabase';
import {
  FiArrowLeft, FiCalendar, FiCheck, FiClock,
  FiTarget, FiTrendingUp, FiUsers, FiZap,
  FiEye, FiStar, FiAward, FiCheckCircle,
  FiArrowRight, FiInfo, FiLock
} from 'react-icons/fi';

interface ChallengeDuration {
  id: string;
  days: number;
  name: string;
  description: string;
  timeCommitment: string;
  goal: string;
  bestFor: string;
  isPro?: boolean;
}

interface WeeklyTheme {
  week: number;
  theme: string;
  days: number;
  focus: string;
}

const DURATIONS: ChallengeDuration[] = [
  {
    id: '7-day',
    days: 7,
    name: '7 Days → Activation Sprint',
    description: 'Quick start to visibility. Perfect for beginners.',
    timeCommitment: '10-15 min/day',
    goal: 'Activate presence & remove fear',
    bestFor: 'Absolute beginners, testing the waters'
  },
  {
    id: '14-day',
    days: 14,
    name: '14 Days → Consistency Builder',
    description: 'Build lasting habits and consistency.',
    timeCommitment: '15-20 min/day',
    goal: 'Build consistency + message clarity',
    bestFor: 'Those ready to commit, building momentum'
  },
  {
    id: '30-day',
    days: 30,
    name: '30 Days → Habit Formation',
    description: 'Complete visibility foundation.',
    timeCommitment: '20-25 min/day',
    goal: 'Habit + momentum',
    bestFor: 'Serious builders, establishing routines'
  },
  {
    id: '60-day',
    days: 60,
    name: '60 Days → Momentum Phase (Pro)',
    description: 'Build unstoppable momentum.',
    timeCommitment: '20-30 min/day',
    goal: 'Deep momentum and audience growth',
    bestFor: 'Pro users, scaling visibility',
    isPro: true
  },
  {
    id: '90-day',
    days: 90,
    name: '90 Days → Market Presence (Pro)',
    description: 'Establish strong market presence.',
    timeCommitment: '25-35 min/day',
    goal: 'Market dominance and recognition',
    bestFor: 'Established brands, market positioning',
    isPro: true
  }
];

const WEEKLY_THEMES: Record<number, WeeklyTheme[]> = {
  7: [
    { week: 1, theme: 'Activation', days: 7, focus: 'Overcoming fear and taking first steps' }
  ],
  14: [
    { week: 1, theme: 'Clarity', days: 7, focus: 'Finding your voice and message' },
    { week: 2, theme: 'Consistency', days: 7, focus: 'Building daily habits and rhythm' }
  ],
  30: [
    { week: 1, theme: 'Clarity', days: 7, focus: 'What you stand for and who you serve' },
    { week: 2, theme: 'Consistency', days: 7, focus: 'Building unbreakable habits' },
    { week: 3, theme: 'Confidence', days: 7, focus: 'Owning your voice and space' },
    { week: 4, theme: 'Presence', days: 7, focus: 'Commanding attention naturally' }
  ],
  60: [
    { week: 1, theme: 'Foundation', days: 7, focus: 'Core visibility principles' },
    { week: 2, theme: 'Rhythm', days: 7, focus: 'Daily practice systems' },
    { week: 3, theme: 'Amplification', days: 7, focus: 'Reaching more people' },
    { week: 4, theme: 'Engagement', days: 7, focus: 'Building relationships' },
    { week: 5, theme: 'Authority', days: 7, focus: 'Establishing expertise' },
    { week: 6, theme: 'Momentum', days: 7, focus: 'Sustained growth' },
    { week: 7, theme: 'Integration', days: 7, focus: 'Making it part of you' },
    { week: 8, theme: 'Dominance', days: 7, focus: 'Owning your space' }
  ],
  90: [
    { week: 1, theme: 'Foundation', days: 7, focus: 'Core visibility principles' },
    { week: 2, theme: 'Rhythm', days: 7, focus: 'Daily practice systems' },
    { week: 3, theme: 'Amplification', days: 7, focus: 'Reaching more people' },
    { week: 4, theme: 'Engagement', days: 7, focus: 'Building relationships' },
    { week: 5, theme: 'Authority', days: 7, focus: 'Establishing expertise' },
    { week: 6, theme: 'Momentum', days: 7, focus: 'Sustained growth' },
    { week: 7, theme: 'Integration', days: 7, focus: 'Making it part of you' },
    { week: 8, theme: 'Dominance', days: 7, focus: 'Owning your space' },
    { week: 9, theme: 'Influence', days: 7, focus: 'Building thought leadership' },
    { week: 10, theme: 'Community', days: 7, focus: 'Building loyal following' },
    { week: 11, theme: 'Strategy', days: 7, focus: 'Advanced visibility tactics' },
    { week: 12, theme: 'Mastery', days: 7, focus: 'Visibility as second nature' }
  ]
};

const DAILY_STRUCTURE = [
  {
    day: 1,
    title: 'Visibility Reset',
    focus: 'Awareness',
    why: 'Clear intention drives consistent action',
    personalVariant: 'Write: "What do I want to be known for as a personal brand?" Update your personal bio.',
    businessVariant: 'Write: "What do we want to be known for as a business?" Update your company bio.'
  },
  {
    day: 2,
    title: 'Clarity Before Noise',
    focus: 'Message clarity',
    why: 'Clear messages get remembered',
    personalVariant: 'Write 3 content ideas: Your expertise, Common questions you get, Problems you help solve.',
    businessVariant: 'Write 3 content ideas: Company expertise, Customer FAQs, Client problems solved.'
  },
  {
    day: 3,
    title: 'First Signal',
    focus: 'Showing up',
    why: 'Action beats perfection every time',
    personalVariant: 'Publish ONE personal post. Imperfect action over perfect inaction.',
    businessVariant: 'Publish ONE business post. Value over polish.'
  }
];

export default function StartVisibilityChallenge() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<string>('7-day');
  const [selectedBrandType, setSelectedBrandType] = useState<'personal' | 'business'>('personal');
  const [startingChallenge, setStartingChallenge] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [showDailyPreview, setShowDailyPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }
      setUser(user);
      
      // Check if user is Pro
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single();
      
      setIsPro(profile?.plan === 'pro' || profile?.plan === 'enterprise');
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/auth/signin');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedDuration = (): ChallengeDuration => {
    return DURATIONS.find(d => d.id === selectedDuration) || DURATIONS[0];
  };

  const handleStartChallenge = async () => {
    const duration = getSelectedDuration();
    
    if (duration.isPro && !isPro) {
      alert('This duration is available for Pro users only. Please upgrade to Pro.');
      router.push('/dashboard?section=billing');
      return;
    }

    if (startingChallenge) return;

    setStartingChallenge(true);
    setError(null);
    
    try {
      // Get the visibility challenge
      let challenge: any = null;
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('id')
        .eq('slug', 'visibility')
        .single();
      challenge = challengeData;

      if (challengeError || !challenge) {
        // Create challenge if it doesn't exist
        const { data: newChallenge, error: createError } = await supabase
          .from('challenges')
          .insert({
            name: 'Visibility Challenge',
            slug: 'visibility',
            description: 'Build consistent brand presence and reduce fear of showing up',
            category: 'entry',
            difficulty: 'beginner',
            daily_time_commitment_minutes: 15,
            is_pro: false,
            reward_points: 100
          })
          .select('id')
          .single();

        if (createError) throw createError;
        challenge = newChallenge;
      }

      // Check for existing active challenge
      const { data: existingChallenge } = await supabase
        .from('user_challenges')
        .select('id')
        .eq('user_id', user.id)
        .eq('challenge_id', challenge.id)
        .eq('status', 'active')
        .single();

      if (existingChallenge) {
        alert('You already have an active Visibility Challenge. Please complete it first.');
        router.push('/challenges/visibility');
        return;
      }

      // Get or create challenge duration
      let durationRecord;
      const { data: existingDuration } = await supabase
        .from('challenge_durations')
        .select('*')
        .eq('challenge_id', challenge.id)
        .eq('duration_days', duration.days)
        .single();

      if (existingDuration) {
        durationRecord = existingDuration;
      } else {
        const { data: newDuration, error: durationError } = await supabase
          .from('challenge_durations')
          .insert({
            challenge_id: challenge.id,
            duration_days: duration.days,
            name: duration.name,
            description: duration.description,
            sort_order: DURATIONS.findIndex(d => d.id === duration.id)
          })
          .select('*')
          .single();

        if (durationError) throw durationError;
        durationRecord = newDuration;
      }

      // Calculate dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration.days);

      // Create user challenge
      const { data: userChallenge, error: userChallengeError } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_id: challenge.id,
          challenge_duration_id: durationRecord.id,
          brand_type: selectedBrandType,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active',
          current_day: 1,
          streak_days: 0,
          completed_days: [],
          last_activity_date: startDate.toISOString().split('T')[0]
        })
        .select('*')
        .single();

      if (userChallengeError) throw userChallengeError;

      // Add to activity feed
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: 'challenge_started',
          metadata: {
            challenge: 'Visibility Challenge',
            duration: duration.days,
            brand_type: selectedBrandType,
            duration_name: duration.name
          }
        });

      alert(`🎉 Visibility Challenge started! You've chosen the ${duration.name}.`);
      router.push('/challenges/visibility');
      
    } catch (error: any) {
      console.error('Error starting challenge:', error);
      setError(error.message || 'Failed to start challenge');
    } finally {
      setStartingChallenge(false);
    }
  };

  const renderDurationCard = (duration: ChallengeDuration) => {
    const isSelected = selectedDuration === duration.id;
    const isLocked = duration.isPro && !isPro;
    const weeklyThemes = WEEKLY_THEMES[duration.days] || [];

    return (
      <div
        key={duration.id}
        onClick={() => !isLocked && setSelectedDuration(duration.id)}
        className={`
          p-4 sm:p-6 rounded-xl border-2 text-left transition-all cursor-pointer
          ${isSelected
            ? 'border-purple-500 bg-purple-50 shadow-lg'
            : isLocked
            ? 'border-gray-200 bg-gray-50 opacity-75 cursor-not-allowed'
            : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
          }
        `}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm sm:text-base mb-1 truncate">{duration.name}</div>
            <div className="text-xs sm:text-sm text-gray-600 mb-2">{duration.days} days</div>
          </div>
          {duration.isPro && (
            <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 flex-shrink-0 ${
              isLocked ? 'bg-gray-200 text-gray-500' : 'bg-purple-100 text-purple-600'
            }`}>
              <FiLock size={12} />
              <span>PRO</span>
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 line-clamp-2">{duration.description}</p>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <FiClock className="text-gray-400" />
            <span>{duration.timeCommitment}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <FiTarget className="text-gray-400" />
            <span className="truncate">Goal: {duration.goal}</span>
          </div>
        </div>

        {isSelected && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-purple-200">
            <div className="flex items-center space-x-2 text-purple-600 font-medium text-sm">
              <FiCheckCircle />
              <span>Selected</span>
            </div>
          </div>
        )}

        {isLocked && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-gray-500 text-xs sm:text-sm">
              <FiLock />
              <span>Upgrade to Pro to unlock</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDailyPreview = () => {
    const duration = getSelectedDuration();
    const weeklyThemes = WEEKLY_THEMES[duration.days] || [];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold">Daily Structure Preview</h3>
            <button
              onClick={() => setShowDailyPreview(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ✕
            </button>
          </div>

          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl mb-4">
              <h4 className="font-bold text-base sm:text-lg mb-2">{duration.name}</h4>
              <p className="text-gray-700 text-sm sm:text-base">{duration.description}</p>
              <div className="mt-2 text-xs sm:text-sm text-gray-600">
                <span className="font-medium">Time commitment:</span> {duration.timeCommitment}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-bold mb-3 text-sm sm:text-base">Sample Daily Structure:</h4>
              <div className="space-y-3 sm:space-y-4">
                {DAILY_STRUCTURE.map(day => (
                  <div key={day.day} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm sm:text-base mb-1">Day {day.day}: {day.title}</div>
                        <div className="text-xs sm:text-sm text-gray-600">Focus: {day.focus}</div>
                      </div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full flex-shrink-0">
                        Day {day.day}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700 mb-2">
                      <span className="font-medium">Why:</span> {day.why}
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs sm:text-sm font-medium mb-1">Your Task ({selectedBrandType}):</div>
                      <div className="text-xs sm:text-sm">
                        {selectedBrandType === 'business' ? day.businessVariant : day.personalVariant}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl">
              <h4 className="font-bold mb-2 text-sm sm:text-base">What Success Looks Like:</h4>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2 text-xs sm:text-sm">
                  <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Increased posting consistency</span>
                </li>
                <li className="flex items-start space-x-2 text-xs sm:text-sm">
                  <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Clearer brand voice and messaging</span>
                </li>
                <li className="flex items-start space-x-2 text-xs sm:text-sm">
                  <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                  <span>Reduced fear of showing up online</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => setShowDailyPreview(false)}
            className="w-full py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition text-sm"
          >
            Close Preview
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF0FF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading challenge setup...</p>
        </div>
      </div>
    );
  }

  const selectedDurationObj = getSelectedDuration();

  return (
    <div className="min-h-screen bg-[#FAF0FF]">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <button
          onClick={() => router.push('/challenges/visibility')}
          className="flex items-center space-x-1 sm:space-x-2 text-purple-600 hover:text-purple-700 mb-4 sm:mb-8 text-sm sm:text-base"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Challenge Overview</span>
        </button>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 sm:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FiEye className="text-xl sm:text-2xl" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Start Your Visibility Challenge</h1>
                      <p className="opacity-90 text-sm sm:text-base">Choose your duration and brand type to begin</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm opacity-80">Available for</div>
                  <div className="text-lg sm:text-xl font-bold">{isPro ? 'Pro & Free Users' : 'Free Users'}</div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 md:p-8">
              {/* Step 1: Choose Duration */}
              <div className="mb-8 sm:mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                  <div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Step 1: Choose Your Duration</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Select the challenge length that fits your commitment level</p>
                  </div>
                  <button
                    onClick={() => setShowDailyPreview(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-xs sm:text-sm"
                  >
                    <FiInfo />
                    <span>Preview Daily Structure</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {DURATIONS.map(duration => renderDurationCard(duration))}
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <FiInfo className="text-purple-500 text-lg sm:text-xl mt-0.5 sm:mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-bold mb-2 text-sm sm:text-base">Duration Recommendation:</div>
                      <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                        <li className="flex items-start space-x-2">
                          <span className="text-green-500 font-bold">•</span>
                          <span><strong>7-Day</strong> - Perfect if you're new to visibility or testing consistency</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-blue-500 font-bold">•</span>
                          <span><strong>14-Day</strong> - Great for building solid habits and message clarity</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-purple-500 font-bold">•</span>
                          <span><strong>30-Day</strong> - Best for forming lasting habits and momentum</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-pink-500 font-bold">•</span>
                          <span><strong>60+ Days</strong> - For serious builders ready for market presence (Pro)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Choose Brand Type */}
              <div className="mb-8 sm:mb-12">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">Step 2: Choose Your Brand Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <button
                    onClick={() => setSelectedBrandType('personal')}
                    className={`p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl border-2 transition-all ${
                      selectedBrandType === 'personal'
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <FiUsers className="text-purple-600 text-lg sm:text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base sm:text-lg md:text-xl truncate">Personal Brand</div>
                        <div className="text-gray-600 text-xs sm:text-sm">Building your personal authority</div>
                      </div>
                      {selectedBrandType === 'personal' && (
                        <div className="ml-auto">
                          <FiCheckCircle className="text-green-500 text-lg sm:text-xl" />
                        </div>
                      )}
                    </div>
                    
                    <ul className="space-y-2 sm:space-y-3 mb-4">
                      <li className="flex items-start space-x-2 text-xs sm:text-sm">
                        <FiCheck className="text-green-500 mt-0.5 sm:mt-1 flex-shrink-0" />
                        <span>Founders & Entrepreneurs</span>
                      </li>
                      <li className="flex items-start space-x-2 text-xs sm:text-sm">
                        <FiCheck className="text-green-500 mt-0.5 sm:mt-1 flex-shrink-0" />
                        <span>Creators & Influencers</span>
                      </li>
                      <li className="flex items-start space-x-2 text-xs sm:text-sm">
                        <FiCheck className="text-green-500 mt-0.5 sm:mt-1 flex-shrink-0" />
                        <span>Coaches & Consultants</span>
                      </li>
                    </ul>
                  </button>

                  <button
                    onClick={() => setSelectedBrandType('business')}
                    className={`p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl border-2 transition-all ${
                      selectedBrandType === 'business'
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                        <FiTarget className="text-purple-600 text-lg sm:text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base sm:text-lg md:text-xl truncate">Business Brand</div>
                        <div className="text-gray-600 text-xs sm:text-sm">Growing your company brand</div>
                      </div>
                      {selectedBrandType === 'business' && (
                        <div className="ml-auto">
                          <FiCheckCircle className="text-green-500 text-lg sm:text-xl" />
                        </div>
                      )}
                    </div>
                    
                    <ul className="space-y-2 sm:space-y-3 mb-4">
                      <li className="flex items-start space-x-2 text-xs sm:text-sm">
                        <FiCheck className="text-green-500 mt-0.5 sm:mt-1 flex-shrink-0" />
                        <span>Small Business Owners</span>
                      </li>
                      <li className="flex items-start space-x-2 text-xs sm:text-sm">
                        <FiCheck className="text-green-500 mt-0.5 sm:mt-1 flex-shrink-0" />
                        <span>Startups & Tech Companies</span>
                      </li>
                      <li className="flex items-start space-x-2 text-xs sm:text-sm">
                        <FiCheck className="text-green-500 mt-0.5 sm:mt-1 flex-shrink-0" />
                        <span>Agencies & Service Providers</span>
                      </li>
                    </ul>
                  </button>
                </div>
              </div>

              {/* Challenge Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-center">Your Challenge Summary</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">
                      {selectedDurationObj.days}
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm">Days</div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">
                      {selectedBrandType === 'personal' ? 'Personal' : 'Business'}
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm">Brand Type</div>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl text-center col-span-2 md:col-span-1">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">100</div>
                    <div className="text-gray-600 text-xs sm:text-sm">Points Reward</div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Daily Commitment: {selectedDurationObj.timeCommitment}</div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    You'll receive daily tasks focused on visibility and brand building
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
                  <div className="font-bold text-red-700 mb-1 sm:mb-2 text-sm sm:text-base">Error:</div>
                  <div className="text-xs sm:text-sm text-red-600">{error}</div>
                </div>
              )}

              {/* Final CTA */}
              <div className="text-center">
                <button
                  onClick={handleStartChallenge}
                  disabled={startingChallenge}
                  className="w-full max-w-2xl mx-auto py-3 sm:py-4 md:py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-bold text-base sm:text-lg md:text-xl hover:shadow-lg transition disabled:opacity-50"
                >
                  {startingChallenge ? (
                    <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm sm:text-base md:text-lg">Starting Your Challenge...</span>
                    </div>
                  ) : (
                    `Start ${selectedDurationObj.name} Now`
                  )}
                </button>
                
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <FiCheckCircle className="text-green-500" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <FiCheckCircle className="text-green-500" />
                    <span>Cancel anytime</span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <FiCheckCircle className="text-green-500" />
                    <span>100% satisfaction guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDailyPreview && renderDailyPreview()}
    </div>
  );
}
