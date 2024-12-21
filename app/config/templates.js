export const user_email_changed = (data) => {
	const email_subject = `Email changed! ⚠️`;
	const email_text = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Torgist</title>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
			<style>
				* {
					margin-block-start: 0;
					margin-block-end: 0;
					box-sizing: border-box;
				}
				body, p {
					font-family: "Manrope", Arial, sans-serif;
					font-optical-sizing: auto;
					font-weight: 400;
					margin: 0;
					padding: 0;
				}
				p {
					opacity: 0.8;
					margin: 20px 0;
					line-height: 2rem;
					width: 88%;
					font-size: 15.2px;
				}
				a {
					background-color: #B91D47;
					display: block;
					width: 100%;
					padding: 16px;
					border-radius: 8px;
					text-align: center;
					font-size: 14.8px;
					font-weight: 700;
					text-decoration: none;
					color: #FFFFFF;
				}
			</style>
		</head>
		<body style="background-color: #E5E5E5;">
			<div style="padding: 20px 0;">
				<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; color: #000;">
					<img src="https://res.cloudinary.com/dabfoaprr/image/upload/v1729289184/torgist-full-logo_usocln.png"
						alt="Torgist logo" style="max-width: 100px; width: 100%; margin: 20px 0;">

					<hr style="opacity: 0.5;">

					<div id="content">
						<p>Hello @${data.username},</p>
						<p>Your email has been changed, below are your new details to unlock your space, and explore new ways to have fun.</p>
						<p>Email: <span style="font-weight: 700; color: #B91D47;">${data.email}</span></p>
						<p>Password: <span style="font-weight: 700; color: #B91D47;">${data.password}</span></p>

						<hr style="opacity: 0.5; margin: 20px 0;">

						<p>If you have any thoughts or suggestions, message us at <a style="padding: 0; background-color: transparent; color: #B91D47; width: initial; display: inline-block;" href="mailto:support@torgist.com">support@torgist.com</a>. We will love to hear from you.</p>
						<p>With excitement,<br><strong>The Torgist Team</strong></p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`;
	const email_html = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Torgist</title>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
			<style>
				* {
					margin-block-start: 0;
					margin-block-end: 0;
					box-sizing: border-box;
				}
				body, p {
					font-family: "Manrope", Arial, sans-serif;
					font-optical-sizing: auto;
					font-weight: 400;
					margin: 0;
					padding: 0;
				}
				p {
					opacity: 0.8;
					margin: 20px 0;
					line-height: 2rem;
					width: 88%;
					font-size: 15.2px;
				}
				a {
					background-color: #B91D47;
					display: block;
					width: 100%;
					padding: 16px;
					border-radius: 8px;
					text-align: center;
					font-size: 14.8px;
					font-weight: 700;
					text-decoration: none;
					color: #FFFFFF;
				}
			</style>
		</head>
		<body style="background-color: #E5E5E5;">
			<div style="padding: 20px 0;">
				<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; color: #000;">
					<img src="https://res.cloudinary.com/dabfoaprr/image/upload/v1729289184/torgist-full-logo_usocln.png"
						alt="Torgist logo" style="max-width: 100px; width: 100%; margin: 20px 0;">

					<hr style="opacity: 0.5;">

					<div id="content">
						<p>Hello @${data.username},</p>
						<p>Your email has been changed, below are your new details to unlock your space, and explore new ways to have fun.</p>
						<p>Email: <span style="font-weight: 700; color: #B91D47;">${data.email}</span></p>
						<p>Password: <span style="font-weight: 700; color: #B91D47;">${data.password}</span></p>

						<hr style="opacity: 0.5; margin: 20px 0;">

						<p>If you have any thoughts or suggestions, message us at <a style="padding: 0; background-color: transparent; color: #B91D47; width: initial; display: inline-block;" href="mailto:support@torgist.com">support@torgist.com</a>. We will love to hear from you.</p>
						<p>With excitement,<br><strong>The Torgist Team</strong></p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`;

	return { email_html, email_subject, email_text };
};

export const user_cancelled_enrollment_fee = (data) => {
	const email_subject = `Enrollment fee cancelled`;
	const email_text = `Dear, ${data.username}, <br/><br/> Your enrollment fee of ${data.amount} has been cancelled <br/><br/>`;
	const email_html = `Dear, ${data.username}, <br/><br/> Your enrollment fee of ${data.amount} has been cancelled <br/><br/>`;

	return { email_html, email_subject, email_text };
};

