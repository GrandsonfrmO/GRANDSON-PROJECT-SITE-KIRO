const nodemailer = require('nodemailer');
const { orderConfirmationEmail } = require('./emailTemplates');

console.log('📧 Email Service module loaded');

/**
 * Create email transporter with SMTP configuration
 * @returns {nodemailer.Transporter}
 */
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Generate customer order confirmation email template
 * @param {Object} orderDetails - Order details
 * @returns {string} HTML email template
 */
const getCustomerOrderConfirmationTemplate = (orderDetails) => {
  // Transform data to match orderConfirmationEmail format
  const transformedOrder = {
    orderNumber: orderDetails.orderNumber,
    customerName: orderDetails.customerName,
    customerPhone: orderDetails.customerPhone,
    deliveryAddress: orderDetails.deliveryAddress,
    deliveryZone: orderDetails.deliveryZone,
    deliveryFee: orderDetails.deliveryFee,
    totalAmount: orderDetails.total,
    items: orderDetails.items.map(item => ({
      name: item.name,
      image: item.image,
      images: item.image ? [item.image] : [],
      size: item.size,
      quantity: item.quantity,
      price: item.price
    }))
  };
  
  return orderConfirmationEmail(transformedOrder);
};

/**
 * Generate admin new order notification email template
 * @param {Object} orderDetails - Order details
 * @returns {string} HTML email template
 */
const getAdminNewOrderTemplate = (orderDetails) => {
  const itemsHtml = orderDetails.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString()} GNF</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouvelle commande</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 5px; overflow: hidden; }
        .order-table th { background: #28a745; color: white; padding: 12px; text-align: left; font-size: 14px; }
        .order-table td { padding: 8px; border-bottom: 1px solid #eee; font-size: 14px; }
        .total-row { background: #f0f0f0; font-weight: bold; }
        .customer-info { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #28a745; }
        .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 Nouvelle Commande</h1>
          <p>Commande #${orderDetails.orderNumber}</p>
        </div>
        <div class="content">
          <div class="urgent">
            <h3>⚡ Action requise</h3>
            <p>Une nouvelle commande vient d'être passée et nécessite votre validation.</p>
          </div>

          <div class="customer-info">
            <h3>👤 Informations client</h3>
            <p><strong>Nom :</strong> ${orderDetails.customerName}</p>
            <p><strong>Email :</strong> ${orderDetails.customerEmail || 'Non fourni'}</p>
            <p><strong>Téléphone :</strong> ${orderDetails.customerPhone}</p>
            <p><strong>Adresse :</strong> ${orderDetails.deliveryAddress}</p>
            <p><strong>Zone :</strong> ${orderDetails.deliveryZone}</p>
          </div>

          <h3>📦 Détails de la commande</h3>
          <table class="order-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th style="text-align: center;">Qté</th>
                <th style="text-align: right;">Prix</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="2">Frais de livraison</td>
                <td style="text-align: right;">${orderDetails.deliveryFee.toLocaleString()} GNF</td>
              </tr>
              <tr class="total-row">
                <td colspan="2"><strong>TOTAL</strong></td>
                <td style="text-align: right;"><strong>${orderDetails.total.toLocaleString()} GNF</strong></td>
              </tr>
            </tbody>
          </table>

          <div style="text-align: center; margin: 30px 0;">
            <p><strong>Connectez-vous à l'admin pour valider cette commande</strong></p>
          </div>

          <p><strong>L'équipe Grand Son Project</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send customer confirmation email
 * @param {Object} orderDetails - Order details including customer email
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendCustomerConfirmation(orderDetails) {
  const startTime = Date.now();
  console.log(`\n📧 [EmailService] Sending customer confirmation for order ${orderDetails.orderNumber}`);
  
  try {
    // Validate required fields
    if (!orderDetails || !orderDetails.customerEmail) {
      const error = 'Customer email is required';
      console.warn(`⚠️  [EmailService] ${error}`);
      return {
        success: false,
        error
      };
    }

    // Validate SMTP configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      const error = 'SMTP configuration missing (SMTP_USER or SMTP_PASS)';
      console.error(`❌ [EmailService] ${error}`);
      return {
        success: false,
        error
      };
    }

    console.log(`📧 [EmailService] Recipient: ${orderDetails.customerEmail}`);
    console.log(`📧 [EmailService] Order items: ${orderDetails.items?.length || 0}`);

    const transporter = createEmailTransporter();
    const mailOptions = {
      from: `"Grandson Project" <${process.env.SMTP_USER}>`,
      to: orderDetails.customerEmail,
      subject: `✅ Commande confirmée #${orderDetails.orderNumber}`,
      html: getCustomerOrderConfirmationTemplate(orderDetails)
    };

    const result = await transporter.sendMail(mailOptions);
    const duration = Date.now() - startTime;
    
    console.log(`✅ [EmailService] Customer confirmation email sent successfully`);
    console.log(`📧 [EmailService] Message ID: ${result.messageId}`);
    console.log(`⏱️  [EmailService] Duration: ${duration}ms`);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [EmailService] Error sending customer confirmation:`);
    console.error(`📄 [EmailService] Error message: ${error.message}`);
    console.error(`📄 [EmailService] Error stack:`, error.stack);
    console.log(`⏱️  [EmailService] Duration: ${duration}ms`);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send admin notification email
 * @param {Object} orderDetails - Order details
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendAdminNotification(orderDetails) {
  const startTime = Date.now();
  console.log(`\n📧 [EmailService] Sending admin notification for order ${orderDetails.orderNumber}`);
  
  try {
    // Validate required fields
    if (!orderDetails) {
      const error = 'Order details are required';
      console.warn(`⚠️  [EmailService] ${error}`);
      return {
        success: false,
        error
      };
    }

    // Check if admin email is configured
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      const error = 'ADMIN_EMAIL not configured';
      console.warn(`⚠️  [EmailService] ${error} - skipping admin notification`);
      return {
        success: false,
        error
      };
    }

    // Validate SMTP configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      const error = 'SMTP configuration missing (SMTP_USER or SMTP_PASS)';
      console.error(`❌ [EmailService] ${error}`);
      return {
        success: false,
        error
      };
    }

    console.log(`📧 [EmailService] Recipient: ${adminEmail}`);
    console.log(`📧 [EmailService] Order items: ${orderDetails.items?.length || 0}`);

    const transporter = createEmailTransporter();
    const mailOptions = {
      from: `"Grand Son Project" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `🛒 Nouvelle commande #${orderDetails.orderNumber}`,
      html: getAdminNewOrderTemplate(orderDetails)
    };

    const result = await transporter.sendMail(mailOptions);
    const duration = Date.now() - startTime;
    
    console.log(`✅ [EmailService] Admin notification email sent successfully`);
    console.log(`📧 [EmailService] Message ID: ${result.messageId}`);
    console.log(`⏱️  [EmailService] Duration: ${duration}ms`);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [EmailService] Error sending admin notification:`);
    console.error(`📄 [EmailService] Error message: ${error.message}`);
    console.error(`📄 [EmailService] Error stack:`, error.stack);
    console.log(`⏱️  [EmailService] Duration: ${duration}ms`);
    
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  sendCustomerConfirmation,
  sendAdminNotification
};
