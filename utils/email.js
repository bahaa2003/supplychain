import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bahaamohammed012003@gmail.com",
    pass: "pqpr hocv ylcl ilxp",
  },
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
    html: htmlContent,
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
    subject: "دعوة للانضمام إلى فريق ChainFlow",
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

export const sendValidEmail = async (to) => {
  const token = jwt.sign({ email: to }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const htmlContent = `
<head>
  <title>Email Verification</title>
  <!--[if !mso]><!-- -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <style type="text/css">
    #outlook a { padding: 0; }
    .ReadMsgBody { width: 100%; }
    .ExternalClass { width: 100%; }
    .ExternalClass * { line-height:100%; }
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { border-collapse:collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    p { display: block; margin: 13px 0; }
  </style>
  <!--[if !mso]><!-->
  <style type="text/css">
    @media only screen and (max-width:480px) {
      @-ms-viewport { width:320px; }
      @viewport { width:320px; }
    }
  </style>
  <!--<![endif]-->
  <!--[if mso]>
  <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml>
  <![endif]-->
  <!--[if lte mso 11]>
  <style type="text/css">
    .outlook-group-fix {
      width:100% !important;
    }
  </style>
  <![endif]-->

  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
  <style type="text/css">
    @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
  </style>
  <!--<![endif]-->
  <style type="text/css">
    @media only screen and (min-width:480px) {
      .mj-column-per-100, * [aria-labelledby="mj-column-per-100"] { width:100%!important; }
    }
  </style>
</head>
<body style="background: #F9F9F9;">
  <div style="background-color:#F9F9F9;">
    <div style="margin:0px auto;max-width:640px;background:transparent;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:transparent;" align="center" border="0">
        <tbody>
          <tr>
            <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:40px 0px;">
              <div aria-labelledby="mj-column-per-100" class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                  <tbody>
                    <tr>
                      <td style="word-break:break-word;font-size:0px;padding:0px;" align="center">
                        <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px;" align="center" border="0">
                          <tbody>
                            <tr>
                              <td style="width:138px;">
                                <a href="#" target="_blank">
                                  <img alt="Logo" title="Logo"  src="https://logos.textgiraffe.com/logos/logo-name/Bahaa-designstyle-smoothie-m.png" style="border:none;border-radius:;display:block;outline:none;text-decoration:none;width:100%; width="138">
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="max-width:640px;margin:0 auto;box-shadow:0px 1px 5px rgba(0,0,0,0.1);border-radius:4px;overflow:hidden">
      <div style="margin:0px auto;max-width:640px;background:#7289DA;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#7289DA;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:57px;">
                <div style="cursor:auto;color:white;font-family:Ubuntu, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-size:36px;font-weight:600;line-height:36px;text-align:center;">Welcome!</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="margin:0px auto;max-width:640px;background:#ffffff;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#ffffff;" align="center" border="0">
          <tbody>
            <tr>
              <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:40px 70px;">
                <div aria-labelledby="mj-column-per-100" class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                    <tbody>
                      <tr>
                        <td style="word-break:break-word;font-size:0px;padding:0px 0px 20px;" align="left">
                          <div style="cursor:auto;color:#737F8D;font-family:Ubuntu, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-size:16px;line-height:24px;text-align:left;">
                            <h2 style="font-family: Ubuntu, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-weight: 500;font-size: 20px;color: #4F545C;letter-spacing: 0.27px;">Hello,</h2>
                            <p>Thank you for registering an account with us! You're just one step away from getting started.</p>
                            <p>Please verify your email address by clicking the button below:</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="word-break:break-word;font-size:0px;padding:10px 25px;" align="center">
                          <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;" align="center" border="0">
                            <tbody>
                              <tr>
                                <td style="border:none;border-radius:3px;color:white;cursor:auto;padding:15px 19px;" align="center" valign="middle" bgcolor="#7289DA">
                                  <a href="http://localhost:${process.env.PORT}/api/auth/verify/${token}" style="text-decoration:none;line-height:100%;background:#7289DA;color:white;font-family:Ubuntu, Helvetica Neue, Helvetica, Arial, sans-serif;font-size:15px;font-weight:normal;text-transform:none;margin:0px;" target="_blank">
                                    Verify Email
                                  </a>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div style="margin:0px auto;max-width:640px;background:transparent;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:transparent;" align="center" border="0">
        <tbody>
          <tr>
            <td style="text-align:center;vertical-align:top;direction:ltr;font-size:0px;padding:20px 0px;">
              <div aria-labelledby="mj-column-per-100" class="mj-column-per-100 outlook-group-fix" style="vertical-align:top;display:inline-block;direction:ltr;font-size:13px;text-align:left;width:100%;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                  <tbody>
                    <tr>
                      <td style="word-break:break-word;font-size:0px;padding:0px;" align="center">
                        <div style="cursor:auto;color:#99AAB5;font-family:Ubuntu, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif;font-size:12px;line-height:24px;text-align:center;">
                          Sent by YourApp • <a href="#" style="color:#1EB0F4;text-decoration:none;" target="_blank">Visit our website</a>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
`;

  const mailOptions = {
    from: '"ChainFlow" <bahaamohammed012003@gmail.com>',
    to,
    subject: "Hello ✔",
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};
