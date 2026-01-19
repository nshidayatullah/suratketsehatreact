# Task: Implement Work Permit Detail Page

## Context

The user wants to be able to click on a row in the "Pengajuan Izin Kerja" table and be redirected to a detailed view of that specific application.

## Steps

- [ ] Create `src/pages/pengajuan/Detail.tsx` component
  - [ ] Setup UI structure to display application details
  - [ ] Implement data fetching by ID from `/api/pengajuan/:id`
- [ ] Update `src/App.tsx`
  - [ ] Add route `/pengajuan/:id` mapped to the Detail component
- [ ] Update `src/pages/pengajuan/Index.tsx`
  - [ ] Add `onClick` handler to table rows to navigate to `/pengajuan/:id`
  - [ ] Ensure "Action" buttons (delete) don't trigger the row click navigation (e.preventDefault)
