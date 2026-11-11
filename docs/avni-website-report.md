# Avni Health ERP: full website report (for script writing)

Website: https://avni-health-erp.vercel.app
Made by: MILLA Innovations and Technologies (Hyderabad)
Stage: development preview / live demo. All data is fictional and stays in the browser. Features marked "Planned" are NOT live yet.
Tagline: "Less complexity. More connected care."
Brand feel: calm, warm, human. Green/teal colours, heart logo. Lines like "A better day of care" and "Care starts with people."

## 1. What it is (one line)
One connected healthcare platform that links the hospital, its staff (admin, front desk, doctors, nurses) and its patients, from the first appointment to the next follow-up.

## 2. The problems it solves
1. **Patients lose their medical history.** Reports, prescriptions and consultation summaries are scattered across paper files, WhatsApp and phone galleries. At the doctor's desk the patient can't find the last report.
2. **Patients forget which doctor they saw.** There is no easy way to go back to a doctor they trust, or to discover good doctors and hospitals nearby.
3. **Hospital front desks are slow and messy.** Every visit means filling a form again, and patient records sit in registers or disconnected software.
4. **Hospitals run on disconnected systems.** Front desk, doctors, nurses and management each use separate tools, so nothing talks to anything.
5. **Patient data privacy is weak.** It's hard to control who can see a patient's details, and nobody knows who opened a record.
6. **Multi-branch hospitals have no single view.** Each branch is managed separately.
7. **Patients have no trusted health guidance.** Health advice on social media comes from random people, not their own doctors.

## 3. The solution
Avni is one platform with a role-based experience for each person:

### For hospitals (staff workspace): LIVE in demo
- **Staff login** with separate roles: Hospital admin, Management/front desk staff, Doctor, Nurse. Platform admin is coming soon.
- **Patient registration:** full name, mobile number (+91), date of birth. Each patient gets a hospital patient ID.
- **Patient directory:** search by name or patient ID, view a patient, see their registration date.
- **Overview dashboard:** registered patients, active team members, and appointment scheduling (shown as "Planned").
- **Activity log:** "Every action, accounted for." Records every sign-in, access to patient data and registration (latest 50 events).
- **Hospital-specific access:** staff only see records of the hospital they belong to. Multi-hospital support is built into the foundation.
- **My account:** role, hospital, active session, "Sign out of all devices".
- **Ask Avni (staff assistant, guided demo):** "Show patients", "Hospital summary", "Register patient". No real AI connected yet; live AI is planned.

### For patients (patient app, mobile-first): LIVE as a demo
- Greets the patient: "Hello, Sara. Let's make feeling better a little simpler."
- **Search doctors or hospitals.**
- **My medical reports:** lab reports (blood test), consultation summaries and prescriptions, "always close by".
- **Doctors you've consulted:** "Continue your care with a familiar doctor", with a one-tap "Book again".
- **All doctors:** profiles by speciality (cardiology, general medicine, dermatology, paediatrics) with hospital and visit fee (sample ₹500), plus "Book visit".
- **Free consultation offer:** "A conversation can be a good beginning."
- **Doctor reels:** short story-style health videos from your own doctors, for example "Getting ready for your heart check-up", "Questions to ask your dermatologist" and "Preparing for a child's routine visit".
- **Discover hospitals:** sponsored hospital placements (Green Valley Hospital, Mint Care Hospital, both fictional).
- **My bookings:** your upcoming visits (simulated in the demo).
- **Ask Avni (patient assistant):** book appointment, free consultation, my bookings.
- No OTP is needed in the demo ("Continue as demo patient").

### PLANNED (not live; do not claim as working)
- Real appointment booking and scheduling (the "core hospital ERP phase").
- Clinical workspaces: consultations, doctor-reviewed prescriptions, medical reports, nursing workflows.
- Healthcare engagement: doctor-led education, hospital live events, engagement insights.
- Live AI in Ask Avni.
- Patient mobile app (currently web).
- Platform admin.

## 4. Pages on the website
| Page | URL | What is on it |
|---|---|---|
| Landing page | `/` | Hero "Less complexity. More connected care.", the 6 platform modules with live/planned status, "A place for everyone who makes care happen" (4 roles), "Built on trust. Centered on care." (access approach), "Try a demo account" |
| Staff login | `/login` | "Welcome back." Work email + password, demo role buttons (Hospital admin / Management staff / Doctor / Nurse), "Access is limited to your authorized hospitals." |
| Staff workspace | after login | Overview, Patients, Activity log, My account, Register patient, Ask Avni. Doctor and nurse currently see Overview / Patients / My account. |
| Patient welcome | `/patient` | "Welcome to your care companion. Reports, familiar doctors, and your next visit. All in one calm, simple place." |
| Patient app | after "Continue as demo patient" | For you, Doctors, Hospitals, My reports, Bookings, Free consult, Doctor reels, Ask Avni, plus a bottom nav (Home, Bookings, Ask Avni, Reels, Profile) |

## 5. Who it's for (audiences)
1. **Patients and families:** keep reports and doctors in one place, book visits, get health tips from their own doctors.
2. **Hospital owners and admins:** a clear view of the hospital and its people, multi-branch, with an audit trail.
3. **Front desk and management staff:** faster registration and a searchable patient directory.
4. **Doctors and nurses:** workspaces planned around care teams, plus a way to reach patients through doctor reels.
5. **Hospital marketing:** sponsored placements and doctor reels to reach patients.

## 6. Trust and privacy promises (from the site)
- Hospital-specific access controls and patient records.
- Logged access to patient registrations (activity log).
- Clinical decisions stay with clinicians ("clinician review in planned clinical workflows").
- "Built around people. Designed for responsible access."

## 7. Unique angles for marketing
- Patient app and hospital ERP in one product: most hospital software ignores the patient, and most patient apps ignore the hospital.
- Doctor reels inside a health app: your own doctor explains things, not random influencers.
- "Book again" with the doctor you already trust.
- An activity log that shows who opened your record.
- A warm, human tone instead of "boring enterprise software".
- Built in Hyderabad, by an Indian team, for Indian hospitals (₹ pricing, +91 numbers).
- Early stage: people can try the demo now and shape what gets built next.

## 8. Script rules (to stay honest)
- OK to show as working: reports in one place, familiar doctors, doctor reels, hospital discovery, patient registration, patient directory, activity log, role-based access, the Ask Avni demo.
- Say "coming soon" for: real appointment booking, clinical workspaces, live AI, the mobile app.
- Call to action: "Try the demo" / "Comment AVNI for the demo link". The demo needs no signup (sample accounts on the login page).

## 9. Reel production decisions (already fixed)
- Characters: **Kiran** (male low-poly host: round glasses, blue jacket) and **Avni** (green heart mascot with two bar eyes and no mouth; it acts with its eyes and hops).
- Voice: AI voice first. If it doesn't sound right, the owner records it himself.
- Captions: **Tenglish** (Telugu written in English letters), one line per shot in a top pill.
- Format: 1080×1920, 30 fps, 60 s or less, hard cut every 2–3 s, scenario = hospital waiting room / lost report.
