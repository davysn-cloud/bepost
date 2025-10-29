import nodemailer from 'nodemailer';
import { EmailOptions } from '../types';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'BePost <noreply@bepost.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendStatusChangeEmail = async (
  to: string,
  postTitle: string,
  oldStatus: string,
  newStatus: string,
  postUrl: string
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Status do Post Atualizado</h2>
      <p>O status do post "<strong>${postTitle}</strong>" foi alterado.</p>
      <p><strong>Status anterior:</strong> ${oldStatus}</p>
      <p><strong>Novo status:</strong> ${newStatus}</p>
      <p style="margin-top: 20px;">
        <a href="${postUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          Ver Post
        </a>
      </p>
    </div>
  `;

  await sendEmail({
    to,
    subject: `Status Atualizado: ${postTitle}`,
    html,
  });
};

export const sendApprovalRequestEmail = async (
  to: string,
  postTitle: string,
  approvalUrl: string
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Novo Post para Aprovação</h2>
      <p>O post "<strong>${postTitle}</strong>" está pronto para sua aprovação.</p>
      <p>Clique no botão abaixo para revisar e aprovar o conteúdo:</p>
      <p style="margin-top: 20px;">
        <a href="${approvalUrl}" style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          Revisar e Aprovar
        </a>
      </p>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        Este link é único e não requer login. Compartilhe com cuidado.
      </p>
    </div>
  `;

  await sendEmail({
    to,
    subject: `Aprovação Necessária: ${postTitle}`,
    html,
  });
};

export const sendNewCommentEmail = async (
  to: string,
  postTitle: string,
  commentAuthor: string,
  commentContent: string,
  postUrl: string
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Novo Comentário no Post</h2>
      <p><strong>${commentAuthor}</strong> comentou no post "<strong>${postTitle}</strong>":</p>
      <blockquote style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
        ${commentContent}
      </blockquote>
      <p style="margin-top: 20px;">
        <a href="${postUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          Ver Comentário
        </a>
      </p>
    </div>
  `;

  await sendEmail({
    to,
    subject: `Novo Comentário: ${postTitle}`,
    html,
  });
};

export const sendPostPublishedEmail = async (
  to: string,
  postTitle: string,
  instagramUrl: string
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Post Publicado com Sucesso!</h2>
      <p>O post "<strong>${postTitle}</strong>" foi publicado no Instagram.</p>
      <p style="margin-top: 20px;">
        <a href="${instagramUrl}" style="background-color: #E4405F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          Ver no Instagram
        </a>
      </p>
    </div>
  `;

  await sendEmail({
    to,
    subject: `Post Publicado: ${postTitle}`,
    html,
  });
};
