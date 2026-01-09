# Lever Calendar Planner

A dynamic sales forecasting tool that lets you plan conversion mechanisms (levers) on a calendar and track actual performance against forecasts.

## Features

- **📅 Plan Mode**: Drag and drop sales levers onto calendar days to build your monthly forecast
- **📊 Track Mode**: Record daily actuals and see variance visualization (hit/close/miss)
- **⚙️ Settings**: Configure lever math (monthly units, attribution days, daily rates)
- **💰 Revenue Tracking**: Set Average Unit Revenue to see revenue forecasts alongside units
- **📆 Monthly Budgets**: Set different unit targets for each month
- **📝 Manager Notes**: Add context to daily performance
- **⬇️ Export**: Download your data as JSON for reporting

## Quick Deploy to Vercel (Recommended)

### Option 1: Deploy via GitHub (Easiest)

1. **Create a GitHub repository**
   - Go to [github.com/new](https://github.com/new)
   - Name it `lever-calendar` or similar
   - Keep it public or private (your choice)

2. **Upload these files**
   - Click "uploading an existing file" on the new repo page
   - Drag all the files from this `app` folder
   - Commit the changes

3. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
   - Click "Add New Project"
   - Import your `lever-calendar` repository
   - Vercel auto-detects Vite - just click "Deploy"
   - Wait ~60 seconds and you'll have a live URL!

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to the app folder
cd app

# Deploy
vercel

# Follow the prompts - it will give you a live URL
```

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## How It Works

### Levers
Each lever represents a sales conversion mechanism with:
- **Monthly Units**: Expected total units when running this lever
- **Attribution Days**: How many days to see 90% of conversions
- **Daily Rate**: Auto-calculated (Monthly Units ÷ Attribution Days)

### Planning
1. Set your monthly budget in Settings → Monthly Budgets
2. Drag levers onto calendar days (or click day, then click levers)
3. Watch the forecast build in the Units dashboard

### Tracking
1. Switch to Track mode
2. Click any day to open the tracking modal
3. Enter actual units collected
4. Add manager notes for context
5. Calendar cells turn green/amber/red based on variance

### Revenue
1. Go to Settings → Revenue
2. Set your Average Unit Revenue (AUR)
3. Revenue forecasts automatically calculate from unit projections

## Data Storage

Data is stored in your browser's localStorage, so:
- ✅ Data persists across browser sessions
- ✅ No server required
- ⚠️ Data is per-browser (not synced across devices)
- ⚠️ Clearing browser data will erase your calendar

For multi-device sync, consider adding a backend database (Supabase, Firebase, etc.)

## Customization

### Adding/Editing Levers
Go to Settings → Levers to:
- Add new levers with custom names
- Adjust monthly units and attribution days
- Change lever colors
- Delete unused levers

### Default Levers
The app comes pre-configured with these levers:
- Webinar (90 units / 6 days = 15.0/day)
- VSL-calls (70 units / 21 days = 3.3/day)
- Hot Apps (70 units / 21 days = 3.3/day)
- Lead Magnet (16 units / 21 days = 0.8/day)
- Free FB Group (38 units / 21 days = 1.8/day)
- Like Live Web (30 units / 3 days = 10.0/day)
- Fireside Chats (10 units / 3 days = 3.3/day)
- Advocate Challenge (10 units / 3 days = 3.3/day)
- Affiliate Challenge (10 units / 3 days = 3.3/day)
- Financing (20 units / 21 days = 1.0/day)

## For Multiple Teams

To give each sales team their own instance:

1. **Separate URLs**: Deploy multiple times with different project names
2. **URL Parameters** (future enhancement): Add team identification to URLs
3. **Add Authentication** (future enhancement): Add login system with per-user data

## License

MIT - Use freely for your sales team!