export const user_complete_enrollment_fee = (data) => {
	const email_subject = `Enrollment fee complete`;
	const email_text = `Dear, ${data.username}, <br/><br/> Your enrollment fee of ${data.amount} has been completed <br/><br/>`;
	const email_html = `Dear, ${data.username}, <br/><br/> Your enrollment fee of ${data.amount} has been completed <br/><br/>`;

	return { email_html, email_subject, email_text };
};

export const user_cancelled_deposit = (data) => {
	const email_subject = `Deposit cancelled`;
	const email_text = `Dear, ${data.username}, <br/><br/> Your deposit of ${data.amount} has been cancelled <br/><br/>`;
	const email_html = `Dear, ${data.username}, <br/><br/> Your deposit of ${data.amount} has been cancelled <br/><br/>`;

	return { email_html, email_subject, email_text };
};

export const user_complete_deposit = (data) => {
	const email_subject = `Deposit complete`;
	const email_text = `Dear, ${data.username}, <br/><br/> Your deposit of ${data.amount} has been completed <br/><br/> New Balance: ${data.balance}`;
	const email_html = `Dear, ${data.username}, <br/><br/> Your deposit of ${data.amount} has been completed <br/><br/> New Balance: ${data.balance}`;

	return { email_html, email_subject, email_text };
};

export const user_cancelled_withdrawal = (data) => {
	const email_subject = `Withdrawal cancelled`;
	const email_text = `Dear, ${data.username}, <br/><br/> Your withdrawal of ${data.amount} has been cancelled <br/><br/>`;
	const email_html = `Dear, ${data.username}, <br/><br/> Your withdrawal of ${data.amount} has been cancelled <br/><br/>`;

	return { email_html, email_subject, email_text };
};

export const user_complete_withdrawal = (data) => {
	const email_subject = `Withdrawal complete`;
	const email_text = `Dear, ${data.username}, <br/><br/> Your withdrawal of ${data.amount} has been completed <br/><br/> New Balance: ${data.balance}`;
	const email_html = `Dear, ${data.username}, <br/><br/> Your withdrawal of ${data.amount} has been completed <br/><br/> New Balance: ${data.balance}`;

	return { email_html, email_subject, email_text };
};

export const user_complete_voting_payment = (data) => {
	const email_subject = `Payment complete for voting`;
	const email_text = `Dear, ${data.username}, <br/><br/> You've received payment for voting transaction with reference - ${data.reference} <br/><br/> Total Received: ${data.amount} <br/><br/> Total Fee: ${data.fee} <br/><br/> New Balance: ${data.balance}`;
	const email_html = `Dear, ${data.username}, <br/><br/> You've received payment for voting transaction with reference - ${data.reference} <br/><br/> Total Received: ${data.amount} <br/><br/> Total Fee: ${data.fee} <br/><br/> New Balance: ${data.balance}`;

	return { email_html, email_subject, email_text };
};

export const user_otp = (data) => {
	const email_subject = `OTP - ${data.otp}`;
	const email_text = `Dear, ${data.username}, <br/><br/> We are sending you this email to provide you with a one-time password (OTP) for
			security to your account. Please keep this OTP confidential and do not share it with anyone. <br/><br/>OTP: ${data.otp} <br/><br/> Expires - ${data.expiring_date} <br/><br/>`;
	const email_html = `Dear, ${data.username}, <br/><br/> We are sending you this email to provide you with a one-time password (OTP) for
			security to your account. Please keep this OTP confidential and do not share it with anyone. <br/><br/>OTP: ${data.otp} <br/><br/> Expires - ${data.expiring_date} <br/><br/>`;

	return { email_html, email_subject, email_text };
};

