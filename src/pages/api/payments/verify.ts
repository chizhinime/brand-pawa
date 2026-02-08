// pages/api/payments/verify.ts
import { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';
import { supabase } from '../../../lib/supabase';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reference } = req.body;

    // Verify payment with Paystack
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    };

    const request = https.request(options, (paystackRes) => {
      let data = '';
      
      paystackRes.on('data', (chunk) => {
        data += chunk;
      });

      paystackRes.on('end', async () => {
        const response = JSON.parse(data);
        
        if (response.status && response.data.status === 'success') {
          const { metadata, amount, customer } = response.data;
          
          // Update user's plan in database
          const { error } = await supabase
            .from('profiles')
            .update({ 
              plan: metadata.plan,
              updated_at: new Date().toISOString()
            })
            .eq('id', metadata.userId);
          
          if (error) {
            throw error;
          }
          
          // Create subscription record
          const periodEnd = new Date();
          periodEnd.setMonth(periodEnd.getMonth() + (metadata.billingCycle === 'yearly' ? 12 : 1));
          
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: metadata.userId,
              plan: metadata.plan,
              status: 'active',
              amount: amount,
              currency: 'NGN',
              interval: metadata.billingCycle,
              current_period_start: new Date().toISOString(),
              current_period_end: periodEnd.toISOString(),
              cancel_at_period_end: false,
              payment_reference: reference,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
          
          // Create invoice record
          await supabase
            .from('invoices')
            .insert({
              user_id: metadata.userId,
              plan: metadata.plan,
              amount: amount,
              currency: 'NGN',
              status: 'paid',
              payment_reference: reference,
              invoice_url: response.data.receipt_url,
              created_at: new Date().toISOString()
            });

          res.status(200).json({ 
            success: true, 
            data: response.data 
          });
        } else {
          res.status(400).json({ 
            success: false, 
            error: 'Payment verification failed' 
          });
        }
      });
    });

    request.on('error', (error) => {
      console.error('Paystack verification error:', error);
      res.status(500).json({ error: 'Payment verification failed' });
    });

    request.end();

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}