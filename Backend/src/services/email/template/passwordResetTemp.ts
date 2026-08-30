export const passwordResetTemplate = (
  name: string,
  resetUrl: string,
) => {
  return {
    subject: "Password Reset",

    text: `
Hello ${name},

We received a request to reset your password.

Please click the link below to reset your password:

${resetUrl}

This reset link will expire soon.

If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.

Thanks,
Auth Service
    `,

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Password Reset</title>
        </head>

        <body>
          <div>
            <h2>Password Reset</h2>

            <p>Hello ${name},</p>

            <p>
              We received a request to reset your password. Click the
              button below to create a new one.
            </p>

            <a href="${resetUrl}">
              Reset Password
            </a>

            <p>
              This reset link will expire soon.
            </p>

            <p>
              If you did not request this password reset, you can safely
              ignore this email. Your password will remain unchanged.
            </p>

            <p>Thanks,<br />Auth Service</p>
          </div>
        </body>
      </html>
    `,
  };
};