export const user_welcome = (data) => {
	const email_subject = `Welcome to Torgist!`;
	const email_text = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Torgist</title>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
			<style>
				* {
					margin-block-start: 0;
					margin-block-end: 0;
					box-sizing: border-box;
				}
				body, p {
					font-family: "Manrope", Arial, sans-serif;
					font-optical-sizing: auto;
					font-weight: 400;
					margin: 0;
					padding: 0;
				}
				p {
					opacity: 0.8;
					margin: 20px 0;
					line-height: 2rem;
					width: 88%;
					font-size: 15.2px;
				}
				a {
					background-color: #B91D47;
					display: block;
					width: 100%;
					padding: 16px;
					border-radius: 8px;
					text-align: center;
					font-size: 14.8px;
					font-weight: 700;
					text-decoration: none;
					color: #FFFFFF;
				}
			</style>
		</head>
		<body style="background-color: #E5E5E5;">
			<div style="padding: 20px 0;">
				<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; color: #000;">
					<img src="https://res.cloudinary.com/dabfoaprr/image/upload/v1729289184/torgist-full-logo_usocln.png"
						alt="Torgist logo" style="max-width: 100px; width: 100%; margin: 20px 0;">

					<img src="https://res.cloudinary.com/dabfoaprr/image/upload/v1729374318/ghostliesLittlePalour-email_xkpylf.png" alt="Reply with images feature" style="width: 100%; height: auto;">

					<div id="content">
						<p>Hey @${data.username},</p>
						<p>We're thrilled to have you as part of the Torgist family! 🎉 While we may not be the first to step into this space, we're here to show you how to have fun better.</p>
						<p>At Torgist, we believe that sharing thoughts and experiences should be enjoyable and engaging. We've built a platform that's all about creating memorable moments with friends and community while being anonymous. So, let loose and explore what we have to offer!</p>

						<a style="color: #FFFFFF;" href="https://torgist.com/dashboard?ref=email-tgst-welcome-message-tem1" aria-label="Join the Fun Now!">Join the Fun Now!</a>

						<p>If you have any thoughts or suggestions, message us at <a style="padding: 0; background-color: transparent; color: #B91D47; width: initial; display: inline-block;" href="mailto:support@torgist.com">support@torgist.com</a>. We'd love to hear from you.</p>
						<p>Welcome aboard, and let's make some great memories together!</p>
						<p>Best regards,<br><strong>Gigi & Emmanuel - Creators of Torgist</strong></p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`;
	const email_html = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Torgist</title>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
			<style>
				* {
					margin-block-start: 0;
					margin-block-end: 0;
					box-sizing: border-box;
				}
				body, p {
					font-family: "Manrope", Arial, sans-serif;
					font-optical-sizing: auto;
					font-weight: 400;
					margin: 0;
					padding: 0;
				}
				p {
					opacity: 0.8;
					margin: 20px 0;
					line-height: 2rem;
					width: 88%;
					font-size: 15.2px;
				}
				a {
					background-color: #B91D47;
					display: block;
					width: 100%;
					padding: 16px;
					border-radius: 8px;
					text-align: center;
					font-size: 14.8px;
					font-weight: 700;
					text-decoration: none;
					color: #FFFFFF;
				}
			</style>
		</head>
		<body style="background-color: #E5E5E5;">
			<div style="padding: 20px 0;">
				<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; color: #000;">
					<img src="https://res.cloudinary.com/dabfoaprr/image/upload/v1729289184/torgist-full-logo_usocln.png"
						alt="Torgist logo" style="max-width: 100px; width: 100%; margin: 20px 0;">

					<img src="https://res.cloudinary.com/dabfoaprr/image/upload/v1729374318/ghostliesLittlePalour-email_xkpylf.png" alt="Reply with images feature" style="width: 100%; height: auto;">

					<div id="content">
						<p>Hey @${data.username},</p>
						<p>We're thrilled to have you as part of the Torgist family! 🎉 While we may not be the first to step into this space, we're here to show you how to have fun better.</p>
						<p>At Torgist, we believe that sharing thoughts and experiences should be enjoyable and engaging. We've built a platform that's all about creating memorable moments with friends and community while being anonymous. So, let loose and explore what we have to offer!</p>

						<a style="color: #FFFFFF;" href="https://torgist.com/dashboard?ref=email-tgst-welcome-message-tem1" aria-label="Join the Fun Now!">Join the Fun Now!</a>

						<p>If you have any thoughts or suggestions, message us at <a style="padding: 0; background-color: transparent; color: #B91D47; width: initial; display: inline-block;" href="mailto:support@torgist.com">support@torgist.com</a>. We'd love to hear from you.</p>
						<p>Welcome aboard, and let's make some great memories together!</p>
						<p>Best regards,<br><strong>Gigi & Emmanuel - Creators of Torgist</strong></p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`;

	return { email_html, email_subject, email_text };
};

