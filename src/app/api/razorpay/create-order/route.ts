import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, notes } = body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid order amount. Amount must be greater than zero.' },
        { status: 400 }
      );
    }

    // Razorpay accepts amounts in paise (1 INR = 100 paise) as an integer
    const amountInPaise = Math.round(parsedAmount * 100);

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const isPlaceholderKey = 
      !keyId || 
      !keySecret || 
      keyId.includes('YOUR_RAZORPAY') || 
      keySecret.includes('YOUR_RAZORPAY') ||
      keyId === 'rzp_test_placeholder';

    // If real Razorpay credentials are provided, create official order via Razorpay SDK
    if (!isPlaceholderKey) {
      try {
        const instance = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const options = {
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now().toString().slice(-8)}`,
          notes: {
            platform: 'Velto Hyperlocal Super App',
            ...(notes || {})
          }
        };

        const order = await instance.orders.create(options);

        return NextResponse.json({
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          keyId: keyId,
          isSandbox: false
        });
      } catch (razorpayErr: any) {
        console.warn('Razorpay live order creation failed, falling back to sandbox mode:', razorpayErr?.message || razorpayErr);
        // Fall through to sandbox mode so the checkout UX does not abruptly break
      }
    }

    // Sandbox / Mock Mode for local testing and merchant preview without live credentials
    const mockOrderId = `order_mock_${Date.now()}`;
    return NextResponse.json({
      id: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_mock_${Date.now().toString().slice(-8)}`,
      keyId: keyId || 'rzp_test_mock',
      isSandbox: true,
      message: 'Razorpay Sandbox Mode: Configure RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in .env.local for production.'
    });

  } catch (error: any) {
    console.error('Create Razorpay Order Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize payment gateway' },
      { status: 500 }
    );
  }
}
