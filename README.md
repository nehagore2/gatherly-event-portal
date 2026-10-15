# Gatherly — Multipage Event Browser Portal

Professional event browsing website built using HTML5, CSS3, and vanilla JavaScript.

## Pages
- `index.html` — Browse events, search, category/date filters, sorting, event detail modal.
- `register.html` — Dedicated registration page with selected event, date, attendee count, validation, price calculation, and confirmation.
- `registrations.html` — My registrations page, cancellation, and downloadable calendar reminder files.
- `contact.html` — Contact information and validated contact form.

## Run
1. Extract the ZIP.
2. Open the folder in VS Code.
3. Start `index.html` using Live Server.
4. Use the navigation to move between pages and test registration.

## Functionality
- Event registrations are stored in browser `localStorage` and shared across these pages on the same browser/origin.
- Calendar reminders are downloaded as `.ics` files for users to open in their calendar app.
- Contact form displays a success message but does not send email.
- This is a front-end demonstration. A production deployment needs a backend/database for central registration storage and automated notifications.
- Event content is sample data and should be verified before publishing.
