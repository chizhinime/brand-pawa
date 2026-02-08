// src/pages/challenges/[id]/index.tsx - OPTIMIZED VERSION
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabase';
import {
  FiArrowLeft, FiCalendar, FiCheck, FiClock,
  FiTrendingUp, FiUsers, FiZap, FiAward, FiStar,
  FiBarChart2, FiTarget, FiCheckCircle,
  FiDownload, FiShare2, FiRefreshCw,
  FiChevronRight, FiChevronLeft, FiBookOpen,
  FiInfo, FiList, FiPieChart,
  FiAlertCircle, FiHelpCircle
} from 'react-icons/fi';

// Types
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
  created_at: string;
  updated_at: string;
}

interface UserChallenge {
  id: string;
  challenge_id: string;
  challenge_duration_id: string;
  brand_type: 'personal' | 'business';
  current_day: number;
  completed_days: number[];
  streak_days: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'failed' | 'paused';
  completed_at?: string;
}

interface ChallengeTask {
  id: string;
  day_number: number;
  title: string;
  focus: string;
  why_it_matters: string;
  task_description: string;
  personal_brand_variant: string;
  business_brand_variant: string;
  completion_type: string;
  optional: boolean;
}

interface ChallengeDuration {
  id: string;
  duration_days: number;
  name: string;
  description: string;
}

interface ChallengeStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  pointsEarned: number;
  daysRemaining: number;
  startDate: string;
  estimatedEndDate: string;
}

interface WeeklyProgress {
  week: number;
  tasksCompleted: number;
  totalTasks: number;
  streak: number;
  points: number;
}

