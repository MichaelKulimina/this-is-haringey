import { Resend } from 'resend'

// Lazy singleton — only initialised at runtime, not at build time.
let _resend: Resend | undefined
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.EMAIL_API_KEY ?? 'missing')
  }
  return _resend
}

const FROM = process.env.EMAIL_FROM_ADDRESS ?? 'hello@thisisharingey.co.uk'
const ADMIN = process.env.ADMIN_EMAIL ?? ''
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://thisisharingey.co.uk'

// ─── Shared template wrapper ──────────────────────────────────────────────────

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F5F0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F0;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#E05A2B;padding:20px 32px;">
            <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.20em;text-transform:uppercase;color:#FFFFFF;">THIS IS</p>
            <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.04em;color:#FFFFFF;">Haringey<span style="color:#FFFFFF;">.</span></p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="background:#F7F5F0;padding:16px 32px;border-top:1px solid #E5E2DB;">
            <p style="margin:0;font-size:12px;color:#888;text-align:center;">
              This Is Haringey · Your guide to events in the London Borough of Haringey<br>
              Part of <a href="https://thisisharingey.co.uk" style="color:#E05A2B;">Haringey Borough of Culture 2027</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

const h1 = (text: string) =>
  `<h1 style="margin:0 0 16px;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#1A1A1A;">${text}</h1>`

const p = (text: string) =>
  `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#444;">${text}</p>`

const cta = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;padding:12px 24px;background:#E05A2B;color:#FFFFFF;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:-0.01em;">${label}</a>`

const quote = (text: string) =>
  `<blockquote style="margin:0 0 16px;padding:12px 16px;border-left:3px solid #E05A2B;background:#FDF5F1;font-size:14px;color:#444;line-height:1.6;">${text}</blockquote>`

// ─── Email functions ──────────────────────────────────────────────────────────

export async function sendSubmissionConfirmation(
  to: string,
  eventName: string,
  submissionId: string
): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: `We've received your submission — ${eventName}`,
      html: wrap(`
        ${h1(`Thanks for submitting "${eventName}"`)}
        ${p("We've received your listing and our team will review it within <strong>3 business days</strong>. We'll email you as soon as there's an update.")}
        <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #E5E2DB;border-radius:6px;margin-bottom:24px;">
          <tr><td style="padding:12px 16px;background:#F7F5F0;border-bottom:1px solid #E5E2DB;font-size:13px;font-weight:600;color:#1A1A1A;">What happens next</td></tr>
          <tr><td style="padding:16px;font-size:14px;color:#444;line-height:1.8;">
            <ol style="margin:0;padding-left:20px;">
              <li>Our team reviews your submission for accuracy and community guidelines</li>
              <li>If approved, your listing goes live on This Is Haringey</li>
              <li>If we need more information, we'll contact you at this email</li>
            </ol>
          </td></tr>
        </table>
        ${p('If you have any questions, reply to this email and we\'ll get back to you.')}
        ${p('— The This Is Haringey team')}
      `),
    })
  } catch (err) {
    console.error('[email] sendSubmissionConfirmation failed:', err)
  }
}

export async function sendAdminNotification(
  eventName: string,
  submissionId: string,
  organiserEmail: string
): Promise<void> {
  if (!ADMIN) {
    console.warn('[email] ADMIN_EMAIL not set — skipping admin notification')
    return
  }
  try {
    await getResend().emails.send({
      from: FROM,
      to: ADMIN,
      subject: `New submission: ${eventName}`,
      html: wrap(`
        ${h1('New event submission')}
        ${p(`<strong>${eventName}</strong> has been submitted and is awaiting review.`)}
        <table cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #E5E2DB;border-radius:6px;margin-bottom:24px;">
          <tr><td style="padding:10px 16px;border-bottom:1px solid #E5E2DB;font-size:13px;"><strong>Organiser:</strong> ${organiserEmail}</td></tr>
          <tr><td style="padding:10px 16px;font-size:13px;"><strong>Submission ID:</strong> ${submissionId}</td></tr>
        </table>
        <p style="margin:0 0 24px;">${cta(`${BASE_URL}/admin/submissions/${submissionId}`, 'Review submission →')}</p>
      `),
    })
  } catch (err) {
    console.error('[email] sendAdminNotification failed:', err)
  }
}

