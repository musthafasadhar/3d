# Avni Health ERP: product notes (explored 2026-11-11)

Site: https://avni-health-erp.vercel.app. Built by MILLA Innovations and Technologies.
Development preview: synthetic demo data only, and data stays in the browser.

## Pages explored
- `/` landing: "Less complexity. More connected care." Covers the platform modules, roles, and the trust/access approach.
- `/login` staff sign-in with demo roles: Hospital admin, Management staff, Doctor, Nurse (Platform admin coming soon).
- Staff workspace (single-page app): Overview (registered patients, active team, appointments marked "Planned"),
  Patients (hospital-scoped directory, search, register), Activity log (audit of access and registrations),
  My account, and the Ask Avni chatbot (demo). Doctor and Nurse currently see Overview / Patients / Account only.
- `/patient` patient app (mobile-first): For you, Doctors (book again / book visit, ₹500 sample fee),
  Hospitals (sponsored placements), My reports (lab, consultation, prescription), Bookings (simulated),
  Free consult offer, Doctor reels (doctor-led education previews), Ask Avni assistant.

## Module status
| Available in development | Planned |
|---|---|
| Hospital operations: staff sign-in, patient registration, directory, activity log | Appointments & discovery |
| Ask Avni AI (guided demo) | Clinical workspaces (consults, prescriptions, reports, nursing) |
| Patient experience demo | Healthcare engagement (doctor education, live events, insights) |

## Positioning (for marketing)
- **Problem:** hospital work is spread across disconnected systems (front desk, records, doctors, patients),
  patients lose track of reports and doctors, and access to records is hard to control.
- **Solution:** one connected platform. Hospitals get hospital-scoped records, role-based access and an audit log.
  Patients get one calm app for reports, familiar doctors, bookings, and doctor reels. An AI assistant (Ask Avni) helps both.
- **Audiences:** hospital admins and owners (multi-hospital), front desk and management, doctors and nurses, patients.
- **Brand:** green/teal (#0f7a5a-ish), heart-in-shield logo, warm human copy ("A better day of care").
- **Honesty constraint:** many features are "Planned". Marketing must not claim them as live.
