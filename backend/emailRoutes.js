const express = require('express');
const nodemailer = require('nodemailer');
const { orderConfirmationEmail } = require('./emailTemplates');

const router = express.Router();

console.log('📧 Email routes loaded successfully');

// Route de test
router.get('/test', (req, res) => {
  res.json({ message: 'Email routes are working!' });
});

// Configuration du transporteur email
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

// Template d'email pour la confirmation client (utilise le template moderne)
const getCustomerOrderConfirmationTemplate = (orderDetails) => {
  // Transformer les données pour correspondre au format attendu par orderConfirmationEmail
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

// Template alternatif simple (backup)
const getSimpleCustomerOrderConfirmationTemplate = (orderDetails) => {
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/100x100/10b981/ffffff?text=Produit';
    
    // Si c'est déjà une URL complète
    if (imagePath.startsWith('http')) return imagePath;
    
    // Si c'est un chemin local, construire l'URL complète
    const baseUrl = process.env.PUBLIC_URL || process.env.BACKEND_URL || 'http://localhost:3000';
    return `${baseUrl}/${imagePath.replace(/^\/+/, '')}`;
  };

  const itemsHtml = orderDetails.items.map(item => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="120" style="padding-right: 20px;">
              <img src="${getImageUrl(item.image)}" 
                   alt="${item.name}" 
                   style="width: 100px; height: 100px; object-fit: cover; border-radius: 12px; border: 2px solid #f3f4f6; display: block;"
                   width="100" height="100"
                   onerror="this.src='https://via.placeholder.com/100x100/10b981/ffffff?text=Produit'">
            </td>
            <td style="vertical-align: middle;">
              <div style="margin-bottom: 8px;">
                <strong style="font-size: 17px; color: #111827;">${item.name}</strong>
              </div>
              ${item.size ? `<div style="margin-bottom: 8px;">
                <span style="display: inline-block; background-color: #f3f4f6; color: #6b7280; padding: 4px 12px; border-radius: 6px; font-size: 13px;">
                  Taille: <strong>${item.size}</strong>
                </span>
              </div>` : ''}
              <div style="margin-bottom: 8px;">
                <span style="display: inline-block; background-color: #f3f4f6; color: #6b7280; padding: 4px 12px; border-radius: 6px; font-size: 13px;">
                  Qté: <strong>${item.quantity}</strong>
                </span>
              </div>
              <div>
                <strong style="color: #10b981; font-size: 18px;">${(item.price * item.quantity).toLocaleString()} GNF</strong>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmation de commande</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; max-width: 600px;">
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px;">✅ Commande Confirmée</h1>
                  <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Commande #${orderDetails.orderNumber}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <h2 style="color: #111827; margin: 0 0 20px 0;">Bonjour ${orderDetails.customerName},</h2>
                  <p style="color: #6b7280; margin: 0 0 20px 0;">Merci pour votre commande ! Voici le récapitulatif :</p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin: 20px 0;">
                    ${itemsHtml}
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <tr>
                      <td style="padding: 8px 0; color: #6b7280;">Frais de livraison</td>
                      <td align="right" style="padding: 8px 0; color: #111827;"><strong>${orderDetails.deliveryFee.toLocaleString()} GNF</strong></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-top: 2px solid #d1d5db; color: #111827;"><strong>Total</strong></td>
                      <td align="right" style="padding: 8px 0; border-top: 2px solid #d1d5db; color: #10b981;"><strong style="font-size: 20px;">${orderDetails.total.toLocaleString()} GNF</strong></td>
                    </tr>
                  </table>

                  <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0; color: #1e3a8a;"><strong>📞 Prochaines étapes :</strong> Notre équipe vous contactera au ${orderDetails.customerPhone} pour confirmer la livraison.</p>
                  </div>

                  <p style="text-align: center; color: #6b7280; margin: 30px 0 0 0;">Merci pour votre confiance ! 🇬🇳</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

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
            <p><strong>Email :</strong> ${orderDetails.customerEmail}</p>
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

const getCustomerOrderValidationTemplate = (orderDetails) => {
  const itemsHtml = orderDetails.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString()} GNF</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Commande validée</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 5px; overflow: hidden; }
        .order-table th { background: #28a745; color: white; padding: 15px; text-align: left; }
        .order-table td { padding: 10px; border-bottom: 1px solid #eee; }
        .total-row { background: #f0f0f0; font-weight: bold; }
        .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #28a745; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🏪 GRAND SON PROJECT</div>
          <h1 style="margin: 15px 0 10px 0; font-size: 24px;">🎉 Commande Validée</h1>
          <p style="font-size: 18px; margin: 0; opacity: 0.9;">Commande #${orderDetails.orderNumber}</p>
        </div>
        <div class="content">
          <div class="success-box" style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); border: 2px solid #28a745; padding: 25px; margin: 25px 0; border-radius: 12px; text-align: center;">
            <h3 style="color: #155724; margin-bottom: 15px; font-size: 20px;">✅ Excellente nouvelle !</h3>
            <p style="color: #155724; font-size: 16px; margin: 0;">Votre commande a été <strong>validée</strong> par notre équipe et est maintenant <strong>en cours de préparation</strong>.</p>
          </div>

          <h2 style="color: #2c5aa0; margin-bottom: 20px;">Bonjour ${orderDetails.customerName},</h2>
          
          <div class="info-box">
            <h3>📋 Récapitulatif de votre commande</h3>
            <p><strong>Numéro :</strong> #${orderDetails.orderNumber}</p>
            <p><strong>Statut :</strong> ✅ Validée - En préparation</p>
            <p><strong>Adresse de livraison :</strong> ${orderDetails.deliveryAddress}</p>
            <p><strong>Zone de livraison :</strong> ${orderDetails.deliveryZone}</p>
          </div>

          <table class="order-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th style="text-align: center;">Quantité</th>
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
                <td colspan="2"><strong>Total</strong></td>
                <td style="text-align: right;"><strong>${orderDetails.total.toLocaleString()} GNF</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="info-box">
            <h3>🚚 Prochaines étapes</h3>
            <p>• Votre commande est en cours de préparation</p>
            <p>• Nous vous contacterons au <strong>${orderDetails.customerPhone}</strong> pour organiser la livraison</p>
            <p>• Vous recevrez une notification dès que votre commande sera expédiée</p>
          </div>

          <p>Merci pour votre confiance et votre patience !</p>
          <p><strong>L'équipe Grand Son Project</strong></p>
        </div>
        <div class="footer">
          <p>📧 ${process.env.CONTACT_EMAIL} | 📱 ${process.env.CONTACT_PHONE}</p>
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Routes
router.post('/send-customer-confirmation', async (req, res) => {
  console.log('📧 Received customer confirmation request');
  try {
    const { orderDetails } = req.body;

    if (!orderDetails || !orderDetails.customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Détails de commande requis'
      });
    }

    console.log('📧 Order items:', JSON.stringify(orderDetails.items, null, 2));

    const transporter = createEmailTransporter();
    const mailOptions = {
      from: `"Grandson Project" <${process.env.SMTP_USER}>`,
      to: orderDetails.customerEmail,
      subject: `✅ Commande confirmée #${orderDetails.orderNumber}`,
      html: getCustomerOrderConfirmationTemplate(orderDetails)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Customer confirmation email sent:', result.messageId);
    
    res.json({
      success: true,
      message: 'Email de confirmation client envoyé avec succès',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('❌ Error sending customer confirmation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email de confirmation client'
    });
  }
});

router.post('/send-admin-notification', async (req, res) => {
  try {
    const { orderDetails } = req.body;

    if (!orderDetails) {
      return res.status(400).json({
        success: false,
        message: 'Détails de commande requis'
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn('ADMIN_EMAIL not configured, skipping admin notification');
      return res.json({
        success: false,
        message: 'Email admin non configuré'
      });
    }

    const transporter = createEmailTransporter();
    const mailOptions = {
      from: `"Grand Son Project" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `🛒 Nouvelle commande #${orderDetails.orderNumber}`,
      html: getAdminNewOrderTemplate(orderDetails)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification email sent:', result.messageId);
    
    res.json({
      success: true,
      message: 'Notification admin envoyée avec succès',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de la notification admin'
    });
  }
});

router.post('/send-validation-confirmation', async (req, res) => {
  try {
    const { orderDetails } = req.body;

    if (!orderDetails || !orderDetails.customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Détails de commande requis'
      });
    }

    const transporter = createEmailTransporter();
    const mailOptions = {
      from: `"Grand Son Project" <${process.env.SMTP_USER}>`,
      to: orderDetails.customerEmail,
      subject: `🎉 Commande validée #${orderDetails.orderNumber}`,
      html: getCustomerOrderValidationTemplate(orderDetails)
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Customer validation email sent:', result.messageId);
    
    res.json({
      success: true,
      message: 'Email de validation envoyé avec succès',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('❌ Error sending validation confirmation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email de validation'
    });
  }
});

module.exports = router;