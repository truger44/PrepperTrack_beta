import { NotificationSettings } from '../types';

/**
 * Email Service for PrepperTrack
 * Handles sending emails through various providers
 */

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send email using the configured provider
 */
export async function sendEmail(
  options: EmailOptions,
  settings: NotificationSettings
): Promise<{ success: boolean; message?: string }> {
  if (!settings.emailNotifications || !settings.emailProvider || settings.emailProvider === 'none') {
    return { success: false, message: 'Email notifications are disabled or not configured' };
  }

  if (!settings.emailConfig?.toEmail) {
    return { success: false, message: 'Recipient email address is not configured' };
  }

  try {
    switch (settings.emailProvider) {
      case 'sendgrid':
        return await sendWithSendGrid(options, settings);
      case 'mailgun':
        return await sendWithMailgun(options, settings);
      case 'twilio':
        return await sendWithTwilio(options, settings);
      case 'pushbullet':
        return await sendWithPushbullet(options, settings);
      case 'smtp':
        return await sendWithSMTP(options, settings);
      default:
        return { success: false, message: 'Unknown email provider' };
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error sending email' 
    };
  }
}

/**
 * Send email using SendGrid
 */
async function sendWithSendGrid(
  options: EmailOptions,
  settings: NotificationSettings
): Promise<{ success: boolean; message?: string }> {
  // In a real implementation, you would use the @sendgrid/mail package
  // For this demo, we'll simulate the API call
  
  const config = settings.emailConfig;
  if (!config?.apiKey || !config.fromEmail) {
    return { success: false, message: 'SendGrid configuration is incomplete' };
  }

  // Simulate API call
  console.log('[SendGrid] Sending email:', {
    to: options.to,
    from: { email: config.fromEmail, name: config.fromName || 'PrepperTrack' },
    subject: options.subject,
    text: options.text,
    html: options.html || options.text,
  });

  // In a real implementation, you would do:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(config.apiKey);
  await sgMail.send({
    to: options.to,
    from: { email: config.fromEmail, name: config.fromName || 'PrepperTrack' },
    subject: options.subject,
    text: options.text,
    html: options.html || options.text,
  });
  */

  return { success: true };
}

/**
 * Send email using Mailgun
 */
async function sendWithMailgun(
  options: EmailOptions,
  settings: NotificationSettings
): Promise<{ success: boolean; message?: string }> {
  // In a real implementation, you would use the mailgun-js package
  // For this demo, we'll simulate the API call
  
  const config = settings.emailConfig;
  if (!config?.apiKey || !config.domain || !config.fromEmail) {
    return { success: false, message: 'Mailgun configuration is incomplete' };
  }

  // Simulate API call
  console.log('[Mailgun] Sending email:', {
    from: `${config.fromName || 'PrepperTrack'} <${config.fromEmail}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || options.text,
  });

  // In a real implementation, you would do:
  /*
  const mailgun = require('mailgun-js')({
    apiKey: config.apiKey,
    domain: config.domain,
  });
  
  await mailgun.messages().send({
    from: `${config.fromName || 'PrepperTrack'} <${config.fromEmail}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || options.text,
  });
  */

  return { success: true };
}

/**
 * Send SMS using Twilio
 */
async function sendWithTwilio(
  options: EmailOptions,
  settings: NotificationSettings
): Promise<{ success: boolean; message?: string }> {
  // In a real implementation, you would use the twilio package
  // For this demo, we'll simulate the API call
  
  const config = settings.emailConfig;
  if (!config?.accountSid || !config.authToken || !config.fromPhone || !config.toPhone) {
    return { success: false, message: 'Twilio configuration is incomplete' };
  }

  // Simulate API call
  console.log('[Twilio] Sending SMS:', {
    from: config.fromPhone,
    to: config.toPhone,
    body: `${options.subject}: ${options.text.substring(0, 140)}...`,
  });

  // In a real implementation, you would do:
  /*
  const twilio = require('twilio')(config.accountSid, config.authToken);
  
  await twilio.messages.create({
    from: config.fromPhone,
    to: config.toPhone,
    body: `${options.subject}: ${options.text.substring(0, 140)}...`,
  });
  */

  return { success: true };
}

/**
 * Send notification using Pushbullet
 */
async function sendWithPushbullet(
  options: EmailOptions,
  settings: NotificationSettings
): Promise<{ success: boolean; message?: string }> {
  // In a real implementation, you would use the pushbullet package
  // For this demo, we'll simulate the API call
  
  const config = settings.emailConfig;
  if (!config?.accessToken) {
    return { success: false, message: 'Pushbullet configuration is incomplete' };
  }

  // Simulate API call
  console.log('[Pushbullet] Sending notification:', {
    type: 'note',
    title: options.subject,
    body: options.text,
  });

  // In a real implementation, you would do:
  /*
  const PushBullet = require('pushbullet');
  const pusher = new PushBullet(config.accessToken);
  
  await pusher.note({}, options.subject, options.text);
  */

  return { success: true };
}

