// src/pages/dashboard/billing/index.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabase';
import {
  FiCheck, FiCreditCard, FiDollarSign, FiCalendar,
  FiDownload, FiFileText, FiShield, FiClock,
  FiUsers, FiZap, FiStar, FiAward, FiBarChart2,
  FiTarget, FiEye, FiMessageSquare, FiGlobe,
  FiInstagram, FiHeart, FiDroplet, FiRefreshCw,
  FiAlertCircle, FiHelpCircle, FiArrowLeft,
  FiExternalLink, FiLock, FiUnlock, FiPercent
} from 'react-icons/fi';

interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  popular?: boolean;
  color: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: 'active' | 'inactive' | 'past_due' | 'canceled';
  current_period_end: string;
  current_period_start: string;
  cancel_at_period_end: boolean;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  description: string;
  download_url?: string;
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  ref: string;
  metadata?: Record<string, any>;
  callback: (response: any) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

export default function BillingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'subscription' | 'invoices' | 'usage'>('plans');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Initialize Paystack
  const initializePaystack = (): Promise<any> => {
    return new Promise((resolve) => {
      if (!PAYSTACK_PUBLIC_KEY) {
        setError('Payment configuration error. Please contact support.');
        resolve(null);
        return;
      }
      
      // Check if Paystack is already loaded
      if (typeof window !== 'undefined' && window.PaystackPop) {
        resolve(window.PaystackPop);
        return;
      }
      
      // Load Paystack script
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      
      script.onload = () => {
        if (window.PaystackPop) {
          resolve(window.PaystackPop);
        } else {
          setError('Unable to load payment system');
          resolve(null);
        }
      };
      
      script.onerror = () => {
        setError('Unable to load payment system. Please check your internet connection.');
        resolve(null);
      };
      
      document.head.appendChild(script);
    });
  };

  // Plans configuration
  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started with basic brand assessment',
      priceMonthly: 0,
      priceYearly: 0,
      features: [
        '3 Basic Diagnostics',
        'Visibility Challenge (7-day)',
        'Basic Dashboard',
        'Email Results',
        'Community Access',
        'Standard Support'
      ],
      color: 'from-gray-100 to-gray-200'
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Complete brand building toolkit for serious creators',
      priceMonthly: 2900, // ₦2,900 in kobo
      priceYearly: 29000, // ₦29,000 in kobo (save ~17%)
      features: [
        'All 10 Diagnostics',
        'All Challenges (Visibility + Authority)',
        'Advanced Analytics Dashboard',
        'Detailed PDF Reports',
        'Priority Email Support',
        'Team Collaboration (up to 3 members)',
        'Export All Data',
        'Custom Brand Guides'
      ],
      popular: true,
      color: 'from-blue-100 to-purple-100'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For agencies and teams building multiple brands',
      priceMonthly: 9900, // ₦9,900 in kobo
      priceYearly: 99000, // ₦99,000 in kobo (save ~17%)
      features: [
        'Everything in Pro',
        'Unlimited Team Members',
        'White Label Reports',
        'API Access (Coming Soon)',
        'Dedicated Account Manager',
        'Custom Integrations',
        'Training & Onboarding',
        'SLA Guarantee'
      ],
      color: 'from-purple-100 to-pink-100'
    }
  ];

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      setUser(user);
      
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);
      
      // Fetch subscription data
      await fetchSubscriptionData(user.id);
      
      // Fetch invoices
      await fetchInvoices(user.id);
      
    } catch (error) {
      console.error('Error loading billing data:', error);
      setError('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionData = async (userId: string) => {
    try {
      const { data: subscriptionData, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
      }
      
      if (subscriptionData) {
        setSubscription(subscriptionData);
      }
    } catch (error) {
      console.error('Error in fetchSubscriptionData:', error);
    }
  };

  const fetchInvoices = async (userId: string) => {
    try {
      const { data: invoicesData, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching invoices:', error);
        return;
      }
      
      if (invoicesData) {
        const formattedInvoices: Invoice[] = invoicesData.map(inv => ({
          id: inv.id,
          invoice_number: `INV-${inv.id.substring(0, 8).toUpperCase()}`,
          amount: inv.amount / 100, // Convert from kobo to Naira
          currency: inv.currency || 'NGN',
          status: inv.status,
          date: new Date(inv.created_at).toLocaleDateString(),
          description: inv.description || `${inv.plan} Plan Subscription`,
          download_url: inv.invoice_url
        }));
        
        setInvoices(formattedInvoices);
      }
    } catch (error) {
      console.error('Error in fetchInvoices:', error);
    }
  };

  const handleUpgrade = async (plan: Plan) => {
    if (!user || !user.email) {
      setError('Please login to upgrade your plan');
      return;
    }

    if (plan.id === 'free') {
      // Handle downgrade to free
      await handleDowngrade();
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleDowngrade = async () => {
    if (!user) return;
    
    if (!window.confirm('Are you sure you want to downgrade to the Free plan? You will lose access to Pro features.')) {
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      // Update profile to free plan
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          plan: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Cancel subscription if exists
      if (subscription) {
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .update({ 
            status: 'canceled',
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);
        
        if (subscriptionError) throw subscriptionError;
      }
      
      // Add activity
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: 'plan_downgrade',
          metadata: { from: profile?.plan || 'free', to: 'free' },
          created_at: new Date().toISOString()
        });
      
      setSuccess('Successfully downgraded to Free plan');
      router.reload();
      
    } catch (error: any) {
      console.error('Downgrade error:', error);
      setError(error.message || 'Failed to downgrade plan');
    } finally {
      setProcessing(false);
    }
  };

  const processPayment = async () => {
    if (!selectedPlan || !user || !user.email) {
      setError('Missing required information for payment');
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const paystack = await initializePaystack();
      if (!paystack) {
        throw new Error('Payment system unavailable');
      }

      const amount = billingCycle === 'monthly' 
        ? selectedPlan.priceMonthly 
        : selectedPlan.priceYearly;
      
      const reference = `BP_${Date.now()}_${user.id.substring(0, 8)}`;
      
      // Create payment configuration
      const config = {
        key: PAYSTACK_PUBLIC_KEY!,
        email: user.email,
        amount: amount,
        ref: reference,
        metadata: {
          userId: user.id,
          plan: selectedPlan.id,
          billingCycle: billingCycle,
          amount: amount,
          reference: reference
        },
        callback: async (response: any) => {
          console.log('Payment successful:', response);
          
          // Verify payment on your backend
          const verificationResponse = await verifyPayment(reference);
          
          if (verificationResponse.success) {
            // Update user profile
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ 
                plan: selectedPlan.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
            
            if (profileError) throw profileError;
            
            // Create subscription record
            const periodEnd = new Date();
            periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === 'yearly' ? 12 : 1));
            
            const { error: subscriptionError } = await supabase
              .from('subscriptions')
              .upsert({
                user_id: user.id,
                plan: selectedPlan.id,
                status: 'active',
                amount: amount,
                currency: 'NGN',
                interval: billingCycle,
                current_period_start: new Date().toISOString(),
                current_period_end: periodEnd.toISOString(),
                cancel_at_period_end: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id'
              });
            
            if (subscriptionError) throw subscriptionError;
            
            // Create invoice record
            const { error: invoiceError } = await supabase
              .from('invoices')
              .insert({
                user_id: user.id,
                plan: selectedPlan.id,
                amount: amount,
                currency: 'NGN',
                status: 'paid',
                payment_reference: reference,
                invoice_url: response.receipt_url,
                created_at: new Date().toISOString()
              });
            
            if (invoiceError) throw invoiceError;
            
            // Add activity
            await supabase
              .from('user_activity')
              .insert({
                user_id: user.id,
                activity_type: 'plan_upgrade',
                metadata: { 
                  from: profile?.plan || 'free', 
                  to: selectedPlan.id,
                  amount: amount / 100,
                  billingCycle: billingCycle
                },
                created_at: new Date().toISOString()
              });
            
            setSuccess(`Successfully upgraded to ${selectedPlan.name} plan!`);
            setShowPaymentModal(false);
            
            // Refresh data
            setTimeout(() => {
              router.reload();
            }, 2000);
          } else {
            setError('Payment verification failed. Please contact support.');
          }
        },
        onClose: () => {
          console.log('Payment modal closed');
          setProcessing(false);
        }
      };

      // Initialize payment
      const handler = paystack.setup(config);
      handler.openIframe();
      
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Payment processing failed');
      setProcessing(false);
    }
  };

  const verifyPayment = async (reference: string): Promise<{ success: boolean; data?: any }> => {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Verification error:', error);
      return { success: false };
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription || !window.confirm('Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.')) {
      return;
    }
    
    setProcessing(true);
    
    try {
      // Update subscription status
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          cancel_at_period_end: true,
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
      
      if (error) throw error;
      
      // Add activity
      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: 'subscription_canceled',
          metadata: { plan: subscription.plan },
          created_at: new Date().toISOString()
        });
      
      setSuccess('Subscription cancelled. You will continue to have access until the end of your billing period.');
      
      // Refresh data
      setTimeout(() => {
        router.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Cancellation error:', error);
      setError(error.message || 'Failed to cancel subscription');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount / 100);
  };

  const getSavingsPercentage = (plan: Plan) => {
    if (plan.priceYearly === 0) return 0;
    const monthlyTotal = plan.priceMonthly * 12;
    const savings = monthlyTotal - plan.priceYearly;
    return Math.round((savings / monthlyTotal) * 100);
  };

  const renderPlans = () => (
    <div className="space-y-8">
      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-white">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition ${
              billingCycle === 'monthly'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition ${
              billingCycle === 'yearly'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Yearly (Save up to 17%)
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrentPlan = profile?.plan === plan.id;
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
          const isFree = plan.id === 'free';
          const savings = getSavingsPercentage(plan);
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-8 transition-all bg-gradient-to-b ${plan.color} ${
                plan.popular
                  ? 'border-blue-500 shadow-xl scale-105'
                  : 'border-gray-200 hover:border-blue-300'
              } ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              {savings > 0 && billingCycle === 'yearly' && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    Save {savings}%
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-center justify-center">
                    <span className="text-4xl font-bold">{formatCurrency(price)}</span>
                    {!isFree && (
                      <span className="text-gray-500 ml-2">
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    )}
                  </div>
                  {billingCycle === 'yearly' && !isFree && (
                    <p className="text-sm text-gray-500 mt-2">
                      {formatCurrency(plan.priceMonthly)} monthly equivalent
                    </p>
                  )}
                </div>
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <FiCheck className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleUpgrade(plan)}
                disabled={processing || (isCurrentPlan && !isFree)}
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  isCurrentPlan
                    ? 'bg-gray-100 text-gray-700 cursor-default'
                    : isFree
                    ? 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-300'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {processing
                  ? 'Processing...'
                  : isCurrentPlan
                  ? 'Current Plan'
                  : isFree
                  ? 'Downgrade to Free'
                  : `Upgrade to ${plan.name}`}
              </button>
              
              {isCurrentPlan && !isFree && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={processing}
                  className="w-full mt-4 py-2 text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold mb-6">Secure Payment Methods</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['Visa', 'Mastercard', 'Verve', 'Bank Transfer'].map((method) => (
            <div key={method} className="bg-gray-50 p-4 rounded-xl text-center">
              <div className="font-semibold text-gray-700">{method}</div>
              <div className="text-sm text-gray-500 mt-1">Secured by Paystack</div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <FiShield className="text-green-500 text-xl" />
            <div>
              <div className="font-semibold">Your payment is secure</div>
              <div className="text-sm text-gray-600">
                All payments are processed through Paystack with bank-level security. We never store your card details.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              q: 'Can I cancel anytime?',
              a: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.'
            },
            {
              q: 'Is there a free trial?',
              a: 'The Free plan includes basic features forever. For Pro features, we offer a 14-day money-back guarantee.'
            },
            {
              q: 'Can I switch plans?',
              a: 'You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, downgrades at the end of your billing period.'
            },
            {
              q: 'Do you offer refunds?',
              a: 'We offer a 14-day money-back guarantee for all paid plans if you\'re not satisfied with our service.'
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-xl">
              <h4 className="font-bold mb-2">{faq.q}</h4>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSubscription = () => (
    subscription ? (
      <div className="space-y-8">
        {/* Current Subscription Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Current Subscription</h3>
              <div className="flex items-center space-x-3">
                <span className="px-4 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 rounded-full font-semibold">
                  {subscription.plan.toUpperCase()}
                </span>
                <span className={`px-4 py-1 rounded-full font-medium ${
                  subscription.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : subscription.status === 'canceled'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <div className="text-3xl font-bold">
                {formatCurrency(subscription.amount)}
                <span className="text-lg text-gray-500">/{subscription.interval}</span>
              </div>
              <div className="text-sm text-gray-600">
                Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Billing Period</div>
                <div className="font-semibold">
                  {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Payment Method</div>
                <div className="font-semibold">Paystack ••••</div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Auto-Renewal</div>
                <div className="font-semibold">
                  {subscription.cancel_at_period_end ? 'Will cancel on renewal' : 'Enabled'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Plan Value</div>
                <div className="font-semibold">
                  Access to {subscription.plan === 'pro' ? 'all 10' : 'all'} features
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8 pt-8 border-t">
            <button
              onClick={() => setActiveTab('plans')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              Change Plan
            </button>
            {!subscription.cancel_at_period_end && (
              <button
                onClick={handleCancelSubscription}
                disabled={processing}
                className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition disabled:opacity-50"
              >
                Cancel Subscription
              </button>
            )}
            <button
              onClick={() => window.open('https://paystack.com', '_blank')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center space-x-2"
            >
              <FiExternalLink />
              <span>Manage Payment Methods</span>
            </button>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-6">Your Plan Usage</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { 
                label: 'Diagnostics Used', 
                value: '7/10', 
                icon: <FiTarget />,
                color: 'text-blue-600',
                progress: 70
              },
              { 
                label: 'Challenges Completed', 
                value: '2/5', 
                icon: <FiZap />,
                color: 'text-purple-600',
                progress: 40
              },
              { 
                label: 'Team Members', 
                value: '1/3', 
                icon: <FiUsers />,
                color: 'text-green-600',
                progress: 33
              }
            ].map((stat, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white`}>
                    <div className={stat.color}>{stat.icon}</div>
                  </div>
                  <div>
                    <div className="font-semibold">{stat.label}</div>
                    <div className="text-2xl font-bold mt-1">{stat.value}</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${stat.color.replace('text-', 'bg-')}`}
                    style={{ width: `${stat.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCreditCard className="text-blue-600 text-2xl" />
        </div>
        <h3 className="text-2xl font-bold mb-4">No Active Subscription</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          You're currently on the Free plan. Upgrade to unlock all features and take your brand to the next level.
        </p>
        <button
          onClick={() => setActiveTab('plans')}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
        >
          View Upgrade Options
        </button>
      </div>
    )
  );

  const renderInvoices = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Billing History</h3>
          <button 
            onClick={() => window.open('https://paystack.com', '_blank')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
          >
            <FiExternalLink />
            <span>View All on Paystack</span>
          </button>
        </div>
        
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-semibold">Invoice #</th>
                  <th className="text-left py-3 font-semibold">Date</th>
                  <th className="text-left py-3 font-semibold">Amount</th>
                  <th className="text-left py-3 font-semibold">Status</th>
                  <th className="text-left py-3 font-semibold">Plan</th>
                  <th className="text-left py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 font-mono text-sm">
                      {invoice.invoice_number}
                    </td>
                    <td className="py-4">
                      {invoice.date}
                    </td>
                    <td className="py-4 font-semibold">
                      {formatCurrency(invoice.amount * 100)}
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4">
                      {invoice.description.includes('Pro') ? 'Pro' : 'Enterprise'}
                    </td>
                    <td className="py-4">
                      <div className="flex space-x-2">
                        {invoice.download_url && (
                          <button 
                            onClick={() => window.open(invoice.download_url, '_blank')}
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                          >
                            <FiDownload />
                            <span>PDF</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No invoices found</p>
            <p className="text-sm text-gray-500 mt-2">Your billing history will appear here</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderUsage = () => (
    <div className="space-y-8">
      {/* Usage Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold mb-6">Usage Summary</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'Total Diagnostics', 
              value: '7', 
              icon: <FiTarget />, 
              max: profile?.plan === 'free' ? '3' : 'Unlimited',
              color: 'bg-blue-100 text-blue-600'
            },
            { 
              label: 'Challenges', 
              value: '2', 
              icon: <FiZap />, 
              max: profile?.plan === 'free' ? '1' : 'All',
              color: 'bg-purple-100 text-purple-600'
            },
            { 
              label: 'Points Earned', 
              value: '350', 
              icon: <FiAward />, 
              max: '∞',
              color: 'bg-green-100 text-green-600'
            },
            { 
              label: 'Active Days', 
              value: '45', 
              icon: <FiCalendar />, 
              max: '∞',
              color: 'bg-orange-100 text-orange-600'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 ${stat.color.split(' ')[0]} rounded-lg flex items-center justify-center`}>
                  <div className={stat.color.split(' ')[1]}>{stat.icon}</div>
                </div>
                <div className="font-semibold">{stat.label}</div>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">
                {profile?.plan === 'free' ? 'Limit: ' : 'Available: '}{stat.max}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Status */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
            <h4 className="font-bold mb-4">Pro Features Status</h4>
            <div className="space-y-4">
              {[
                { feature: 'All 10 Diagnostics', enabled: profile?.plan !== 'free', icon: <FiTarget /> },
                { feature: 'Authority Challenge', enabled: profile?.plan !== 'free', icon: <FiZap /> },
                { feature: 'PDF Reports', enabled: profile?.plan !== 'free', icon: <FiFileText /> },
                { feature: 'Priority Support', enabled: profile?.plan !== 'free', icon: <FiShield /> }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className={item.enabled ? 'font-medium' : 'text-gray-500'}>{item.feature}</span>
                  </div>
                  {item.enabled ? (
                    <FiCheck className="text-green-500" />
                  ) : (
                    <FiLock className="text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
            <h4 className="font-bold mb-4">Get More Value</h4>
            <div className="space-y-4">
              {[
                { feature: 'Team Collaboration', upgrade: 'Pro+', icon: <FiUsers /> },
                { feature: 'API Access', upgrade: 'Enterprise', icon: <FiGlobe /> },
                { feature: 'White Label', upgrade: 'Enterprise', icon: <FiStar /> },
                { feature: 'Custom Training', upgrade: 'Enterprise', icon: <FiAward /> }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span>{item.feature}</span>
                  </div>
                  <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {item.upgrade}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveTab('plans')}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              Upgrade for More Features
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentModal = () => {
    if (!selectedPlan) return null;
    
    const amount = billingCycle === 'monthly' 
      ? selectedPlan.priceMonthly 
      : selectedPlan.priceYearly;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCreditCard className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Upgrade to {selectedPlan.name}</h3>
            <p className="text-gray-600">Complete your payment to activate your new plan</p>
          </div>
          
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="font-bold">{selectedPlan.name} Plan</div>
                <div className="text-sm text-gray-600">
                  {billingCycle === 'monthly' ? 'Monthly billing' : 'Yearly billing (Save 17%)'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{formatCurrency(amount)}</div>
                <div className="text-sm text-gray-600">
                  {billingCycle === 'monthly' ? 'per month' : 'per year'}
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="text-sm text-gray-600 mb-2">What you get:</div>
              <ul className="space-y-2">
                {selectedPlan.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <FiCheck className="text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
                {selectedPlan.features.length > 3 && (
                  <li className="text-sm text-gray-500">
                    +{selectedPlan.features.length - 3} more features
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Payment Button */}
          <button
            onClick={processPayment}
            disabled={processing}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            {processing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <FiCreditCard />
                <span>Pay {formatCurrency(amount)} Now</span>
              </>
            )}
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-4">
            Secured by Paystack • 14-day money-back guarantee
          </p>
          
          <button
            onClick={() => setShowPaymentModal(false)}
            disabled={processing}
            className="w-full mt-4 py-3 text-gray-600 hover:text-gray-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF0FF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF0FF]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <FiArrowLeft />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold">Billing & Subscription</h1>
              <p className="text-gray-600">Manage your plan, billing, and usage</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full font-semibold ${
                profile?.plan === 'free'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600'
              }`}>
                Current: {profile?.plan?.toUpperCase() || 'FREE'}
              </div>
              <button
                onClick={() => window.open('mailto:support@brandpawa.com', '_blank')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center space-x-2"
              >
                <FiHelpCircle />
                <span>Help</span>
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2 text-red-700">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center space-x-2 text-green-700">
              <FiCheck className="text-green-500" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap border-b border-gray-200">
            {[
              { id: 'plans', label: 'Plans & Pricing', icon: <FiCreditCard /> },
              { id: 'subscription', label: 'Subscription', icon: <FiCalendar /> },
              { id: 'invoices', label: 'Invoices', icon: <FiFileText /> },
              { id: 'usage', label: 'Usage', icon: <FiBarChart2 /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div>
          {activeTab === 'plans' && renderPlans()}
          {activeTab === 'subscription' && renderSubscription()}
          {activeTab === 'invoices' && renderInvoices()}
          {activeTab === 'usage' && renderUsage()}
        </div>

        {/* Support Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Need Help with Billing?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our support team is here to help you with any billing questions or issues you may have.
              We typically respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.open('mailto:support@brandpawa.com', '_blank')}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Contact Support
              </button>
              <button
                onClick={() => window.open('https://help.brandpawa.com', '_blank')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                View Help Center
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && renderPaymentModal()}
    </div>
  );
}
