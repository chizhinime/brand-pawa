// src/pages/challenges/visibility/start.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabase';
import {
  FiArrowLeft, FiCalendar, FiCheck, FiClock,
  FiTarget, FiTrendingUp, FiUsers, FiZap,
  FiEye, FiStar, FiAward
} from 'react-icons/fi';

interface ChallengeDuration {
  id: string;
  duration_days: number;
  name: string;
  description: string;
}

export default function StartVisibilityChallenge() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [durations, setDurations] = useState<ChallengeDuration[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [selectedBrandType, setSelectedBrandType] = useState<'personal' | 'business'>('personal');
  const [startingChallenge, setStartingChallenge] = useState(false);
  const [challengeInfo, setChallengeInfo] = useState({
    name: 'Visibility Challenge',
    description: 'Build consistent brand presence and reduce fear of showing up',
    dailyTime: '10-25',
    difficulty: 'Beginner',
    points: 100
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchChallengeData();
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

  const fetchChallengeData = async () => {
    try {
      // Get Visibility Challenge ID
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('id')
        .eq('slug', 'visibility')
        .single();

      if (challengeError) throw challengeError;

      // Get available durations
      const { data: durationsData, error: durationsError } = await supabase
        .from('challenge_durations')
        .select('*')
        .eq('challenge_id', challengeData.id)
        .order('duration_days', { ascending: true });

      if (durationsError) throw durationsError;
      setDurations(durationsData || []);

      // Set default duration
      if (durationsData && durationsData.length > 0) {
        setSelectedDuration(durationsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching challenge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChallenge = async () => {
    if (!selectedDuration || startingChallenge) return;

    setStartingChallenge(true);
    try {
      const selectedDurationData = durations.find(d => d.id === selectedDuration);
      if (!selectedDurationData) throw new Error('Invalid duration selected');

      // Get challenge ID
            const { data: challengeData } = await supabase
              .from('challenge_durations')
              .select('challenge_id')
              .eq('id', selectedDuration)
              .single();
      
            if (!challengeData || !challengeData.challenge_id) {
              throw new Error('Challenge not found for selected duration');
            }
            const challengeId = challengeData.challenge_id;
      
            // Check if user already has an active visibility challenge
            const { data: existingChallenge } = await supabase
              .from('user_challenges')
              .select('id')
              .eq('user_id', user.id)
              .eq('challenge_id', challengeId)
              .eq('status', 'active')
              .single();

      if (existingChallenge) {
        alert('You already have an active Visibility Challenge. Please complete it first.');
        router.push('/challenges/visibility');
        return;
      }

      // Calculate end date
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + selectedDurationData.duration_days);

      // Create user challenge
      const { data: userChallenge, error: createError } = await supabase
        .from('user_challenges')
        .insert({
          user_id: user.id,
          challenge_id: challengeData.challenge_id,
          challenge_duration_id: selectedDuration,
          brand_type: selectedBrandType,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active',
          current_day: 1
        })
        .select()
        .single();

      if (createError) throw createError;

      // Get tasks for this duration
      const { data: tasks } = await supabase
        .from('challenge_tasks')
        .select('id, day_number')
        .eq('challenge_duration_id', selectedDuration)
        .order('day_number', { ascending: true });

      // Create initial task entries
      if (tasks && tasks.length > 0) {
        const taskEntries = tasks.map((task: { id: string; day_number: number }) => ({
          user_challenge_id: userChallenge.id,
          challenge_task_id: task.id,
          day_number: task.day_number,
          status: 'pending'
        }));

        await supabase
          .from('user_challenge_tasks')
          .insert(taskEntries);
      }

      // Add to activity feed
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: 'challenge_started',
          metadata: {
            challenge: 'Visibility Challenge',
            duration: selectedDurationData.duration_days,
            brand_type: selectedBrandType
          }
        });

      alert('Visibility Challenge started successfully!');
      router.push('/challenges/visibility');
    } catch (error) {
      console.error('Error starting challenge:', error);
      alert('Failed to start challenge. Please try again.');
    } finally {
      setStartingChallenge(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF0FF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading challenge setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF0FF]">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/challenges/visibility')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <FiArrowLeft />
          <span>Back to Challenge Overview</span>
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FiEye className="text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Start Visibility Challenge</h1>
                  <p className="opacity-90">Set up your challenge for success</p>
                </div>
              </div>
            </div>

            {/* Setup Steps */}
            <div className="p-8">
              {/* Step 1: Choose Duration */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Step 1: Choose Your Duration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {durations.map(duration => (
                    <button
                      key={duration.id}
                      onClick={() => setSelectedDuration(duration.id)}
                      className={`p-6 rounded-xl border-2 text-left transition-all ${
                        selectedDuration === duration.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-bold text-lg mb-2">{duration.name}</div>
                      <div className="text-sm text-gray-600 mb-2">{duration.duration_days} days</div>
                      <div className="text-xs text-gray-500">{duration.description}</div>
                      <div className="mt-4 text-sm font-medium text-blue-600">
                        {duration.duration_days === 7 ? 'Perfect for beginners' :
                         duration.duration_days === 14 ? 'Great for consistency' :
                         'Best for habit formation'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Choose Brand Type */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Step 2: Choose Your Brand Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedBrandType('personal')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      selectedBrandType === 'personal'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiUsers className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Personal Brand</div>
                        <div className="text-sm text-gray-600">Building your personal authority</div>
                      </div>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center space-x-2">
                        <FiCheck className="text-green-500 text-xs" />
                        <span>Uses "I" and personal stories</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <FiCheck className="text-green-500 text-xs" />
                        <span>Opinion-driven content</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <FiCheck className="text-green-500 text-xs" />
                        <span>Focus on individual expertise</span>
                      </li>
                    </ul>
                  </button>
                  <button
                    onClick={() => setSelectedBrandType('business')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      selectedBrandType === 'business'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiTarget className="text-purple-600" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">Business Brand</div>
                        <div className="text-sm text-gray-600">Growing your company brand</div>
                      </div>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center space-x-2">
                        <FiCheck className="text-green-500 text-xs" />
                        <span>Uses "We" and team focus</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <FiCheck className="text-green-500 text-xs" />
                        <span>Value and offer-based prompts</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <FiCheck className="text-green-500 text-xs" />
                        <span>Customer-centric framing</span>
                      </li>
                    </ul>
                  </button>
                </div>
              </div>

              {/* Challenge Success Definition */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                <h3 className="font-bold text-lg mb-4">What Success Looks Like</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="font-semibold mb-2">By completing this challenge, you'll:</div>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-2">
                        <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                        <span>Build consistent visibility habits</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                        <span>Develop clearer brand messaging</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                        <span>Reduce fear of showing up</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold mb-2">You'll receive:</div>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-2">
                        <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                        <span>Completion certificate</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                        <span>BrandPawa Score points</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                        <span>Personalized next steps</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartChallenge}
                disabled={startingChallenge || !selectedDuration}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50"
              >
                {startingChallenge ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Starting Challenge...</span>
                  </div>
                ) : (
                  'Start Visibility Challenge Now'
                )}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Estimated daily commitment: {challengeInfo.dailyTime} minutes • {challengeInfo.points} points reward
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}