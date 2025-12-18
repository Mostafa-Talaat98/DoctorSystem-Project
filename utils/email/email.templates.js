export const confirmEmailTemplate = async ({ otp }) => {
  return `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; background-color: #f4f7fb; color: #333; max-width: 600px; margin: auto; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); text-align: center;">
    
    <h2 style="color: #2c3e50; margin-bottom: 10px;">🩺 Email Verification</h2>

    <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px;">
        Welcome to <strong style="color:#4a90e2;">Doctor Appointment</strong>.
    </p>

    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
        To complete your registration and start booking appointments, please use the verification code below:
    </p>

    <div style="margin: 20px auto; padding: 18px 35px; background: linear-gradient(135deg,#e3f2fd,#f1f8ff); border: 2px dashed #4a90e2; border-radius: 12px; display: inline-block; font-size: 26px; letter-spacing: 5px; font-weight: bold; color:#2c3e50; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
        ${otp}
    </div>

    <p style="font-size: 14px; color: #555; line-height: 1.6; margin: 20px 0;">
        This code is valid for <strong>5 minutes</strong> only.<br>
        If you did not request this verification, please ignore this email.
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 13px; color: #888; margin: 0;">
        Wishing you good health,<br>
        <strong style="color:#4a90e2;">Doctor Appointment Team</strong><br>
        <span style="font-size: 12px; color:#aaa;">System Notification</span>
    </p>
  </div>
  `;
};