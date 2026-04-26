const supabase = require('../config/supabaseClient');

const submitQuote = async (req, res) => {
  try {
    console.log('Quote request body:', req.body);

    const {
      name,
      email,
      service,
      message,
      company,
      phone,
      quantity,
      description,
    } = req.body;

    if (!name || !email || !service) {
      return res.status(400).json({
        message: 'Name, email, and service are required',
      });
    }

    // ================= SAVE INQUIRY =================
    const contactMessage = [
      `Service: ${service}`,
      quantity ? `Quantity: ${quantity}` : null,
      description ? `Description: ${description}` : null,
      company ? `Company: ${company}` : null,
      phone ? `Phone: ${phone}` : null,
      message ? `Message: ${message}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const { data: inquiry, error: inquiryError } = await supabase
      .from('contacts')
      .insert([
        {
          name,
          email: email.toLowerCase(),
          phone: phone || null,
          message: contactMessage,
          status: 'new',
        },
      ])
      .select()
      .single();

    if (inquiryError) {
      console.error('Inquiry error:', inquiryError);
      return res.status(500).json({
        message: 'Failed to save inquiry',
      });
    }

    // ================= CREATE ORDER =================
    const { error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: name,
          email: email.toLowerCase(),
          phone: phone || null,
          service,
          quantity: Number(quantity) || 1,
          total: 0,
          status: 'pending',
        },
      ]);

    if (orderError) {
      console.error('Order creation error:', orderError);

      return res.status(500).json({
        message: 'Inquiry saved but order creation failed',
      });
    }

    // ================= SUCCESS =================
    res.status(201).json({
      message: 'Quote submitted & order created successfully',
      inquiryId: inquiry.id,
    });

  } catch (err) {
    console.error('Quote controller error:', err);

    res.status(500).json({
      message: 'Server error',
    });
  }
};

module.exports = {
  submitQuote,
};