export const user_welcome_with_password = (data) => {
	const email_subject = `Welcome to Torgist... Shhhh 🤫, Don't tell no one!`;
	const email_text = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Torgist</title>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
			<style>
				* {
					margin-block-start: 0;
					margin-block-end: 0;
					box-sizing: border-box;
				}
				body, p {
					font-family: "Manrope", Arial, sans-serif;
					font-optical-sizing: auto;
					font-weight: 400;
					margin: 0;
					padding: 0;
				}
				p {
					opacity: 0.8;
					margin: 20px 0;
					line-height: 2rem;
					width: 88%;
					font-size: 15.2px;
				}
				a {
					background-color: #B91D47;
					display: block;
					width: 100%;
					padding: 16px;
					border-radius: 8px;
					text-align: center;
					font-size: 14.8px;
					font-weight: 700;
					text-decoration: none;
					color: #FFFFFF;
				}
			</style>
		</head>
		<body style="background-color: #E5E5E5;">
			<div style="padding: 20px 0;">
				<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; color: #000;">
					<img src="https://res.cloudinary.com/dabfoaprr/image/upload/v1729289184/torgist-full-logo_usocln.png"
						alt="Torgist logo" style="max-width: 100px; width: 100%; margin: 20px 0;">

					<hr style="opacity: 0.5;">

					<div id="content">
						<p>Hello @${data.username},</p>
						<p>Your adventure with Torgist starts now! Use the password below to unlock your space, and explore new ways to have fun.</p>
						<p>Password: <span style="font-weight: 700; color: #B91D47;">${data.password}</span></p>

						<hr style="opacity: 0.5; margin: 20px 0;">

						<p>If you have any thoughts or suggestions, message us at <a style="padding: 0; background-color: transparent; color: #B91D47; width: initial; display: inline-block;" href="mailto:support@torgist.com">support@torgist.com</a>. We will love to hear from you.</p>
						<p>With excitement,<br><strong>The Torgist Team</strong></p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`;
	const email_html = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Torgist</title>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
			<style>
				* {
					margin-block-start: 0;
					margin-block-end: 0;
					box-sizing: border-box;
				}
				body, p {
					font-family: "Manrope", Arial, sans-serif;
					font-optical-sizing: auto;
					font-weight: 400;
					margin: 0;
					padding: 0;
				}
				p {
					opacity: 0.8;
					margin: 20px 0;
					line-height: 2rem;
					width: 88%;
					font-size: 15.2px;
				}
				a {
					background-color: #B91D47;
					display: block;
					width: 100%;
					padding: 16px;
					border-radius: 8px;
					text-align: center;
					font-size: 14.8px;
					font-weight: 700;
					text-decoration: none;
					color: #FFFFFF;
				}
			</style>
		</head>
		<body style="background-color: #E5E5E5;">
			<div style="padding: 20px 0;">
				<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; color: #000;">
					<img src="https://res.cloudinary.com/dabfoaprr/image/upload/v1729289184/torgist-full-logo_usocln.png"
						alt="Torgist logo" style="max-width: 100px; width: 100%; margin: 20px 0;">

					<hr style="opacity: 0.5;">

					<div id="content">
						<p>Hello @${data.username},</p>
						<p>Your adventure with Torgist starts now! Use the password below to unlock your space, and explore new ways to have fun.</p>
						<p>Password: <span style="font-weight: 700; color: #B91D47;">${data.password}</span></p>

						<hr style="opacity: 0.5; margin: 20px 0;">

						<p>If you have any thoughts or suggestions, message us at <a style="padding: 0; background-color: transparent; color: #B91D47; width: initial; display: inline-block;" href="mailto:support@torgist.com">support@torgist.com</a>. We will love to hear from you.</p>
						<p>With excitement,<br><strong>The Torgist Team</strong></p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`;
	
	return { email_html, email_subject, email_text };
};

