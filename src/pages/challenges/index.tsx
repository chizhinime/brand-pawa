// src/pages/challenges/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import {
  FiTarget, FiTrendingUp, FiUsers, FiAward, FiCalendar,
  FiCheckCircle, FiClock, FiStar, FiZap, FiFilter,
  FiChevronRight, FiArrowRight, FiPlay, FiBookOpen,
  FiVideo, FiMessageCircle, FiDollarSign, FiEye
} from 'react-icons/fi';

interface Challenge {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'entry' | 'pro' | 'diagnostic';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  daily_time_commitment_minutes: number;
  is_pro: boolean;
  reward_points: number;
  durations: Array<{
    id: string;
    duration_days: number;
    name: string;
    description: string;
  }>;
  user_participation?: {
    status: 'active' | 'completed' | 'archived';
    current_day: number;
    completed_days: number;
  };
}

interface UserChallenge {
  id: string;
  challenge_id: string;
  challenge_name: string;
  status: string;
  current_day: number;
  completed_days: number;
  start_date: string;
  end_date: string;
  streak_days: number;
}

export default function ChallengesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<UserChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'entry' | 'pro'>('all');
  const [showChallengeDetail, setShowChallengeDetail] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchChallenges();
      fetchUserChallenges();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }
    setUser(user);
  };

  const fetchChallenges = async () => {
    try {
      // Fetch challenges with their durations
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select(`
          *,
          durations:challenge_durations(*)
        `)
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('difficulty', { ascending: true });

      if (challengesError) throw challengesError;

      // Fetch user participation for challenges
      const { data: participationData, error: participationError } = await supabase
        .from('user_challenges')
        .select('challenge_id, status, current_day, completed_days')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (!participationError && participationData) {
        const challengesWithParticipation = challengesData.map(challenge => ({
          ...challenge,
          user_participation: participationData.find(p => p.challenge_id === challenge.id)
        }));
        setChallenges(challengesWithParticipation);
      } else {
        setChallenges(challengesData);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchUserChallenges = async () => {
    try {
      const { data: activeData, error: activeError } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenges:challenge_id (name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('start_date', { ascending: false });

      const { data: completedData, error: completedError } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenges:challenge_id (name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (!activeError && activeData) {
        setActiveChallenges(activeData.map(uc => ({
          ...uc,
          challenge_name: uc.challenges?.name || 'Unknown Challenge'
        })));
      }

      if (!completedError && completedData) {
        setCompletedChallenges(completedData.map(uc => ({
          ...uc,
          challenge_name: uc.challenges?.name || 'Unknown Challenge'
        })));
      }
    } catch (error) {
      console.error('Error fetching user challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'entry': return <FiUsers className="text-blue-500" />;
      case 'pro': return <FiStar className="text-purple-500" />;
      case 'diagnostic': return <FiTarget className="text-green-500" />;
      default: return <FiTarget className="text-gray-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartChallenge = (challengeId: string) => {
    router.push(`/challenges/${challengeId}/start`);
  };

  const handleContinueChallenge = (challengeId: string) => {
    router.push(`/challenges/${challengeId}`);
  };

  const renderChallengeCard = (challenge: Challenge) => {
    const isActive = challenge.user_participation?.status === 'active';
    const isProLocked = challenge.is_pro && !user?.user_metadata?.is_pro;

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
              {getCategoryIcon(challenge.category)}
            </div>
            <div>
              <h3 className="font-bold text-lg">{challenge.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty}
                </span>
                {challenge.is_pro && (
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">
                    PRO
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">{challenge.daily_time_commitment_minutes} min/day</div>
            <div className="text-sm font-medium text-purple-600">{challenge.reward_points} points</div>
          </div>
        </div>

        <p className="text-gray-600 mb-4">{challenge.description}</p>

        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Available Durations:</div>
          <div className="flex flex-wrap gap-2">
            {challenge.durations.slice(0, 3).map(duration => (
              <div key={duration.id} className="px-3 py-1 bg-gray-100 rounded-lg text-sm">
                {duration.name}
              </div>
            ))}
            {challenge.durations.length > 3 && (
              <div className="px-3 py-1 bg-gray-100 rounded-lg text-sm">
                +{challenge.durations.length - 3} more
              </div>
            )}
          </div>
        </div>

        {isActive ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Day {challenge.user_participation?.current_day} of {challenge.durations[0]?.duration_days}
              </div>
              <div className="text-sm font-medium text-green-600">
                {Math.round((challenge.user_participation?.completed_days || 0) / challenge.durations[0]?.duration_days * 100)}% complete
              </div>
            </div>
            <button
              onClick={() => handleContinueChallenge(challenge.id)}
              className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center justify-center space-x-2"
            >
              <FiPlay />
              <span>Continue Challenge</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleStartChallenge(challenge.id)}
            disabled={isProLocked}
            className={`w-full py-2.5 rounded-lg font-medium transition ${
              isProLocked
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
            }`}
          >
            {isProLocked ? 'Upgrade to Pro' : 'Start Challenge'}
          </button>
        )}
      </div>
    );
  };

  const renderActiveChallenges = () => {
    if (activeChallenges.length === 0) {
      return (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiTarget className="text-purple-600 text-2xl" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Active Challenges</h3>
          <p className="text-gray-600 mb-6">Start your first challenge to begin building your brand intentionally.</p>
          <button
            onClick={() => setActiveFilter('all')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
          >
            Browse Challenges
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {activeChallenges.map(challenge => (
          <div key={challenge.id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{challenge.challenge_name}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  Started {new Date(challenge.start_date).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-purple-600">
                  Day {challenge.current_day}
                </div>
                <div className="text-xs text-gray-500">
                  Streak: {challenge.streak_days} days
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{challenge.completed_days} days completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                  style={{ width: `${(challenge.current_day / 30) * 100}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={() => handleContinueChallenge(challenge.challenge_id)}
              className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center justify-center space-x-2"
            >
              <FiPlay />
              <span>Continue Today's Task</span>
            </button>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF0FF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF0FF] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">BrandPawa Challenges</h1>
              <p className="opacity-90">Turn insights into action. Build your brand intentionally.</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 md:mt-0 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <FiTarget className="text-blue-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeChallenges.length}</div>
                <div className="text-gray-600">Active Challenges</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="text-green-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold">{completedChallenges.length}</div>
                <div className="text-gray-600">Completed</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <FiAward className="text-purple-600 text-xl" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {activeChallenges.reduce((sum, c) => sum + (c.streak_days || 0), 0)}
                </div>
                <div className="text-gray-600">Total Streak Days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Active Challenges */}
          <div className="lg:w-2/3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Active Challenges</h2>
              <div className="text-sm text-gray-600">
                {activeChallenges.length} in progress
              </div>
            </div>
            {renderActiveChallenges()}

            {/* Available Challenges */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Available Challenges</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      activeFilter === 'all'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveFilter('entry')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      activeFilter === 'entry'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Entry
                  </button>
                  <button
                    onClick={() => setActiveFilter('pro')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      activeFilter === 'pro'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Pro
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenges
                  .filter(challenge => 
                    activeFilter === 'all' || 
                    challenge.category === activeFilter
                  )
                  .map(challenge => renderChallengeCard(challenge))}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Recommendations */}
          <div className="lg:w-1/3 space-y-8">
            {/* Progress Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Challenge Completion</span>
                    <span>
                      {completedChallenges.length} / {completedChallenges.length + activeChallenges.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(completedChallenges.length / (completedChallenges.length + activeChallenges.length)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Current Streak</div>
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.max(...activeChallenges.map(c => c.streak_days || 0))} days
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Challenges */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4">Recommended For You</h3>
              <div className="space-y-4">
                <button
                  onClick={() => handleStartChallenge('visibility')}
                  className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <FiEye className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Visibility Challenge</div>
                      <div className="text-sm text-gray-600">Build consistent presence</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleStartChallenge('authority')}
                  className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                      <FiStar className="text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Authority Challenge</div>
                      <div className="text-sm text-gray-600">Establish credibility</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Challenge Tips</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">Complete tasks daily to maintain your streak</div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">Share progress to inspire others</div>
                </div>
                <div className="flex items-start space-x-3">
                  <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">Complete challenges to earn BrandPawa points</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}