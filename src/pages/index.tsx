// src/pages/index.tsx
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';
import Image from 'next/image';
import {
  FiMenu, FiX, FiCheck, FiArrowRight, FiStar, FiUsers,
  FiBarChart2, FiShield, FiDownload, FiMail, FiLock,
  FiCreditCard, FiTrendingUp, FiTarget, FiEye, FiPlay,
  FiMessageSquare, FiBriefcase, FiGlobe, FiBookOpen,
  FiSmartphone, FiShare2, FiHeart, FiZap, FiAward,
  FiCalendar, FiClock, FiUsers as FiUsers2, FiLayers
} from 'react-icons/fi';
import { FcGoogle, FcOk, FcAutomotive, FcCollaboration } from 'react-icons/fc';
import { BsLinkedin, BsTwitter, BsInstagram, BsFacebook } from 'react-icons/bs';
import { MdColorLens, MdDashboard, MdAutoAwesome } from 'react-icons/md';

export default function HomePage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistType, setWaitlistType] = useState<'talent' | 'automation'>('automation');
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const featuredTools = [
    {
      icon: <MdColorLens className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Brand Color Test',
      description: 'Find the perfect color for your brand personality',
      type: 'Quiz',
      color: 'from-blue-400 to-cyan-400'
    },
    {
      icon: <FiHeart className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Brand Archetype Quiz',
      description: 'Uncover your brand\'s core identity',
      type: 'Quiz',
      color: 'from-pink-400 to-rose-400'
    },
    {
      icon: <FiBarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Brand Pulse Test',
      description: 'Measure your brand\'s strength in the market',
      type: 'Test',
      color: 'from-purple-400 to-violet-400'
    },
    {
      icon: <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Brand Growth Test',
      description: 'Diagnose what\'s limiting your business growth',
      type: 'Test',
      color: 'from-green-400 to-emerald-400'
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Take a Quiz or Test',
      description: 'Identify your brand\'s DNA with interactive assessments',
      icon: <FiBookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    {
      step: '02',
      title: 'Get Insights',
      description: 'Receive personalized brand strategy output',
      icon: <FiEye className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    {
      step: '03',
      title: 'Take Action',
      description: 'Connect with experts or automate your brand communication',
      icon: <FiZap className="w-6 h-6 sm:w-8 sm:h-8" />
    },
    {
      step: '04',
      title: 'Grow',
      description: 'Watch your influence and visibility increase',
      icon: <FiTrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
    }
  ];

  const pawaFramework = [
    {
      letter: 'P',
      title: 'Positioning',
      description: 'Never blend in. Stand out with clear strategy and unique identity.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      letter: 'A',
      title: 'Authority',
      description: 'Be the trusted leader. Shape your brand to win trust, followers, and influence.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      letter: 'W',
      title: 'Wealth',
      description: 'Convert visibility into revenue and results.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      letter: 'A',
      title: 'Awareness',
      description: 'Expand your reach through automated communication.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    if (!loginEmail || !loginPassword) {
      setAuthError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return;
    }

    // Success - redirect to dashboard
    setLoading(false);
    setIsLoginModalOpen(false);
    router.push('/dashboard');
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    // Validation
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      setAuthError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setAuthError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (signupPassword.length < 6) {
      setAuthError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      options: {
        data: {
          full_name: signupName,
          plan: 'free',
        },
        emailRedirectTo: `https://test-phase-teal.vercel.app//dashboard`,
      },
    });

    if (error) {
      setAuthError(error.message);
      setLoading(false);
      return;
    }

    // Create user profile in profiles table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: signupName,
          email: signupEmail,
          plan: 'free',
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }

    setLoading(false);
    setIsSignupModalOpen(false);
    
    // Show success message
    alert('Account created successfully! Please check your email to verify your account.');
    
    // Clear form
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setAuthError(error.message);
      setLoading(false);
    }
  };

  const handleWaitlistSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;

    // Here you would typically send this to your backend
    console.log(`${waitlistType} waitlist signup:`, waitlistEmail);
    
    alert(`Thank you! You've been added to the ${waitlistType} waitlist. We'll notify you when it launches.`);
    setIsWaitlistModalOpen(false);
    setWaitlistEmail('');
  };

  const Modal = ({ isOpen, onClose, children }: any) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 text-gray-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-purple-100">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src="/images/BrandPawa logo2.png"
                alt="BrandPawa Logo"
                width={100}
                height={40}
                className="w-auto h-8 sm:h-10 object-contain"
                priority
              />
            </div>
        
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a href="#tools" className="hover:text-purple-600 transition text-sm lg:text-base">Tools</a>
              <a href="#how-it-works" className="hover:text-purple-600 transition text-sm lg:text-base">How It Works</a>
              <a href="#talent" className="hover:text-purple-600 transition text-sm lg:text-base">Talent</a>
              <a href="#learning" className="hover:text-purple-600 transition text-sm lg:text-base">Learning</a>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3 py-1.5 lg:px-4 lg:py-2 text-purple-600 hover:text-purple-700 text-sm lg:text-base"
              >
                Login
              </button>
              <button
                onClick={() => setIsSignupModalOpen(true)}
                className="px-4 py-2 lg:px-6 lg:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition text-sm lg:text-base"
              >
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 p-2 -mr-2"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 space-y-4 pb-4 pt-4 border-t border-gray-100">
              <a 
                href="#tools" 
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 hover:text-purple-600 text-base font-medium"
              >
                Tools
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 hover:text-purple-600 text-base font-medium"
              >
                How It Works
              </a>
              <a 
                href="#talent" 
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 hover:text-purple-600 text-base font-medium"
              >
                Talent
              </a>
              <a 
                href="#learning" 
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 hover:text-purple-600 text-base font-medium"
              >
                Learning
              </a>
              <div className="pt-4 space-y-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full py-3 text-purple-600 border border-purple-200 rounded-xl text-base font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSignupModalOpen(true);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-base font-medium"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16 lg:py-24">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight px-2">
            Discover Your Brand&apos;s{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              True Power
            </span>
            <br className="hidden sm:block" />
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl block mt-2 md:mt-4">
              Build the Brand That Commands Attention
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 md:mb-10 max-w-3xl mx-auto px-4">
            BrandPawa gives you clarity, strategy, and tools to elevate your brand and multiply your growth
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 md:mb-16 px-4">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-base sm:text-lg font-semibold hover:shadow-xl transition flex items-center justify-center space-x-2 group"
            >
              <span>Test Your Brand</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-purple-200 text-purple-600 rounded-xl text-base sm:text-lg font-semibold hover:bg-purple-50 transition flex items-center justify-center space-x-2"
            >
              <span>Take a Quiz</span>
              <FiPlay />
            </button>
          </div>
          
          {/* Hero Visuals */}
          <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 md:p-8 mx-2 sm:mx-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 transform rotate-3 sm:rotate-6 scale-90 sm:scale-100">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div 
                    key={i} 
                    className={`w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 lg:w-32 lg:h-40 rounded-xl shadow-lg bg-white p-2 sm:p-3 md:p-4 transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-transform duration-300`}
                  >
                    <div className={`w-full h-1/2 rounded-lg mb-1 sm:mb-2 bg-gradient-to-r ${i % 3 === 0 ? 'from-blue-400 to-cyan-400' : i % 3 === 1 ? 'from-purple-400 to-pink-400' : 'from-green-400 to-emerald-400'}`} />
                    <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full mb-1" />
                    <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About BrandPawa */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
            Your <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Brand Growth Partner</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 md:mb-10 max-w-2xl mx-auto">
            We built BrandPawa to give everyone with vision the tools they need to change the world easily and faster.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 md:mb-12">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <FiBookOpen className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Discover Your Identity</h3>
              <p className="text-sm sm:text-base text-gray-600">Interactive quizzes reveal your brand&apos;s true DNA and personality</p>
            </div>
            
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <FiBarChart2 className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Diagnose Growth Gaps</h3>
              <p className="text-sm sm:text-base text-gray-600">Precision tests identify what&apos;s holding your brand back</p>
            </div>
            
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <MdAutoAwesome className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Automate Communication</h3>
              <p className="text-sm sm:text-base text-gray-600">Manage email, social media, and WhatsApp from one dashboard</p>
            </div>
            
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <FcCollaboration className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Connect with Experts</h3>
              <p className="text-sm sm:text-base text-gray-600">Access our Talent Network of vetted designers and marketers</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition text-sm sm:text-base"
          >
            Explore Tools
          </button>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gradient-to-b from-white to-purple-50 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">
            How It Works
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-5xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="relative">
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-6 sm:top-8 left-full w-full h-0.5 bg-gradient-to-r from-purple-200 to-pink-200 -translate-x-1/2" />
                )}
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">{step.step}</div>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAWA Framework */}
      <section className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">
            Our Tools <span className="text-purple-600">(PAWA Framework)</span>
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {pawaFramework.map((item) => (
              <div key={item.letter} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl" style={{
                  backgroundImage: `linear-gradient(to right, ${item.color.split(' ')[2]}, ${item.color.split(' ')[4]})`
                }} />
                <div className="relative bg-white p-6 sm:p-8 rounded-2xl shadow-lg h-full border border-gray-100">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mb-4 sm:mb-6 text-white text-2xl sm:text-3xl font-bold`}>
                    {item.letter}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{item.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discover Your Brand Power CTA */}
      <section className="bg-gradient-to-r from-purple-500 to-pink-500 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">
            Discover Your Brand Power
          </h2>
          <p className="text-lg sm:text-xl text-purple-100 mb-6 md:mb-8 max-w-2xl mx-auto">
            Unlock your brand&apos;s full potential with our comprehensive suite of tools
          </p>
          <button
            onClick={() => setIsSignupModalOpen(true)}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-purple-600 rounded-xl text-base sm:text-lg font-semibold hover:shadow-xl transition"
          >
            Start Your Journey
          </button>
        </div>
      </section>

      {/* Featured Tools */}
      <section id="tools" className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">
          Featured Tools
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {featuredTools.map((tool) => (
            <div key={tool.title} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition">
              <div className={`h-1.5 sm:h-2 bg-gradient-to-r ${tool.color}`} />
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${tool.color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                    <div className={`bg-gradient-to-r ${tool.color} bg-clip-text text-transparent`}>
                      {tool.icon}
                    </div>
                  </div>
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                    tool.type === 'Quiz' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'bg-purple-50 text-purple-600'
                  }`}>
                    {tool.type}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{tool.title}</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4">{tool.description}</p>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="w-full py-1.5 sm:py-2 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition text-sm sm:text-base"
                >
                  Try Now
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8 sm:mt-12">
          <button
            onClick={() => setIsSignupModalOpen(true)}
            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition text-sm sm:text-base"
          >
            Start for Free
          </button>
        </div>
      </section>

      {/* Automation Preview */}
      <section className="bg-gradient-to-b from-white to-blue-50 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12">
                <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-blue-50 text-blue-600 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                  <FiZap className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Coming Soon
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                  Automate Your Brand Communication — Effortlessly
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  From email to WhatsApp and social media — manage your entire brand presence from one dashboard.
                </p>
                <button
                  onClick={() => {
                    setWaitlistType('automation');
                    setIsWaitlistModalOpen(true);
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition text-sm sm:text-base"
                >
                  Join the Waitlist
                </button>
              </div>
              <div className="md:w-1/2 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 sm:p-8 flex items-center justify-center">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
                  <div className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-blue-200 rounded-full opacity-20" />
                  <div className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-cyan-200 rounded-full opacity-20" />
                  <div className="relative bg-white p-4 sm:p-6 rounded-xl shadow-lg">
                    <div className="flex space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <div className="w-1/3 h-20 sm:h-24 md:h-32 bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg" />
                      <div className="w-2/3 space-y-2 sm:space-y-3">
                        <div className="h-2 sm:h-3 bg-gray-200 rounded" />
                        <div className="h-2 sm:h-3 bg-gray-200 rounded w-3/4" />
                        <div className="h-16 sm:h-20 md:h-24 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-2 sm:p-3">
                          <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" />
                            <div className="h-2 sm:h-3 bg-gray-300 rounded w-1/3" />
                          </div>
                          <div className="h-2 sm:h-3 bg-gray-300 rounded w-2/3" />
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1 sm:space-x-2">
                      {['Email', 'WhatsApp', 'Social'].map((platform) => (
                        <div key={platform} className="flex-1 text-center py-1.5 sm:py-2 bg-gray-50 rounded-lg text-xs sm:text-sm font-medium">
                          {platform}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Talent Network */}
      <section id="talent" className="container mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-orange-50 text-orange-600 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <FiUsers2 className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Coming Soon
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Hire Top Designers & Marketers
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Get access to vetted brand creatives who can help you design, grow, and manage your brand
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 md:mb-12">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 sm:p-8 rounded-2xl">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">For Businesses</h3>
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
                Find the perfect talent to bring your brand vision to life. Our vetted professionals are ready to help you succeed.
              </p>
              <button
                onClick={() => {
                  setWaitlistType('talent');
                  setIsWaitlistModalOpen(true);
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition text-sm sm:text-base"
              >
                Hire Talent
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 sm:p-8 rounded-2xl">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4">For Creatives</h3>
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
                Join our network of elite designers and marketers. Get access to exciting projects and grow your career.
              </p>
              <button
                onClick={() => {
                  setWaitlistType('talent');
                  setIsWaitlistModalOpen(true);
                }}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition text-sm sm:text-base"
              >
                Join as Talent
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Community & Learning */}
      <section id="learning" className="bg-gradient-to-b from-white to-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                  <FiBookOpen className="text-green-600 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                  Join the BrandPawa Learning Hub
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Access resources, toolkits, and guides at learn.brandpawa.com — for brands, designers, and marketers.
                </p>
                <button
                  onClick={() => window.open('https://learn.brandpawa.com', '_blank')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition text-sm sm:text-base"
                >
                  Start Learning
                </button>
              </div>
              <div className="md:w-1/2 bg-gradient-to-br from-green-50 to-emerald-50 p-6 sm:p-8 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {['Brand Guides', 'Templates', 'Webinars', 'Case Studies'].map((item) => (
                    <div key={item} className="bg-white p-3 sm:p-4 rounded-xl shadow-sm">
                      <div className="h-6 w-6 sm:h-8 sm:w-8 bg-green-100 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                        <FiBookOpen className="text-green-600 w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <div className="text-xs sm:text-sm font-medium">{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid md:grid-cols-6 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/images/BrandPawa logo2.png"
                  alt="BrandPawa Logo"
                  width={120}
                  height={48}
                  className="w-auto h-8 sm:h-10 object-contain"
                />
              </div>
              <p className="text-sm text-gray-400 mb-4 sm:mb-6">
                Empowering brands with data-driven insights and tools for exponential growth.
              </p>
              <div className="flex space-x-2 sm:space-x-4">
                {[BsFacebook, BsInstagram, BsTwitter, BsLinkedin].map((Icon, i) => (
                  <a 
                    key={i} 
                    href="#" 
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition"
                    aria-label={['Facebook', 'Instagram', 'Twitter', 'LinkedIn'][i]}
                  >
                    <Icon size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                  </a>
                ))}
              </div>
            </div>
            
            {[
              {
                title: 'Tools',
                links: ['Quizzes', 'Tests', 'Automation', 'Dashboard']
              },
              {
                title: 'Talent',
                links: ['Hire Talent', 'Join as Talent', 'Talent Directory', 'For Agencies']
              },
              {
                title: 'Resources',
                links: ['Blog', 'Learn Hub', 'Toolkits', 'Case Studies']
              },
              {
                title: 'Company',
                links: ['About', 'Careers', 'Partners', 'Contact']
              }
            ].map((section, idx) => (
              <div key={idx}>
                <h4 className="font-bold mb-3 sm:mb-4 text-base sm:text-lg">{section.title}</h4>
                <ul className="space-y-2 sm:space-y-3">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-sm sm:text-base text-gray-400 hover:text-white transition">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          {/* Newsletter */}
          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <div className="max-w-md">
              <h4 className="font-bold mb-3 sm:mb-4 text-base sm:text-lg">Subscribe for brand growth insights weekly</h4>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-800 text-white rounded-xl sm:rounded-l-xl sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                />
                <button
                  onClick={() => {
                    if (newsletterEmail) {
                      alert('Thank you for subscribing!');
                      setNewsletterEmail('');
                    }
                  }}
                  className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl sm:rounded-r-xl font-semibold hover:opacity-90 transition text-sm sm:text-base"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-xs sm:text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} BrandPawa. All Rights Reserved.
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-gray-400">
                <a href="#" className="hover:text-white transition">Privacy Policy</a>
                <a href="#" className="hover:text-white transition">Terms of Service</a>
                <a href="#" className="hover:text-white transition">GDPR</a>
                <a href="#" className="hover:text-white transition">Compliance</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Waitlist Modal */}
      <Modal isOpen={isWaitlistModalOpen} onClose={() => setIsWaitlistModalOpen(false)}>
        <div className="p-6 sm:p-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
            <FiZap className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-2">
            Join the {waitlistType === 'automation' ? 'Automation' : 'Talent Network'} Waitlist
          </h3>
          <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8">
            {waitlistType === 'automation'
              ? 'Be the first to know when our automation tools launch!'
              : 'Get notified when our talent network goes live!'}
          </p>
          
          <form onSubmit={handleWaitlistSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="you@company.com"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition text-sm sm:text-base"
            >
              Join Waitlist
            </button>
          </form>
        </div>
      </Modal>

      {/* Login Modal */}
      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}>
        <div className="p-6 sm:p-8">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
            <FiLock className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-2">Welcome Back</h3>
          <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8">Sign in to your BrandPawa account</p>
          
          {authError && (
            <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs sm:text-sm">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded text-purple-600 w-4 h-4" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  if (!loginEmail) {
                    setAuthError('Please enter your email first');
                    return;
                  }
                  alert('Password reset email sent! Check your inbox.');
                }}
                className="text-purple-600 hover:text-purple-700 text-sm"
              >
                Forgot password?
              </button>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 sm:py-3 border border-gray-300 rounded-xl font-medium flex items-center justify-center space-x-2 hover:bg-gray-50 transition disabled:opacity-50 text-sm sm:text-base"
            >
              <FcGoogle size={18} className="sm:w-5 sm:h-5" />
              <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>
            
            <div className="text-center mt-3 sm:mt-4">
              <span className="text-gray-600 text-sm">Don&apos;t have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setIsSignupModalOpen(true);
                }}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Signup Modal */}
      <Modal isOpen={isSignupModalOpen} onClose={() => setIsSignupModalOpen(false)}>
        <div className="p-6 sm:p-8">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-4 sm:mb-6 mx-auto">
            <FiMail className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-2">Create Account</h3>
          <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8">Start your brand&apos;s journey today</p>
          
          {authError && (
            <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs sm:text-sm">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleSignup} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                placeholder="John Smith"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                placeholder="you@company.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Password
              </label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                placeholder="••••••••"
                required
              />
            </div>
            
            <label className="flex items-start space-x-2 text-xs sm:text-sm">
              <input 
                type="checkbox" 
                className="mt-0.5 sm:mt-1 rounded text-purple-600 w-4 h-4" 
                required 
              />
              <span className="text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-purple-600 hover:text-purple-700">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-purple-600 hover:text-purple-700">
                  Privacy Policy
                </a>
              </span>
            </label>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="py-2 sm:py-3 border border-gray-300 rounded-xl font-medium flex items-center justify-center space-x-1 sm:space-x-2 hover:bg-gray-50 transition disabled:opacity-50 text-xs sm:text-sm"
              >
                <FcGoogle size={16} className="sm:w-4 sm:h-4" />
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthError('LinkedIn login coming soon!')}
                disabled={loading}
                className="py-2 sm:py-3 border border-gray-300 rounded-xl font-medium flex items-center justify-center space-x-1 sm:space-x-2 hover:bg-gray-50 transition disabled:opacity-50 text-xs sm:text-sm"
              >
                <BsLinkedin className="text-blue-600 w-4 h-4 sm:w-4 sm:h-4" />
                <span>LinkedIn</span>
              </button>
            </div>
            
            <div className="text-center mt-3 sm:mt-4">
              <span className="text-gray-600 text-sm">Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignupModalOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