export default function ChallengeDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const [user, setUser] = useState<any>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userChallenge, setUserChallenge] = useState<UserChallenge | null>(null);
  const [durations, setDurations] = useState<ChallengeDuration[]>([]);
  const [tasks, setTasks] = useState<ChallengeTask[]>([]);
  const [activeTasks, setActiveTasks] = useState<ChallengeTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<ChallengeTask[]>([]);
  const [stats, setStats] = useState<ChallengeStats>({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    pointsEarned: 0,
    daysRemaining: 0,
    startDate: '',
    estimatedEndDate: ''
  });
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'progress' | 'analytics'>('overview');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check user authentication
  useEffect(() => {
    checkUser();
  }, []);

  // Fetch challenge data when user and challenge ID are available
  useEffect(() => {
    if (user && id) {
      fetchChallengeData();
    }
  }, [user, id]);

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
      
      setIsProUser(profile?.plan === 'pro' || profile?.plan === 'enterprise');
      
    } catch (error) {
      console.error('Error checking user:', error);
      setError('Failed to authenticate user');
    }
  };

  const fetchChallengeData = useCallback(async () => {
    if (!user || !id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch challenge details
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();
      
      if (challengeError) throw challengeError;
      setChallenge(challengeData);
      
      // Fetch user's participation in this challenge
      const { data: userChallengeData, error: userChallengeError } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (userChallengeError && userChallengeError.code !== 'PGRST116') {
        throw userChallengeError;
      }
      
      if (userChallengeData) {
        setUserChallenge(userChallengeData);
      }
      
      // Fetch available durations for this challenge
      const { data: durationsData, error: durationsError } = await supabase
        .from('challenge_durations')
        .select('*')
        .eq('challenge_id', id)
        .order('duration_days', { ascending: true });
      
      if (durationsError) throw durationsError;
      setDurations(durationsData || []);
      
      // If user has a challenge, fetch tasks for their duration
      if (userChallengeData) {
        await fetchTasksForDuration(userChallengeData.challenge_duration_id);
        await calculateChallengeStats(userChallengeData);
      } else {
        // If no user challenge, fetch tasks for the default duration
        const defaultDuration = durationsData?.[0];
        if (defaultDuration) {
          await fetchTasksForDuration(defaultDuration.id);
        }
      }
      
    } catch (error: any) {
      console.error('Error fetching challenge data:', error);
      setError(error.message || 'Failed to load challenge details');
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  const fetchTasksForDuration = async (durationId: string) => {
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('challenge_tasks')
        .select('*')
        .eq('challenge_duration_id', durationId)
        .order('day_number', { ascending: true });
      
      if (tasksError) throw tasksError;
      
      if (tasksData) {
        setTasks(tasksData);
        
        // Separate active and completed tasks
        const completed = tasksData.filter(task => 
          userChallenge?.completed_days?.includes(task.day_number)
        );
        const active = tasksData.filter(task => 
          !userChallenge?.completed_days?.includes(task.day_number)
        );
        
        setCompletedTasks(completed);
        setActiveTasks(active);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const calculateChallengeStats = async (userChallenge: UserChallenge) => {
    try {
      const totalTasks = tasks.length;
      const completedTasksCount = userChallenge.completed_days?.length || 0;
      const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
      
      // Calculate streaks
      const streaks = calculateStreaks(userChallenge.completed_days || []);
      
      // Calculate estimated end date
      const startDate = new Date(userChallenge.start_date);
      const endDate = userChallenge.status === 'completed' && userChallenge.completed_at
        ? new Date(userChallenge.completed_at)
        : durations.find(d => d.id === userChallenge.challenge_duration_id)
          ? new Date(startDate.getTime() + (durations.find(d => d.id === userChallenge.challenge_duration_id)!.duration_days * 24 * 60 * 60 * 1000))
          : new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      // Calculate points earned
      let pointsEarned = completedTasksCount * 10; // 10 points per task
      if (userChallenge.status === 'completed') {
        pointsEarned += (challenge?.reward_points || 100);
      }
      
      // Calculate days remaining
      const today = new Date();
      const daysRemaining = userChallenge.status === 'completed' 
        ? 0 
        : Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Calculate weekly progress
      const weeklyProgressData = calculateWeeklyProgress(userChallenge, tasks);
      
      setStats({
        totalTasks,
        completedTasks: completedTasksCount,
        completionRate,
        currentStreak: userChallenge.streak_days || 0,
        longestStreak: streaks.longestStreak,
        pointsEarned,
        daysRemaining,
        startDate: userChallenge.start_date,
        estimatedEndDate: endDate.toISOString().split('T')[0]
      });
      
      setWeeklyProgress(weeklyProgressData);
      
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const calculateStreaks = (completedDays: number[]): { currentStreak: number; longestStreak: number } => {
    if (!completedDays || completedDays.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }
    
    const sortedDays = [...completedDays].sort((a, b) => a - b);
    let currentStreak = 1;
    let longestStreak = 1;
    let maxStreak = 1;
    
    for (let i = 1; i < sortedDays.length; i++) {
      if (sortedDays[i] === sortedDays[i - 1] + 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    // Check if last streak is still active (consecutive days)
    const lastCompletion = Math.max(...sortedDays);
    const today = new Date();
    const startDate = new Date(sortedDays[0]);
    const daysSinceLastCompletion = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      currentStreak: daysSinceLastCompletion <= 1 ? currentStreak : 0,
      longestStreak: maxStreak
    };
  };

  const calculateWeeklyProgress = (userChallenge: UserChallenge, tasks: ChallengeTask[]): WeeklyProgress[] => {
    const weeklyData: WeeklyProgress[] = [];
    const duration = durations.find(d => d.id === userChallenge.challenge_duration_id);
    if (!duration || tasks.length === 0) return weeklyData;
    
    const weeks = Math.ceil(duration.duration_days / 7);
    
    for (let week = 1; week <= weeks; week++) {
      const weekStartDay = (week - 1) * 7 + 1;
      const weekEndDay = Math.min(week * 7, tasks.length);
      
      const weekTasks = tasks.filter(task => 
        task.day_number >= weekStartDay && task.day_number <= weekEndDay
      );
      
      const completedWeekTasks = weekTasks.filter(task =>
        userChallenge.completed_days?.includes(task.day_number)
      );
      
      weeklyData.push({
        week,
        tasksCompleted: completedWeekTasks.length,
        totalTasks: weekTasks.length,
        streak: 0,
        points: completedWeekTasks.length * 10
      });
    }
    
    return weeklyData;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchChallengeData();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleStartChallenge = async (durationId: string) => {
    if (!user || !challenge) return;
    
    try {
      // Check if already participating
      if (userChallenge) {
        alert('You are already participating in this challenge!');
        return;
      }
      
      // Start the challenge
      const startDate = new Date();
      const duration = durations.find(d => d.id === durationId);
      const endDate = new Date(startDate.getTime() + (duration!.duration_days * 24 * 60 * 60 * 1000));
      
      const { data: newUserChallenge, error } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_id: challenge.id,
          challenge_duration_id: durationId,
          brand_type: 'personal',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active',
          current_day: 1,
          streak_days: 0,
          completed_days: []
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add activity
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: 'challenge_started',
          metadata: {
            challenge: challenge.name,
            duration: duration!.duration_days,
            duration_name: duration!.name
          },
          created_at: new Date().toISOString()
        });
      
      alert(`🎉 Challenge started! You've chosen the ${duration!.name}.`);
      
      // Refresh data
      await fetchChallengeData();
      
      // Navigate to challenge execution page
      if (challenge.slug === 'visibility') {
        router.push('/challenges/visibility');
      } else if (challenge.slug === 'authority') {
        router.push('/challenges/authority');
      }
      
    } catch (error: any) {
      console.error('Error starting challenge:', error);
      alert(`Failed to start challenge: ${error.message}`);
    }
  };

  const handleContinueChallenge = () => {
    if (!userChallenge || !challenge) return;
    
    if (challenge.slug === 'visibility') {
      router.push('/challenges/visibility');
    } else if (challenge.slug === 'authority') {
      router.push('/challenges/authority');
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'entry': return <FiBookOpen className="text-blue-500" />;
      case 'pro': return <FiStar className="text-purple-500" />;
      case 'diagnostic': return <FiTarget className="text-green-500" />;
      default: return <FiTarget className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'entry': return 'Entry Level';
      case 'pro': return 'Pro Challenge';
      case 'diagnostic': return 'Diagnostic';
      default: return 'Challenge';
    }
  };

  const renderOverview = () => {
    if (!challenge) return null;
    
    return (
      <div className="space-y-6">
        {/* Challenge Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                {getCategoryIcon(challenge.category)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{challenge.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {getCategoryName(challenge.category)}
                  </span>
                  {challenge.is_pro && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      PRO Feature
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                title="Refresh"
              >
                <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">{challenge.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <FiClock className="text-gray-400" />
                <span className="font-medium">Time Commitment</span>
              </div>
              <div className="text-xl font-bold">{challenge.daily_time_commitment_minutes} min/day</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <FiAward className="text-gray-400" />
                <span className="font-medium">Reward Points</span>
              </div>
              <div className="text-xl font-bold">{challenge.reward_points}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <FiTrendingUp className="text-gray-400" />
                <span className="font-medium">Category</span>
              </div>
              <div className="text-xl font-bold">{getCategoryName(challenge.category)}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <FiUsers className="text-gray-400" />
                <span className="font-medium">For</span>
              </div>
              <div className="text-xl font-bold">
                {challenge.category === 'entry' ? 'Beginners' : 
                 challenge.category === 'pro' ? 'Advanced' : 'All Levels'}
              </div>
            </div>
          </div>
        </div>

        {/* User Participation Status */}
        {userChallenge && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Your Progress</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(userChallenge.status)}`}>
                {userChallenge.status.charAt(0).toUpperCase() + userChallenge.status.slice(1)}
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{stats.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                    style={{ width: `${stats.completionRate}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {stats.completedTasks} of {stats.totalTasks} tasks completed
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Streak:</span>
                  <span className="font-bold">{stats.currentStreak} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Points Earned:</span>
                  <span className="font-bold text-purple-600">{stats.pointsEarned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Days Remaining:</span>
                  <span className="font-bold">{stats.daysRemaining}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              {userChallenge.status === 'active' ? (
                <button
                  onClick={handleContinueChallenge}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center space-x-3"
                >
                  <FiZap />
                  <span>Continue Challenge</span>
                </button>
              ) : userChallenge.status === 'completed' ? (
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-green-600 mb-3">
                    <FiCheckCircle className="text-2xl" />
                    <span className="font-semibold">Challenge Completed!</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Completed on {new Date(userChallenge.completed_at!).toLocaleDateString()}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Available Durations */}
        {!userChallenge && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Available Durations</h2>
            <p className="text-gray-600 mb-6">Choose how long you want to commit to this challenge</p>
            
            <div className="grid md:grid-cols-3 gap-4">
              {durations.map((duration) => (
                <div key={duration.id} className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition">
                  <div className="font-bold text-lg mb-2">{duration.name}</div>
                  <div className="text-sm text-gray-600 mb-3">{duration.description}</div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <FiCalendar className="text-gray-400" />
                      <span>{duration.duration_days} days</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <FiClock className="text-gray-400" />
                      <span>{challenge?.daily_time_commitment_minutes || 15} min/day</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <FiAward className="text-gray-400" />
                      <span>{challenge?.reward_points || 100} points</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleStartChallenge(duration.id)}
                    disabled={challenge?.is_pro && !isProUser}
                    className={`w-full py-2.5 rounded-lg font-medium transition ${
                      challenge?.is_pro && !isProUser
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                    }`}
                  >
                    {challenge?.is_pro && !isProUser ? 'Upgrade to Pro' : 'Start Challenge'}
                  </button>
                </div>
              ))}
            </div>
            
            {challenge?.is_pro && !isProUser && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <FiInfo className="text-purple-500 text-xl" />
                  <div>
                    <div className="font-semibold mb-1">Pro Feature</div>
                    <p className="text-sm text-gray-600">
                      This challenge is available for Pro users only. Upgrade to unlock all pro features.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/dashboard?section=billing')}
                  className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition"
                >
                  Upgrade to Pro
                </button>
              </div>
            )}
          </div>
        )}

        {/* Challenge Benefits */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">What You'll Achieve</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-xl">
                <div className="font-semibold mb-2">Skills You'll Build</div>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                    <span>Consistent brand presence</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                    <span>Clear messaging strategy</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                    <span>Audience engagement techniques</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="font-semibold mb-2">What You Get</div>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <FiAward className="text-yellow-500 mt-1 flex-shrink-0" />
                    <span>Completion certificate</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <FiStar className="text-purple-500 mt-1 flex-shrink-0" />
                    <span>BrandPawa Score boost</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <FiUsers className="text-green-500 mt-1 flex-shrink-0" />
                    <span>Community recognition</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTasks = () => {
    if (!challenge) return null;
    
    const allTasks = [...completedTasks, ...activeTasks].sort((a, b) => a.day_number - b.day_number);
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Challenge Tasks</h2>
            <div className="text-sm text-gray-600">
              {completedTasks.length} of {allTasks.length} completed
            </div>
          </div>
          
          {allTasks.length === 0 ? (
            <div className="text-center py-8">
              <FiList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No tasks available for this challenge duration.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allTasks.map((task) => {
                const isCompleted = completedTasks.some(t => t.id === task.id);
                const isCurrent = userChallenge?.current_day === task.day_number;
                
                return (
                  <div
                    key={task.id}
                    className={`border rounded-xl p-4 transition-all ${
                      isCompleted
                        ? 'border-green-200 bg-green-50'
                        : isCurrent
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
                            Day {task.day_number}
                          </span>
                          {isCompleted && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium flex items-center space-x-1">
                              <FiCheckCircle size={12} />
                              <span>Completed</span>
                            </span>
                          )}
                          {isCurrent && !isCompleted && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                              Current Task
                            </span>
                          )}
                          {task.optional && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm font-medium">
                              Optional
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-bold mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{task.focus}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <FiTarget size={14} />
                            <span>Focus: {task.focus}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiClock size={14} />
                            <span>10-25 min</span>
                          </div>
                        </div>
                      </div>
                      
                      {userChallenge?.status === 'active' && !isCompleted && (
                        <button
                          onClick={() => {
                            if (challenge.slug === 'visibility') {
                              router.push('/challenges/visibility');
                            } else if (challenge.slug === 'authority') {
                              router.push('/challenges/authority');
                            }
                          }}
                          className="ml-4 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition text-sm"
                        >
                          {isCurrent ? 'Continue' : 'View'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProgress = () => {
    if (!userChallenge) return null;
    
    return (
      <div className="space-y-6">
        {/* Progress Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">Progress Overview</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Completion Progress */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="font-semibold">Completion Progress</div>
                <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Tasks Completed</span>
                    <span>{stats.completedTasks}/{stats.totalTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                      style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Days Completed</span>
                    <span>{userChallenge.current_day - 1}/{durations.find(d => d.id === userChallenge.challenge_duration_id)?.duration_days || 30}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${((userChallenge.current_day - 1) / (durations.find(d => d.id === userChallenge.challenge_duration_id)?.duration_days || 30)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Streak Stats */}
            <div>
              <div className="font-semibold mb-4">Streak Statistics</div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <FiZap className="text-purple-600" />
                    <div>
                      <div className="font-medium">Current Streak</div>
                      <div className="text-sm text-gray-600">Consecutive days active</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{stats.currentStreak}</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <FiTrendingUp className="text-blue-600" />
                    <div>
                      <div className="font-medium">Longest Streak</div>
                      <div className="text-sm text-gray-600">Best consecutive days</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{stats.longestStreak}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Progress */}
        {weeklyProgress.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Weekly Progress</h2>
            
            <div className="space-y-4">
              {weeklyProgress.map((week) => (
                <div key={week.week} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-semibold">Week {week.week}</div>
                    <div className="text-sm text-gray-600">
                      {week.tasksCompleted} of {week.totalTasks} tasks
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Task Completion</span>
                      <span>{Math.round((week.tasksCompleted / week.totalTasks) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${(week.tasksCompleted / week.totalTasks) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-bold text-purple-600">{week.points}</div>
                      <div className="text-gray-600">Points</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-bold text-green-600">{week.tasksCompleted}</div>
                      <div className="text-gray-600">Tasks</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-bold text-blue-600">
                        {Math.round((week.tasksCompleted / week.totalTasks) * 100)}%
                      </div>
                      <div className="text-gray-600">Complete</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!userChallenge) return null;
    
    return (
      <div className="space-y-6">
        {/* Performance Metrics */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">Performance Analytics</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 mb-1">{stats.completionRate}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.currentStreak}</div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.pointsEarned}</div>
              <div className="text-sm text-gray-600">Points Earned</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl">
              <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.daysRemaining}</div>
              <div className="text-sm text-gray-600">Days Remaining</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="font-medium mb-2">Consistency Score</div>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                    style={{ width: `${Math.min(100, (stats.currentStreak / 30) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-lg font-bold">
                  {Math.min(100, Math.round((stats.currentStreak / 30) * 100))}/100
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Based on your consecutive day streak
              </div>
            </div>
            
            <div>
              <div className="font-medium mb-2">Engagement Level</div>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                    style={{ width: `${Math.min(100, (stats.completedTasks / stats.totalTasks) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-lg font-bold">
                  {Math.min(100, Math.round((stats.completedTasks / stats.totalTasks) * 100))}/100
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Based on task completion rate
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Recommendations</h2>
          
          <div className="space-y-3">
            {stats.completionRate < 50 && (
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                <FiAlertCircle className="text-yellow-500 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium mb-1">Increase Your Consistency</div>
                  <p className="text-sm text-gray-600">
                    Try to complete at least one task every day to build momentum.
                  </p>
                </div>
              </div>
            )}
            
            {stats.currentStreak < 7 && (
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                <FiTrendingUp className="text-purple-500 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium mb-1">Build Your Streak</div>
                  <p className="text-sm text-gray-600">
                    Aim for a 7-day streak to unlock bonus points and build better habits.
                  </p>
                </div>
              </div>
            )}
            
            {stats.daysRemaining < 3 && userChallenge.status === 'active' && (
              <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                <FiClock className="text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium mb-1">Challenge Ending Soon</div>
                  <p className="text-sm text-gray-600">
                    Only {stats.daysRemaining} days left! Focus on completing remaining tasks.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF0FF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading challenge details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF0FF] py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.push('/dashboard?section=challenges')}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-8"
          >
            <FiArrowLeft />
            <span>Back to Challenges</span>
          </button>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertCircle className="text-red-600 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Error Loading Challenge</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                
                <div className="space-y-3">
                  <button
                    onClick={fetchChallengeData}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push('/dashboard?section=challenges')}
                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                  >
                    Back to Challenges
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-[#FAF0FF] py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.push('/dashboard?section=challenges')}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-8"
          >
            <FiArrowLeft />
            <span>Back to Challenges</span>
          </button>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Challenge Not Found</h3>
              <p className="text-gray-600 mb-6">The challenge you're looking for doesn't exist or has been removed.</p>
              
              <button
                onClick={() => router.push('/dashboard?section=challenges')}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                Browse Available Challenges
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF0FF] py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => router.push('/dashboard?section=challenges')}
          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-6"
        >
          <FiArrowLeft />
          <span>Back to Challenges</span>
        </button>
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-4 px-6 text-center font-medium transition ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FiInfo />
                <span>Overview</span>
              </div>
            </button>
            
            {userChallenge && (
              <>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`flex-1 py-4 px-6 text-center font-medium transition ${
                    activeTab === 'tasks'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <FiList />
                    <span>Tasks</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('progress')}
                  className={`flex-1 py-4 px-6 text-center font-medium transition ${
                    activeTab === 'progress'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <FiTrendingUp />
                    <span>Progress</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex-1 py-4 px-6 text-center font-medium transition ${
                    activeTab === 'analytics'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <FiBarChart2 />
                    <span>Analytics</span>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Main Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'progress' && renderProgress()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
}
