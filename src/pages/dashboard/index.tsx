// src/pages/dashboard/index.tsx - RESPONSIVE VERSION
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import {
  FiBarChart2, FiTarget, FiTrendingUp, FiUsers,
  FiFileText, FiSettings, FiCreditCard, FiBell, FiCheck,
  FiSearch, FiGrid, FiLogOut, FiChevronRight,
  FiCalendar, FiDownload, FiShare2, FiStar,
  FiCheckCircle, FiAlertCircle, FiRefreshCw,
  FiMessageSquare, FiDroplet, FiHeart, FiGlobe,
  FiInstagram, FiEye, FiClock, FiActivity,
  FiPercent, FiHome, FiDatabase, FiFlag,
  FiLayers, FiPackage, FiUser, FiKey,
  FiMenu, FiX, FiChevronDown, FiZap, FiAward,
  FiBookOpen, FiVideo, FiMessageCircle, FiDollarSign,
  FiBookmark, FiTrendingDown, FiAlertTriangle, FiHelpCircle
} from 'react-icons/fi';

// Environment check
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Types
interface DiagnosticResult {
  id: string;
  diagnostic_id: number;
  diagnostic_name: string;
  score: number;
  result_data: any;
  completed_at: string;
  created_at: string;
}

interface Activity {
  id: string;
  activity_type: string;
  metadata: any;
  diagnostic_id?: number;
  created_at: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  time?: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
  plan: string;
  brand_score: number;
  brand_stage: string;
  last_diagnostic_at: string;
  diagnostic_count: number;
  challenge_points?: number;
  created_at?: string;
  updated_at?: string;
}

interface UserChallenge {
  id: string;
  challenge_id: string;
  challenge_name: string;
  status: string;
  current_day: number;
  completed_days: number[];
  start_date: string;
  end_date: string;
  streak_days: number;
  brand_type: 'personal' | 'business';
  challenge_category?: string;
}

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

interface DashboardStats {
  totalScore: number;
  averageScore: number;
  completedDiagnostics: number;
  activeChallenges: number;
  completedChallenges: number;
  totalPoints: number;
  bestStreak: number;
  completionRate: number;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
  pro?: boolean;
}

// Constants
const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'overview', label: 'Overview', icon: <FiBarChart2 size={18} /> },
  { id: 'diagnostics', label: 'Diagnostics', icon: <FiTarget size={18} /> },
  { id: 'challenges', label: 'Challenges', icon: <FiZap size={18} /> },
  { id: 'results', label: 'Results', icon: <FiFileText size={18} /> },
  { id: 'reports', label: 'Reports', icon: <FiDownload size={18} />, pro: true },
  { id: 'team', label: 'Team', icon: <FiUsers size={18} />, pro: true },
  { id: 'billing', label: 'Billing', icon: <FiCreditCard size={18} /> },
  { id: 'settings', label: 'Settings', icon: <FiSettings size={18} /> },
];