export const password_recovery = (data) => {
	const email_subject = `Password recovery!`;
	const email_text = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Torgist</title>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
			<style>
				* {
					margin-block-start: 0;
					margin-block-end: 0;
					box-sizing: border-box;
				}
				body, p {
					font-family: "Manrope", Arial, sans-serif;
					font-optical-sizing: auto;
					font-weight: 400;
					margin: 0;
					padding: 0;
				}
				p {
					opacity: 0.8;
					margin: 20px 0;
					line-height: 2rem;
					width: 88%;
					font-size: 15.2px;
				}
				a {
					background-color: #B91D47;
					display: block;
					width: 100%;
					padding: 16px;
					border-radius: 8px;
					text-align: center;
					font-size: 14.8px;
					font-weight: 700;
					text-decoration: none;
					color: #FFFFFF;
				}
			</style>
		</head>
		<body style="background-color: #E5E5E5;">
			<div style="padding: 20px 0;">
				<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; color: #000;">
					<img src="https://res.cloudinary.com/dabfoaprr/image/upload/v1729289184/torgist-full-logo_usocln.png"
						alt="Torgist logo" style="max-width: 100px; width: 100%; margin: 20px 0;">

					<hr style="opacity: 0.5;">

					<div id="content">
						<p>Hello @${data.username},</p>
						<p>You forgot your password ? Don't worry it happens to the best of us still ... Use the password below to unlock your space, don't forget to change your password to your desired characters once you're in.</p>
						<p>Password: <span style="font-weight: 700; color: #B91D47;">${data.password}</span></p>

						<hr style="opacity: 0.5; margin: 20px 0;">

						<p>If you have any thoughts or suggestions, message us at <a style="padding: 0; background-color: transparent; color: #B91D47; width: initial; display: inline-block;" href="mailto:support@torgist.com">support@torgist.com</a>. We will love to hear from you.</p>
						<p>With excitement,<br><strong>The Torgist Team</strong></p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`;
	const email_html = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Torgist</title>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
			<style>
				* {
					margin-block-start: 0;
					margin-block-end: 0;
					box-sizing: border-box;
				}
				body, p {
					font-family: "Manrope", Arial, sans-serif;
					font-optical-sizing: auto;
					font-weight: 400;
					margin: 0;
					padding: 0;
				}
				p {
					opacity: 0.8;
					margin: 20px 0;
					line-height: 2rem;
					width: 88%;
					font-size: 15.2px;
				}
				a {
					background-color: #B91D47;
					display: block;
					width: 100%;
					padding: 16px;
					border-radius: 8px;
					text-align: center;
					font-size: 14.8px;
					font-weight: 700;
					text-decoration: none;
					color: #FFFFFF;
				}
			</style>
		</head>
		<body style="background-color: #E5E5E5;">
			<div style="padding: 20px 0;">
				<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; color: #000;">
					<img src="https://res.cloudinary.com/dabfoaprr/image/upload/v1729289184/torgist-full-logo_usocln.png"
						alt="Torgist logo" style="max-width: 100px; width: 100%; margin: 20px 0;">

					<hr style="opacity: 0.5;">

					<div id="content">
						<p>Hello @${data.username},</p>
						<p>You forgot your password ? Don't worry it happens to the best of us still ... Use the password below to unlock your space, don't forget to change your password to your desired characters once you're in.</p>
						<p>Password: <span style="font-weight: 700; color: #B91D47;">${data.password}</span></p>

						<hr style="opacity: 0.5; margin: 20px 0;">

						<p>If you have any thoughts or suggestions, message us at <a style="padding: 0; background-color: transparent; color: #B91D47; width: initial; display: inline-block;" href="mailto:support@torgist.com">support@torgist.com</a>. We will love to hear from you.</p>
						<p>With excitement,<br><strong>The Torgist Team</strong></p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`;

	return { email_html, email_subject, email_text };
};

