// pages/api/payments/initialize.ts
import { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, amount, plan, billingCycle, userId } = req.body;
    
    const params = JSON.stringify({
      email,
      amount: amount * 100, // Convert to kobo
      currency: 'NGN',
      metadata: {
        userId,
        plan,
        billingCycle,
        amount: amount
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      channels: ['card', 'bank', 'ussd', 'qr', 'bank_transfer']
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const request = https.request(options, (paystackRes) => {
      let data = '';
      
      paystackRes.on('data', (chunk) => {
        data += chunk;
      });

      paystackRes.on('end', () => {
        const response = JSON.parse(data);
        if (response.status) {
          res.status(200).json({
            success: true,
            authorization_url: response.data.authorization_url,
            access_code: response.data.access_code,
            reference: response.data.reference
          });
        } else {
          res.status(400).json({ error: response.message });
        }
      });
    });

    request.on('error', (error) => {
      console.error('Paystack API error:', error);
      res.status(500).json({ error: 'Payment initialization failed' });
    });

    request.write(params);
    request.end();

  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}