const DIAGNOSTICS = [
  { id: '1', name: 'BrandPawa Score', icon: <FiBarChart2 />, category: 'Foundation', description: 'Overall brand health 0-100' },
  { id: '2', name: 'Color Power', icon: <FiDroplet />, category: 'Visual Identity', description: 'Find your brand colors' },
  { id: '3', name: 'Brand Personality', icon: <FiHeart />, category: 'Positioning', description: 'Discover brand archetype' },
  { id: '4', name: 'Logo Identity', icon: <FiEye />, category: 'Visual Identity', description: 'Ideal logo type' },
  { id: '5', name: 'Brand Stage', icon: <FiTrendingUp />, category: 'Growth', description: 'Current growth stage' },
  { id: '6', name: 'Social Platform', icon: <FiInstagram />, category: 'Marketing', description: 'Best platform for you' },
  { id: '7', name: 'Positioning Clarity', icon: <FiMessageSquare />, category: 'Positioning', description: 'Message effectiveness' },
  { id: '8', name: 'Trust & Authority', icon: <FiGlobe />, category: 'Credibility', description: 'Brand credibility score' },
  { id: '9', name: 'Audience Fit', icon: <FiUsers />, category: 'Audience', description: 'Target alignment' },
  { id: '10', name: 'Monetization', icon: <FiCreditCard />, category: 'Growth', description: 'Revenue potential' },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [dbStats, setDbStats] = useState({
    profiles: 0,
    diagnostics: 0,
    activities: 0,
    challenges: 0
  });
  const [activeChallenges, setActiveChallenges] = useState<UserChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<UserChallenge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeStats, setChallengeStats] = useState({
    totalActive: 0,
    totalCompleted: 0,
    totalPoints: 0,
    bestStreak: 0,
    completionRate: 0
  });

  // Memoized calculations
  const dashboardStats = useMemo(() => {
    const averageScore = diagnosticResults.length > 0 
      ? Math.round(diagnosticResults.reduce((sum, result) => sum + result.score, 0) / diagnosticResults.length)
      : 0;
    
    const completedDiagnostics = diagnosticResults.length;
    const activeChallengesCount = activeChallenges.length;
    const completedChallengesCount = completedChallenges.length;
    
    return {
      totalScore: profile?.brand_score || 0,
      averageScore,
      completedDiagnostics,
      activeChallenges: activeChallengesCount,
      completedChallenges: completedChallengesCount,
      totalPoints: profile?.challenge_points || 0,
      bestStreak: challengeStats.bestStreak,
      completionRate: challengeStats.completionRate
    };
  }, [profile, diagnosticResults, activeChallenges, completedChallenges, challengeStats]);

  // Check environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="min-h-screen bg-[#FAF0FF] flex items-center justify-center p-4">
        <div className="max-w-md p-4 sm:p-6 bg-white rounded-xl shadow-lg text-center w-full mx-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FiAlertCircle className="text-red-600 text-xl sm:text-2xl" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold mb-2 px-2">Configuration Required</h2>
          <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
            Supabase environment variables are missing.
          </p>
          <div className="text-left bg-gray-50 p-3 rounded-lg mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Add to .env.local:</p>
            <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
              NEXT_PUBLIC_SUPABASE_URL=your_project_url<br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-sm sm:text-base w-full sm:w-auto"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check user on mount
  useEffect(() => {
    checkUser();
    
    const section = router.query.section as string;
    if (section) {
      setActiveSection(section);
    }
  }, [router.query]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channels = [
      supabase
        .channel('dashboard-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_diagnostics',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            console.log('Diagnostics updated');
            fetchDiagnosticResults(user.id);
          }
        ),
      supabase
        .channel('challenge-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_challenges',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            console.log('Challenges updated');
            fetchUserChallenges(user.id);
          }
        ),
      supabase
        .channel('activity-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_activity',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            console.log('Activity updated');
            fetchActivities(user.id);
          }
        )
    ];

    channels.forEach(channel => channel.subscribe());

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user]);

  const checkUser = async () => {
    try {
      console.log('🔍 Checking user authentication...');
      
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      
      if (error || !authUser) {
        console.error('❌ Auth error:', error);
        router.push('/');
        return;
      }
      
      console.log('✅ User authenticated:', authUser.id);
      setUser(authUser);
      
      // Fetch all data in parallel
      await Promise.all([
        fetchProfile(authUser.id),
        fetchDiagnosticResults(authUser.id),
        fetchActivities(authUser.id),
        fetchUserChallenges(authUser.id),
        fetchAvailableChallenges(authUser.id),
        fetchDatabaseStats(authUser.id)
      ]);
      
    } catch (error) {
      console.error('❌ Error checking user:', error);
      router.push('/');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const fetchAllData = useCallback(async (userId: string) => {
    console.log('🔄 Fetching all dashboard data...');
    setRefreshing(true);
    
    try {
      await Promise.all([
        fetchProfile(userId),
        fetchDiagnosticResults(userId),
        fetchActivities(userId),
        fetchUserChallenges(userId),
        fetchAvailableChallenges(userId)
      ]);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('📋 Fetching profile...');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Create profile if it doesn't exist
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData.user) {
            const newProfile = {
              id: userId,
              email: userData.user.email,
              full_name: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0],
              plan: 'free',
              brand_score: 0,
              brand_stage: 'Weak Pawa',
              diagnostic_count: 0,
              challenge_points: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            const { data: createdProfile } = await supabase
              .from('profiles')
              .upsert(newProfile)
              .select()
              .single();
            
            if (createdProfile) {
              setProfile(createdProfile);
            }
          }
        }
        return;
      }
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
    }
  };

  const fetchDiagnosticResults = async (userId: string) => {
    try {
      console.log('📊 Fetching diagnostic results...');
      
      const { data, error } = await supabase
        .from('user_diagnostics')
        .select('*')
        .eq('user_id', userId)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setDiagnosticResults(data);
      }
    } catch (error) {
      console.error('❌ Error fetching diagnostic results:', error);
    }
  };

  const fetchActivities = async (userId: string) => {
    try {
      console.log('📈 Fetching activities...');
      
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      if (data) {
        const formattedActivities = data.map(activity => ({
          ...activity,
          ...formatActivity(activity)
        }));
        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error('❌ Error fetching activities:', error);
    }
  };

  const fetchUserChallenges = async (userId: string) => {
    try {
      console.log('🎯 Fetching user challenges...');
      
      const { data: activeData, error: activeError } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenges:challenge_id (name, category)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('start_date', { ascending: false });

      const { data: completedData, error: completedError } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenges:challenge_id (name, category)
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (!activeError && activeData) {
        const formattedActive = activeData.map(uc => ({
          ...uc,
          challenge_name: uc.challenges?.name || 'Unknown Challenge',
          challenge_category: uc.challenges?.category || 'entry'
        }));
        setActiveChallenges(formattedActive);
      }

      if (!completedError && completedData) {
        const formattedCompleted = completedData.map(uc => ({
          ...uc,
          challenge_name: uc.challenges?.name || 'Unknown Challenge',
          challenge_category: uc.challenges?.category || 'entry'
        }));
        setCompletedChallenges(formattedCompleted);
      }

      // Calculate challenge stats
      const totalActive = activeData?.length || 0;
      const totalCompleted = completedData?.length || 0;
      const totalPoints = (completedData || []).reduce((sum, challenge) => {
        return sum + (challenge.challenges?.category === 'pro' ? 250 : 100);
      }, 0);
      const bestStreak = Math.max(...[...(activeData || []), ...(completedData || [])].map(c => c.streak_days || 0));
      const completionRate = totalCompleted > 0 ? Math.round((totalCompleted / (totalCompleted + totalActive)) * 100) : 0;

      setChallengeStats({
        totalActive,
        totalCompleted,
        totalPoints,
        bestStreak,
        completionRate
      });

    } catch (error) {
      console.error('❌ Error fetching user challenges:', error);
    }
  };

  const fetchAvailableChallenges = async (userId: string) => {
    try {
      console.log('🏆 Fetching available challenges...');
      
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select(`
          *,
          durations:challenge_durations(*)
        `)
        .eq('is_active', true)
        .order('category')
        .order('difficulty');

      if (challengesError) throw challengesError;

      // Fetch user participation
      const { data: participationData } = await supabase
        .from('user_challenges')
        .select('challenge_id, status, current_day, completed_days')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (challengesData) {
        const challengesWithParticipation = challengesData.map(challenge => ({
          ...challenge,
          user_participation: participationData?.find(p => p.challenge_id === challenge.id)
        }));
        setChallenges(challengesWithParticipation);
      }
    } catch (error) {
      console.error('❌ Error fetching challenges:', error);
    }
  };

  const fetchDatabaseStats = async (userId: string) => {
    try {
      console.log('🗄️ Fetching database stats...');
      
      const [
        { count: profileCount },
        { count: diagnosticCount },
        { count: activityCount },
        { count: challengeCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('id', userId),
        supabase.from('user_diagnostics').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('user_activity').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('user_challenges').select('*', { count: 'exact', head: true }).eq('user_id', userId)
      ]);

      setDbStats({
        profiles: profileCount || 0,
        diagnostics: diagnosticCount || 0,
        activities: activityCount || 0,
        challenges: challengeCount || 0
      });
    } catch (error) {
      console.error('❌ Error fetching DB stats:', error);
    }
  };

  // Utility functions
  const formatActivity = (activity: Activity) => {
    const timeAgo = getTimeAgo(new Date(activity.created_at));
    
    const activityMap: Record<string, any> = {
      'test_completed': {
        icon: <FiCheckCircle className="text-green-500" />,
        title: `${activity.metadata?.diagnostic || 'Test'} Completed`,
        description: `Score: ${activity.metadata?.score || 'N/A'}`
      },
      'test_started': {
        icon: <FiTarget className="text-blue-500" />,
        title: 'Test Started',
        description: activity.metadata?.diagnostic || 'Brand Diagnostic'
      },
      'test_retaken': {
        icon: <FiRefreshCw className="text-purple-500" />,
        title: 'Test Retaken',
        description: activity.metadata?.diagnostic || 'Brand Diagnostic'
      },
      'share': {
        icon: <FiShare2 className="text-purple-500" />,
        title: 'Shared Results',
        description: `Shared on ${activity.metadata?.platform || 'social media'}`
      },
      'challenge_started': {
        icon: <FiZap className="text-orange-500" />,
        title: 'Challenge Started',
        description: activity.metadata?.challenge || 'Brand Challenge'
      },
      'challenge_completed': {
        icon: <FiAward className="text-yellow-500" />,
        title: 'Challenge Completed',
        description: `${activity.metadata?.challenge || 'Challenge'} (${activity.metadata?.duration} days)`
      },
      'challenge_task_completed': {
        icon: <FiCheckCircle className="text-green-500" />,
        title: 'Challenge Task Completed',
        description: `Day ${activity.metadata?.day || ''} of ${activity.metadata?.challenge || 'Challenge'}`
      }
    };

    const activityInfo = activityMap[activity.activity_type] || {
      icon: <FiBell className="text-gray-500" />,
      title: 'Activity',
      description: activity.activity_type
    };

    return {
      icon: activityInfo.icon,
      title: activityInfo.title,
      description: activityInfo.description,
      time: timeAgo
    };
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreStage = (score: number) => {
    if (score >= 80) return { name: 'Dominant Pawa', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 60) return { name: 'Active Pawa', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 30) return { name: 'Emerging Pawa', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { name: 'Weak Pawa', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const getChallengeIcon = (category: string) => {
    switch (category) {
      case 'entry': return <FiBookOpen className="text-blue-500" />;
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

  // Event handlers
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleRefresh = async () => {
    if (!user) return;
    await fetchAllData(user.id);
  };

  const handleStartDiagnostic = (id: string) => {
    router.push(`/dashboard/diagnostic/${id}`);
  };

  const handleViewResult = (diagnosticId: number) => {
    router.push(`/dashboard/diagnostic/${diagnosticId}?view=results`);
  };

  const handleStartChallenge = (slug: string) => {
    router.push(`/challenges/${slug}`);
  };

  const handleContinueChallenge = (challengeId: string) => {
    const challenge = activeChallenges.find(c => c.challenge_id === challengeId);
    if (challenge?.challenge_name?.includes('Visibility')) {
      router.push('/challenges/visibility');
    } else if (challenge?.challenge_name?.includes('Authority')) {
      router.push('/challenges/authority');
    } else {
      router.push(`/challenges/${challengeId}`);
    }
  };

  // Database debug functions
  const testDatabaseConnection = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      alert('✅ Database connection successful!');
    } catch (error) {
      alert('❌ Database connection failed. Check your Supabase setup.');
    }
  };

  const debugDatabase = async () => {
    if (!user) return;
    
    console.group('🔍 Database Debug Info');
    console.log('User ID:', user.id);
    
    const tables = ['profiles', 'user_diagnostics', 'user_activity', 'user_challenges'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('user_id', user.id)
          .limit(3);
        
        console.log(`${table}:`, error ? error.message : `${data?.length || 0} records`);
        if (data && data.length > 0) console.log('Sample:', data[0]);
      } catch (err) {
        console.log(`${table} error:`, err);
      }
    }
    
    console.groupEnd();
    alert('Debug complete! Check browser console.');
  };

  // Render sections
  const renderOverview = () => {
    const scoreStage = getScoreStage(profile?.brand_score || 0);
    
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 truncate">
                Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'User'}!
              </h1>
              <p className="opacity-90 text-sm sm:text-base truncate">Track and improve your brand's power</p>
            </div>
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition flex-shrink-0"
                title="Refresh data"
              >
                <FiRefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setActiveSection('diagnostics')}
                className="flex-1 md:flex-none px-3 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition text-sm sm:text-base"
              >
                Take New Test
              </button>
            </div>
          </div>
        </div>

        {/* Brand Health Scorecard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-1 sm:gap-0">
              <h2 className="text-lg sm:text-xl font-bold">Brand Health Score</h2>
              <span className="text-xs sm:text-sm text-gray-500 truncate">
                Updated: {getTimeAgo(new Date(profile?.last_diagnostic_at || new Date()))}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-center sm:text-left w-full sm:w-auto">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold">
                  {profile?.brand_score || 0}<span className="text-xl sm:text-2xl text-gray-400">/100</span>
                </div>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-semibold ${scoreStage.color} ${scoreStage.bgColor}`}>
                    {scoreStage.name}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600">
                    {diagnosticResults.length} tests
                  </span>
                </div>
              </div>
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${(profile?.brand_score || 0) * 2.83} 283`}
                    transform="rotate(-90 50 50)"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-sm sm:text-lg font-bold ${getScoreColor(profile?.brand_score || 0)}`}>
                    {profile?.brand_score || 0 >= 80 ? 'Excellent' : profile?.brand_score || 0 >= 60 ? 'Good' : 'Needs Work'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Challenge Stats */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Challenge Progress</h2>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {[
                { label: 'Active', value: activeChallenges.length, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Completed', value: completedChallenges.length, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Points', value: profile?.challenge_points || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Best Streak', value: challengeStats.bestStreak, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              ].map((stat, index) => (
                <div key={index} className={`p-3 rounded-xl ${stat.bg}`}>
                  <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Challenges */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl font-bold">Active Challenges</h3>
            <button
              onClick={() => setActiveSection('challenges')}
              className="text-xs sm:text-sm text-purple-600 hover:text-purple-700"
            >
              View All
            </button>
          </div>
          {activeChallenges.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {activeChallenges.slice(0, 2).map(challenge => {
                const progressPercentage = challenge.completed_days?.length > 0 
                  ? (challenge.completed_days.length / (challenge.current_day || 1)) * 100 
                  : 0;
                
                return (
                  <div key={challenge.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiZap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate text-sm sm:text-base">{challenge.challenge_name}</div>
                        <div className="text-xs sm:text-sm text-gray-600 truncate">
                          Day {challenge.current_day} • {challenge.brand_type === 'personal' ? 'Personal' : 'Business'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                      <div className="text-right hidden xs:block">
                        <div className="text-xs sm:text-sm font-medium text-purple-600">
                          {Math.round(progressPercentage)}% complete
                        </div>
                        <div className="text-xs text-gray-500">Streak: {challenge.streak_days} days</div>
                      </div>
                      <button
                        onClick={() => handleContinueChallenge(challenge.challenge_id)}
                        className="px-2 py-1 sm:px-3 sm:py-1 bg-purple-50 text-purple-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-100 transition"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <FiTarget className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <p className="text-gray-600 text-sm sm:text-base mb-2 sm:mb-3">No active challenges</p>
              <button
                onClick={() => setActiveSection('challenges')}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition text-sm sm:text-base"
              >
                Start Your First Challenge
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {[
              { icon: <FiTarget size={18} />, label: 'BrandPawa Score', action: () => handleStartDiagnostic('1') },
              { icon: <FiDroplet size={18} />, label: 'Color Power', action: () => handleStartDiagnostic('2') },
              { icon: <FiEye size={18} />, label: 'Visibility', action: () => handleStartChallenge('visibility') },
              { icon: <FiRefreshCw size={18} />, label: refreshing ? 'Refreshing...' : 'Refresh', action: handleRefresh }
            ].map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                disabled={item.label === 'Refresh' && refreshing}
                className="p-3 border-2 border-purple-200 rounded-xl hover:bg-purple-50 transition text-center flex flex-col items-center"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-1 sm:mb-2">
                  <div className={item.label === 'Refresh' && refreshing ? 'animate-spin' : ''}>
                    {item.icon}
                  </div>
                </div>
                <span className="font-medium text-xs sm:text-sm truncate w-full">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Recent Activity</h3>
              <button
                onClick={() => user && fetchActivities(user.id)}
                className="text-xs sm:text-sm text-purple-600 hover:text-purple-700"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-2 sm:space-y-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto">
              {activities.length > 0 ? (
                activities.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition">
                    <div className="p-1 sm:p-2 flex-shrink-0">{activity.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-sm sm:text-base">{activity.title}</div>
                      <div className="text-xs sm:text-sm text-gray-600 truncate">{activity.description}</div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0">{activity.time}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <FiActivity className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm sm:text-base">No recent activity</p>
                  <p className="text-xs sm:text-sm">Complete a diagnostic or challenge to see activity here</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Results */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Recent Results</h3>
              <button
                onClick={() => setActiveSection('results')}
                disabled={diagnosticResults.length === 0}
                className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 disabled:text-gray-400"
              >
                View All
              </button>
            </div>
            <div className="space-y-2 sm:space-y-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto">
              {diagnosticResults.slice(0, 3).map((result) => (
                <div key={result.id} className="flex items-center justify-between p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FiBarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate text-sm sm:text-base">{result.diagnostic_name}</div>
                      <div className="text-xs sm:text-sm text-gray-600 truncate">{getTimeAgo(new Date(result.completed_at))}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                    <div className={`text-lg sm:text-xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score}<span className="text-sm sm:text-lg text-gray-400">/100</span>
                    </div>
                    <button
                      onClick={() => handleViewResult(result.diagnostic_id)}
                      className="p-1 sm:p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                    >
                      <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {diagnosticResults.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <FiBarChart2 className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm sm:text-base mb-2">No results yet</p>
                  <p className="text-xs sm:text-sm mb-2">Complete your first diagnostic to see results</p>
                  <button
                    onClick={() => handleStartDiagnostic('1')}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs sm:text-sm rounded-lg font-medium hover:shadow-lg transition"
                  >
                    Take Your First Test
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDiagnostics = () => {
    const completedDiagnosticIds = diagnosticResults.map(r => r.diagnostic_id);
    
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">All Diagnostics</h2>
              <p className="text-gray-600 text-sm sm:text-base">Complete brand analysis suite</p>
            </div>
            <div className="w-full md:w-auto">
              <div className="text-sm sm:text-base text-gray-600">
                {completedDiagnosticIds.length} of {DIAGNOSTICS.length} completed
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {DIAGNOSTICS.map((diag) => {
              const isCompleted = completedDiagnosticIds.includes(parseInt(diag.id));
              const result = diagnosticResults.find(r => r.diagnostic_id === parseInt(diag.id));
              
              return (
                <div key={diag.id} className="border border-gray-200 rounded-lg sm:rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {diag.icon}
                    </div>
                    <div className="flex flex-col items-end ml-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                        {diag.category}
                      </span>
                      {isCompleted && (
                        <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full mt-1">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 truncate">{diag.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{diag.description}</p>
                  
                  {isCompleted && result ? (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Your Score</span>
                        <span className={`font-bold text-sm sm:text-base ${getScoreColor(result.score)}`}>
                          {result.score}/100
                        </span>
                      </div>
                      <div className="flex space-x-1 sm:space-x-2">
                        <button
                          onClick={() => handleStartDiagnostic(diag.id)}
                          className="flex-1 py-1.5 sm:py-2 bg-purple-50 text-purple-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-purple-100 transition"
                        >
                          Retake
                        </button>
                        <button
                          onClick={() => handleViewResult(result.diagnostic_id)}
                          className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 text-gray-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 transition"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartDiagnostic(diag.id)}
                      className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition text-sm sm:text-base"
                    >
                      Start Test
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderChallenges = () => {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {[
            { icon: <FiTarget />, label: 'Active Challenges', value: challengeStats.totalActive, color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: <FiCheckCircle />, label: 'Completed', value: challengeStats.totalCompleted, color: 'text-green-600', bg: 'bg-green-50' },
            { icon: <FiAward />, label: 'Challenge Points', value: profile?.challenge_points || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 sm:w-12 sm:h-12 ${stat.bg} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`}>{stat.icon}</div>
                </div>
                <div className="min-w-0">
                  <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-600 truncate">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Challenges */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Active Challenges</h2>
            <div className="text-xs sm:text-sm text-gray-600">
              {activeChallenges.length} in progress
            </div>
          </div>
          
          {activeChallenges.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {activeChallenges.map(challenge => {
                const totalDays = 30; // Should come from challenge duration
                const progressPercentage = (challenge.current_day / totalDays) * 100;
                
                return (
                  <div key={challenge.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-start mb-3 sm:mb-4 gap-2 sm:gap-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                          <div className={`p-1.5 sm:p-2 rounded-lg ${
                            challenge.challenge_category === 'pro' 
                              ? 'bg-gradient-to-r from-purple-100 to-pink-100' 
                              : 'bg-gradient-to-r from-blue-100 to-blue-200'
                          }`}>
                            {getChallengeIcon(challenge.challenge_category || 'entry')}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-base sm:text-lg md:text-xl truncate">{challenge.challenge_name}</h3>
                            <div className="text-xs sm:text-sm text-gray-600">
                              {challenge.brand_type === 'personal' ? 'Personal Brand' : 'Business Brand'} • Day {challenge.current_day}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">
                          Started {new Date(challenge.start_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right w-full sm:w-auto">
                        <div className="text-xs sm:text-sm font-medium text-purple-600">
                          {challenge.completed_days?.length || 0} tasks
                        </div>
                        <div className="text-xs text-gray-500">
                          Streak: {challenge.streak_days} days
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3 sm:mb-4">
                      <div className="flex justify-between text-xs sm:text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progressPercentage)}% complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 sm:h-2 rounded-full transition-all"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => handleContinueChallenge(challenge.challenge_id)}
                        className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center justify-center space-x-2 text-sm sm:text-base"
                      >
                        <FiZap className="w-4 h-4" />
                        <span>Continue Today's Task</span>
                      </button>
                      <button
                        onClick={() => router.push(`/challenges/${challenge.challenge_id}`)}
                        className="py-2 sm:py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm sm:text-base"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FiTarget className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">No Active Challenges</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">Start your first challenge to begin building your brand intentionally.</p>
              <button
                onClick={() => router.push('/challenges/visibility')}
                className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition text-sm sm:text-base"
              >
                Start Visibility Challenge
              </button>
            </div>
          )}
        </div>

        {/* Available Challenges */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Available Challenges</h2>
            <div className="text-xs sm:text-sm text-gray-600">
              {challenges.length} available
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {challenges.slice(0, 2).map(challenge => {
              const isActive = challenge.user_participation?.status === 'active';
              const isProLocked = challenge.is_pro && profile?.plan !== 'pro';

              return (
                <div key={challenge.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-start mb-3 sm:mb-4 gap-2 sm:gap-0">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="p-1.5 sm:p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex-shrink-0">
                        {getChallengeIcon(challenge.category)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg truncate">{challenge.name}</h3>
                        <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                          <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                          {challenge.is_pro && (
                            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs bg-purple-100 text-purple-600 rounded-full">
                              PRO
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right w-full sm:w-auto">
                      <div className="text-xs sm:text-sm text-gray-600">{challenge.daily_time_commitment_minutes} min/day</div>
                      <div className="text-xs sm:text-sm font-medium text-purple-600">{challenge.reward_points} points</div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{challenge.description}</p>

                  <div className="mb-3 sm:mb-4">
                    <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Available Durations:</div>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {challenge.durations.slice(0, 2).map(duration => (
                        <div key={duration.id} className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-100 rounded-lg text-xs sm:text-sm">
                          {duration.name}
                        </div>
                      ))}
                      {challenge.durations.length > 2 && (
                        <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-gray-100 rounded-lg text-xs sm:text-sm">
                          +{challenge.durations.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>

                  {isActive ? (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs sm:text-sm text-gray-600">
                          In progress • Day {challenge.user_participation?.current_day}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-green-600">
                          {Math.round((challenge.user_participation?.completed_days || 0) / challenge.durations[0]?.duration_days * 100)}% complete
                        </div>
                      </div>
                      <button
                        onClick={() => handleContinueChallenge(challenge.id)}
                        className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center justify-center space-x-2 text-sm sm:text-base"
                      >
                        <FiZap className="w-4 h-4" />
                        <span>Continue Challenge</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartChallenge(challenge.slug)}
                      disabled={isProLocked}
                      className={`w-full py-2 sm:py-2.5 rounded-lg font-medium transition text-sm sm:text-base ${
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
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">All Results</h2>
              <p className="text-gray-600 text-sm sm:text-base">Your completed diagnostics and scores</p>
            </div>
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <span className="text-xs sm:text-sm text-gray-600">{diagnosticResults.length} results</span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 sm:p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                title="Refresh results"
              >
                <FiRefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {diagnosticResults.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {diagnosticResults.map((result) => (
                <div key={result.id} className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-3 md:gap-0">
                    <div className="mb-2 md:mb-0 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiBarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-sm sm:text-base truncate">{result.diagnostic_name}</h3>
                          <div className="text-xs sm:text-sm text-gray-600 truncate">
                            Completed: {new Date(result.completed_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end space-x-3 sm:space-x-4">
                      <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${getScoreColor(result.score)}`}>
                        {result.score}<span className="text-sm sm:text-lg md:text-xl text-gray-400">/100</span>
                      </div>
                      <button
                        onClick={() => handleViewResult(result.diagnostic_id)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 transition text-xs sm:text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  
                  {result.result_data?.stage && (
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                      <span className={`text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full ${getScoreBgColor(result.score)} ${getScoreColor(result.score)}`}>
                        {result.result_data.stage}
                      </span>
                      {result.result_data.tagline && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 line-clamp-2">{result.result_data.tagline}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <FiBarChart2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">No results yet</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">Complete your first diagnostic to see results here</p>
              <button
                onClick={() => handleStartDiagnostic('1')}
                className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition text-sm sm:text-base"
              >
                Start BrandPawa Score
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">Settings</h2>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Account Settings */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Account</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <div className="mb-2 sm:mb-0">
                    <div className="font-medium text-sm sm:text-base">Email</div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">{user?.email}</div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-medium sm:self-start">
                    Change
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <div className="mb-2 sm:mb-0">
                    <div className="font-medium text-sm sm:text-base">Name</div>
                    <div className="text-xs sm:text-sm text-gray-600">{profile?.full_name || 'Not set'}</div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-medium sm:self-start">
                    Edit
                  </button>
                </div>
              </div>
            </div>
            
            {/* Plan Settings */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Plan & Billing</h3>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base sm:text-lg">{profile?.plan?.toUpperCase() || 'FREE'} Plan</div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {profile?.plan === 'free' ? 'Limited access to diagnostics' : 'Full access to all features'}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('billing')}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition text-xs sm:text-base"
                  >
                    {profile?.plan === 'free' ? 'Upgrade to Pro' : 'Manage Subscription'}
                  </button>
                </div>
                
                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <FiCheck className="text-green-500 mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{profile?.plan === 'free' ? '3 basic diagnostics' : 'All 10 diagnostics'}</span>
                  </div>
                  <div className="flex items-center">
                    <FiCheck className="text-green-500 mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{profile?.plan === 'free' ? 'Basic dashboard' : 'Advanced analytics'}</span>
                  </div>
                  <div className="flex items-center">
                    <FiCheck className="text-green-500 mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{profile?.plan === 'free' ? 'Email results' : 'Detailed PDF reports'}</span>
                  </div>
                  <div className="flex items-center">
                    <FiCheck className="text-green-500 mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{profile?.plan === 'free' ? 'Visibility Challenge only' : 'All challenges unlocked'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Data Management */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Data & Privacy</h3>
              <div className="space-y-2 sm:space-y-3">
                <button className="w-full text-left p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="font-medium text-sm sm:text-base">Export Your Data</div>
                  <div className="text-xs sm:text-sm text-gray-600">Download all your diagnostic results</div>
                </button>
                <button className="w-full text-left p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="font-medium text-sm sm:text-base">Privacy Settings</div>
                  <div className="text-xs sm:text-sm text-gray-600">Manage your privacy preferences</div>
                </button>
              </div>
            </div>
            
            {/* Debug Section */}
            {showDebug && (
              <div className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-red-600">Developer Debug</h3>
                <div className="space-y-2 sm:space-y-3">
                  <button
                    onClick={testDatabaseConnection}
                    className="w-full text-left p-3 sm:p-4 border border-red-200 rounded-lg hover:bg-red-50 transition"
                  >
                    <div className="font-medium text-sm sm:text-base text-red-600">Test Database Connection</div>
                    <div className="text-xs sm:text-sm text-red-500">Check if Supabase is connected</div>
                  </button>
                  <button
                    onClick={debugDatabase}
                    className="w-full text-left p-3 sm:p-4 border border-red-200 rounded-lg hover:bg-red-50 transition"
                  >
                    <div className="font-medium text-sm sm:text-base text-red-600">Debug Database</div>
                    <div className="text-xs sm:text-sm text-red-500">Show all user data in console</div>
                  </button>
                  <div className="p-3 sm:p-4 bg-gray-100 rounded-lg">
                    <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Database Stats</div>
                    <div className="text-xs space-y-0.5 sm:space-y-1">
                      <div>Profiles: {dbStats.profiles}</div>
                      <div>Diagnostics: {dbStats.diagnostics}</div>
                      <div>Activities: {dbStats.activities}</div>
                      <div>Challenges: {dbStats.challenges}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Danger Zone */}
            <div className="border-t pt-4 sm:pt-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-red-600">Danger Zone</h3>
              <button
                onClick={handleLogout}
                className="w-full p-3 sm:p-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // In the dashboard index.tsx, update the renderSection function:
  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'diagnostics':
        return renderDiagnostics();
      case 'challenges':
        return renderChallenges();
      case 'results':
        return renderResults();
      case 'settings':
        return renderSettings();
      case 'billing':
        // Redirect to the dedicated billing page
        router.push('/dashboard/billing');
        return (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Redirecting to billing...</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  // Loading state
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#FAF0FF] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF0FF]">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b border-purple-100">
        <div className="px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-1.5 text-gray-600"
              >
                {showMobileMenu ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded" />
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  BrandPawa
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:block relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 pr-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent w-40 sm:w-48 md:w-64 text-sm"
                />
              </div>
              
              <button className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg">
                <FiBell className="text-gray-600 w-4 h-4 sm:w-5 sm:h-5" />
                {activities.length > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-medium truncate max-w-[120px]">{user?.email}</div>
                    <div className="text-xs text-gray-600">{profile?.plan?.toUpperCase() || 'FREE'} plan</div>
                  </div>
                  <FiChevronDown className="hidden md:block text-gray-500 w-4 h-4" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-3 border-b">
                      <div className="font-medium text-sm truncate">{user?.email}</div>
                      <div className="text-xs text-gray-600">
                        Score: {profile?.brand_score || 0}/100 • {profile?.challenge_points || 0} pts
                      </div>
                    </div>
                    <button
                      onClick={() => { setActiveSection('settings'); setShowUserMenu(false); }}
                      className="w-full p-2.5 text-left hover:bg-gray-50 flex items-center space-x-2 text-sm"
                    >
                      <FiSettings className="text-gray-500 w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => { setShowDebug(!showDebug); setShowUserMenu(false); }}
                      className="w-full p-2.5 text-left hover:bg-gray-50 flex items-center space-x-2 text-sm text-gray-500"
                    >
                      <FiDatabase className="text-gray-500 w-4 h-4" />
                      <span>Debug: {showDebug ? 'ON' : 'OFF'}</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full p-2.5 text-left hover:bg-gray-50 flex items-center space-x-2 text-sm"
                    >
                      <FiLogOut className="text-gray-500 w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="sm:hidden mt-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-4 gap-1">
                {NAVIGATION_ITEMS.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); setShowMobileMenu(false); }}
                    className={`flex flex-col items-center p-2 rounded-lg ${
                      activeSection === item.id ? 'bg-purple-50 text-purple-600' : 'text-gray-600'
                    }`}
                  >
                    {item.icon}
                    <span className="text-xs mt-1">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1 mt-1">
                {NAVIGATION_ITEMS.slice(4, 8).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); setShowMobileMenu(false); }}
                    className={`flex flex-col items-center p-2 rounded-lg ${
                      activeSection === item.id ? 'bg-purple-50 text-purple-600' : 'text-gray-600'
                    }`}
                  >
                    {item.icon}
                    <span className="text-xs mt-1">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
            <div className="sticky top-20 space-y-1.5">
              {NAVIGATION_ITEMS.map((item) => {
                let count;
                if (item.id === 'overview') count = diagnosticResults.length;
                if (item.id === 'challenges') count = activeChallenges.length;
                
                const isProLocked = item.pro && profile?.plan !== 'pro';
                
                return (
                  <button
                    key={item.id}
                    onClick={() => !isProLocked && setActiveSection(item.id)}
                    className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl transition text-sm sm:text-base ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : isProLocked
                        ? 'opacity-50 cursor-not-allowed text-gray-400'
                        : 'hover:bg-purple-50 text-gray-700'
                    }`}
                    disabled={isProLocked}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {item.icon}
                      <span className="font-medium truncate">{item.label}</span>
                    </div>
                    {count !== undefined && count > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        activeSection === item.id ? 'bg-white/20' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {count}
                      </span>
                    )}
                    {item.pro && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        activeSection === item.id ? 'bg-white/20' : 'bg-purple-100 text-purple-600'
                      }`}>
                        PRO
                      </span>
                    )}
                  </button>
                );
              })}
              
              {/* Upgrade Banner */}
              {profile?.plan !== 'pro' && (
                <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                  <h4 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Upgrade to Pro</h4>
                  <p className="text-xs mb-2 sm:mb-3">Unlock all challenges and advanced features</p>
                  <button
                    onClick={() => setActiveSection('billing')}
                    className="w-full py-1.5 sm:py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition text-xs sm:text-sm"
                  >
                    Upgrade Now
                  </button>
                </div>
              )}
              
              {/* Quick Stats */}
              <div className="mt-3 p-2.5 sm:p-3 bg-gray-100 rounded-lg">
                <div className="text-xs font-medium mb-1.5 sm:mb-2">Quick Stats</div>
                <div className="text-xs space-y-0.5 sm:space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Brand Score:</span>
                    <span className="font-medium">{dashboardStats.totalScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Challenges:</span>
                    <span className="font-medium">{dashboardStats.completedChallenges} done</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Points:</span>
                    <span className="font-medium text-purple-600">{dashboardStats.totalPoints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tests:</span>
                    <span className="font-medium">{dashboardStats.completedDiagnostics}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">Loading dashboard data...</p>
              </div>
            ) : (
              renderSection()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