export const send_verification_email = (data) => {
	const email_subject = `Verify your email!`;
	const email_text = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Torgist</title>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
			<style>
				* {
					margin-block-start: 0;
					margin-block-end: 0;
					box-sizing: border-box;
				}
				body, p {
					font-family: "Manrope", Arial, sans-serif;
					font-optical-sizing: auto;
					font-weight: 400;
					margin: 0;
					padding: 0;
				}
				p {
					opacity: 0.8;
					margin: 20px 0;
					line-height: 2rem;
					width: 88%;
					font-size: 15.2px;
				}
				a {
					background-color: #B91D47;
					display: block;
					width: 100%;
					padding: 16px;
					border-radius: 8px;
					text-align: center;
					font-size: 14.8px;
					font-weight: 700;
					text-decoration: none;
					color: #FFFFFF;
				}
			</style>
		</head>
		<body style="background-color: #E5E5E5;">
			<div style="padding: 20px 0;">
				<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; color: #000;">
					<img src="https://res.cloudinary.com/dabfoaprr/image/upload/v1729289184/torgist-full-logo_usocln.png"
						alt="Torgist logo" style="max-width: 100px; width: 100%; margin: 20px 0;">

					<div id="content">
						<p>Hello @${data.username},</p>
						<p>We're thrilled to have you as part of the Torgist family! 🎉 </p>
						<p>Please click on the button below to verify your email address ...</p>

						<a style="color: #FFFFFF;" href="${data.verification_link}" aria-label="Verify email address!">Verify email address!</a>

						<p>If you have any thoughts or suggestions, message us at <a style="padding: 0; background-color: transparent; color: #B91D47; width: initial; display: inline-block;" href="mailto:support@torgist.com">support@torgist.com</a>. We'd love to hear from you.</p>
						<p>Welcome aboard, and let's make some great memories together!</p>
						<p>Best regards,<br><strong>Gigi & Emmanuel - Creators of Torgist</strong></p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`;
	const email_html = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Torgist</title>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
			<style>
				* {
					margin-block-start: 0;
					margin-block-end: 0;
					box-sizing: border-box;
				}
				body, p {
					font-family: "Manrope", Arial, sans-serif;
					font-optical-sizing: auto;
					font-weight: 400;
					margin: 0;
					padding: 0;
				}
				p {
					opacity: 0.8;
					margin: 20px 0;
					line-height: 2rem;
					width: 88%;
					font-size: 15.2px;
				}
				a {
					background-color: #B91D47;
					display: block;
					width: 100%;
					padding: 16px;
					border-radius: 8px;
					text-align: center;
					font-size: 14.8px;
					font-weight: 700;
					text-decoration: none;
					color: #FFFFFF;
				}
			</style>
		</head>
		<body style="background-color: #E5E5E5;">
			<div style="padding: 20px 0;">
				<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; color: #000;">
					<img src="https://res.cloudinary.com/dabfoaprr/image/upload/v1729289184/torgist-full-logo_usocln.png"
						alt="Torgist logo" style="max-width: 100px; width: 100%; margin: 20px 0;">

					<div id="content">
						<p>Hello @${data.username},</p>
						<p>We're thrilled to have you as part of the Torgist family! 🎉 </p>
						<p>Please click on the button below to verify your email address ...</p>

						<a style="color: #FFFFFF;" href="${data.verification_link}" aria-label="Verify email address!">Verify email address!</a>

						<p>If you have any thoughts or suggestions, message us at <a style="padding: 0; background-color: transparent; color: #B91D47; width: initial; display: inline-block;" href="mailto:support@torgist.com">support@torgist.com</a>. We'd love to hear from you.</p>
						<p>Welcome aboard, and let's make some great memories together!</p>
						<p>Best regards,<br><strong>Gigi & Emmanuel - Creators of Torgist</strong></p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`;

	return { email_html, email_subject, email_text };
};

