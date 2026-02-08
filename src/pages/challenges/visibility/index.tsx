// src/pages/challenges/visibility/index.tsx - OPTIMIZED VERSION
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabase';
import {
  FiArrowLeft, FiCalendar, FiCheck, FiChevronRight,
  FiChevronLeft, FiClock, FiShare2, FiTarget,
  FiTrendingUp, FiUsers, FiZap, FiAward, FiEye,
  FiMessageCircle, FiHeart, FiStar, FiCheckCircle,
  FiAlertCircle, FiList, FiRefreshCw,
  FiBarChart2, FiHome
} from 'react-icons/fi';

// Types
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
  challenge_duration_id: string;
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
  challenge_name?: string;
  duration_days?: number;
  duration_name?: string;
}

interface ChallengeStats {
  totalTasks: number;
  completedTasks: number;
  streak: number;
  pointsEarned: number;
  completionPercentage: number;
  daysRemaining: number;
}

export default function VisibilityChallenge() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userChallenge, setUserChallenge] = useState<UserChallenge | null>(null);
  const [tasks, setTasks] = useState<ChallengeTask[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<ChallengeTask | null>(null);
  const [userInput, setUserInput] = useState('');
  const [completingTask, setCompletingTask] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showTaskList, setShowTaskList] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [challengeStats, setChallengeStats] = useState<ChallengeStats>({
    totalTasks: 0,
    completedTasks: 0,
    streak: 0,
    pointsEarned: 0,
    completionPercentage: 0,
    daysRemaining: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isProUser, setIsProUser] = useState(false);

  // Check user on mount
  useEffect(() => {
    checkUser();
  }, []);

  // Fetch challenge data when user is available
  useEffect(() => {
    if (user) {
      fetchChallengeData();
    }
  }, [user]);

  const checkUser = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Auth error:', userError);
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
      
    } catch (error: any) {
      console.error('Error checking user:', error);
      setError('Failed to load user session. Please sign in again.');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchChallengeData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      
      if (!user) {
        console.log('No user available');
        return;
      }

      // Fetch user's active visibility challenge
      const { data: userChallenges, error: userChallengesError } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenges:challenge_id (name),
          durations:challenge_duration_id (duration_days, name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .ilike('challenges.name', '%visibility%')
        .single();

      if (userChallengesError) {
        // No active challenge found
        if (userChallengesError.code === 'PGRST116') {
          console.log('No active visibility challenge found');
          setLoading(false);
          return;
        }
        throw userChallengesError;
      }

      if (!userChallenges) {
        console.log('No challenge data returned');
        setLoading(false);
        return;
      }

      // Format challenge data
      const formattedChallenge: UserChallenge = {
        ...userChallenges,
        challenge_name: userChallenges.challenges?.name || 'Visibility Challenge',
        duration_days: userChallenges.durations?.duration_days || 7,
        duration_name: userChallenges.durations?.name || '7-Day Challenge'
      };
      
      setUserChallenge(formattedChallenge);
      setCurrentDay(userChallenges.current_day || 1);

      // Fetch tasks for this challenge duration
      const { data: tasksData, error: tasksError } = await supabase
        .from('challenge_tasks')
        .select('*')
        .eq('challenge_duration_id', userChallenges.challenge_duration_id)
        .order('day_number', { ascending: true });

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        setError('Failed to load challenge tasks');
      } else if (tasksData) {
        setTasks(tasksData);
        
        // Find and set today's task
        const todayTask = tasksData.find(t => t.day_number === userChallenges.current_day);
        if (todayTask) {
          setSelectedTask(todayTask);
        } else if (tasksData.length > 0) {
          setSelectedTask(tasksData[0]);
        }
      }

      // Calculate challenge stats
      const completedTasksCount = userChallenges.completed_days?.length || 0;
      const totalTasks = tasksData?.length || 0;
      const daysRemaining = totalTasks - (userChallenges.current_day || 1) + 1;
      const completionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
      
      setChallengeStats({
        totalTasks,
        completedTasks: completedTasksCount,
        streak: userChallenges.streak_days || 0,
        pointsEarned: completedTasksCount * 10,
        completionPercentage,
        daysRemaining
      });

    } catch (error: any) {
      console.error('Error in fetchChallengeData:', error);
      setError(error.message || 'Failed to load challenge data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleRefresh = async () => {
    if (!user || refreshing) return;
    
    setRefreshing(true);
    try {
      await fetchChallengeData();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getTaskVariant = useCallback((task: ChallengeTask) => {
    if (!userChallenge || !task) return 'No task available';
    
    return userChallenge.brand_type === 'business' && task.business_brand_variant
      ? task.business_brand_variant
      : task.personal_brand_variant || task.task_description || 'No task description available';
  }, [userChallenge]);

  const handleCompleteTask = async () => {
    if (!selectedTask || !userChallenge || !user) {
      alert('Missing required data. Please try again.');
      return;
    }

    if (selectedTask.completion_type === 'text_input' && !userInput.trim()) {
      alert('Please provide a response before completing the task.');
      return;
    }

    setCompletingTask(true);
    setError(null);

    try {
      // Mark task as completed in user_challenge_tasks
      const { error: taskError } = await supabase
        .from('user_challenge_tasks')
        .upsert({
          user_challenge_id: userChallenge.id,
          challenge_task_id: selectedTask.id,
          day_number: selectedTask.day_number,
          status: 'completed',
          user_input: userInput || null,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_challenge_id,challenge_task_id'
        });

      if (taskError) throw taskError;

      // Update user challenge progress
      const completedDays = [...(userChallenge.completed_days || []), selectedTask.day_number];
      const newStreak = calculateStreak(completedDays);
      const nextDay = selectedTask.day_number + 1;
      const totalDays = tasks.length;
      
      const updateData: any = {
        completed_days: completedDays,
        streak_days: newStreak,
        current_day: selectedTask.day_number,
        last_activity_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      };

      // Check if challenge is complete
      if (selectedTask.day_number >= totalDays) {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.current_day = nextDay;
      }

      const { error: updateError } = await supabase
        .from('user_challenges')
        .update(updateData)
        .eq('id', userChallenge.id);

      if (updateError) throw updateError;

      // Update user's challenge points in profile
      if (selectedTask.day_number >= totalDays) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('challenge_points')
          .eq('id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              challenge_points: (profile.challenge_points || 0) + 100,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
        }
      }

      // Add activity
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: 'challenge_task_completed',
          metadata: {
            challenge: 'Visibility Challenge',
            day: selectedTask.day_number,
            task_title: selectedTask.title,
            points: 10
          },
          created_at: new Date().toISOString()
        });

      // If challenge is complete, add completion activity
      if (selectedTask.day_number >= totalDays) {
        await supabase
          .from('user_activity')
          .insert({
            user_id: user.id,
            activity_type: 'challenge_completed',
            metadata: {
              challenge: 'Visibility Challenge',
              duration: userChallenge.duration_days,
              streak: newStreak,
              points: 100
            },
            created_at: new Date().toISOString()
          });

        setShowCompletionModal(true);
      } else {
        // Move to next day
        if (nextDay <= tasks.length) {
          const nextTask = tasks.find(t => t.day_number === nextDay);
          if (nextTask) {
            setSelectedTask(nextTask);
            setCurrentDay(nextDay);
          }
        }

        // Update local stats
        setChallengeStats(prev => ({
          ...prev,
          completedTasks: prev.completedTasks + 1,
          streak: newStreak,
          pointsEarned: prev.pointsEarned + 10,
          daysRemaining: prev.daysRemaining - 1,
          completionPercentage: Math.round(((prev.completedTasks + 1) / prev.totalTasks) * 100)
        }));
      }

      // Update user challenge in state
      setUserChallenge(prev => prev ? {
        ...prev,
        completed_days: completedDays,
        streak_days: newStreak,
        current_day: selectedTask.day_number,
        status: selectedTask.day_number >= totalDays ? 'completed' : prev.status
      } : null);

      // Clear user input
      setUserInput('');

      alert('✅ Task completed successfully!');

    } catch (error: any) {
      console.error('Error completing task:', error);
      setError(`Failed to complete task: ${error.message}`);
      alert(`Failed to complete task: ${error.message}`);
    } finally {
      setCompletingTask(false);
    }
  };

  const calculateStreak = (completedDays: number[]): number => {
    if (!completedDays || completedDays.length === 0) return 0;
    
    const sortedDays = [...completedDays].sort((a, b) => a - b);
    let streak = 1;
    let maxStreak = 1;
    
    for (let i = 1; i < sortedDays.length; i++) {
      if (sortedDays[i] === sortedDays[i - 1] + 1) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 1;
      }
    }
    
    return maxStreak;
  };

  const handleSelectTask = (task: ChallengeTask) => {
    setSelectedTask(task);
    setShowTaskList(false);
  };

  const renderTaskList = () => {
    if (!tasks.length) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">All Tasks</h3>
            <button
              onClick={() => setShowTaskList(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => handleSelectTask(task)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedTask?.id === task.id
                    ? 'border-purple-500 bg-purple-50'
                    : userChallenge?.completed_days?.includes(task.day_number)
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm sm:text-base">Day {task.day_number}: {task.title}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">{task.focus}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {userChallenge?.completed_days?.includes(task.day_number) && (
                      <FiCheckCircle className="text-green-500" />
                    )}
                    {task.day_number === currentDay && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCompletionModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FiAward className="text-green-600 text-2xl sm:text-3xl" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Challenge Complete! 🎉</h3>
            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
              Congratulations on completing the Visibility Challenge!
            </p>
            
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 mb-4 sm:mb-6">
              <div className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Your Achievements:</div>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{userChallenge?.duration_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Tasks Completed:</span>
                  <span className="font-medium">{challengeStats.completedTasks} of {challengeStats.totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Points Earned:</span>
                  <span className="font-medium text-green-600">+100 points</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  router.push('/dashboard?section=challenges');
                }}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition text-sm sm:text-base"
              >
                View All Challenges
              </button>
              {isProUser && (
                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    router.push('/challenges/authority');
                  }}
                  className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition text-sm sm:text-base"
                >
                  Start Authority Challenge
                </button>
              )}
              <button
                onClick={() => setShowCompletionModal(false)}
                className="w-full py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-200 transition text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderErrorView = () => {
    return (
      <div className="min-h-screen bg-[#FAF0FF] py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.push('/dashboard?section=challenges')}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-6 sm:mb-8"
          >
            <FiArrowLeft />
            <span className="text-sm sm:text-base">Back to Challenges</span>
          </button>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <FiAlertCircle className="text-red-600 text-lg sm:text-xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Oops! Something went wrong</h3>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  {error || 'Failed to load the challenge.'}
                </p>
                
                <div className="space-y-2 sm:space-y-3">
                  <button
                    onClick={fetchChallengeData}
                    className="w-full py-2.5 sm:py-3 bg-purple-500 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-purple-600 transition text-sm sm:text-base"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push('/challenges/visibility/start')}
                    className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition text-sm sm:text-base"
                  >
                    Start New Challenge
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-200 transition text-sm sm:text-base"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNoChallengeView = () => {
    return (
      <div className="min-h-screen bg-[#FAF0FF] py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.push('/dashboard?section=challenges')}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 mb-6 sm:mb-8"
          >
            <FiArrowLeft />
            <span className="text-sm sm:text-base">Back to Challenges</span>
          </button>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 sm:p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FiEye className="text-xl sm:text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Visibility Challenge</h1>
                    <p className="text-base sm:text-lg opacity-90 mt-2">Build consistent brand presence</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="bg-purple-50 p-4 sm:p-6 rounded-lg sm:rounded-xl">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <FiClock className="text-purple-600 text-lg sm:text-xl" />
                      <div className="font-semibold text-sm sm:text-base">Time Commitment</div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold">10-25 min/day</div>
                    <div className="text-gray-600 text-xs sm:text-sm">Easy to fit in your schedule</div>
                  </div>
                  <div className="bg-pink-50 p-4 sm:p-6 rounded-lg sm:rounded-xl">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <FiTrendingUp className="text-pink-600 text-lg sm:text-xl" />
                      <div className="font-semibold text-sm sm:text-base">Difficulty</div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold">Beginner</div>
                    <div className="text-gray-600 text-xs sm:text-sm">Perfect for getting started</div>
                  </div>
                  <div className="bg-blue-50 p-4 sm:p-6 rounded-lg sm:rounded-xl">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                      <FiZap className="text-blue-600 text-lg sm:text-xl" />
                      <div className="font-semibold text-sm sm:text-base">Reward Points</div>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold">100</div>
                    <div className="text-gray-600 text-xs sm:text-sm">Added to your BrandPawa Score</div>
                  </div>
                </div>

                {/* Start Button */}
                <div className="text-center">
                  <button
                    onClick={() => router.push('/challenges/visibility/start')}
                    className="w-full max-w-md mx-auto py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-bold text-lg sm:text-xl hover:shadow-lg transition"
                  >
                    Start Visibility Challenge
                  </button>
                  <p className="text-gray-600 mt-3 sm:mt-4 text-xs sm:text-sm">
                    Free for all users • Cancel anytime
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTaskView = () => {
    if (!selectedTask || !userChallenge) {
      return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">Loading today's task...</h3>
          
          <button
            onClick={fetchChallengeData}
            className="w-full mt-4 py-2.5 sm:py-3 bg-purple-500 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-purple-600 transition text-sm sm:text-base"
          >
            Refresh Challenge
          </button>
        </div>
      );
    }

    const progressPercentage = challengeStats.totalTasks > 0 
      ? ((currentDay - 1) / challengeStats.totalTasks) * 100 
      : 0;

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Challenge Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 sm:mb-4">
            <div className="mb-3 md:mb-0">
              <h1 className="text-xl sm:text-2xl font-bold">Visibility Challenge</h1>
              <p className="opacity-90 text-sm sm:text-base">
                {userChallenge.brand_type === 'personal' ? 'Personal Brand' : 'Business Brand'} • 
                {userChallenge.duration_name || ` ${userChallenge.duration_days || 7}-Day Challenge`}
              </p>
            </div>
            <div className="flex space-x-2 w-full md:w-auto">
              <button
                onClick={() => setShowTaskList(true)}
                className="flex-1 md:flex-none px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition flex items-center justify-center space-x-2 text-xs sm:text-sm"
              >
                <FiList className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>View All Tasks</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex-1 md:flex-none px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition flex items-center justify-center space-x-2 text-xs sm:text-sm disabled:opacity-50"
              >
                <FiRefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs sm:text-sm mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-1">
                <FiCalendar />
                <span>Day {currentDay} of {challengeStats.totalTasks}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiClock />
                <span>{challengeStats.daysRemaining} days remaining</span>
              </div>
            </div>
            <div>
              {challengeStats.completedTasks} of {challengeStats.totalTasks} tasks
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-1 sm:mb-2">
            <div className="flex justify-between text-xs sm:text-sm mb-1">
              <span>Overall Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm border text-center">
            <div className="text-lg sm:text-xl font-bold text-purple-600">{challengeStats.streak}</div>
            <div className="text-xs sm:text-sm text-gray-600">Day Streak</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm border text-center">
            <div className="text-lg sm:text-xl font-bold text-pink-600">{challengeStats.completedTasks}</div>
            <div className="text-xs sm:text-sm text-gray-600">Tasks Done</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm border text-center">
            <div className="text-lg sm:text-xl font-bold text-green-600">{challengeStats.pointsEarned}</div>
            <div className="text-xs sm:text-sm text-gray-600">Points Earned</div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm border text-center">
            <div className="text-lg sm:text-xl font-bold text-blue-600">
              {challengeStats.completionPercentage}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Completion</div>
          </div>
        </div>

        {/* Current Task Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs sm:text-sm font-medium">
                  Day {selectedTask.day_number}
                </span>
                {userChallenge.completed_days?.includes(selectedTask.day_number) && (
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs sm:text-sm font-medium flex items-center space-x-1">
                    <FiCheckCircle className="w-3 h-3" />
                    <span>Completed</span>
                  </span>
                )}
                {selectedTask.optional && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs sm:text-sm font-medium">
                    Optional
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold">{selectedTask.title}</h2>
            </div>
            <div className="text-right mt-2 sm:mt-0">
              <div className="text-xs sm:text-sm text-gray-600">Estimated time</div>
              <div className="font-medium text-sm sm:text-base">10-25 minutes</div>
            </div>
          </div>

          {/* Task Details */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <div className="font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base flex items-center space-x-1.5 sm:space-x-2">
                  <FiTarget className="text-purple-500 w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Today's Focus</span>
                </div>
                <p className="text-gray-700 text-xs sm:text-sm">{selectedTask.focus}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <div className="font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base flex items-center space-x-1.5 sm:space-x-2">
                  <FiStar className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Why This Matters</span>
                </div>
                <p className="text-gray-700 text-xs sm:text-sm">{selectedTask.why_it_matters}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg sm:rounded-xl">
              <div className="font-bold text-base sm:text-lg mb-3 flex items-center space-x-1.5 sm:space-x-2">
                <FiCheckCircle className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" />
                <span>Your Task</span>
              </div>
              <div className="prose max-w-none">
                <p className="text-sm sm:text-base leading-relaxed">{getTaskVariant(selectedTask)}</p>
              </div>
              
              {selectedTask.completion_type === 'text_input' && (
                <div className="mt-4 sm:mt-6">
                  <label className="block font-medium mb-2 text-sm sm:text-base flex items-center space-x-1.5 sm:space-x-2">
                    <FiMessageCircle className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Your Response</span>
                  </label>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm sm:text-base"
                    rows={4}
                    placeholder="Type your response here..."
                    disabled={completingTask || userChallenge.completed_days?.includes(selectedTask.day_number)}
                  />
                  <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2">
                    Your response will be saved to your challenge progress
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6 border-t">
            {!userChallenge.completed_days?.includes(selectedTask.day_number) ? (
              <>
                <button
                  onClick={handleCompleteTask}
                  disabled={completingTask || (selectedTask.completion_type === 'text_input' && !userInput.trim())}
                  className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {completingTask ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Completing...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Mark as Complete</span>
                    </>
                  )}
                </button>
                {selectedTask.optional && (
                  <button
                    onClick={() => alert('Skip functionality coming soon!')}
                    disabled={completingTask}
                    className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-50 transition disabled:opacity-50 text-sm sm:text-base"
                  >
                    <span>Skip for Now</span>
                  </button>
                )}
              </>
            ) : (
              <div className="w-full py-3 sm:py-4 bg-green-50 text-green-700 rounded-lg sm:rounded-xl text-center font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base">
                <FiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Task Completed</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Need Help?</h4>
            <div className="space-y-1.5 sm:space-y-2">
              <button className="w-full text-left p-2.5 sm:p-3 bg-white rounded-lg hover:bg-gray-50 transition text-xs sm:text-sm">
                View Example Responses
              </button>
              <button className="w-full text-left p-2.5 sm:p-3 bg-white rounded-lg hover:bg-gray-50 transition text-xs sm:text-sm">
                Join Community Discussion
              </button>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Track Progress</h4>
            <div className="space-y-1.5 sm:space-y-2">
              <button 
                onClick={() => router.push('/dashboard?section=results')}
                className="w-full text-left p-2.5 sm:p-3 bg-white rounded-lg hover:bg-gray-50 transition text-xs sm:text-sm flex items-center justify-between"
              >
                <span>View Brand Score</span>
                <FiBarChart2 className="text-gray-400" />
              </button>
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full text-left p-2.5 sm:p-3 bg-white rounded-lg hover:bg-gray-50 transition text-xs sm:text-sm flex items-center justify-between"
              >
                <span>Back to Dashboard</span>
                <FiHome className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#FAF0FF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl font-bold text-gray-800">Loading Challenge...</h3>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !userChallenge) {
    return renderErrorView();
  }

  // No active challenge
  if (!userChallenge && !loading) {
    return renderNoChallengeView();
  }

  // Main challenge view
  return (
    <div className="min-h-screen bg-[#FAF0FF] py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={() => router.push('/dashboard?section=challenges')}
            className="flex items-center space-x-1 sm:space-x-2 text-purple-600 hover:text-purple-700 text-sm sm:text-base"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push('/challenges/visibility/start')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-purple-300 text-purple-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-50 transition"
            >
              Restart
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Loading challenge data...</p>
          </div>
        ) : (
          renderTaskView()
        )}
        
        {showTaskList && renderTaskList()}
        {showCompletionModal && renderCompletionModal()}
      </div>
    </div>
  );
}
