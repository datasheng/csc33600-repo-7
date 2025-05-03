app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_...');
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
  
      // Save this info to DB or CSV
      const paymentData = {
        user: session.customer_email,
        amount: session.amount_total / 100,
        paidAt: new Date().toISOString(),
      };
  
      // Append to CSV or save to database
      // e.g., using 'fs' module or Google Sheets API
    }
  
    res.status(200).json({ received: true });
  });
  