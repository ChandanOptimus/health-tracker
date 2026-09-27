# Health Tracker — Phase 1

Fresh Next.js + TypeScript foundation for the health tracking app.

## Phase 1 includes

- Responsive dark dashboard
- Typed health data model
- 48-week progress structure
- Weight trend chart
- Weekly weight-change chart
- Navigation for Dashboard, Progress, Nutrition, Workout and Check-in
- Data adapter boundary so Google Sheets can replace mock data without rewriting the UI

## Run

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Next phase

Connect the actual Google Sheets workbook through a server-side adapter and map:
- Check-in daily weights
- Weekly averages/change
- Body measurements
- Sleep/hunger/stress
- Diet adherence
- Workout adherence

Then populate Nutrition and Workout pages from their respective sheets.
