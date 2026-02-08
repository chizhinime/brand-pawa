// src/pages/challenges/authority/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabase';
import {
  FiArrowLeft, FiCalendar, FiCheck, FiChevronRight,
  FiChevronLeft, FiClock, FiShare2, FiTarget,
  FiTrendingUp, FiUsers, FiZap, FiAward, FiStar,
  FiMessageCircle, FiHeart, FiCheckCircle, FiLock
} from 'react-icons/fi';

interface UserChallenge {
  id: string;
  challenge_id: string;
  challenge_name?: string;
  status: string;
  current_day: number;
  completed_days: number[];
  start_date: string;
  end_date: string;
  streak_days: number;
}

export default function AuthorityChallenge() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userChallenge, setUserChallenge] = useState<UserChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [hasVisibilityChallenge, setHasVisibilityChallenge] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }
    setUser(user);
    
    // Check if user is Pro
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();
    
    setIsPro(profile?.plan === 'pro');
    
    // Check if user has completed Visibility Challenge
    const { data: visibilityChallenge } = await supabase
      .from('user_challenges')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .ilike('challenge_name', '%Visibility%')
      .single();
    
    setHasVisibilityChallenge(!!visibilityChallenge);
    
    // Check for active authority challenge
    const { data: activeChallenge } = await supabase
      .from('user_challenges')
      .select(`
        *,
        challenges:challenge_id (name)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .ilike('challenges.name', '%Authority%')
      .single();
    
    if (activeChallenge) {
      setUserChallenge({
        ...activeChallenge,
        challenge_name: activeChallenge.challenges?.name
      });
    }
    
    setLoading(false);
  };

  const renderStartView = () => {
    if (!isPro) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FiLock className="text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Authority Challenge</h1>
                  <p className="opacity-90">Transform visibility into credible, trusted authority</p>
                </div>
              </div>
            </div>

            {/* Pro Locked Message */}
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiStar className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Pro Feature</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                The Authority Challenge is available exclusively for BrandPawa Pro members. 
                Upgrade to unlock this advanced challenge and transform your visibility into authority.
              </p>
              
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 max-w-md mx-auto mb-8">
                <div className="font-bold text-lg mb-3">What You Get with Pro:</div>
                <ul className="text-left space-y-3">
                  <li className="flex items-center space-x-3">
                    <FiCheck className="text-green-500" />
                    <span>Access to Authority Challenge</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <FiCheck className="text-green-500" />
                    <span>All 10 brand diagnostics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <FiCheck className="text-green-500" />
                    <span>Advanced analytics & reports</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <FiCheck className="text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => router.push('/dashboard?section=billing')}
                  className="w-full max-w-md mx-auto py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition"
                >
                  Upgrade to Pro
                </button>
                <button
                  onClick={() => router.push('/challenges/visibility')}
                  className="w-full max-w-md mx-auto py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  Start Free Visibility Challenge Instead
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!hasVisibilityChallenge) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FiStar className="text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Authority Challenge</h1>
                  <p className="opacity-90">Transform visibility into credible, trusted authority</p>
                </div>
              </div>
            </div>

            {/* Prerequisite Message */}
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiTarget className="text-yellow-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Prerequisite Required</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                The Authority Challenge builds upon the foundations laid in the Visibility Challenge. 
                Please complete the Visibility Challenge first to establish consistent brand presence.
              </p>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 max-w-md mx-auto mb-8">
                <div className="font-bold text-lg mb-3">Why This Order Matters:</div>
                <ul className="text-left space-y-3">
                  <li className="flex items-center space-x-3">
                    <FiCheck className="text-green-500" />
                    <span>Visibility creates attention</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <FiCheck className="text-green-500" />
                    <span>Authority converts attention to trust</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <FiCheck className="text-green-500" />
                    <span>Build momentum step by step</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => router.push('/challenges/visibility')}
                  className="w-full max-w-md mx-auto py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition"
                >
                  Start Visibility Challenge
                </button>
                <button
                  onClick={() => router.push('/dashboard?section=diagnostics')}
                  className="w-full max-w-md mx-auto py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  Run Brand Diagnostics First
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Ready to start Authority Challenge
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <FiStar className="text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Authority Challenge</h1>
                <p className="opacity-90">Transform visibility into credible, trusted authority</p>
              </div>
            </div>
          </div>

          {/* Challenge Details */}
          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <FiClock className="text-purple-600" />
                  <div className="font-semibold">Time Commitment</div>
                </div>
                <div className="text-2xl font-bold">20-35 minutes</div>
                <div className="text-sm text-gray-600">per day</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <FiTrendingUp className="text-purple-600" />
                  <div className="font-semibold">Difficulty</div>
                </div>
                <div className="text-2xl font-bold">Intermediate</div>
                <div className="text-sm text-gray-600">level</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <FiZap className="text-purple-600" />
                  <div className="font-semibold">Reward Points</div>
                </div>
                <div className="text-2xl font-bold">250</div>
                <div className="text-sm text-gray-600">BrandPawa Score</div>
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">What You'll Achieve</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-purple-50 p-6 rounded-xl">
                  <div className="font-semibold mb-3">By completing this challenge, you'll:</div>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                      <span>Establish clear authority positioning</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                      <span>Build documented proof assets</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                      <span>Develop stronger messaging confidence</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                      <span>Create authority-based content system</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-pink-50 p-6 rounded-xl">
                  <div className="font-semibold mb-3">The 5 Authority Pillars:</div>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">1</span>
                      </div>
                      <span>Clarity - What you're known for</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">2</span>
                      </div>
                      <span>Proof - Evidence you're credible</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">3</span>
                      </div>
                      <span>Perspective - How you think differently</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">4</span>
                      </div>
                      <span>Consistency - Repetition of signal</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">5</span>
                      </div>
                      <span>Trust Assets - Systems that build belief</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => router.push('/challenges/authority/start')}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition"
            >
              Start Authority Challenge
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Available for Pro users only • 30-day foundation program
            </p>
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
          <p className="mt-4 text-gray-600">Loading challenge...</p>
        </div>
      </div>
    );
  }

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
        {renderStartView()}
      </div>
    </div>
  );
}