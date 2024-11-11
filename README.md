***ExpenseTree***

ExpenseTree is a full-stack expense tracking application built with Next.js, Tailwind CSS, and Firebase. It provides users with a dynamic analytics dashboard to visualize expenses, customizable settings for budget management, and real-time data storage.

>Features:

1.Analytics Dashboard:
>Displays a comprehensive overview of user expenses, including:
>Expense Summary: Shows total expenses, categorized expenses, and highest spending category.
>Expense Trends: Visualizes expenses through an interactive bar chart, allowing users to click or hover on bars for specific expense details.
>Comparison View: Provides side-by-side comparisons of monthly or category-based spending.
>This dashboard allows users to make informed decisions based on their spending habits.

2.Settings Management: Allows users to set a monthly budget and toggle notifications for a personalized experience.
3.User Authentication: Secure login through Firebase, ensuring each user’s data is private.
4.Real-time Data Storage: Uses Firebase Firestore to securely store and retrieve expense data in real time.
5.Responsive Design: Tailwind CSS ensures the app looks and functions beautifully on both mobile and desktop devices.


>Technology Used:
1.Next.js: Provides server-rendered and statically generated pages for improved performance.
2.Tailwind CSS: Utility-first CSS framework for fast and customizable styling.
3.Firebase: Includes Firebase Authentication for secure login and Firestore for real-time database management.
4.Recharts: Library for creating responsive, interactive bar charts used in the analytics dashboard.


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
