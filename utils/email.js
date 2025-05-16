import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bahaamohammed012003@gmail.com',
    pass: 'pqpr hocv ylcl ilxp'
  }
});

export const sendEmail = async (to, subject, resetLink) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; background-color: #f7f7f7; border-radius: 10px;">
      <h2 style="color: #3c3c3c;">🚀 ChainFlow - Smart Supply Chain Platform</h2>
      <p style="color: #333;">أهلاً بك في منصة <strong>ChainFlow</strong>!</p>
      <p style="color: #333;">لقد طلبت إعادة تعيين كلمة المرور الخاصة بك. اضغط على الزر التالي لتحديثها:</p>
      <a href="${resetLink}" 
         style="display: inline-block; margin-top: 20px; background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">
        إعادة تعيين كلمة المرور
      </a>
      <p style="color: #666; margin-top: 30px;">إذا لم تطلب هذا، يمكنك تجاهل الرسالة.</p>
      <hr style="margin-top: 40px;"/>
      <small style="color: #999;">© ${new Date().getFullYear()} ChainFlow Inc.</small>
    </div>
  `;

  const mailOptions = {
    from: '"ChainFlow" <bahaamohammed012003@gmail.com>',
    to,
    subject,
    html: htmlContent
  };

  await transporter.sendMail(mailOptions);
};

export const sendTeamInviteEmail = async (to, inviteLink, invitedBy) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; background-color: #f9f9f9; border-radius: 10px;">
      <h2 style="color: #3c3c3c;">🤝 دعوة للانضمام إلى فريق ChainFlow</h2>
      <p style="color: #333;">${invitedBy} قام بدعوتك للانضمام إلى فريق عمله في منصة <strong>ChainFlow</strong>.</p>
      <p style="color: #333;">اضغط على الزر التالي لإنشاء حسابك:</p>
      <a href="${inviteLink}" 
         style="display: inline-block; margin-top: 20px; background-color: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px;">
        إكمال التسجيل
      </a>
      <p style="color: #666; margin-top: 30px;">إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل الرسالة.</p>
      <hr style="margin-top: 40px;"/>
      <small style="color: #999;">© ${new Date().getFullYear()} ChainFlow Inc.</small>
    </div>
  `;

  const mailOptions = {
    from: '"ChainFlow" <bahaamohammed012003@gmail.com>',
    to,
    subject: 'دعوة للانضمام إلى فريق ChainFlow',
    html: htmlContent
  };

  await transporter.sendMail(mailOptions);
};
