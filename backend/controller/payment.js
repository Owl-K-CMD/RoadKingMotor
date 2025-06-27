app.post('/api/verify-payment', async (req, res) => {
  const { transaction_id } = req.body;

  const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
    headers: {
      Authorization: `Bearer FLW_SECRET_KEY`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (data.status === 'success') {

    await Payment.create({
      carId: 'CAR-001',
      userEmail: data.data.customer.email,
      amount: data.data.amount,
      status: 'successful',
      transactionId: data.data.id,
    });

    return res.status(200).json({ success: true, message: 'Payment verified' });
  } else {
    return res.status(400).json({ success: false, message: 'Verification failed' });
  }
});