/**
 * Send email using SMTP
 */
async function sendWithSMTP(
  options: EmailOptions,
  settings: NotificationSettings
): Promise<{ success: boolean; message?: string }> {
  // In a real implementation, you would use the nodemailer package
  // For this demo, we'll simulate the API call
  
  const config = settings.emailConfig;
  if (!config?.host || !config.port || !config.username || !config.password || !config.fromEmail) {
    return { success: false, message: 'SMTP configuration is incomplete' };
  }

  // Simulate API call
  console.log('[SMTP] Sending email:', {
    from: `${config.fromName || 'PrepperTrack'} <${config.fromEmail}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || options.text,
  });

  // In a real implementation, you would do:
  /*
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: parseInt(config.port),
    secure: parseInt(config.port) === 465,
    auth: {
      user: config.username,
      pass: config.password,
    },
  });
  
  await transporter.sendMail({
    from: `${config.fromName || 'PrepperTrack'} <${config.fromEmail}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html || options.text,
  });
  */

  return { success: true };
}

/**
 * Generate HTML email template for expiration notifications
 */
export function generateExpirationEmailTemplate(
  items: { name: string; expirationDate: string; daysRemaining: number }[]
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; border: 1px solid #eee; border-radius: 0 0 5px 5px; }
        .item { padding: 10px; margin-bottom: 10px; border-bottom: 1px solid #eee; }
        .critical { color: #dc3545; }
        .warning { color: #ffc107; }
        .footer { margin-top: 20px; font-size: 12px; color: #6c757d; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>PrepperTrack Expiration Alert</h2>
        </div>
        <div class="content">
          <p>The following items in your inventory are expiring soon:</p>
          
          <div class="items">
            ${items.map(item => `
              <div class="item">
                <h3 class="${item.daysRemaining <= 7 ? 'critical' : 'warning'}">${item.name}</h3>
                <p>Expires on: <strong>${new Date(item.expirationDate).toLocaleDateString()}</strong></p>
                <p>Days remaining: <strong>${item.daysRemaining}</strong></p>
              </div>
            `).join('')}
          </div>
          
          <p>Please check your inventory and take appropriate action.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from PrepperTrack. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate weekly digest email for upcoming expirations
 */
export function generateWeeklyDigestEmail(
  items: { name: string; expirationDate: string; daysRemaining: number }[]
): string {
  // Group items by expiration timeframe
  const critical = items.filter(item => item.daysRemaining <= 7);
  const warning = items.filter(item => item.daysRemaining > 7 && item.daysRemaining <= 30);
  const upcoming = items.filter(item => item.daysRemaining > 30 && item.daysRemaining <= 90);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; border: 1px solid #eee; border-radius: 0 0 5px 5px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .critical { color: #dc3545; }
        .warning { color: #ffc107; }
        .upcoming { color: #17a2b8; }
        .item { padding: 8px; margin-bottom: 5px; border-bottom: 1px solid #eee; }
        .footer { margin-top: 20px; font-size: 12px; color: #6c757d; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>PrepperTrack Weekly Expiration Digest</h2>
        </div>
        <div class="content">
          <p>Here's a summary of items in your inventory that are expiring soon:</p>
          
          ${critical.length > 0 ? `
            <div class="section">
              <div class="section-title critical">Critical (Expiring within 7 days)</div>
              ${critical.map(item => `
                <div class="item">
                  <strong>${item.name}</strong> - Expires in ${item.daysRemaining} days (${new Date(item.expirationDate).toLocaleDateString()})
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${warning.length > 0 ? `
            <div class="section">
              <div class="section-title warning">Warning (Expiring within 30 days)</div>
              ${warning.map(item => `
                <div class="item">
                  <strong>${item.name}</strong> - Expires in ${item.daysRemaining} days (${new Date(item.expirationDate).toLocaleDateString()})
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${upcoming.length > 0 ? `
            <div class="section">
              <div class="section-title upcoming">Upcoming (Expiring within 90 days)</div>
              ${upcoming.map(item => `
                <div class="item">
                  <strong>${item.name}</strong> - Expires in ${item.daysRemaining} days (${new Date(item.expirationDate).toLocaleDateString()})
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${items.length === 0 ? `
            <p>No items are expiring soon. Great job keeping your inventory fresh!</p>
          ` : ''}
          
          <p>Please check your inventory and take appropriate action.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from PrepperTrack. Please do not reply to this email.</p>
          <p>You're receiving this because you've enabled weekly expiration digests in your notification settings.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}