export const user_certification = (data) => {
	const email_subject = `Congratulations, you've been certified`;
	const email_text = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Torgist</title>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
			<style>
				* {
					margin-block-start: 0;
					margin-block-end: 0;
					box-sizing: border-box;
				}
				body, p {
					font-family: "Manrope", Arial, sans-serif;
					font-optical-sizing: auto;
					font-weight: 400;
					margin: 0;
					padding: 0;
				}
				p {
					opacity: 0.8;
					margin: 20px 0;
					line-height: 2rem;
					width: 88%;
					font-size: 15.2px;
				}
				a {
					background-color: #B91D47;
					display: block;
					width: 100%;
					padding: 16px;
					border-radius: 8px;
					text-align: center;
					font-size: 14.8px;
					font-weight: 700;
					text-decoration: none;
					color: #FFFFFF;
				}
			</style>
		</head>
		<body style="background-color: #E5E5E5;">
			<div style="padding: 20px 0;">
				<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; color: #000;">
					<img src="https://res.cloudinary.com/dabfoaprr/image/upload/v1729289184/torgist-full-logo_usocln.png"
						alt="Torgist logo" style="max-width: 100px; width: 100%; margin: 20px 0;">

					<hr style="opacity: 0.5;">

					<div id="content">
						<p>Hello @${data.username},</p>
						<p>Your email has been changed, below are your new details to unlock your space, and explore new ways to have fun.</p>
						<p>Email: <span style="font-weight: 700; color: #B91D47;">${data.email}</span></p>
						<p>Password: <span style="font-weight: 700; color: #B91D47;">${data.password}</span></p>

						<hr style="opacity: 0.5; margin: 20px 0;">

						<p>If you have any thoughts or suggestions, message us at <a style="padding: 0; background-color: transparent; color: #B91D47; width: initial; display: inline-block;" href="mailto:support@torgist.com">support@torgist.com</a>. We will love to hear from you.</p>
						<p>With excitement,<br><strong>The Torgist Team</strong></p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`;
	const email_html = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Torgist</title>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
			<style>
				* {
					margin-block-start: 0;
					margin-block-end: 0;
					box-sizing: border-box;
				}
				body, p {
					font-family: "Manrope", Arial, sans-serif;
					font-optical-sizing: auto;
					font-weight: 400;
					margin: 0;
					padding: 0;
				}
				p {
					opacity: 0.8;
					margin: 20px 0;
					line-height: 2rem;
					width: 88%;
					font-size: 15.2px;
				}
				a {
					background-color: #B91D47;
					display: block;
					width: 100%;
					padding: 16px;
					border-radius: 8px;
					text-align: center;
					font-size: 14.8px;
					font-weight: 700;
					text-decoration: none;
					color: #FFFFFF;
				}
			</style>
		</head>
		<body style="background-color: #E5E5E5;">
			<div style="padding: 20px 0;">
				<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; color: #000;">
					<img src="https://res.cloudinary.com/dabfoaprr/image/upload/v1729289184/torgist-full-logo_usocln.png"
						alt="Torgist logo" style="max-width: 100px; width: 100%; margin: 20px 0;">

					<hr style="opacity: 0.5;">

					<div id="content">
						<p>Hello @${data.username},</p>
						<p>Your email has been changed, below are your new details to unlock your space, and explore new ways to have fun.</p>
						<p>Email: <span style="font-weight: 700; color: #B91D47;">${data.email}</span></p>
						<p>Password: <span style="font-weight: 700; color: #B91D47;">${data.password}</span></p>

						<hr style="opacity: 0.5; margin: 20px 0;">

						<p>If you have any thoughts or suggestions, message us at <a style="padding: 0; background-color: transparent; color: #B91D47; width: initial; display: inline-block;" href="mailto:support@torgist.com">support@torgist.com</a>. We will love to hear from you.</p>
						<p>With excitement,<br><strong>The Torgist Team</strong></p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`;

	return { email_html, email_subject, email_text };
};

