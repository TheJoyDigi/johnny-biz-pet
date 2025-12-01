# Ruh-Roh Retreat - Premium Pet Boarding Services

This is the official website for Ruh-Roh Retreat, a premium pet boarding service providing luxury accommodations and specialized care for your furry family members.

## Features

- Modern, responsive landing page with animations using Framer Motion
- SEO-optimized with proper metadata and structured data
- Blog section with content management through markdown files
- Booking form for service reservations
- Mobile-friendly design

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework for production
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Gray Matter](https://github.com/jonschlinkert/gray-matter) - Parsing markdown front-matter
- [React Markdown](https://github.com/remarkjs/react-markdown) - Rendering markdown content

## Environment Variables

The application uses the following environment variables:

```
# Google Gemini AI API Key
GOOGLE_API_KEY=your_api_key

# Email Configuration
EMAIL_HOST=smtp_host
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
EMAIL_FROM=sending_email_address
BOOKING_RECIPIENT_EMAIL=recipient_email_address

# Supabase Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AWS S3 Configuration
S3_BUCKET_NAME=your_s3_bucket_name
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Admin Account Creation
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
```

### ⚠️ IMPORTANT EMAIL CONFIGURATION NOTE ⚠️

Make sure `EMAIL_SECURE` is set to `false` in production. If set to `true`, the booking email functionality will not work properly. This is because many SMTP providers (including Brevo) require that secure connection is set to false when using port 587 with STARTTLS.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm run start
```

## Database Seeding

This project uses Supabase for the database. The seed data is located in the `supabase/seed.sql` file.

To seed the database, you can use the Supabase CLI:

```bash
# Reset the database and apply the seed data
npx supabase db reset
```

This command will drop all the tables in your local database, recreate them based on your migrations, and then run the `supabase/seed.sql` file to populate the tables with initial data.

### Seeding Auth Users

The `supabase/seed.sql` file seeds the `public.users` table, but it does not create the corresponding authentication users in Supabase's `auth.users` table. To create the auth users, you can use the `scripts/seed-auth-users.js` script:

```bash
# Run the script to create auth users
node scripts/seed-auth-users.js
```

This script will read the users from the `public.users` table and create corresponding users in the `auth.users` table with a default password of `password`.

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## Project Structure

- `/src/components` - React components
- `/src/pages` - Next.js pages
- `/src/styles` - Global CSS styles
- `/src/lib` - Utility functions
- `/posts` - Markdown blog posts
- `/public` - Static assets

## Blog System

Blog posts are written in Markdown format and stored in the `/posts` directory. Each post has front matter with metadata:

```markdown
---
title: "Post Title"
excerpt: "Brief excerpt about the post"
date: "2023-01-01"
author: "Author Name"
cover_image: true
---

Post content goes here...
```

## License

All rights reserved © Ruh-Roh Retreat

## Testing

### Pricing Calculation Test

This project includes a script to test the end-to-end pricing calculation for bookings. The script simulates the full booking and acceptance workflow to verify that the final price is calculated correctly.

To run the test:

1.  **Seed the Database:** Before running the script, ensure your local database is seeded with the initial data. This will create the necessary sitter and add-on data for the test.

    ```bash
    npx supabase db reset
    ```

2.  **Run the Test Script:** Execute the following command from the project root:

    ```bash
    node scripts/test-pricing-calculation.js
    ```

The script will perform the following steps:
- Authenticate as a test sitter.
- Create a new booking request.
- Accept the booking, which triggers the price calculation on the backend.
- Query the database to retrieve the final calculated cost.
- Log the results and verify that the calculated total matches the expected total.