export async function sendApprovalEmail(
  to: string,
  eventName: string,
  eventId: string
): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: `Your event is live — ${eventName}`,
      html: wrap(`
        ${h1('Great news — your event is live!')}
        ${p(`<strong>${eventName}</strong> has been approved and is now live on This Is Haringey.`)}
        <p style="margin:0 0 24px;">${cta(`${BASE_URL}/events/${eventId}`, 'View your listing →')}</p>
        ${p('Share your listing with your community, on social media, and anywhere else your audience hangs out. The more people who know about it, the better!')}
        ${p('— The This Is Haringey team')}
      `),
    })
  } catch (err) {
    console.error('[email] sendApprovalEmail failed:', err)
  }
}

export async function sendReturnEmail(
  to: string,
  eventName: string,
  feedback: string
): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: `Your submission needs attention — ${eventName}`,
      html: wrap(`
        ${h1('Your submission needs a small update')}
        ${p(`We've reviewed <strong>${eventName}</strong> and have some feedback before we can publish it.`)}
        ${quote(feedback)}
        ${p('Please reply to this email with your updates and we\'ll review your listing again. You won\'t need to pay the listing fee a second time.')}
        ${p('— The This Is Haringey team')}
      `),
    })
  } catch (err) {
    console.error('[email] sendReturnEmail failed:', err)
  }
}

export async function sendReReviewNotification(
  eventName: string,
  submissionId: string
): Promise<void> {
  if (!ADMIN) {
    console.warn('[email] ADMIN_EMAIL not set — skipping re-review notification')
    return
  }
  try {
    await getResend().emails.send({
      from: FROM,
      to: ADMIN,
      subject: `Re-review requested: ${eventName}`,
      html: wrap(`
        ${h1('Re-review requested')}
        ${p(`An organiser has submitted changes to <strong>${eventName}</strong> for re-review.`)}
        ${p('The existing published listing remains live until you approve this re-review submission.')}
        <p style="margin:0 0 24px;">${cta(`${BASE_URL}/admin/submissions/${submissionId}`, 'Review changes →')}</p>
      `),
    })
  } catch (err) {
    console.error('[email] sendReReviewNotification failed:', err)
  }
}

export async function sendWithdrawalConfirmedEmail(
  to: string,
  eventName: string
): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: `Your listing has been withdrawn — ${eventName}`,
      html: wrap(`
        ${h1('Your listing has been withdrawn')}
        ${p(`<strong>${eventName}</strong> has been removed from This Is Haringey as requested.`)}
        ${p('If you wish to relist this event in the future, you can submit a new listing at any time.')}
        <p style="margin:0 0 24px;">${cta(`${BASE_URL}/submit`, 'Submit a new listing →')}</p>
        ${p('— The This Is Haringey team')}
      `),
    })
  } catch (err) {
    console.error('[email] sendWithdrawalConfirmedEmail failed:', err)
  }
}

export async function sendRejectionEmail(
  to: string,
  eventName: string,
  reason: string
): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: `Update on your submission — ${eventName}`,
      html: wrap(`
        ${h1('Update on your submission')}
        ${p(`Thank you for submitting <strong>${eventName}</strong> to This Is Haringey. Unfortunately we're unable to list this event on the platform.`)}
        ${quote(reason)}
        ${p('A full refund of <strong>£10.00</strong> has been issued to your original payment method. Please allow 5–10 business days for it to appear on your statement.')}
        ${p('If you have any questions about this decision, please reply to this email.')}
        ${p('— The This Is Haringey team')}
      `),
    })
  } catch (err) {
    console.error('[email] sendRejectionEmail failed:', err)
  }
}
