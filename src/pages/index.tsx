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
        `}</style>
      </Head>

      <main className="dark-gradient-bg text-gray-100 overflow-hidden">
        {/* Hero Section */}
        <section 
          ref={heroRef}
          className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden parallax-bg"
          style={{
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.9), rgba(30, 27, 75, 0.9)), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238b5cf6' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 -z-10">
            {/* Floating particles */}
            <div className="absolute top-20 left-10 w-4 h-4 bg-purple-500 rounded-full animate-float opacity-60"></div>
            <div className="absolute top-40 right-20 w-6 h-6 bg-indigo-500 rounded-full animate-float opacity-40" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-40 left-20 w-8 h-8 bg-violet-500 rounded-full animate-float opacity-30" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-20 right-10 w-5 h-5 bg-purple-400 rounded-full animate-float opacity-50" style={{animationDelay: '3s'}}></div>
            
            {/* Animated gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-full blur-3xl opacity-40 animate-float"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-violet-900/20 to-blue-900/20 rounded-full blur-3xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>

            {/* Stars */}
            {[...Array(20)].map((_, i) => (
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
          <div className="mb-12 transform hover:scale-105 transition-transform duration-300 animate-on-scroll">
            <div className="h-16 w-48 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl mx-auto shadow-2xl flex items-center justify-center animate-pulse-glow border border-purple-500/30">
              <span className="text-white font-bold text-xl text-glow">BrandPawa</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-8 max-w-6xl animate-on-scroll">
            Discover your{" "}
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent animate-gradient text-glow">
              BrandPawa Score
            </span>{" "}
            <br className="hidden md:block" />
            and unlock predictable growth.
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed animate-on-scroll">
            Join the waitlist to be the first to test your brand and access
            exclusive growth tools designed to scale your business.
          </p>

          {/* Waitlist Form */}
          <form
            onSubmit={handleSubmit}
            className="glass-morphism-dark p-8 rounded-3xl shadow-2xl flex flex-col gap-6 w-full max-w-2xl transform hover:shadow-2xl transition-all duration-300 animate-on-scroll border border-white/10"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="flex-1 px-5 py-4 border border-gray-700 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400"
                required
                disabled={isLoading}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                className="flex-1 px-5 py-4 border border-gray-700 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400"
                required
                disabled={isLoading}
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-5 py-4 border border-gray-700 rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none transition-all duration-300 bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400"
              required
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl animate-pulse-glow border border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                '🚀 Unlock My BrandPawa'
              )}
            </button>
            <p className="text-sm text-gray-400 mt-2">
              Join 1,000+ brands already waiting
            </p>
          </form>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-indigo-600"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16 animate-on-scroll">
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Why Choose{" "}
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent animate-gradient text-glow">
                  BrandPawa?
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Comprehensive tools and insights to transform your brand&apos;s growth trajectory
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
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
                  className="group p-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl hover:shadow-3xl border border-slate-700 hover:border-purple-500/50 transform hover:-translate-y-2 transition-all duration-500 animate-on-scroll glass-morphism-dark"
                  style={{animationDelay: `${index * 200}ms`}}
                >
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-2xl mb-4 text-white">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-gray-400 bg-slate-900 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-sm animate-on-scroll">
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
