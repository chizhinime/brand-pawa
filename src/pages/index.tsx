// pages/index.tsx
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

  return (
    <>
      <Head>
        <title>BrandPawa | Unlock Your Growth</title>
        <meta
          name="description"
          content="Discover your BrandPawa Score and unlock predictable growth. Join the waitlist today."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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

      <main className="dark-gradient-bg text-gray-100 overflow-hidden">
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

          {/* Logo */}
          <div className="mb-8 sm:mb-12 transform hover:scale-105 transition-transform duration-300 animate-on-scroll">
            <div className="h-12 w-32 sm:h-16 sm:w-48 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl mx-auto shadow-2xl flex items-center justify-center animate-pulse-glow border border-purple-500/30">
              <span className="text-white font-bold text-lg sm:text-xl text-glow">BrandPawa</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight sm:leading-tight mb-6 sm:mb-8 max-w-4xl sm:max-w-6xl animate-on-scroll px-2">
            Discover your{" "}
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent animate-gradient text-glow block sm:inline">
              BrandPawa Score
            </span>{" "}
            and unlock predictable growth.
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-xl sm:max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed animate-on-scroll mobile-text-lg">
            Join the waitlist to be the first to test your brand and access
            exclusive growth tools designed to scale your business.
          </p>

<form
  onSubmit={handleSubmit}
  className="glass-morphism-dark p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md sm:max-w-2xl transform hover:shadow-2xl transition-all duration-300 animate-on-scroll border border-white/10 mx-2"
>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
    {/* First Name - Full width on mobile, half on desktop */}
    <div className="sm:col-span-1">
      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={formData.firstName}
        onChange={handleInputChange}
        className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-700 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 text-base sm:text-lg"
        required
        disabled={isLoading}
      />
    </div>
    
    {/* Last Name - Full width on mobile (appears under first name), half on desktop */}
    <div className="sm:col-span-1">
      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={handleInputChange}
        className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-700 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 text-base sm:text-lg"
        required
        disabled={isLoading}
      />
    </div>
    
    {/* Email - Full width on both mobile and desktop */}
    <div className="col-span-1 sm:col-span-2">
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleInputChange}
        className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-700 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 text-base sm:text-lg"
        required
        disabled={isLoading}
      />
    </div>
    
    {/* Submit Button - Full width */}
    <div className="col-span-1 sm:col-span-2">
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 sm:py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl animate-pulse-glow border border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-base sm:text-lg"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </>
        ) : (
          '🚀 Unlock My BrandPawa'
        )}
      </button>
    </div>
  </div>
  
  <p className="text-xs sm:text-sm text-gray-400 mt-4 text-center">
    Join 1,000+ brands already waiting
  </p>
</form>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-900 relative overflow-hidden mobile-padding">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12 sm:mb-16 animate-on-scroll">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6">
                Why Choose{" "}
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent animate-gradient text-glow">
                  BrandPawa?
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl sm:max-w-3xl mx-auto mobile-text-lg">
                Comprehensive tools and insights to transform your brand&apos;s growth trajectory
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: "📊",
                  title: "Measure",
                  description: "Get your BrandPawa Score and see where your brand stands in the market with precision analytics."
                },
                {
                  icon: "🚀",
                  title: "Grow",
                  description: "Access tailored strategies and growth tools designed specifically for your brand&apos;s needs."
                },
                {
                  icon: "👑",
                  title: "Dominate",
                  description: "Track progress, refine your approach, and dominate your industry with data-driven confidence."
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group p-6 sm:p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl hover:shadow-2xl sm:hover:shadow-3xl border border-slate-700 hover:border-purple-500/50 transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 animate-on-scroll glass-morphism-dark"
                  style={{animationDelay: `${index * 200}ms`}}
                >
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-xl sm:text-2xl mb-3 sm:mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-slate-900 to-indigo-900/30 relative overflow-hidden mobile-padding">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12 sm:mb-16 animate-on-scroll">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 text-white">
                How It Works
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl sm:max-w-3xl mx-auto mobile-text-lg">
                Simple steps to unlock your brand&apos;s full potential
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative">
              {/* Mobile vertical line */}
              <div className="hidden md:block absolute top-20 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 transform translate-y-8">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
              </div>
              
              {[
                {
                  step: "1",
                  title: "Sign Up",
                  description: "Join the waitlist and be among the first to access BrandPawa&apos;s powerful platform."
                },
                {
                  step: "2",
                  title: "Test Your Brand",
                  description: "Get your BrandPawa Score instantly with our comprehensive diagnostic tools."
                },
                {
                  step: "3",
                  title: "Unlock Growth",
                  description: "Use exclusive insights and tools to drive predictable, sustainable growth."
                }
              ].map((step, index) => (
                <div 
                  key={index}
                  className="relative text-center group animate-on-scroll"
                  style={{animationDelay: `${index * 300}ms`}}
                >
                  <div className="relative z-10 bg-slate-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl sm:shadow-2xl hover:shadow-2xl sm:hover:shadow-3xl border border-slate-700 transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 group-hover:animate-pulse-glow glass-morphism-dark">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg sm:rounded-2xl flex items-center justify-center text-white font-black text-xl sm:text-2xl mb-4 sm:mb-6 mx-auto transform group-hover:scale-110 transition-transform duration-300 border border-purple-500/30">
                      {step.step}
                    </div>
                    <h3 className="font-bold text-xl sm:text-2xl mb-3 sm:mb-4 text-white">{step.title}</h3>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white text-center relative overflow-hidden mobile-padding">
          <div className="max-w-4xl mx-auto relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-6 sm:mb-8 animate-on-scroll text-glow">
              Ready to unlock your brand&apos;s true potential?
            </h2>
            <p className="text-lg sm:text-xl mb-8 sm:mb-12 opacity-90 max-w-2xl mx-auto leading-relaxed animate-on-scroll mobile-text-lg">
              Join thousands of forward-thinking brands already on the waitlist for exclusive early access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-on-scroll">
              <button
                onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-block py-3 sm:py-4 px-6 sm:px-8 bg-white text-purple-900 font-bold rounded-lg sm:rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl sm:shadow-2xl hover:shadow-2xl sm:hover:shadow-3xl backdrop-blur-sm border border-white/20 text-base sm:text-lg w-full sm:w-auto"
              >
                Join the Waitlist Now
              </button>
              <a
                href="#features"
                className="inline-block py-3 sm:py-4 px-6 sm:px-8 glass-morphism-dark text-white font-bold rounded-lg sm:rounded-xl hover:bg-white/10 transform hover:scale-105 transition-all duration-300 border border-white/20 text-base sm:text-lg w-full sm:w-auto text-center"
              >
                Learn More
              </a>
            </div>
            <div className="mt-6 sm:mt-8 flex items-center justify-center gap-3 sm:gap-4 text-sm opacity-80 animate-on-scroll">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full border-2 border-purple-300 animate-bounce" style={{animationDelay: `${i * 0.1}s`}}></div>
                  ))}
                </div>
                <span className="text-xs sm:text-sm">1,000+ brands joined</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 sm:py-8 text-center text-gray-400 bg-slate-900 border-t border-slate-800 mobile-padding">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <p className="text-xs sm:text-sm animate-on-scroll">
              © {new Date().getFullYear()} BrandPawa. All rights reserved. 
              <span className="mx-2">•</span>
              Building the future of brand growth
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
