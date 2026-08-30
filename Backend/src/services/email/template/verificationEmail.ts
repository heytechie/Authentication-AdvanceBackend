export const verificationEmailTemplate = (
  name: string,
  verificationUrl: string,
) => {
  return {
    subject: "Verify your email address",

    text: `
Hello ${name},

Thanks for signing up.

Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire soon.

If you did not create this account, you can safely ignore this email.

Thanks,
Auth Service
    `,

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verify your email</title>
        </head>

        <body>
          <div>
            <h2>Verify your email address</h2>

            <p>Hello ${name},</p>

            <p>
              Thanks for signing up. Please verify your email address
              by clicking the button below.
            </p>

            <a href="${verificationUrl}">
              Verify Email
            </a>

            <p>
              This verification link will expire soon.
            </p>

            <p>
              If you did not create this account, you can safely ignore
              this email.
            </p>

            <p>Thanks,<br />Auth Service</p>
          </div>
        </body>
      </html>
    `,
  };
};