export const user_enrollment = (data) => {
	const email_subject = `Congratulations, you've been enrolled`;
	const email_text = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Torgist</title>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
			<style>
				* {
					margin-block-start: 0;
					margin-block-end: 0;
					box-sizing: border-box;
				}
				body, p {
					font-family: "Manrope", Arial, sans-serif;
					font-optical-sizing: auto;
					font-weight: 400;
					margin: 0;
					padding: 0;
				}
				p {
					opacity: 0.8;
					margin: 20px 0;
					line-height: 2rem;
					width: 88%;
					font-size: 15.2px;
				}
				a {
					background-color: #B91D47;
					display: block;
					width: 100%;
					padding: 16px;
					border-radius: 8px;
					text-align: center;
					font-size: 14.8px;
					font-weight: 700;
					text-decoration: none;
					color: #FFFFFF;
				}
			</style>
		</head>
		<body style="background-color: #E5E5E5;">
			<div style="padding: 20px 0;">
				<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; color: #000;">
					<img src="https://res.cloudinary.com/dabfoaprr/image/upload/v1729289184/torgist-full-logo_usocln.png"
						alt="Torgist logo" style="max-width: 100px; width: 100%; margin: 20px 0;">

					<hr style="opacity: 0.5;">

					<div id="content">
						<p>Hello @${data.username},</p>
						<p>Email - ${data.email},</p>
						<p>Center - ${data.center_name},</p>
						<p>Center URL - ${data.center_url},</p>
						<p>Course - ${data.course},</p>
						<p>Course Certificate - ${data.course_certificate},</p>
						<p>Reference - ${data.reference},</p>
						<p>Enrolled Date - ${data.enrolled_date},</p>
						<p>Enrollment Status - ${data.enrollment_status},</p>
						<p>Your email has been changed, below are your new details to unlock your space, and explore new ways to have fun.</p>
						<p>Email: <span style="font-weight: 700; color: #B91D47;">${data.email}</span></p>
						<p>Password: <span style="font-weight: 700; color: #B91D47;">${data.password}</span></p>
						<img src="${data.course_image}"
						alt="${data.course} image" style="max-width: 100px; width: 100%; margin: 20px 0;">
						<img src="${data.center_image}"
						alt="${data.center_name} image" style="max-width: 100px; width: 100%; margin: 20px 0;">

						<hr style="opacity: 0.5; margin: 20px 0;">

						<p>If you have any thoughts or suggestions, message us at <a style="padding: 0; background-color: transparent; color: #B91D47; width: initial; display: inline-block;" href="mailto:support@torgist.com">support@torgist.com</a>. We will love to hear from you.</p>
						<p>With excitement,<br><strong>The Torgist Team</strong></p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`;
	const email_html = `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Torgist</title>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet">
			<style>
				* {
					margin-block-start: 0;
					margin-block-end: 0;
					box-sizing: border-box;
				}
				body, p {
					font-family: "Manrope", Arial, sans-serif;
					font-optical-sizing: auto;
					font-weight: 400;
					margin: 0;
					padding: 0;
				}
				p {
					opacity: 0.8;
					margin: 20px 0;
					line-height: 2rem;
					width: 88%;
					font-size: 15.2px;
				}
				a {
					background-color: #B91D47;
					display: block;
					width: 100%;
					padding: 16px;
					border-radius: 8px;
					text-align: center;
					font-size: 14.8px;
					font-weight: 700;
					text-decoration: none;
					color: #FFFFFF;
				}
			</style>
		</head>
		<body style="background-color: #E5E5E5;">
			<div style="padding: 20px 0;">
				<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #FFFFFF; color: #000;">
					<img src="https://res.cloudinary.com/dabfoaprr/image/upload/v1729289184/torgist-full-logo_usocln.png"
						alt="Torgist logo" style="max-width: 100px; width: 100%; margin: 20px 0;">

					<hr style="opacity: 0.5;">

					<div id="content">
						<p>Hello @${data.username},</p>
						<p>Email - ${data.email},</p>
						<p>Center - ${data.center_name},</p>
						<p>Center URL - ${data.center_url},</p>
						<p>Course - ${data.course},</p>
						<p>Course Certificate - ${data.course_certificate},</p>
						<p>Reference - ${data.reference},</p>
						<p>Enrolled Date - ${data.enrolled_date},</p>
						<p>Enrollment Status - ${data.enrollment_status},</p>
						<p>Your email has been changed, below are your new details to unlock your space, and explore new ways to have fun.</p>
						<p>Email: <span style="font-weight: 700; color: #B91D47;">${data.email}</span></p>
						<p>Password: <span style="font-weight: 700; color: #B91D47;">${data.password}</span></p>
						<img src="${data.course_image}"
						alt="${data.course} image" style="max-width: 100px; width: 100%; margin: 20px 0;">
						<img src="${data.center_image}"
						alt="${data.center_name} image" style="max-width: 100px; width: 100%; margin: 20px 0;">

						<hr style="opacity: 0.5; margin: 20px 0;">

						<p>If you have any thoughts or suggestions, message us at <a style="padding: 0; background-color: transparent; color: #B91D47; width: initial; display: inline-block;" href="mailto:support@torgist.com">support@torgist.com</a>. We will love to hear from you.</p>
						<p>With excitement,<br><strong>The Torgist Team</strong></p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`;

	return { email_html, email_subject, email_text };
};
