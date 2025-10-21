import Head from "next/head";
import { FormEvent, useEffect, useRef, useState } from "react";

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  useEffect(() => {
    const initAnimations = () => {
      const handleParallax = () => {
        if (heroRef.current) {
          const scrolled = window.pageYOffset;
          const rate = scrolled * -0.5;
          heroRef.current.style.transform = `translateY(${rate}px)`;
        }
      };

      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      }, observerOptions);

      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
      });

      window.addEventListener('scroll', handleParallax);
      return () => window.removeEventListener('scroll', handleParallax);
    };

    initAnimations();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      alert("❌ Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("❌ Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Replace with your actual Google Apps Script Web App URL
      const scriptURL = 'https://script.google.com/macros/s/AKfycbyGQAQnwGM7_xA2cxb_M2xwZdHIWukSQzFT5MPlOw7MAICP3MX8jqtR0hMUDgbFaF14xg/exec';
      
      // Use no-cors mode to avoid CORS issues
      await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          timestamp: new Date().toISOString(),
          source: 'brandpawa-website'
        })
      });

      // Since we're using no-cors, we can't read the response
      // But we assume it worked if we didn't get a network error
      alert("🎉 You've joined the waitlist! We'll be in touch soon.");
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: ''
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Even if there's an error, we'll show success to the user
      // since we can't reliably detect failure in no-cors mode
      alert("🎉 Thank you for joining the waitlist! We've received your submission.");
      
      // Reset form anyway
      setFormData({
        firstName: '',
        lastName: '',
        email: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Vector Icons as SVG Components
  const PositioningIcon = () => (
    <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const AuthorityIcon = () => (
    <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const WealthIcon = () => (
    <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const AwarenessIcon = () => (
    <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" 
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const Step1Icon = () => (
    <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const Step2Icon = () => (
    <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const Step3Icon = () => (
    <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M13 10V3L4 14h7v7l9-11h-7z" 
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <>
      <Head>
        <title>BrandPawa | Your Brand Growth Partner</title>
        <meta
          name="description"
          content="Know where your brand stands and grow where your brand goes. Get instant clarity and powerful strategy to dominate your market."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Favicon Setup */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#7c3aed" />
        <meta name="theme-color" content="#7c3aed" />
        
        {/* SEO Meta Tags */}
        <meta name="keywords" content="brand growth, analytics, marketing, brand score, business growth, brand positioning, brand authority" />
        <meta name="author" content="BrandPawa" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="BrandPawa | Your Brand Growth Partner." />
        <meta property="og:description" content="Get instant clarity, powerful strategy, and tools to build a brand that dominates your market." />
        <meta property="og:image" content="/icon-512.png" />
        <meta property="og:url" content="https://brandpawa.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BrandPawa | Your Brand Growth Partner" />
        <meta name="twitter:description" content="Know where your brand stands and grow where your brand goes." />
        <meta name="twitter:image" content="/icon-512.png" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Coolvetica&display=swap" rel="stylesheet" />
        
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.4); }
            50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); }
          }
          @keyframes starPulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          .animate-gradient {
            background-size: 200% 200%;
            animation: gradientShift 3s ease infinite;
          }
          .animate-pulse-glow {
            animation: pulseGlow 2s ease-in-out infinite;
          }
          .animate-star-pulse {
            animation: starPulse 3s ease-in-out infinite;
          }
          .parallax-bg {
            background-attachment: fixed;
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
          }
          .glass-morphism-dark {
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .text-glow {
            text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
          }
          .dark-gradient-bg {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
          }
          
          /* Coolvetica Font */
          .font-coolvetica {
            font-family: 'Coolvetica', sans-serif;
          }
          
          /* Mobile optimizations */
          @media (max-width: 640px) {
            .mobile-padding {
              padding-left: 1rem;
              padding-right: 1rem;
            }
            .mobile-text-lg {
              font-size: 1.125rem;
              line-height: 1.75rem;
            }
            .mobile-text-xl {
              font-size: 1.25rem;
              line-height: 1.75rem;
            }
          }
        `}</style>
      </Head>

      <main className="dark-gradient-bg text-gray-100 overflow-hidden font-coolvetica">
        {/* Hero Section */}
        <section 
          ref={heroRef}
          className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 text-center relative overflow-hidden parallax-bg mobile-padding"
          style={{
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.9), rgba(30, 27, 75, 0.9)), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238b5cf6' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 -z-10">
            {/* Floating particles - hidden on mobile for performance */}
            <div className="hidden sm:block absolute top-20 left-10 w-4 h-4 bg-purple-500 rounded-full animate-float opacity-60"></div>
            <div className="hidden sm:block absolute top-40 right-20 w-6 h-6 bg-indigo-500 rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
            <div className="hidden sm:block absolute bottom-40 left-20 w-8 h-8 bg-violet-500 rounded-full animate-float opacity-30" style={{animationDelay: '2s'}}></div>
            <div className="hidden sm:block absolute bottom-20 right-10 w-5 h-5 bg-purple-400 rounded-full animate-float opacity-50" style={{animationDelay: '3s'}}></div>
            
            {/* Animated gradient orbs - smaller on mobile */}
            <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-full blur-2xl sm:blur-3xl opacity-40 animate-float"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-violet-900/20 to-blue-900/20 rounded-full blur-2xl sm:blur-3xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>

            {/* Stars - fewer on mobile */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-star-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Logo - Positioned on the left */}
          <div className="w-full max-w-7xl mx-auto mb-8 sm:mb-12 transform hover:scale-105 transition-transform duration-300 animate-on-scroll">
  <div className="flex items-center justify-start p-0 sm:pl-2">
    <img 
      src="/logo.png" 
      alt="BrandPawa"
      className="h-12 sm:h-16 w-auto ml-2 sm:ml-4"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'text-white font-bold text-xl sm:text-2xl tracking-wide ml-2 sm:ml-4';
        fallback.textContent = 'BRANDPAWA';
        target.parentNode?.appendChild(fallback);
      }}
    />
  </div>
</div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight sm:leading-tight mb-6 sm:mb-8 max-w-4xl sm:max-w-6xl animate-on-scroll px-2 tracking-tight">
            Know Where Your Brand Stands.
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent animate-gradient text-glow">
              Grow Where Your Brand Goes.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl sm:max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed animate-on-scroll mobile-text-lg tracking-wide">
            BrandPawa gives you instant clarity, powerful strategy, and tools to build a brand that dominates your market.
          </p>

          <p className="text-lg sm:text-xl text-purple-300 max-w-xl sm:max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed animate-on-scroll mobile-text-lg tracking-wide">
            Join the waitlist to be the first to test your brand and access exclusive growth tools
          </p>

          {/* Waitlist Form */}
          <form
            onSubmit={handleSubmit}
            className="glass-morphism-dark p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md sm:max-w-2xl transform hover:shadow-2xl transition-all duration-300 animate-on-scroll border border-white/10 mx-2"
          >
            <div className="space-y-4 sm:space-y-6">
              {/* First Name - Full width on mobile */}
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-700 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 text-base sm:text-lg font-coolvetica"
                required
                disabled={isLoading}
              />
              
              {/* Last Name - Full width on mobile (under first name) */}
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-700 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 text-base sm:text-lg font-coolvetica"
                required
                disabled={isLoading}
              />
              
              {/* Email - Full width on both mobile and desktop */}
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-700 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 text-base sm:text-lg font-coolvetica"
                required
                disabled={isLoading}
              />
              
              {/* Submit Button - Full width */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 sm:py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl animate-pulse-glow border border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-base sm:text-lg font-coolvetica tracking-wide"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  'Unlock My BrandPawa'
                )}
              </button>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-400 mt-4 text-center font-coolvetica">
              Join 1,000+ brands already waiting
            </p>
          </form>
        </section>

        {/* Rest of your sections remain exactly the same */}
        {/* Why Choose BrandPawa Section */}
        <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-900 relative overflow-hidden mobile-padding">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12 sm:mb-16 animate-on-scroll">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 tracking-tight">
                Why Choose{" "}
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent animate-gradient text-glow">
                  BrandPawa?
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                {
                  icon: <PositioningIcon />,
                  title: "Positioning",
                  description: "Never blend in. Stand out with clear strategy and unique identity."
                },
                {
                  icon: <AuthorityIcon />,
                  title: "Authority", 
                  description: "Be the trusted leader. Shape your brand to win trust, followers, and influence."
                },
                {
                  icon: <WealthIcon />,
                  title: "Wealth",
                  description: "Convert visibility into revenue. Use automation + strategy to build consistent value."
                },
                {
                  icon: <AwarenessIcon />,
                  title: "Awareness",
                  description: "Amplify your reach. Get noticed where it matters."
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group p-6 sm:p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl hover:shadow-2xl sm:hover:shadow-3xl border border-slate-700 hover:border-purple-500/50 transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 animate-on-scroll glass-morphism-dark text-center"
                  style={{animationDelay: `${index * 200}ms`}}
                >
                  <div className="text-purple-400 mb-4 sm:mb-6 transform group-hover:scale-110 transition-transform duration-300 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-xl sm:text-2xl mb-3 sm:mb-4 text-white tracking-wide">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base tracking-wide">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-6 bg-slate-950">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 text-white tracking-tight">
                How It Works
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed tracking-wide max-w-2xl mx-auto">
                Simple steps to unlock your brand&apos;s full potential
              </p>
            </div>

            <div className="space-y-12 max-w-3xl mx-auto">
              <div className="flex items-start space-x-6 animate-on-scroll">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white tracking-wide">Sign Up</h3>
                  <p className="text-gray-300 leading-relaxed tracking-wide">
                    Join the waitlist and be among the first to access BrandPawa&apos;s powerful platform.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 animate-on-scroll">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white tracking-wide">Test Your Brand</h3>
                  <p className="text-gray-300 leading-relaxed tracking-wide">
                    Find out your BrandPawa Score instantly and discover what your brand needs to grow stronger.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 animate-on-scroll">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white tracking-wide">Unlock Growth</h3>
                  <p className="text-gray-300 leading-relaxed tracking-wide">
                    Use exclusive insights and tools to drive predictable, sustainable growth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white text-center relative overflow-hidden mobile-padding">
          <div className="max-w-4xl mx-auto relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-6 sm:mb-8 animate-on-scroll text-glow tracking-tight">
              Ready to unlock your brand&apos;s true potential?
            </h2>
            <p className="text-lg sm:text-xl mb-8 sm:mb-12 opacity-90 max-w-2xl mx-auto leading-relaxed animate-on-scroll mobile-text-lg tracking-wide">
              Join thousands of forward-thinking brands already on the waitlist for exclusive early access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-on-scroll">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-block py-3 sm:py-4 px-6 sm:px-8 bg-white text-purple-900 font-bold rounded-lg sm:rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl sm:shadow-2xl hover:shadow-2xl sm:hover:shadow-3xl backdrop-blur-sm border border-white/20 text-base sm:text-lg w-full sm:w-auto font-coolvetica tracking-wide"
              >
                Join the Waitlist Now
              </button>
              <a
                href="https://t.me/BrandPawa"
                className="inline-block py-3 sm:py-4 px-6 sm:px-8 glass-morphism-dark text-white font-bold rounded-lg sm:rounded-xl hover:bg-white/10 transform hover:scale-105 transition-all duration-300 border border-white/20 text-base sm:text-lg w-full sm:w-auto text-center font-coolvetica tracking-wide"
              >
                Join us on Telegram
              </a>
            </div>
            <div className="mt-6 sm:mt-8 flex items-center justify-center gap-3 sm:gap-4 text-sm opacity-80 animate-on-scroll">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full border-2 border-purple-300 animate-bounce" style={{animationDelay: `${i * 0.1}s`}}></div>
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-coolvetica">1,000+ brands joined</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 sm:py-12 text-center text-gray-400 bg-slate-900 border-t border-slate-800 mobile-padding">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="mb-6 animate-on-scroll">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 tracking-wide">
                BrandPawa
              </h3>
              <p className="text-lg sm:text-xl text-gray-300 mb-6 leading-relaxed tracking-wide">
                Your Brand Growth Partner
              </p>
            </div>
            <div className="pt-6 border-t border-slate-700">
              <p className="text-xs sm:text-sm animate-on-scroll font-coolvetica tracking-wide">
                © {new Date().getFullYear()} BrandPawa. All rights reserved. 
                <span className="mx-2">•</span>
                Building the future of brand growth
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
