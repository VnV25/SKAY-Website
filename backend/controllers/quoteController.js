const { supabase, isSupabaseConfigured } = require('../lib/supabase');

const submitQuote = async (req, res) => {
  try {
    if (!isSupabaseConfigured) {
      return res.status(500).json({
        success: false,
        message: 'Supabase environment variables are missing on the server',
      });
    }

    const {
      name,
      email,
      service,
      serviceType,
      message,
      company,
      phone,
      quantity,
      description,
      color,
      variant,
      size,
    } = req.body;

    const normalizedService = service || serviceType;

    if (!name || !email || !normalizedService) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and service are required',
      });
    }

    const contactMessage = [
      `Service: ${normalizedService}`,
      quantity ? `Quantity: ${quantity}` : null,
      color ? `Color: ${color}` : null,
      variant ? `Variant: ${variant}` : null,
      size ? `Size: ${size}` : null,
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
        success: false,
        message: inquiryError.message || 'Failed to save inquiry',
      });
    }

    const { error: orderError } = await supabase.from('orders').insert([
      {
        customer_name: name,
        email: email.toLowerCase(),
        phone: phone || null,
        service: normalizedService,
        quantity: Number(quantity) || 1,
        total: 0,
        status: 'pending',
      },
    ]);

    if (orderError) {
      console.error('Order creation error:', orderError);
      return res.status(201).json({
        success: true,
        message: 'Inquiry saved successfully, but order creation failed',
        inquiry,
        inquiryId: inquiry.id,
        orderCreated: false,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Quote submitted successfully',
      inquiry,
      inquiryId: inquiry.id,
      orderCreated: true,
    });
  } catch (err) {
    console.error('Quote controller error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Server error',
    });
  }
};

module.exports = {
  submitQuote,
};
