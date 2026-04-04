This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

AP - To check for type errors and anything that needs to be reviewed:

```bash
npm run build
```

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

**This project is currently deployed on Vercel at [eonia-atlas.vercel.app](https://eonia-atlas.vercel.app).**

For deployment guidance, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Steps when a tester reports a bug

1. Create a bugfix branch (git)

```bash
git switch main
git pull
git switch -c fix/map-pin-click
```

2. Make the fix locally
   • edit code
   • test with npm run dev

3. Commit + push (git)

```bash
git add .
git commit -m "fix: pin selection when panning"
git push -u origin fix/map-pin-click
```

4. Get the Preview URL (Vercel)

In Vercel dashboard:
• Project → Deployments
• Find the deployment for your fix/map-pin-click branch
• Copy the Preview URL
• Send that to your tester

(You usually don’t need to click anything else.)

5. Merge to Production when confirmed

Once the tester says “looks good”:
• Merge that branch into main (GitHub PR is the cleanest way)
• Vercel will automatically redeploy Production from main
