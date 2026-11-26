# GlowVai — R&D and Market Research Report

**Prepared for:** Founder, GlowVai (https://glowvai.in), Vijayawada, Andhra Pradesh
**Research date:** 26 November 2026
**Scope:** website audit; the Indian beauty market; competitors (skin-analysis apps, marketplaces, brands, quick commerce); regulation; growth options; first-mover analysis.

### How to read this report

- Every market figure is followed by its source (publisher, year) as a link. All links are also collected in the **Sources** section.
- **†** after a source means the figure came from a search-result snippet or a secondary write-up, and the original page could not be opened. Re-check these before quoting them to investors or press.
- **UNVERIFIED** means no reliable source was found. Nothing marked UNVERIFIED should be treated as fact.
- **"Analysis:"** marks my own reasoning, not a sourced fact.
- **Method:** the website was crawled and its code inspected directly. Five parallel research streams then opened about 100 primary and secondary pages: company filings, Redseer, Euromonitor, Motilal Oswal, ASCI, LocalCircles, Inc42, Entrackr, and Gazette/legal texts.
- **Limit:** the research tools had a 200-search cap, and it ran out before every lead could be checked. The gaps are listed honestly in **Open questions**.
- This is research, not legal advice. Have an Indian advocate and a CA review Part 4 before acting on it.

---

## EXECUTIVE SUMMARY

**1. The market is real, large and moving toward GlowVai's model.**
- Indian beauty & personal care (BPC) was about **USD 23 bn in FY25**, projected at **~USD 40 bn by FY30 (~12% CAGR)** ([Redseer, Feb 2026](https://redseer.com/wp-content/uploads/2026/02/India-BPC-2030_Growth-Shifts-and-Opportunities_ExecReport_Redseer-2.pdf)). Estimates vary by firm; IMARC says USD 31.2 bn at 5.1% CAGR.
- Skincare is the fastest-growing big category (~13% CAGR FY25–29) ([Motilal Oswal citing Redseer, Dec 2025](https://bsmedia.business-standard.com/_media/bs/data/market-reports/equity-brokertips/2025-12/17665661370.41111100.pdf)).
- Online is ~20% of BPC today, heading to 34–38% by FY30.
- **Quick commerce** was ~15% of online BPC in FY25 and is expected to become the largest online beauty channel (30–40%) by 2030 (Redseer, 2026).
- About **65% of Nykaa's revenue comes from Tier 2 cities and smaller** ([Nykaa AGM transcript, Aug 2025](https://www.nykaa.com/media/wysiwyg/uiTools/2025-8/transcript-of-13th-agm.pdf)).
- Vijayawada is a Tier 2 ("Y") city, in a state whose per-capita income is about 34% above the national average (AP Socio-Economic Survey 2024-25†).

**2. The consumer problems GlowVai targets are documented.**
- **Counterfeits:** 34% of households bought fake cosmetics in 3 years ([LocalCircles, 2022](https://www.localcircles.com/a/press/page/cosmetic-products-reaction)).
- **Adverse reactions:** 15% of households had an allergic reaction or serious ailment from cosmetics (same source).
- **Misleading ads:** 90% of 639 BPC ads that ASCI processed needed changes, and 45% were influencer-led ([ASCI Annual Complaints Report 2025-26](https://www.ascionline.in/wp-content/uploads/2026/05/annual-complaints-report-25-26-final.pdf)).
- **Dermatologist shortage:** India has ~9.5 dermatologists per million people, against ~34 in the US ([IJDVL, 2024](https://ijdvl.com/global-health-dermatology-an-emerging-field-addressing-the-access-to-care-crisis)).
- **Self-medication:** 63% of steroid-damaged-face patients in one 2024 study got the cream over the counter ([Cureus, 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11723967/)).
- **Returns:** opened beauty products are almost universally non-returnable in India.

**3. The website has serious credibility and compliance problems. Fix these before any marketing spend.**
- **The "AI face scan" does not analyse the face.** In the live code, the four scores come from a fixed lookup by the demographic the user picks (e.g., everyone who picks "Girl 18–23" gets 74, so hydration 76). "Face detection" is only a skin-colour pixel count. The site and press page call this "AI", "on-device diagnostic intelligence" and "proprietary computer-vision models". That mismatch is the single biggest legal and reputational risk found (Consumer Protection Act s.21/s.89; Cosmetics Rules r.36).
- **Personal data and the privacy policy disagree.**
  - Name, phone, GPS/IP location and the **face photo** are sent to a Google Apps Script endpoint on every report.
  - The privacy policy says the photo is analysed on-device and saved only if a separate box is ticked. No such box exists.
  - The policy lists only Vercel as a processor, but Google, ipify, ipapi and OpenStreetMap also receive data.
  - The privacy and terms pages are publicly marked **"Draft for legal review"**.
- **Brand and labelling problems.**
  - Six own-label products are tagged in Google structured data as **"The Derma Co …"**, a real Honasa brand.
  - Their labels name a "Marketer" (GLOW VAI Technologies Pvt. Ltd., Hyderabad) but no manufacturer or licence number. Meanwhile the story page says "we do not make it".
  - The company's legal existence, CIN and GSTIN are not shown and could not be verified.
- **Unverified claims on the site:** "4.9/5", "1,200+ scans", a named testimonial, "5 active hubs", "HDFC 10% off", and a "Test Test ₹1" product listed among bestsellers.

**4. Competition: the software is a commodity; the combination is not.**
- Free AI skin scans already exist from Nykaa†, The Derma Co†, Foxtale, Kaya, Tira (in-store), CureSkin and Kult.
- Any Indian brand can rent white-label skin-scan software from **Fynd GlamAR from ~US$250/month†**.
- Well-funded new entrants launched in 2026:
  - Puresta's **EVERQ** (₹34 Cr pre-seed, AI assessment plus dermatologist, Sep 2026)
  - **SkinBB** (Aug 2026)
- Blinkit (since Aug 2024) and Instamart (since Dec 2022) already deliver beauty in Vijayawada in minutes.
- **No player was found combining all four of these, in Tier 2 or anywhere:**
  - (a) skin analysis
  - (b) dermatologist-reviewed recommendations
  - (c) local delivery with authenticity checks
  - (d) a refund or reaction guarantee on *used* skincare

  The only Indian used-product return found is Plum's: 7 days, less than one-third used, store credit only. This is a real but narrow and **provisional** gap.

**5. Verdicts on the planned expansions.**

| Expansion | Verdict |
|---|---|
| **B2B skin-analysis add-on for salons/clinics** | **Most promising, after the scan is real.** None of the Indian salon software checked (Zenoti, Invoay, Salonist, Zylu, DINGG) offers AI skin analysis. Salons pay ₹700–4,000/month for software, and dedicated analyser hardware costs ₹1–1.85 lakh†. |
| **Beauty accessories** | **Low-risk add-on, not a strategy.** Small (~USD 221M), fragmented, low entry barrier. |
| **Wellness/ABC juice** | **Do not pursue now.** Cold chain, FSSAI licensing, a ~3-day shelf life without HPP, and no clinical evidence that ABC juice improves skin. Raw Pressery sold at an ~80% valuation cut. |
| **Face-scan vending machines** | **Pilot one kiosk at most.** No commercially scaled face-scan + dispensing machine exists anywhere. Use a scan kiosk that sends orders to delivery, not a dispenser. |

**6. Top 10 actions (next 30 days)**
1. Make the scan honest: relabel it now, or ship genuine image analysis (a licensed SDK or your own model) before saying "AI".
2. Fix data handling: a real image-consent checkbox, an accurate processor list, India-region storage, and auto-delete.
3. Get lawyer-approved privacy and terms pages, and remove the "Draft" banner.
4. Remove the "The Derma Co" structured data, unverifiable ratings and testimonials, and the test product.
5. Decide **retailer vs own-label**, and label products per Cosmetics Rules 2020 Rule 34.
6. Show the CIN, GSTIN and full registered address.
7. Sign one named consulting dermatologist.
8. Unify the refund policy (14 vs 7 days). Turn the "Skin-Fit Guarantee" into the core differentiator, with clear limits.
9. Use Google/email login, or WhatsApp OTP at about ₹0.115 per message, rather than SMS OTP.
10. Run a 60-day Vijayawada pilot measuring scan→order conversion, repeat rate and refund rate before any new category.

---
## PART 1 — WEBSITE ANALYSIS (glowvai.in)

**Method.** Crawled on 26 Nov 2026 with `curl` (all 40 URLs in `https://glowvai.in/sitemap.xml` plus 22 guessed paths), parsed every page's HTML for titles, meta tags, headings, structured data and links, downloaded all 25 JavaScript bundles and read the face-scan code, and loaded key pages in headless Chromium emulating a Pixel 7 phone to measure speed, layout and console errors. Everything below was observed directly unless marked otherwise. Web searches for GlowVai's off-site presence (news, MCA filings, Google index, social profiles) could **not** be run because the session's search budget was spent on the market research; see Open Questions.

### 1.1 Page inventory

The sitemap lists 40 URLs. All returned HTTP 200. Four more live pages are **not** in the sitemap: `/privacy`, `/terms` (both set to `noindex`), `/sell`, `/affiliate`. `/about` is `noindex` with a canonical tag pointing to `/our-story`. `/admin` returns 200 with `noindex, nofollow`.

| Page | What it contains |
|---|---|
| `/` (Home) | Hero "Know your skin. Fix it in 15 minutes." Explains the 30-second scan and four markers (Hydration, Texture, Tone, Clarity) with example scores. Shop-by-concern tiles, a 4-step routine (₹2,046 total), a delivery explainer with pincode checker, the founder story (3 founders, timeline Feb 2025 → Sep 2026), a referral teaser, one testimonial, a feedback form, a journal teaser, FAQ, a "Department Directory" with 8 email addresses, and a newsletter signup. Shows "★★★★★ 4.9 / 5.0 · Over 1,200+ scans completed in Vijayawada". |
| `/face-analysis` | Free scan: camera or upload, an 18+ notice, "Cosmetic skin insights, not medical advice". Four steps, no sign-up. After the photo, asks "Who is this scan for?" (demographic) and "Main skin concern", plus name/phone/email. |
| `/shop` | A separate client-rendered storefront ("The Beauty Destination for Every Indian"). It loads products from Firebase Firestore. It sells **third-party brands** (Minimalist, The Derma Co, Roop Mantra) using images hotlinked from Nykaa, Purplle, Flipkart, Apollo247, Cureka, Minimalist and The Derma Co servers. Shows a "Test Test ₹1" product in **Bestsellers**, coupon GLOW50, "10% off with HDFC cards", "5% cashback in GlowVai wallet", "7-day return window", "6 areas, from 12 mins", and "Take a 1-minute skin quiz". |
| `/product/*` (6 pages) | Six products with invented names (Clarity Pop Niacinamide Serum ₹549, Dew Barrier Daily Hydrator ₹499, Sun Shield SPF 50 ₹599, Velvet Cloud Cica Cleanser ₹399, Petal Plump Lip Butter ₹299, Velvet Smooth Body Lotion ₹649). Each lists INCI ingredients, net quantity, a 24-month shelf life, "Made in India", and "Marketer: GLOW VAI Technologies Pvt. Ltd., Studio 4B, Design District, Hyderabad 500081". Ordering is "Add to bag" or "Order on WhatsApp" (a pre-filled wa.me link). |
| `/concerns/*` (5) | Landing pages for breakouts & pores, dullness, dehydration, dark spots, and sun protection, each with tips and matched products. |
| `/journal/how-to-read-a-skincare-label` | The only article: a 6-minute guide to reading labels. |
| `/delivery` | "Fresh skincare at your door in about 15 minutes." Lists 5 "Active Fulfillment Hubs" (Benz Circle 520010, One Town 520001, Kanuru 520007, Bhavanipuram 520012, Auto Nagar 520008) with "Avg 12–15 min". Claims "licensed partner pharmacies", "cut transit times by 98%", "100% genuine batch codes verified with official brand distributors", insulated pouches, and OTP handoff. |
| `/returns` | "14-Day Skin Satisfaction Guarantee… Skincare that fits, or your money back." Conditions: request within 14 days; at least 50% of the product left; adverse reaction "verified with our advisor"; free pickup in covered pincodes; UPI refund in "Instant – 4 Hours". Excludes opened lip care. |
| `/referral` | Partner program for **auto drivers and campus ambassadors**: ₹10 per verified referral, plus a ₹1,000 bonus at 100 a month, paid by UPI. Has a QR seat-back poster, a college badge, WhatsApp links, and a registration/login portal. |
| `/our-story` | Long founder narrative (11 chapters, 2023–Oct 2026) and team. States "Independent — **We retail skincare, we do not make it**." |
| `/press`, `/press/brand-kit` | Fast facts and boilerplate ("on-device smartphone diagnostic intelligence", "proprietary computer-vision models calibrated for South Asian climates and skin tones", "licensed pharmacy dark stores"). Logo and colour downloads. |
| `/partners` + `/stores`, `/brands`, `/rider` | Recruitment for pharmacies (need a drug licence or GSTIN), brands (need "CDSCO / AYUSH approval"), riders ("fuel support & rider transit insurance"), and referral partners. |
| `/careers` + 4 sub-pages | 5 roles (Full-stack, CV/ML for "on-device ONNX models", Campus lead, Dark-store manager, "Derm-Trained Skincare Advisor"), offering equity and health cover. |
| `/help` + `/orders`, `/payments`, `/face-scan` | Short help articles. Payment method is "confirmed on WhatsApp". |
| `/track-order` | Order number + phone → status sent on WhatsApp. |
| `/contact` | Email, WhatsApp +91 89778 55998 (Telugu/English), address "GLOW VAI Retail, Vijayawada 520001", hours, contact form. |
| `/faq`, `/grievance`, `/accessibility`, `/site-map` | FAQ (6 Qs); Grievance Officer "SK Sardar Musthafa" with 48-hour acknowledgement; accessibility statement; HTML site map. |
| `/privacy`, `/terms` | Both carry a visible banner: **"Draft for legal review. This text is not final until it has been approved by a lawyer."** Both are `noindex` and not in the sitemap. |
| `/sell`, `/affiliate` | Placeholders ("Seller applications open soon"). |
| 404 page | Custom 404 ("This page took a wrong turn") with correct 404 status. |

### 1.2 Features and user flows (as built)

1. **Face scan** (`/face-analysis`, also on `/shop`). Camera or upload → a "face detected" check → the user picks a demographic group (e.g., "Girl (Aged 18–23)", "Boy (Under 18)", "Older Man", "Bright / Well-lit Face") and a main concern, and enters name, phone and optional email → report with an overall score, four sub-scores, a summary and product picks.
2. **Critical finding: how the score is calculated.** The scan code in the production bundle `/_next/static/immutable/chunks/1aztfsivvdlae.js` (function `analyseFrame`) **does not use the photo to produce scores.** It looks up a fixed number for the chosen demographic (e.g., Girl 18–23 = 74, Boy 18–21 = 72, Older Man = 66, "Bright / Well-lit Face" = 76). It then sets hydration = score+2, texture = score−1, tone = score+1, clarity = score−2, and picks one of three canned summaries. "Face detection" is a simple skin-colour pixel count inside an oval (it passes if 10–95% of sampled pixels are skin-toned). So two different people who choose the same group get identical scores. The site and press page describe this as "AI", "on-device diagnostic intelligence" and "proprietary computer-vision models calibrated for South Asian… skin tones". **That description does not match the shipped code** and creates misleading-claim exposure (see Part 4).
3. **What is sent and where.** On submit, the browser POSTs to a Google Apps Script web app (`script.google.com/macros/s/AKfycbwz…/exec`). The payload contains name, phone, email, demographic, concern, **the full face photo as base64**, scores, location (from browser GPS reverse-geocoded via OpenStreetMap Nominatim, or IP lookup via ipapi.co), IP address (via api.ipify.org, called as soon as `/face-analysis` loads), browser and OS. The bundle has **no separate image-consent checkbox**. The image is sent whenever one exists. This contradicts the privacy policy (below).
4. **Ordering.** "Add to bag" or a pre-filled **WhatsApp** message. Payment is confirmed on WhatsApp, and order tracking replies on WhatsApp. There is no online checkout, cart page or account page on the main site (`/cart`, `/checkout`, `/account`, `/login` return 404). The `/shop` app has Firebase Auth (identitytoolkit) and a bottom nav with "Orders" and "Account".
5. **Referrals.** (a) Partner referrals for auto drivers and students (₹10 per verified referral, stored via a second Apps Script endpoint). (b) Customer referral coins are built into the code (`referrerCoins:50`, `refereeCoins:50`, 1 coin = ₹1, triggered on `FIRST_ORDER_DELIVERED`, redeemable up to 20% of the item total). (c) Subscription re-orders every 2, 4 or 8 weeks are configured in code. (b) and (c) are not described on the site.
6. **Other flows.** Pincode availability check, feedback form (with publish consent), newsletter, contact form, data-rights request form (delete / withdraw / summary), grievance email.

### 1.3 Tech stack, speed, mobile, SEO

- **Stack (detected):** Next.js (App Router, Turbopack build, React Server Components) on **Vercel** (`server: Vercel`, `x-vercel-cache: HIT`, `x-nextjs-prerender`). Google **Firebase** (Firestore + Auth) for the shop. **Google Apps Script** web apps as the form and lead backend (likely writing to Google Sheets/Drive — UNVERIFIED). **Zoho Mail** for email (MX `mx.zoho.in`, SPF `include:zoho.in`). DMARC is set to `p=none` (monitor only). Google Analytics is wired in, but the measurement ID in the bundle is the placeholder **`G-XXXXXXXXXX`**, so analytics is probably not recording. The careers page mentions Next.js 16, Firebase/PostgreSQL and ONNX. ONNX, TensorFlow.js and MediaPipe are **not** present in the shipped bundles.
- **Security headers are strong:** HSTS, CSP, `X-Frame-Options: DENY`, `nosniff`, `Permissions-Policy camera=(self)`, and www and http both redirect with 308 to https://glowvai.in.
- **Speed (Pixel 7 emulation, single run, from a US datacenter — indicative only):**

| Page | TTFB | LCP | CLS | Transfer | Requests |
|---|---|---|---|---|---|
| Home | 407 ms | 0.90 s | 0.001 | 694 KB | 39 |
| Face analysis | 111 ms | 0.23 s | 0 | 270 KB | 34 |
| Product | 189 ms | 1.11 s | 0 | 263 KB | 36 |
| Delivery | 135 ms | 0.38 s | 0 | 126 KB | 32 |
| **Shop** | 315 ms | **1.78 s** | 0 | **2.27 MB** | **82** |

  Static pages are fast (served from Vercel's edge cache). `/shop` is heavy. Some product images are 400+ KB PNGs (e.g., `serum-1.png` is 414 KB). `/shop` logged a 404, a 400 and a failed Firestore Listen channel in the console.
- **Mobile:** No horizontal overflow at 412 px on any tested page, and the viewport is set correctly. The `/face-analysis` page detects in-app browsers (Instagram/Facebook) and asks users to open Chrome/Safari. This matters because traffic from Instagram, auto-rickshaw QR codes and WhatsApp often opens in in-app browsers.
- **SEO basics:**
  - Every sitemap page has a unique `<title>` and meta description, a canonical tag, Open Graph and Twitter tags, `lang="en-IN"`, and an H1. The exception is `/shop`, which has **no H1 and no server-rendered content** (0 links in the HTML), so Google sees an almost empty page.
  - JSON-LD exists for Organization, WebSite, FAQ, Product and others.
  - **Problems:**
    1. Product JSON-LD names every product as **"The Derma Co …"** with `brand: The Derma Co` (e.g., "The Derma Co Clarity Pop Niacinamide Serum 30ml"). The visible page says the marketer is GLOW VAI, and The Derma Co sells no product by these names. This misattributes a real trademark in data that Google shows in search results.
    2. `robots.txt` has `Disallow: /*?*`, which blocks every URL with a query string. That is fine for filters but also blocks UTM-tagged landing URLs from being crawled.
    3. `/privacy` and `/terms` are `noindex`. Legal pages are usually left indexable as a trust signal.
    4. Only one blog article, and no Telugu-language content.
    5. The Organization schema's founder IDs (`#sardhar-musthafa`, `#rahimath`) differ from the on-page names (Sardar, Rehmit).
    6. `/sell` and `/affiliate` are live placeholders.
- **Broken links / errors:** All 125 unique internal links found resolve with 200. No broken internal links. Console errors appear on `/shop` only. The social links (Instagram, X, LinkedIn) were not verified (they need a login).

### 1.4 Trust signals and data handling

| Signal | What the site shows | Assessment |
|---|---|---|
| Dermatologist credibility | **No named dermatologist, advisor, or medical reviewer anywhere.** The scan is labelled "cosmetic skin insights, not medical advice". Returns mention "verified with our advisor", and careers lists a "Derm-Trained Skincare Advisor" opening. | Weak. Nothing backs the "dermatologically calibrated" wording on the press page. |
| Privacy policy | Exists, but is publicly marked **"Draft for legal review… not final"**. Names the data fiduciary as "GLOW VAI Technologies Pvt. Ltd.". Says photos are **"analysed on your phone… saved only if you check the separate optional image consent box"**, kept 90 days, and lists **only Vercel** as a processor. Says "We do not use third-party tracking cookies". | **Contradicted by the code.** The photo is uploaded with every submitted report, and there is no image checkbox. Undisclosed processors are Google (Apps Script/Sheets, Firebase), ipify, ipapi.co and OpenStreetMap Nominatim. GPS location is requested. Google Analytics tags are present (placeholder ID). Under the DPDP Act a notice must describe the processing accurately (see Part 4). |
| Inconsistent photo statements | Home and FAQ: "sent to us only when you submit your report". Privacy: "analysed on your phone… only if you check… consent box". Shop: "sent to GlowVai's analysis service only to run this check". | Three different stories. Pick the true one and use it everywhere. |
| Terms | Exist, also marked "Draft for legal review". Jurisdiction: Hyderabad courts. | Draft banner undermines trust. Jurisdiction and address don't match the Vijayawada HQ. |
| Refund policy | 14-day guarantee on `/returns`; **7-day return window** on `/shop`; FAQ says damage must be reported within 48 hours. | Inconsistent windows. Under the E-Commerce Rules, the displayed return policy must be clear (Part 4). |
| Legal entity | "GLOW VAI Technologies Pvt. Ltd." with an address of "Studio 4B, Design District, Hyderabad 500081" (privacy, terms, product labels). Contact and grievance pages say "GLOW VAI Retail, Vijayawada 520001". Press page says "GLOW VAI (Glow Vai Retail)". | **UNVERIFIED** — I could not check the MCA registry for this company. If it is not incorporated, naming it as data fiduciary and marketer is a serious problem. "Design District" looks like a template placeholder. No CIN or GSTIN is shown anywhere. |
| Product labelling | Own-label products list a "Marketer" but **no manufacturer name, address or manufacturing licence number**. The story page says "we do not make it". | Cosmetics Rules 2020 require manufacturer details and licence number on the label (Part 4). Either these are real own-label products that need that information, or they are mock-ups that should be removed. |
| Social proof | "4.9/5", "1,200+ scans completed in Vijayawada", and a named testimonial ("Ananya R., Benz Circle… delivered in 14 minutes"), next to "We're new. Tell us what you think." | **Cannot be verified from the site.** If these are illustrative rather than real, they are a CCPA misleading-ad / fake-review risk (Part 4). |
| Operational claims | 5 "Active" hubs with average times, "licensed partner pharmacies", "batch codes verified with official brand distributors", "cut transit times by 98%", "HDFC 10% off", "rider transit insurance". | Unverifiable from outside. Each needs evidence on file or should be softened. |
| Contact details | Phone/WhatsApp, 8 role emails (Zoho, MX valid), grievance officer named with hours, physical address (partial). | Good breadth. Use a full street address. |
| Age gating | "18+" text, but the demographic picker offers "Boy (Under 18)" and "Girl (Under 18)". | Contradiction. Under DPDP, processing a child's data needs verifiable parental consent (Part 4). |
| Test data in production | "Test Test ₹1" listed under Bestsellers on `/shop`. | Remove immediately. |

### 1.5 Weaknesses and quick fixes (priority order)

| # | Weakness | Quick fix (days, not months) |
|---|---|---|
| 1 | Scores don't come from the photo, but are marketed as AI/computer vision | Either (a) relabel honestly now ("a guided skin check based on your answers; photo used for reference") or (b) ship real image analysis (on-device model or a licensed SDK — see Part 3) **before** saying "AI". Remove "proprietary computer-vision models" from the press page until true. |
| 2 | Photo uploaded without the image consent the policy promises; undisclosed processors; IP collected on page load | Add an unticked, separate "Save my photo" checkbox and send `image_base64` only when ticked. Call ipify/ipapi only after consent. List every processor (Google Apps Script/Sheets, Firebase, Zoho, ipapi, ipify, OSM). Move face images out of Apps Script into access-controlled storage with automatic 90-day deletion. |
| 3 | "Draft for legal review" on privacy and terms | Get a lawyer review, remove the banner, make the pages indexable, and add them to the sitemap. |
| 4 | Real brand (The Derma Co) wrongly named in product structured data | Fix the JSON-LD `brand` and `name` today. |
| 5 | Own-label products without manufacturer/licence info vs "we do not make it" | Decide: retail-only (remove the 6 own-label products) or own-label (add manufacturer name, address, licence no., batch, mfg/expiry per Cosmetics Rules 2020). |
| 6 | Unverified social proof and operational claims | Remove "4.9/5" and "1,200+" unless backed by data. Label illustrative testimonials or remove them. Soften "98%", "100% genuine", "HDFC" and "insurance" unless contracts exist. |
| 7 | Inconsistent policies (7 vs 14 days; 48 h; three photo statements; two addresses; Hyderabad vs Vijayawada jurisdiction) | One policy source of truth. Show CIN, GSTIN, and full registered and operating addresses in the footer. |
| 8 | Under-18 options despite the 18+ rule | Remove the under-18 groups, or build parental consent. |
| 9 | No dermatologist credibility | Engage a consulting dermatologist (named, registration no.) to review the product-matching rules and content. Show "Reviewed by Dr X, MD (Derm), Reg. No." on content, not on scan results. |
| 10 | `/shop` is client-rendered, heavy, hotlinks retailer images, shows test data | Server-render the catalogue. Use your own or brand-licensed images in your own storage. Compress to WebP/AVIF. Remove the test product. |
| 11 | Analytics placeholder; no measurement | Set a real GA4 ID behind a consent banner, or use a privacy-light tool. You cannot measure funnel conversion today. |
| 12 | `robots.txt` blocks all query-string URLs; thin content; no Telugu | Narrow the disallow rule. Add Telugu pages and 10–20 concern/ingredient articles targeting Vijayawada queries. |
| 13 | DMARC `p=none` | Move to `quarantine` after monitoring (protects support@ / returns@ from spoofing). |

---

## PART 2 — THE INDIAN BEAUTY AND SKINCARE MARKET

### 2.1 Market size and growth

| Segment | Size | Growth | Source |
|---|---|---|---|
| Total BPC | ~USD 23 bn (FY25), up from ~USD 15 bn (FY20) | ~12% CAGR to ~USD 40 bn (FY30); was ~9% FY20–25 | [Redseer, Feb 2026](https://redseer.com/wp-content/uploads/2026/02/India-BPC-2030_Growth-Shifts-and-Opportunities_ExecReport_Redseer-2.pdf) |
| Total BPC (alternative) | ~USD 24 bn (FY25) | USD 40–45 bn by FY30 | [Motilal Oswal, Dec 2025](https://bsmedia.business-standard.com/_media/bs/data/market-reports/equity-brokertips/2025-12/17665661370.41111100.pdf) |
| Total BPC (alternative) | USD 31.19 bn (2025) | 5.08% CAGR to USD 48.7 bn (2034) | [IMARC, 2025/26](https://www.imarcgroup.com/india-beauty-personal-care-market) |
| Total BPC (alternative) | USD 33.08 bn (2025) | 3.48% CAGR to 2030 | [Statista, 2025](https://www.statista.com/outlook/cmo/beauty-personal-care/india)† |
| BPC retail value growth | — | +9% in 2025 | [Euromonitor, May 2026](https://www.euromonitor.com/beauty-and-personal-care-in-india/report) |
| Skincare | USD 9.06 bn (2025) | 7.49% CAGR to 2034 | [IMARC](https://www.imarcgroup.com/india-skincare-market) |
| Skincare growth | — | ~13% CAGR FY25–29 (makeup ~12%, fragrance ~10%, others ~9%) | [Motilal Oswal / Redseer, Dec 2025](https://bsmedia.business-standard.com/_media/bs/data/market-reports/equity-brokertips/2025-12/17665661370.41111100.pdf) |
| Online BPC | ~USD 4.8 bn (FY25) | USD 13–15 bn (FY30) | [Redseer, 2026](https://redseer.com/wp-content/uploads/2026/02/India-BPC-2030_Growth-Shifts-and-Opportunities_ExecReport_Redseer-2.pdf) |
| Online BPC (₹) | ~₹52K Cr (CY25), up from ~₹21K Cr (CY22) | 2.4× in 3 years | [Redseer, Mar 2026](https://redseer.com/articles/beauty-personal-care-in-quick-commerce/) |
| Premium beauty (>₹1,000) | USD 3–3.2 bn by 2028 | Online premium 21–22% CAGR | [Nykaa × Redseer, 2024](https://nykaa.com/media/wysiwyg/2024/pdf/Nykaa_Beauty_Summit_Report_2024-v5.pdf) |
| Men's grooming | ₹18,630 Cr (2025) | +9% | [Euromonitor via Open, Nov 2026](https://openthemagazine.com/branding-marketing-and-advertising/too-many-stars-one-bathroom-shelf-can-indias-celebrity-mens-grooming-brands-all-find-a-market) |
| New-age (D2C-origin) brands | ~USD 3–3.5 bn revenue pool (FY26) | USD 10–12 bn by FY31; brands with ₹100 Cr+ revenue: ~70 → 150+ | [Redseer, 2026](https://redseer.com/wp-content/uploads/2026/02/India-BPC-2030_Growth-Shifts-and-Opportunities_ExecReport_Redseer-2.pdf) |

**Why the estimates disagree.** Firms count different categories (Redseer includes wellness and oral care), use different exchange rates (₹80 vs ₹85 per USD), and measure retail value vs manufacturer value. Analysis: for investor decks, use Redseer's figure and name it. Do not mix firms.

**Fragmentation is rising.** HUL's skincare share fell from 37% to 28%, and its colour-cosmetics share from 22% to 15%, between 2020 and 2025 ([Euromonitor Skin Care in India, May 2026](https://www.euromonitor.com/skin-care-in-india/report)). Concern-led and active-led searches are rising. For example, sunscreen-spray searches on Nykaa rose 388% from Jan to Jul 2024 ([Nykaa × Redseer, 2024](https://nykaa.com/media/wysiwyg/2024/pdf/Nykaa_Beauty_Summit_Report_2024-v5.pdf)).

### 2.2 Consumer segments

- **Age.** Gen Z and Gen Alpha are about 32% of BPC spend (FY24) and are projected at about 50% by FY30. Millennials fall from about 62% to 44% ([Redseer, 2026](https://redseer.com/wp-content/uploads/2026/02/India-BPC-2030_Growth-Shifts-and-Opportunities_ExecReport_Redseer-2.pdf)).
- **Gender.**
  - Men account for less than 10% of BPC spend (Redseer, cited by H.I.M., [Open, 2026](https://openthemagazine.com/branding-marketing-and-advertising/too-many-stars-one-bathroom-shelf-can-indias-celebrity-mens-grooming-brands-all-find-a-market)).
  - Flipkart men's grooming grew 50–80% YoY in 2025 ([Storyboard18, Jan 2026](https://www.storyboard18.com/amp/brand-marketing/mens-grooming-gains-lifestyle-edge-as-flipkart-amazon-post-up-to-80-yoy-growth-88232.htm)).
  - On Amazon, Tier 2 and smaller cities are more than 75% of repeat men's-grooming customers (same source).
- **City tier.**
  - About 65% of Nykaa revenue comes from "tier two cities and beyond" ([Nykaa AGM, Aug 2025](https://www.nykaa.com/media/wysiwyg/uiTools/2025-8/transcript-of-13th-agm.pdf)).
  - About 55% of the top prestige brands' sales on Nykaa are from non-metros ([Nykaa × Redseer, 2024](https://nykaa.com/media/wysiwyg/2024/pdf/Nykaa_Beauty_Summit_Report_2024-v5.pdf)).
  - Nykaa Superstore (B2B to retailers): about 89% of sales come from Tier 2 and smaller cities (AGM 2025).
  - Amazon: more than half of premium beauty demand is from Tier 2/3 cities, and premium beauty grew 50% YoY ([Business Today, May 2026](https://www.businesstoday.in/latest/trends/story/from-korean-serums-to-french-creams-how-these-indian-cities-are-driving-indias-premium-beauty-boom-532827-2026-05-23)).
- **Vijayawada and Andhra Pradesh.**
  - Vijayawada is a "Y" (Tier 2) city under the 7th CPC HRA classification ([StaffNews / Finance Ministry OM, 2017](https://www.staffnews.in/2017/07/7th-cpc-house-rent-allowance-hra-finance-ministry-om.html)†).
  - Census 2011 population: urban agglomeration ~14.77 lakh; municipal corporation ~10.3–10.5 lakh. Sources conflict ([Census2011.co.in](https://census2011.co.in/census/metropolitan/344-vijayawada.html)†). Verify on censusindia.gov.in.
  - AP per-capita income was ₹2,68,653 (2024-25) against ₹2,00,162 nationally ([AP Socio-Economic Survey 2024-25](https://adda247.com/jobs/wp-content/uploads/sites/9/2025/02/28171012/AP-Socio-Economic-Survey-2024-25.pdf)†). The 2025-26 advance estimate is ₹2,94,507, with **NTR district ranked 3rd** in the state ([Deccan Chronicle, Apr 2026](https://www.deccanchronicle.com/southern-states/andhra-pradesh/per-capita-income-rayalaseema-districts-lag-behind-visakhapatnam-records-highest-earnings-1948928)).
  - **No AP-specific beauty spending data exists in public sources (UNVERIFIED).**
- **South Indian skin context.**
  - In a melasma study, southern patients had the highest weekly sun exposure (~43 h), and **87% used no sunscreen** ([Dermatology & Therapy, 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4065278)).
  - Chennai women had significantly darker mean skin luminance than women in Mumbai, Delhi and Kolkata ([IJDVL, 2014](https://ijdvl.com/?p=7174)).

### 2.3 Major consumer problems (with evidence)

| Problem | Evidence | Source |
|---|---|---|
| **Counterfeit and expired products** | 34% of households bought fake cosmetics in 3 years (12% online, 22% offline). 19% of online shoppers got a fake in 6 months, with cosmetics among the top faked categories (35%). 20% of online shoppers got a fake in the last 12 months, and 43% found no way to report it. 53% of counterfeit purchases are online. CDSCO and police seized heavy-metal skin-whitening creams in Hyderabad (Oct 2026). | [LocalCircles 2022](https://www.localcircles.com/a/press/page/cosmetic-products-reaction); [LocalCircles 2018](https://www.localcircles.com/a/press/page/fake-products-on-ecommerce-sites); [LocalCircles via NewsMeter, Jan 2025](https://newsmeter.in/do-you-know/20-online-shoppers-received-fake-product-at-least-once-in-12-months-survey-742207); [ASPA–CRISIL via ThePrint, Mar 2026](https://theprint.in/feature/indias-fake-goods-boom-9-in-10-urban-shoppers-have-bought-knockoffs-says-survey/2880659); [Telangana Today, Oct 2026](https://telanganatoday.com/pakistan-made-cosmetics-worth-rs-7-lakh-seized-in-hyderabad-wider-network-suspected) |
| **Expiry visibility** | 57% of online shoppers could not find best-before dates; quick-commerce apps were flagged. | [Business Standard / LocalCircles, 2024](https://business-standard.com/companies/news/quick-commerce-firms-don-t-display-items-best-before-dates-57-shoppers-124101000859_1.html)† |
| **Paid or unreliable influencer advice** | FY25-26: 90% of 639 BPC ads needed changes; 45% were influencer-led. 76% of Forbes India's Top 100 Digital Stars broke disclosure rules. Typical claims: "acne reversal in 6 hours", "India's No.1 Dermatologist Recommended". Apr–Sep 2025: skincare was 66% of personal-care violations. India has 3 mn+ influencers (FY25). | [ASCI 2025-26](https://www.ascionline.in/wp-content/uploads/2026/05/annual-complaints-report-25-26-final.pdf); [ASCI H1 2025-26](https://www.ascionline.in/wp-content/uploads/2025/11/ASCI-Half-Yearly-Complaints-Report-2025-26.pdf); [Redseer 2026](https://redseer.com/wp-content/uploads/2026/02/India-BPC-2030_Growth-Shifts-and-Opportunities_ExecReport_Redseer-2.pdf) |
| **Dermatologist shortage** | ~9.5 dermatologists per million people (US ~34), concentrated in cities. IADVL has 17,000+ members. One source contrasts ~18,000 registered dermatologists with ~2 mn "Instagram skin doctors". | [IJDVL 2024](https://ijdvl.com/global-health-dermatology-an-emerging-field-addressing-the-access-to-care-crisis); [IADVL](https://www.iadvl.org/about-iadvl); [The South First](https://thesouthfirst.com/health/instagram-skin-doctors-vs-real-dermatologists-dakshin-health-summit-exposes-digital-quackery-crisis)† |
| **Adverse skin reactions and steroid misuse** | 15% of households had an allergic reaction or serious ailment from cosmetics (3 years). 12-centre study: 14.8% of facial-dermatoses patients used steroids; 59.3% on non-doctor advice; 29% as a fairness or general cream. 2024 study: 63% got the steroid OTC; uses were acne 41%, melasma 20%, fairness 12%. 14 steroid creams were moved to Schedule H in 2018. | [LocalCircles 2022](https://www.localcircles.com/a/press/page/cosmetic-products-reaction); [IJDVL 2011](https://ijdvl.com/topical-corticosteroid-abuse-on-the-face-a-prospective-multicenter-study-of-dermatology-outpatients/); [Cureus 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11723967/); [Down To Earth 2018](https://www.downtoearth.org.in/health/health-min-bans-14-over-the-counter-steroid-creams-60122) |
| **Wasted spending and returns** | Of fake cosmetics, 45% bought online and 65% bought offline could not be returned. About 60% of e-commerce/quick-commerce shoppers had return or refund problems in the 2025 festive season. Opened beauty is non-returnable at Nykaa, Mamaearth, Minimalist, CureSkin, Amazon India† and AJIO. | [LocalCircles 2022](https://www.localcircles.com/a/press/page/cosmetic-products-reaction); [Business Today / LocalCircles, Oct 2025](https://www.businesstoday.in/india/story/online-festive-shopping-blues-6-in-10-consumers-stuck-with-wrong-or-defective-products-they-couldnt-return-during-diwali-500419-2025-10-31); [Nykaa policy](https://nykaa.com/cancellation-policy); [Minimalist policy](https://beminimalist.co/policies/refund-policy); [CureSkin refunds](https://www.cureskin.com/refunds); [Zoutons, Oct 2026](https://zoutons.com/news/d2c-beauty-return-windows-compared-2026). A beauty-specific return rate for India: **UNVERIFIED**. |
| **Products unsuited to Indian skin and climate** | Melasma in ~27–30% of women aged 40–65 (4-city study); 70%+ of women over 30 had >10 facial hyperpigmented spots. In a melasma study only 35% used sunscreen. AI-scan study of 21,373 Indians: dark circles 66.6%, "dehydrated" 70.3%, at least one moderate concern 79% (company-sponsored study). Nykaa and Redseer call fit for Indian skin tone and texture a core lever. | [IJDVL 2014](https://ijdvl.com/?p=7174); [Derm Ther 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4065278); [BioPatrika / Ningen–Auriga, Jun 2026](https://biopatrika.com/science-society/health/ai-skin-analysis-india-ningen-auriga-study/); [Nykaa × Redseer 2024](https://nykaa.com/media/wysiwyg/2024/pdf/Nykaa_Beauty_Summit_Report_2024-v5.pdf). Humidity-specific suitability studies: **UNVERIFIED**. |

### 2.4 How Indians discover and buy skincare

- **Channel split, FY25:** unorganised retail (kirana, chemists, general trade) about 52% (down from 72% in FY20); organised physical retail about 28%; e-commerce about 20% ([Redseer, 2026](https://redseer.com/wp-content/uploads/2026/02/India-BPC-2030_Growth-Shifts-and-Opportunities_ExecReport_Redseer-2.pdf)).
- **Online by business model, FY25 → FY30P:**
  - Horizontal marketplaces (Amazon, Flipkart): ~40% → 20–30%
  - Vertical specialists (Nykaa type): ~27% → 15–25%
  - Quick commerce: ~15% → 30–40%
  - D2C brand websites: ~10% → ~10%
  - Value commerce (Meesho type): ~8% → 10–15%
- **Quick commerce is now material.**
  - BPC is the second-largest quick-commerce category, at about 8% of GMV (CY25) ([Redseer, Mar 2026](https://redseer.com/articles/beauty-personal-care-in-quick-commerce/)).
  - Quick-commerce BPC is nearing USD 1 bn annualised and growing about 90% YoY. **59% of that spend is premium or masstige**, against 37% in the overall market ([BW Retail World / Redseer Brand Index, Jul 2026](https://bwretailworld.com/sector/e-commerce-marketplaces/premium-products-make-up-59-of-beauty-quick-commerce-spending)).
  - Quick-commerce makeup sales were about 2.2× Amazon's in July 2026 ([IndianTelevision, 2026](https://indiantelevision.com/iworld/quick-commerce-makeup-sales-hit-rs-938-crore-in-july-2026/)†).
- **Discovery is creator-led, conversion is replenishment-led.**
  - Motilal Oswal: discovery is "driven by creators, tutorials and concern-led storytelling". In-store consultation is often the entry point for online repeat buying, and quick commerce "does not solve the broader discovery and curation journey" ([Motilal Oswal, Dec 2025](https://bsmedia.business-standard.com/_media/bs/data/market-reports/equity-brokertips/2025-12/17665661370.41111100.pdf)).
  - Nykaa runs a network of 28,000 influencers ([AGM 2025](https://www.nykaa.com/media/wysiwyg/uiTools/2025-8/transcript-of-13th-agm.pdf)).
  - Non-metro shoppers are swayed by "infotainment" and regional creators, and dermatologists are gaining relevance as influencers ([Nykaa × Redseer, 2024](https://nykaa.com/media/wysiwyg/2024/pdf/Nykaa_Beauty_Summit_Report_2024-v5.pdf)).
- **Language.** 57% of urban internet users prefer Indic-language content, and Telugu is among the most popular ([IAMAI–Kantar, Jan 2025](https://www.iamai.in/sites/default/files/research/Kantar_%20IAMAI%20report_2024_.pdf)†).
- **Word of mouth and dermatologist referral:** no survey data giving their share was found (**UNVERIFIED**).

### 2.5 Problems still unsolved in the Indian beauty sector

1. **Discovery is weak where most purchases happen.** Purchases skew to grocery and pharmacy stores, "limiting beauty-led discovery"; Redseer also cites "broken distribution" in smaller cities, "significant margin leakages" and consumer-education gaps ([Redseer, 2026](https://redseer.com/wp-content/uploads/2026/02/India-BPC-2030_Growth-Shifts-and-Opportunities_ExecReport_Redseer-2.pdf)).
2. **Trust.** Counterfeits, fake reviews and unsubstantiated influencer claims persist (section 2.3). ASCI calls the "speed-first, compliance-later mindset" a "structural problem that results in trust erosion".
3. **No safety net for a skin reaction.** Opened products are non-returnable almost everywhere in India (Part 3.3).
4. **Expert access.** Dermatologists are scarce outside cities, and OTC steroid self-medication is common.
5. **Brand economics.** Marketing eats 33–53% of revenue at leading D2C brands (Part 3.6). Fewer than 3% of brands cross ₹100 Cr ([Nykaa × Redseer, 2024](https://nykaa.com/media/wysiwyg/2024/pdf/Nykaa_Beauty_Summit_Report_2024-v5.pdf)).
6. **Quick commerce is optimised for speed, not advice.** It is optimised for replenishment, not personalised routines (Motilal Oswal, 2025). It also faces expiry-display, return and gig-worker controversies (Part 3.4).
7. **Salons are mostly informal.** About 300,000 operators, of which only ~14,200 are organised chain outlets ([Ken Research](https://www.kenresearch.com/industry-reports/india-beauty-salon-market.md)). Many run on cash, registers and WhatsApp (vendor claims†).
8. **The AI skin tools themselves are unreliable.** A Which? test (UK, Oct 2026) found Boots' tool missed acne in 10 of 14 cases, never flagged redness, and swung up to 39 points with lighting. It also gave darker skin (Fitzpatrick IV–V) higher average scores ([Which?, 2026](https://www.which.co.uk/news/article/can-you-trust-ai-skin-analysers-a7Uhd1Q5mhUa)). Indian-skin-validated analysis is an open problem.

---

## PART 3 — COMPETITOR LANDSCAPE

### 3.1 AI skin-analysis apps and tools

**India**

| Player | What it does | Consumer price | Funding / financials | Presence |
|---|---|---|---|---|
| **CureSkin** (Bengaluru, 2017) | App: AI photo analysis plus a dermatologist-prescribed kit and follow-ups | Plans from ₹1,700 ([pricing](https://cureskin.com/pricing)) | US$26M+ raised; Series B US$20M (Mar 2024) ([Inc42](https://inc42.com/buzz/cureskin-secures-20-mn-to-scale-up-its-ai-powered-dermatology-platform)). FY26 revenue ₹133 Cr, loss ₹35 Cr, ad spend ₹61 Cr, cash ₹8 Cr ([D2C Insider, Oct 2026](https://pulse.d2cinsider.com/cureskin-reports-₹133-crore-revenue-in-fy26-as-net-loss-narrows-48-5/)) | Online, all-India; 1.5M+ customers, **80%+ Tier II/III** |
| **Kult** (Mumbai) | Beauty app with "Skin Code Test" compatibility score, own dark stores, premium brands | Product prices | US$20M Series A (May 2025) ([Indian Startup News](https://indianstartupnews.com/funding/kult-a-startup-using-ai-to-offer-personalised-skincare-recommendations-raises-over-rs-170-crore-in-funding-9030145)). **CDSCO cancelled all its cosmetic import registrations (Feb 2026)** over label mismatches and misleading claims ([Medical Dialogues, Feb 2026](https://medicaldialogues.in/amp/news/industry/pharma/cdsco-cancels-kult-apps-cosmetic-import-registrations-over-false-labeling-165567)) | Mumbai (2-hour delivery); pan-India 2-day ([ThePrint, 2022](https://theprint.in/ani-press-releases/kult-app-launches-in-india-tech-driven-beauty-app-with-under-2-hour-deliveries-in-mumbai-and-less-than-48-hours-pan-india/1251008/)) |
| **Nykaa Skin Scan / Skin Compass** | Selfie scan of ~15 factors† plus a questionnaire, leading to products | Free | Part of Nykaa | App, all-India ([NewsBytes, Nov 2025](https://www.newsbytesapp.com/news/science/nykaas-new-skin-scan-lets-you-selfie-your-way-to-better-skincare/tldr)†; [Skin Compass](https://www.nykaa.com/skin-compass)) |
| **Tira** (Reliance) | In-store skin-analysis tablets, smart mirrors, virtual try-on, AI bot | Free in store | Not disclosed separately | Metros only (Mumbai, Pune, Chennai, Bengaluru, Hyderabad, Delhi) ([ThePrint, Apr 2025](https://theprint.in/feature/tira-turns-two-indias-beauty-playground-gets-bigger-bolder-and-more-beautiful/2586472/)) |
| **The Derma Co** (Honasa) | Free AI skin test on app, web and in store | Free | ARR >₹1,000 Cr† | All-India ([blog](https://thedermaco.com/blogs/skin-care/the-derma-co-ai-skin-test-works-app-vs-website)†) |
| **Foxtale** | In-app "Skin Horoscope" selfie report, built by Fynd GlamAR | Free | FY25 revenue ~₹199 Cr, loss ~₹73 Cr† | App ([GlamAR case study](https://www.glamar.io/customer-stories/foxtale)) |
| **Kaya** | AI selfie app (Sep 2024) plus 75+ clinics | App price not stated; clinic treatments | Listed; FY25 revenue ~₹217 Cr† | 27 cities incl. Hyderabad and Vizag; **not Vijayawada** ([PR Newswire 2024](https://prnewswire.com/in/news-releases/kaya-launches-ai-powered-app-to-revolutionize-personalized-skincare-solutions-302255943.html); [kaya.in](https://www.kaya.in/)) |
| **Oliva Skin & Hair** | Doctor-led clinic consultations; no AI scan advertised | **₹900 consultation in Vijayawada** | Kedaara bought majority for ~US$65M (Mar 2023)†; FY25 revenue ~₹113.5 Cr† | **Has a clinic in Patamata, Vijayawada** ([Oliva Vijayawada](https://www.olivaclinic.com/vijayawada/)) |
| **Clinikally** ("Clara") | Teledermatology, e-pharmacy and AI assistant | Not stated | ~US$3.1M (YC, Tribe)† | ~500 cities ([YC Launches](https://www.ycombinator.com/launches/Ndm-clara-by-clinikally-clinical-grade-skin-analysis-with-ai)) |
| **Puresta EVERQ** (2026) | AI assessment, then dermatologist, then SKINQ products; "Diagnose First. Then Treat." | Not disclosed | ₹34 Cr pre-seed (Feb 2026) ([Angel One/Inc42](https://www.angelone.in/news/unlisted-companies/beauty-and-personal-care-startup-puresta-raises-34-crore-to-build-ai-powered-dermatology-platform)) | Launched Sep 2026, aims beyond metros ([Indian Pharma Post](https://www.indianpharmapost.com/healthcare/purestas-everq-brings-ai-led-skin-assessment-and-dermatologist-care-into-one-platform-21922)) |
| **SkinBB** (2026) | Audited, dermatologist-led marketplace; engine uses UV, AQI and humidity | Not disclosed | Not disclosed | Launched Aug 2026 ([Indian Pharma Post](https://www.indianpharmapost.com/healthcare/skinbb-launches-ai-powered-dermatologist-led-skincare-ecosystem-for-indian-consumers-21530)) |
| **Myntra** | Revieve-powered Digital Skincare Advisor (2021) | Free | — | App† |
| **Traya** (hair; analogous model) | Online hair test, then doctor, then kits; 20+ offline centres | Kits | FY25 revenue ₹338 Cr, loss ₹23 Cr ([Entrackr](https://entrackr.com/fintrackr/traya-returns-to-losses-in-fy25-as-marketing-and-employee-costs-surge-10961037)); raising at ₹2,500–3,000 Cr valuation ([Inc42, Oct 2026](https://inc42.com/?p=576233)) | Incl. Hyderabad centres |
| **Fynd GlamAR** (B2B vendor) | White-label AI skin analysis for brands | **~US$250/month for 10,000 scans**† ([Shopify listing](https://apps.shopify.com/glamar)); tiers on [pricing page](https://www.glamar.io/pricing/ai-skin-analysis) | Reliance-backed Fynd | India |
| **SkinKraft** (Hyderabad) | Quiz-based customised regimen, no face scan | — | US$4M Series A (2020)† | Online |

**Global**

| Player | What it does | Price | Funding / scale | Notes |
|---|---|---|---|---|
| **Perfect Corp** (YouCam; NYSE: PERF) | Consumer apps; B2B Skincare Pro scanner and API | Skincare Pro ~US$139–209 per licence per month†; "AI Skin Analysis from $5/month" ([blog](https://www.perfectcorp.com/business/blog/ai-skincare/four-popular-skin-scanner-features-prices-size)) | FY25 revenue US$69.2M†; going private at US$2.00/share (Jul 2026)† ([Retail Dive](https://www.retaildive.com/news/perfect-corp-go-private-merger/825065/)); subscribers fell to 820k ([FashionUnited, Jul 2026](https://fashionunited.com/news/business/perfect-corp-reports-net-income-growth-in-second-quarter-2026/2026072873737)) | Worked with Good Glamm Group in India (2023) ([Perfect Corp](https://www.perfectcorp.com/business/news/perfect-corp-partners-with-the-good-glamm-group)) |
| **Haut.AI** (Estonia) | B2B skin AI SaaS (SkinGPT, LIQA) | Quote, usage-based | ~€2M (2023)† | Clients include Neutrogena, Ulta and Beiersdorf; no Indian clients shown ([haut.ai](https://haut.ai/)) |
| **Revieve** (Finland) | White-label skin advisor | Quote | ~US$2M† | Clients include Boots and Myntra ([Wikipedia](https://en.wikipedia.org/wiki/Revieve_(company))). Which? found accuracy problems in the Boots deployment |
| **L'Oréal ModiFace / La Roche-Posay Spotscan+ / Cell BioPrint** | Brand-owned engines; Spotscan validated on 1,012 acne patients† | Free (brand tools) | L'Oréal | Cell BioPrint is a proteomics device from CES 2025† |
| **Neutrogena Skin360** | Brand app | Free | Kenvue | Changed vendors: Perfect Corp (2024), then Haut.AI (2025)† |
| **Samsung MICRO LED Beauty Mirror** | Concept mirror analysing wrinkles, pigmentation, pores and redness (~30 s) | **Not for sale** | — | CES 2025 Best of Innovation ([CES](https://ces.tech/ces-innovation-awards/2025/micro-led-beauty-mirror); [TweakTown](https://www.tweaktown.com/news/102435/samsung-can-diagnose-face-and-skin-conditions-with-its-new-mirror-display/index.html)). No sale in India or elsewhere found |
| **Lululab LUMINI** (Samsung C-Lab spin-off) | In-store skin-scan kiosk and SDK; unmanned AI Beauty Store in Dubai Mall (2019) | Not public | Series C KRW 20B (2022)† | Closest analogue to a GlowVai kiosk; recommends products but does not dispense ([PR Newswire 2019](https://www.prnewswire.com/ae/news-releases/samsung-spin-off-lululab-to-unveil-ai-beauty-store-a-decision-maker-of-cosmetic-products-in-dubai-mall-881452944.html)) |
| **Canfield VISIA** | Clinic imaging hardware | ~US$7,000–20,000 (estimate) | — | Indian price **UNVERIFIED** |
| **SkinVision / Skinive** | **Medical** apps (EU-certified: SkinVision MDR Class IIa; Skinive CE) | — | SkinVision ~US$13M† | Shows the line where an app becomes a medical device ([IO+, 2025](https://ioplus.nl/en/posts/highest-european-certification-for-skin-cancer-detection-app)) |

**Takeaways for GlowVai**
- (1) **The software is not a moat.** White-label scans cost about US$250/month, and big brands switch vendors.
- (2) **Accuracy and trust are the gap.** The Which? findings show the category over-promises.
- (3) **CureSkin's numbers show customer acquisition is expensive.** Ad spend is about 46% of revenue. A physical, local, referral-driven funnel (auto drivers, campuses, salons, pharmacies) is a credible lower-cost alternative, but only if conversion is proven.

### 3.2 Beauty marketplaces and retailers

| Player | Latest financials | Valuation / market cap | Scale | Problems they face |
|---|---|---|---|---|
| **Nykaa** (FSN E-Commerce) | Q2 FY27: revenue ₹3,006 Cr (+28%), profit ₹101 Cr, GMV ₹6,151 Cr ([Business Today, Nov 2026](https://www.businesstoday.in/markets/stocks/story/nykaa-q2-earnings-net-profit-rises-revenue-crosses-rs-3000-crore-565721-2026-11-04)). FY26 revenue ₹10,022 Cr, profit ₹204 Cr ([Entrepreneur, May 2026](https://india.entrepreneur.com/business-news/nykaa-crosses-1-billion-revenue-mark-in-fy26)) | **~₹1.01 lakh Cr** market cap (4 Nov 2026) | 338 stores, 111 cities (one Nykaa Luxe in Vijayawada); Nykaa Now in 15 cities ([Inc42](https://inc42.com/?p=579242); [store locator](https://stores.nykaa.com/nykaa-luxe-cosmetics-store-sriram-nagar-vijayawada-543606/Home)) | Customers report rejected returns on opened items†; thin margins (8.7% EBITDA); quick-commerce competition. Nykaa deliberately avoids 10-minute delivery (30–60 min)† |
| **Purplle** | FY25 revenue ₹1,367 Cr (+101%), loss ₹69.4 Cr, marketing ₹218 Cr ([Inc42, Feb 2026](https://inc42.com/buzz/purplle-trims-fy25-net-loss-by-44-to-%E2%82%B969-4-cr/)) | ~US$1.2–1.3 bn (2024 round)†; ₹1,500 Cr Series F | 13 warehouses, 8 dark stores; owns Faces Canada and others | Loss-making; returns "case to case" ([policy](https://www.purplle.com/pr/cancellation-and-returns)); IPO talk but **no DRHP found** |
| **Tira** (Reliance) | Not disclosed; the separate legal entity had nil revenue in FY25 ([RIL filing](https://www.ril.com/sites/default/files/2025-07/Tira_Beauty_Limited.pdf)) | Part of Reliance Retail | Experiential metro stores; "Tira Express" 4-hour delivery† | Metro-only footprint |
| **Sephora India** (Reliance) | Bought for ~₹99 Cr (Nov 2023)†; FY23 turnover ₹336.7 Cr† | — | 26 stores in 13 cities (2023)† | Recent revenue **UNVERIFIED** |
| **Myntra beauty** | Myntra FY25 revenue ₹6,043 Cr, profit ₹548 Cr† | Flipkart group | M-Now 30-minute delivery† | No beauty-specific disclosure |
| **Amazon / Flipkart** | Beauty GMV **UNVERIFIED** | — | Premium beauty +50% YoY on Amazon (2026) | Beauty generally non-returnable unless damaged, defective or wrong† |
| **Meesho** | Updated DRHP (Oct 2025), ₹4,250 Cr fresh issue† | — | Value commerce, Tier 2+ | Beauty share **UNVERIFIED** |
| **Smytten** (trials) | FY25 revenue ~₹111 Cr, loss ₹23.5 Cr† | — | Sampling-led | Revenue shrinking |
| **Foxy** | FY25 revenue ₹15.2 Cr (−54.6%), loss ₹20.8 Cr† | — | App | Steep decline |
| **Health & Glow** | **UNVERIFIED** | — | Chennai-founded chain (1997)† | No Vijayawada store found |

### 3.3 Refund, satisfaction guarantees and "beauty insurance"

| Company | Policy on opened or used skincare | How it works |
|---|---|---|
| **Ulta Beauty (US)** | **Accepts "new or gently used"** | Refund within 30 days; store credit for days 31–60; ID required ([Ulta](https://www.ulta.com/returns)) |
| **Sephora (US/Canada)** | Accepts "new or gently used" | Refund within 30 days; monitors for abuse ([Sephora](https://www.sephora.com/beauty/returns-exchanges)†) |
| **Boots (UK)** | Opened cosmetics refunded only if faulty; a "Make-Up Exchange Promise" existed (current status **UNVERIFIED**) | 35-day window† |
| **Plum (India)** | **The only Indian example found that accepts used product** | Any reason, within 7 days, <1/3 used, **store-coupon refund only, never cash** ([Plum](https://plumgoodness.com/policies/refund-policy)) |
| **Nykaa** | Refuses used or altered products | 15 days; colour cosmetics and appliances non-returnable ([Nykaa](https://nykaa.com/cancellation-policy)) |
| **Minimalist** | Only wrong, damaged or expired items | 7 days ([Minimalist](https://beminimalist.co/policies/refund-policy)) |
| **CureSkin** | Unopened only; no results guarantee | 7 days; customer pays return shipping ([CureSkin](https://www.cureskin.com/refunds)) |
| **Mamaearth, Beardo, mCaffeine, Dot & Key** | Refuse opened items; windows of 48 h to 7 days | [Zoutons, Oct 2026](https://zoutons.com/news/d2c-beauty-return-windows-compared-2026) |
| **Olay, Proactiv, Clinique money-back guarantees** | **UNVERIFIED** (official pages did not load) | — |
| **Cosmetic or skin-reaction insurance in India** | **None found.** Embedded e-commerce cover from ACKO, Digit and others was not researched. Absence is **UNVERIFIED**. | — |

**Analysis.** A cash refund on *used* skincare for "didn't suit me" or a verified reaction is essentially unavailable in India. GlowVai's 14-day "Skin Satisfaction Guarantee" (≥50% remaining, adverse reaction verified) is therefore a genuine differentiator, **if it is operated honestly and the economics are controlled**. Ways to control the cost:
- cap the claim at one per customer per product;
- require that the scan was taken before purchase;
- offer a replacement or store credit before cash;
- recover cost from brand partners as a "sampling" expense;
- track refund rate weekly.

A "skin-reaction protection" add-on backed by an insurer is an untested idea. It needs an IRDAI-registered partner, and nothing like it was found in India.

### 3.4 Quick commerce: players, delivery times, supply-chain model

| Player | Scale (latest) | Promise | Beauty moves | Vijayawada? |
|---|---|---|---|---|
| **Blinkit** (Eternal) | NOV ₹20,940 Cr in Q2 FY27 (+79%); **2,751 stores**; target 3,500+ by Mar 2027 ([Kotak Neo, Oct 2026](https://www.kotakneo.com/news/stocks/eternal-q2-results-profit-rises-revenue-growth-blinkit-adds-stores/)) | Dropped "10-minute" branding (Jan 2026) after a Labour Ministry push† | ~7,847 beauty SKUs†; Laneige and Forest Essentials listed† | **Yes**, since ~Aug 2024 (Currency Nagar)†; also Kakinada, Rajahmundry and Guntur ([IndianTelevision, Feb 2025](https://indiantelevision.com/news-headline/blinkit-expands-in-andhra-pradesh-bringing-hyper-fast-delivery-to-three-more-cities/)) |
| **Swiggy Instamart** | GOV ₹9,230 Cr in Q2 FY27; **1,240 stores, 133 cities**; adjusted EBITDA −₹895 Cr ([Inc42, Oct 2026](https://inc42.com/buzz/swiggy-q2-loss-narrows-16-yoy-to-%E2%82%B9922-cr-revenue-jumps-36/)) | ~12 min average in Vijayawada | In Vijayawada, bath/body/hair care up 114% | **Yes**, since Dec 2022, the city's first quick-commerce service ([Hans India, Aug 2025](https://assets.thehansindia.com/business/oil-tops-orders-bath-body-category-surges-114-as-vijayawada-embraces-instamarts-10-minute-delivery-revolution-993411)) |
| **Zepto** | FY26 revenue ₹22,624 Cr, **loss ₹5,905 Cr**, 1,139 stores ([Inc42, Jun 2026](https://inc42.com/buzz/zepto-fy26-loss-jumps-26-yoy-to-₹5905-cr-revenue-doubles/)) | 10-minute heritage | Take rate 22–23%† | **UNVERIFIED** |
| **Flipkart Minutes** | ~1,000–1,200 stores, 130–150+ cities† | Minutes | — | Listed as targeting Vijayawada† |
| **Amazon Now** | ~500–600 stores (UBS)†; 100-city plan | Minutes | — | Vizag announced; Vijayawada **UNVERIFIED** |
| **BB Now** (Tata) | ~800+ stores†; reportedly cutting to ~40 cities† | — | — | — |
| **JioMart quick** | 1,000+ cities, 600+ stores (Oct 2025)† | — | — | — |
| **Nykaa Now** | 15 cities | 30–60 min, 1,000+ brands† | Beauty specialist | Not listed |
| **Myntra M-Now** | — | 30 min† | Estée Lauder, YSL† | — |

**How the quick-commerce supply chain works (sourced points only)**
- **Dark stores close to demand.** Blinkit says speed comes "primarily due to stores being closer to customers and not higher road speeds"†.
- **SKU depth.** Stores grew from ~2,000 to ~6,000 SKUs, with plans for 10–12K, restocked 2–3 times a day ([TechCrunch, 2024](https://techcrunch.com/2024/06/17/can-quick-commerce-leapfrog-e-commerce-in-india)†).
- **Inventory vs marketplace, and FDI.** Majority foreign-owned e-commerce firms cannot own inventory. Eternal capped foreign ownership at 49.5% so Blinkit could switch to owned inventory from ~Sep 2025, and Instamart is following ([Inc42, 2025](https://inc42.com/features/blinkit-inventory-model-quick-commerce-cash-burn-problem)†).
- **Brand economics.**
  - Blinkit commission was 3–18% by category, then variable by price from Mar 2025 ([Inc42, Mar 2025](https://inc42.com/?p=503754)).
  - Instamart reportedly 20–22%; Zepto take rate 22–23%†.
  - Legacy brands run at ~1.7× the scale of digital-native brands on quick commerce, and the top 10 brands take 25% of quick-commerce BPC GMV ([BW Retail World, 2026](https://bwretailworld.com/sector/e-commerce-marketplaces/premium-products-make-up-59-of-beauty-quick-commerce-spending)).
- **Controversies.**
  - The distributors' federation AICPDF filed a predatory-pricing complaint with the CCI (Feb 2025; no ruling found)† and asked SEBI to stop loss-making quick-commerce IPOs†.
  - Maharashtra FDA suspended the food licence of Zepto's Dharavi store (expired stock, fungus) in May 2025†.
  - Telangana officials seized expired items at a Blinkit warehouse†.
  - LocalCircles flagged missing best-before dates.
  - Gig-worker safety pressure led to "10-minute" claims being dropped.
- Mother-hub, cold-chain and forecasting specifics: **UNVERIFIED**.

**Analysis for GlowVai.** Competing with Blinkit and Instamart on *speed* in Vijayawada is a losing fight: they have hundreds of crores in working capital and existing stores. GlowVai's 15-minute promise is credible only as a **"pharmacy-partner, authenticity-checked, advice-led"** service, not as a speed race. The delivery page's "Avg 12 min" claims need real data behind them.

### 3.5 Beauty vending machines and B2B skin-analysis software in India

- **Vending in India.**
  - Daalchini claims ~5,500 machines in 110 cities and ~₹140 Cr FY26 revenue (CEO statement), which works out to roughly ₹2.5 lakh per machine per year ([Inc42, Apr 2026](https://inc42.com/buzz/daalchini-claims-2x-yoy-jump-in-fy26-revenue-to-₹140-cr/)).
  - Vendiman claims 2,000+ UPI machines†.
  - Smart machines cost ~₹1.5–3.5 lakh ([Franchise India](https://static.franchiseindia.com/insights/en/article/vending-machine-cost-investment-in-india.56234)†).
  - An IndiaMART vendor lists an "AI cosmetic vending machine with virtual try-on" at ₹1 lakh (a listing, not a deployment)†.
- **Beauty vending precedents.**
  - Benefit "Glam Up & Away" airport kiosks (US, from 2013)†; Shiseido and Kanebo machines in Japan†.
  - India: Twenty Beauty planned 1,000 makeup machines (2020; no evidence of scale)†; Fabpiks "Vendy" sampling machine (Delhi, 2023)†; Sirona hygiene machines at Delhi T2†.
  - **No commercially scaled face-scan plus dispensing machine was found anywhere.** Lululab's kiosk recommends but does not dispense. A 2026 academic prototype exists ([EPJ Web of Conferences](https://www.epj-conferences.org/articles/epjconf/pdf/2026/33/epjconf_ips2026_06009.pdf)†).
- **B2B skin-analysis software and devices.**
  - Perfect Corp Skincare Pro (~US$139–209 per licence per month†) and GlamAR (~US$250/month†).
  - IndiaMART analysers: ₹3,000 dermascope; ₹8,500–18,000 basic; **₹1–1.85 lakh professional** ([IndiaMART](https://m.indiamart.com/impcat/skin-analysis-machine.html)†).
  - Bengaluru's Flekt brings AI skin and scalp analysis to salons†.
- **Salon software.** None of these advertise AI skin analysis:
  - **Zenoti** (30,000+ businesses globally; [zenoti.com](https://www.zenoti.com/))
  - **Invoay** (₹674–2,249/month per branch; [pricing](https://www.invoay.com/pricing))
  - **Salonist** (US$30–90/month; [pricing](https://www.salonist.io/pricing))
  - **Zylu** ([pricing](https://www.zylu.co/pricing))
  - **DINGG** (quote-based; [pricing](https://www.dingg.app/pricing))

### 3.6 Skincare and cosmetics brands: finance, problems, ease of entry

| Brand | Latest financials | Valuation / market cap | Notable problems |
|---|---|---|---|
| **Honasa** (Mamaearth, The Derma Co, Aqualogica…) | Q2 FY27 revenue ₹731 Cr (+36%), profit ₹73 Cr ([Inc42, Nov 2026](https://inc42.com/buzz/mamaearth-parent-honasas-q2-profit-jumps-87-yoy-to-₹73-cr/)); FY26 revenue ₹2,392 Cr, profit ₹200 Cr† | Market cap ~₹16,000–17,000 Cr (Nov 2026, aggregators)† | ₹63 Cr inventory correction and first loss in Q2 FY25; stock fell ~36% in 3 sessions† ([YourStory, 2024](https://yourstory.com/2024/11/distribution-woes-inventory-correction-mamaearth-honasa-consumer)†); ad spend ~33% of revenue† |
| **Minimalist** (HUL) | FY26 revenue ₹690 Cr, profit ~₹26 Cr, ad spend ~₹235 Cr† | HUL bought 90.5% at ₹2,955 Cr valuation (2025)† ([HUL](https://www.hul.co.in/news/press-releases/2025/hul-to-acquire-premium-beauty-brand-minimalist/)) | Ad intensity ~34% |
| **SUGAR** | FY25 revenue ₹404 Cr (−20%), loss ₹135 Cr | **Down round at ~₹550–600 Cr, a 75–80% cut** (Sep 2026) ([Inc42](https://inc42.com/buzz/sugar-cosmetics-raises-%E2%82%B9145-cr-from-a91-at-a-near-80-valuation-cut/)) | Closed 30–40% of its stores over per-store losses |
| **Plum** | FY25 revenue ₹402 Cr, profit ₹25 Cr† | Last round US$35M (2022)† | — |
| **Dot & Key** | GMV >₹900 Cr (FY25)† | ~90% owned by **Nykaa** (not Marico)† | Returns only within 48 h |
| **Foxtale** | FY25 revenue ~₹199 Cr, loss ~₹73 Cr; ad spend ~53% of revenue† | — | Spends ₹1.40 to earn ₹1† |
| **Pilgrim** | FY25 revenue ₹408 Cr, loss ₹68.7 Cr† | ₹3,000 Cr pre-money (Mar 2025)† | — |
| **Deconstruct** | FY25 ~₹130 Cr, profitable† | — | — |
| **RENÉE** | FY26 revenue >₹400 Cr† | ~US$200M (Aug 2025)† | — |
| **Bombay Shaving Co** | FY26 revenue ₹635 Cr, loss ₹9 Cr† | ₹136 Cr raise (Nov 2025)† | — |
| **Lakmé, Lotus, Himalaya, Biotique, Re'equil, Swiss Beauty** | **UNVERIFIED** in this research | — | — |

**How hard is it to enter as a brand?**
- **Regulation.**
  - Indian-made cosmetics need a State manufacturing licence or **loan licence** (Form COS-5/COS-6). Imports need CDSCO registration (COS-1). Labels must follow Rule 34 (Cosmetics Rules 2020; see Part 4).
  - Enforcement is real: CDSCO cancelled Kult's and Skintl's import registrations in 2026 ([Medical Dialogues](https://medicaldialogues.in/news/industry/pharma/cdsco-cancels-skintl-enterprises-cosmetic-import-registrations-over-unregistered-products-labelling-violations-178618)).
- **Manufacturing.** Contract manufacturers advertise MOQs of ~1,000–5,000 units per SKU (IndiaMART†). A reliable total launch-cost figure: **UNVERIFIED**.
- **Economics.**
  - Marketing runs 33–53% of revenue at leading D2C brands (sources in the table).
  - Packaging that leads with an ingredient (niacinamide, hyaluronic acid) is commoditised ([BestMediaInfo, 2025](https://bestmediainfo.com/mediainfo/mediainfo-marketing/hyaluronic-niacinamide-retinol-why-every-beauty-shelf-feels-the-same-10499518)†).
  - Fewer than 3% of brands cross ₹100 Cr.
- **Verdict (analysis).** Launching **another own-label serum brand is the weakest path for GlowVai**: crowded, ad-heavy, and HUL, Honasa and Nykaa are consolidating. GlowVai's leverage is *curation, advice and trust* across existing brands. That is also what the "Independent — we retail, we don't make" statement already claims.

### 3.7 Comparison table: where GlowVai fits

| Competitor | Offering | Price | Strengths | Weaknesses | Gap GlowVai could fill |
|---|---|---|---|---|---|
| CureSkin | AI photo, dermatologist and kit (app) | From ₹1,700 | 80% Tier II/III, US$26M+ | Ads ~46% of revenue; unopened-only refunds | Local, multi-brand, in-person trust; refund on reaction |
| Nykaa (+ Skin Scan†, Now) | Marketplace, stores, 30–60 min delivery | Product prices | Scale, authenticity reputation | One store in Vijayawada; refuses used returns; Nykaa Now not in Vijayawada | Assisted advice plus a skin-fit guarantee locally |
| Blinkit / Instamart | Delivery in minutes in Vijayawada | Product prices, 0 advice | Speed, stores already in city | No personalisation, no guidance; expiry/return complaints | "Right product for your skin," not "any product fast" |
| Tira / Sephora | Experiential stores with skin analysers | Product prices | Reliance capital | Metro-only | Tier 2 assisted beauty |
| Kult | Skin-compatibility score, dark stores | Product prices | US$20M funding | CDSCO registration cancellation (2026); metro-focused | Compliance-first, Tier 2 |
| Oliva (Vijayawada) | Doctor-led clinic | ₹900 consult | Local clinic, PE-backed | Costly, requires a visit | Free pre-screen that refers serious cases to clinics (partnership) |
| EVERQ / SkinBB | AI plus dermatologist platforms | Not disclosed | New funding, dermatologist founders | New, online-only | Offline Telugu-first presence in AP |
| Plum | Brand with used-product return (store credit) | — | Only Indian precedent | Single brand, coupons only | Multi-brand cash/replacement guarantee |
| Salon software (Zenoti, Invoay…) | Booking, POS | ₹674–4,000/month | Installed base | No skin analysis | Skin-scan add-on for salons |
| Perfect Corp / GlamAR | B2B scan SaaS | ~US$139–250/month† | Mature tech | Dollar pricing; no local service | Rupee-priced, Telugu, salon-integrated package |

**First-mover check (analysis, provisional).** No Indian company was found that combines skin analysis, multi-brand recommendations, authenticity-checked local delivery, and a guarantee on used product. That holds in Tier 2 or anywhere. Kult (scan, delivery), Plum (partial guarantee) and Tira (in-store scan, metros) each cover parts. Because the search budget ran out, regional or Tier 2 apps may have been missed.

---

## PART 4 — REGULATION AND RISK (INDIA)

*This is research, not legal advice. Items marked "Lawyer to confirm" or UNVERIFIED need an Indian advocate.*

### 4.1 Cosmetics: sale and claims

- **Cosmetic or drug.** The Drugs & Cosmetics Act 1940 defines a *cosmetic* as an article applied "for cleansing, beautifying, promoting attractiveness, or altering the appearance" (s.3(aaa)). A *drug* is anything "intended to be used for … diagnosis, treatment, mitigation or prevention of any disease or disorder" (s.3(b)) ([D&C Act text](https://www.thc.nic.in/Tripura%20State%20Lagislation%20Acts/Drugs%20and%20Cosmetics%20Act,%201940.pdf)). Analysis: claiming a product "treats acne or melasma" pushes it toward being a drug.
- **Cosmetics Rules 2020** (G.S.R. 763(E)) ([text](https://www.thc.nic.in/Central%20Governmental%20Rules/e%20Cosmetics%20Rules,%202020.pdf)):
  - **Import:** each imported product needs CDSCO registration (Rule 12, Form COS-1).
  - **Manufacture:** needs a State licence or loan licence (Rule 23, COS-5/COS-6).
  - **Sale:** only licensed and properly labelled products may be sold (Rule 33).
  - **Retail licence:** the Rules contain no separate cosmetics retail sale licence, unlike drugs (**Lawyer to confirm**, including any AP-specific requirement).
  - **Labels (Rule 34):** name; manufacturer name and address; batch number; use-before or expiry date; manufacturing licence number (or import RC number plus importer); net contents; warnings; ingredients.
  - **Rule 35:** no defacing of labels (relevant to repacking or vending).
  - **Rule 36:** "No cosmetic may … convey any idea which is false or misleading."
  - The 2025 amendment (G.S.R. 513(E)) defines "use before" as the 1st day of the stated month and "expiry" as the last day, and lets States suspend licences ([Medical Dialogues, 2025](https://medicaldialogues.in/amp/news/industry/pharma/health-ministry-notifies-cosmetics-rules-2025-empowers-states-to-suspend-licences-152852)†).
- **Penalties.**
  - Selling or stocking spurious or adulterated cosmetics: up to 3 years' imprisonment plus a fine of at least ₹50,000 (s.27A(i)). Retailers are covered.
  - Other breaches: up to 1 year or ₹20,000 (s.27A(ii)).
  - Lawyer to confirm whether the Jan Vishwas amendments changed these.
- **Drugs & Magic Remedies (Objectionable Advertisements) Act 1954.** It bans adverts implying treatment of Schedule conditions, which include **leucoderma (#33), obesity (#38), diabetes (#9), blood pressure (#27), bust shape (#21) and stature (#47)**. Penalty: up to 6 months, then 1 year for repeat offences ([DMR Act text](https://www.thc.nic.in/Central%20Governmental%20Acts/Drugs%20and%20Magic%20Remedies%20(Objectionable%20Advertisements)%20Act,%201954.pdf)). This matters directly for juice and "fairness" messaging.
- **Consumer Protection Act 2019** ([text](https://www.thc.nic.in/Central%20Governmental%20Acts/Consumer%20Protection%20Act,%202019.pdf)):
  - **s.21:** CCPA penalties for false ads, up to ₹10 lakh (₹50 lakh for repeats), on the manufacturer **or endorser**. Endorsers can be banned for 1–3 years.
  - **s.89:** criminal liability for false ads, up to 2 years plus ₹10 lakh (5 years plus ₹50 lakh for repeats).
  - **s.84–86:** product liability. A seller that controls the labelling, or makes its own warranty, carries liability like a manufacturer. A service provider that fails to give adequate warnings is also liable. **This covers an AI advice service and GlowVai's own-label products.**
- **E-Commerce Rules 2020** ([text](https://www.thc.nic.in/Central%20Governmental%20Rules/Consumer%20Protection%20(E-Commerce)%20Rules,%202020.pdf)). Every e-commerce entity must:
  - display its **legal name, address and grievance officer**;
  - **acknowledge complaints within 48 h and resolve them within 1 month** (Rule 4(4)–(5));
  - use **no pre-ticked consent boxes** (Rule 4(9));
  - make no fake reviews posing as consumers (Rules 6(2), 7(2));
  - show the expiry date, country of origin and return terms (Rule 6(5)).

  GlowVai's grievance page cites "Rule 5(9)". Rule 5 covers *marketplace* entities; the general duty is Rule 4(4)–(5). Correct the citation.
- **CCPA guidelines** on misleading ads (2022), "Endorsement Know-hows" (2023) and Dark Patterns (2023), plus BIS IS 19000:2022 on online reviews: their existence is widely reported, but the official texts could not be opened (**UNVERIFIED** details).
- **Legal Metrology (Packaged Commodities) Rules:** the rule requiring e-commerce listings to show the label declarations (MRP, net quantity, manufacturer, origin) is **UNVERIFIED** in this research; lawyer to confirm.

**Specific GlowVai exposure (from Part 1):**
- (a) The "AI" scan claims vs the actual code: CPA s.21/89 misleading advertisement.
- (b) Own-label products without manufacturer or licence details: Rule 34.
- (c) "Evens out post-acne marks in 3 weeks" without substantiation: Rule 36 and ASCI.
- (d) Unverifiable ratings and testimonials: E-Com Rules 6(2)/7(2) and CCPA.
- (e) A real brand named in product data: trademark and passing-off risk (Trade Marks Act, not researched here; lawyer to confirm).

### 4.2 DPDP Act 2023 and DPDP Rules 2025: face images and health-like data

- **Commencement.** The DPDP Rules were notified as **G.S.R. 846(E), 13 Nov 2025** ([MeitY Rules PDF](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf); [PIB backgrounder](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf)). Phases:
  - Consent Manager rules: from ~13 Nov 2026.
  - Notice, security, breach, retention, children's data and rights obligations: **from ~13 May 2027**.
  - A proposal to shorten the timeline to 12 months exists (Jan 2026); its adoption is **UNVERIFIED**.
  - Analysis: GlowVai has about 6 months. Build it right now; retrofitting later costs more.
- **Key obligations** ([DPDP Act](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf); Rules):
  - **Notice (Rule 3):** an itemised description of the data and purposes, plus withdrawal that is as easy as giving consent.
  - **Children under 18 (s.9; Rule 10):** verifiable parental consent; no tracking or targeted ads.
  - **Security (Rule 6):** encryption, access control, logging, a processor contract, and **logs kept for 1 year**.
  - **Breach (Rule 7):** tell affected users "without delay"; tell the Board "without delay" and report **within 72 h**.
  - **Erasure:** erase on withdrawal of consent or when the purpose ends (s.8(7)), while keeping minimal processing logs for 1 year (Rule 8(3)).
  - **Rights:** answer requests within 90 days (Rule 14).
  - **Cross-border:** transfers are allowed unless the government blacklists the country (s.16).
- **Penalties:** up to **₹250 Cr** for security failures; ₹200 Cr for breach-notice or children's-data failures; ₹50 Cr for other breaches.
- **Face images.** The DPDP Act has **no special "sensitive" or biometric category**. However, the older **IT (SPDI) Rules 2011**, which treat biometric data as sensitive, are understood to apply until DPDP s.44(2) commences (around May 2027) (**Lawyer to confirm**; [Chambers / S&R](https://chambers.com/articles/s-r-data-india-s-digital-personal-data-protection-regime-takes-effect)†).
- **What this means for GlowVai's current build (analysis):**
  - Photo, phone, GPS location and IP currently go to Google Apps Script on every report, without the separate consent the policy promises. Fix that before scaling.
  - Ask for consent to analyse the face separately from consent to store the photo, and **separately again for AI training (default off)**.
  - Prefer not to store raw images at all; store only the scores.
  - If images are stored: use an Indian region (e.g. Google Cloud asia-south1), encrypt them, delete automatically within ≤90 days, and get a processor agreement.
  - Remove the under-18 options or build parental verification.
  - For vending kiosks: on-screen consent and signage, and no images left on the device.

### 4.3 SMS OTP: TRAI DLT and cheaper alternatives

- **Rules for sending OTP by SMS:**
  - Every commercial or OTP SMS sender registers as a Principal Entity on an operator DLT portal, with a header (sender ID) and a content template.
  - Since **1 Oct 2024**, links and APKs in SMS must be whitelisted.
  - Since **11 Dec 2024**, the chain from sender to telemarketer must be traceable, or messages are rejected.
  - Sources: TRAI directions of [20 Aug 2024](https://www.trai.gov.in/sites/default/files/2024-09/Direction_20082024.pdf), [30 Aug 2024](https://www.trai.gov.in/sites/default/files/2024-09/Direction_30082024_0.pdf) and [30 Nov 2024](https://www.trai.gov.in/sites/default/files/2024-12/Direction_30112024.pdf).
  - Operator DLT registration fees: **UNVERIFIED**.

| Method | Cost (verified Nov 2026) | Notes |
|---|---|---|
| Google Sign-In / email magic link | **Free** up to 50,000 monthly active users ([Google Identity Platform pricing](https://cloud.google.com/identity-platform/pricing)) | Cheapest; no DLT needed |
| WhatsApp authentication template | **₹0.115 per delivered message** (Meta list rate, India) plus the provider's markup ([Meta pricing API](https://whatsappbusiness.com/wp-json/wab/v1/pricing?market=IN&currency=INR&category=Authentication)) | No DLT needed (analysis). Fits GlowVai's WhatsApp-first flow |
| DLT SMS via MSG91 | ₹0.25 → ₹0.16 per SMS by volume, plus 18% GST ([MSG91](https://msg91.com/in/pricing/sms)) | Needs DLT registration |
| DLT SMS via Fast2SMS | ₹0.25 → ₹0.11 per SMS ([Fast2SMS](https://www.fast2sms.com/pricing)) | ₹50 free credit |
| Firebase Phone Auth | **US$0.07 per SMS to India** (~25–50× DLT SMS); first 10 per day free; Blaze plan needed ([Google Cloud](https://cloud.google.com/identity-platform/pricing)) | Use only as a fallback |
| Truecaller SDK, missed-call, 2Factor | **UNVERIFIED** | — |

**Recommendation:** Google sign-in or email first, WhatsApp OTP second, and DLT SMS only if needed.

### 4.4 AI that looks like medical advice: risk and safe wording

- **Medical Devices Rules 2017.** Software is classified by its **intended purpose**. Software that drives a device takes the device's class ([MDR text](https://www.thc.nic.in/Central%20Governmental%20Rules/Medical%20Device%20Rules,%202017.pdf)). A Feb 2020 notification brought all devices, including software intended for diagnosis or treatment, under regulation (exact S.O. number **UNVERIFIED**). Analysis:
  - If GlowVai claims to *detect or diagnose* acne, eczema, melasma, rosacea or skin cancer, it risks being a regulated medical device.
  - A cosmetic, appearance-only analysis stays outside that.
- **Telemedicine Practice Guidelines 2020.** Only registered medical practitioners may consult, and AI may assist but not prescribe (**UNVERIFIED** text).
- **Market precedent:** SkinVision and Skinive went through EU medical certification precisely because they make medical claims.

**Safe wording guide**

| Say this | Never say this |
|---|---|
| "Cosmetic skin check for information only. Not a medical diagnosis." | "Diagnose", "detect", "medical-grade", "clinically proven" (without proof), "dermatologist-approved" (without a named dermatologist and evidence) |
| "Your scores describe how your skin *looks* in this photo, under this light." | "You have acne vulgaris / eczema / psoriasis / melasma / rosacea / leucoderma / fungal infection" |
| "Results change with lighting, camera and makeup." | "Treat", "cure", "heal", "prevent", "prescription", "guaranteed results in X days" |
| "Suggestions are based on your answers and visible appearance." | "India's No.1", "100% safe", "chemical-free" (ASCI's most-flagged claims) |
| "If you have persistent redness, itching, pain, a rash, or a changing mole, see a registered dermatologist." *(with a link)* | Juice: "detox", "cures diabetes", "reduces obesity", "glowing skin guaranteed" |
| "Some links are partner links; we may earn a commission." | AI-enhanced before/after images without disclosure |

### 4.5 Influencer advertising (ASCI)

- **ASCI Influencer Guidelines (2021, current book 2025-26)** ([ASCI Code book](https://www.ascionline.in/wp-content/uploads/guidelines/ASCI_Codes_Guidelines_Book.pdf)):
  - Any "material connection" (money, free product, discount, referral reward) needs an upfront label such as **Ad, Sponsored, Collab, Partnership, Affiliate or Free Gift**.
  - Video label timing: at least 3 s for videos ≤15 s; one-third of the duration for videos up to 2 min; the whole segment for longer ones.
  - Virtual influencers must say they are not human.
  - The brand and the influencer are **jointly responsible**.
- **Health/finance influencer addendum (dated 06.03.2025 in the book; refined Apr 2025):** anyone giving technical health advice must hold and disclose a relevant qualification.
- **Enforcement data and statutory backing:** 639 beauty and personal-care cases processed and 1,609 influencer ads processed in FY25-26 ([ASCI Annual Report 2025-26](https://www.ascionline.in/wp-content/uploads/2026/09/Annual-Report-2025-26.pdf)). The CPA s.21 endorser penalties apply.
- **For GlowVai's referral programme (analysis):**
  - Auto drivers, campus ambassadors and customers earning ₹10 or coins have a material connection, so their posts should carry "Ad" or "Referral".
  - Do not give them health-claim scripts.
  - Never pay for reviews.

### 4.6 Expansion-specific (mostly UNVERIFIED; check before acting)

- **Juice:**
  - FSSAI Basic Registration, State or Central licence by turnover (thresholds **UNVERIFIED**).
  - FSS labelling.
  - No DMR-Schedule claims.
  - GST on fruit juice was reportedly cut to 5% in the Sept 2025 GST rationalisation (**UNVERIFIED**; CA to confirm the HSN code).
- **Vending:**
  - FSSAI registration per food machine or location.
  - Municipal permissions.
  - Full Rule 34 labels visible.
  - DPDP consent for face capture.
- **GST on cosmetics:** HSN 3304 reportedly stays at 18%, while some toiletries moved to 5% (**UNVERIFIED**).
- **Registrations:**
  - AP Shops & Establishments (**UNVERIFIED** process).
  - **DPIIT Startup India recognition:** eligible if a Pvt Ltd company or LLP under 10 years old with turnover under ₹200 Cr. Benefits include the 80-IAC tax-exemption application and the Seed Fund ([Startup India](https://www.startupindia.gov.in/content/sih/en/startupgov/startup_recognition_page.html)).
  - **AP Innovation & Startup Policy 2024-29:** targets 20,000 startups ([KNN, Mar 2025](https://knnindia.co.in/news/newsdetails/state/andhra-pradesh/andhra-pradesh-unveils-ambitious-innovation-and-start-up-policy-for-2024-2029)).
  - **Ratan Tata Innovation Hub:** a spoke in Vijayawada†.

---

## PART 5 — GROWTH OPPORTUNITIES (VERIFIED FINDINGS ONLY)

### 5.1 Beauty accessories (brushes, tools, cosmetics)

- **Demand evidence:**
  - Indian beauty-tools market ~USD 221M (2025), projected at USD 498M by 2032 (12.7% CAGR). Makeup brushes are ~26% of it. The top 5 players hold only ~31% ([MarkNtel, Sep 2026](https://www.marknteladvisors.com/press-release/india-beauty-tools-market-share)).
  - Retail prices: branded brush sets ₹399–3,999 (Vega, Swiss Beauty on Nykaa†).
  - Wholesale: unbranded sets ₹40–150 on IndiaMART†.
- **Risks:**
  - Low barrier means many copycats.
  - Gross margins **UNVERIFIED**.
  - Import data on China dependence conflicts (aggregator says ~54.5%; official TradeStat shows a far smaller import value†).
  - Physical retail is dangerous: SUGAR closed 30–40% of the stores it opened.
  - Cosmetics (as opposed to tools) bring Rule 34 labelling and licence obligations.
- **Verdict:** **Yes, as a basket-size add-on** (brushes, sponges, headbands, pimple patches) sold beside routines. **Not as a separate business line.** Stock branded, labelled goods rather than launching a cosmetics label.

### 5.2 Wellness juices (e.g., ABC juice)

- **Demand evidence:**
  - Cold-pressed juice in India ~USD 128M (2025), projected at USD 224M by 2034 ([IMARC](https://www.imarcgroup.com/india-cold-pressed-juices-market)).
  - Pluckk ABC 150 ml retails at ~₹79†.
  - Nutricosmetics growth signals: OZiva revenue ₹258 Cr in FY25 ([Entrackr](https://entrackr.com/fintrackr/oziva-revenue-grows-25x-in-fy25-cuts-losses-by-90-10479735)); HUL buying the rest of OZiva for ₹824 Cr†.
- **Risks:**
  - **Raw Pressery** sold in 2021 at ~₹100 Cr, after a ₹500 Cr valuation, with an FY18 loss of ₹48 Cr on ₹33 Cr revenue ([Restaurant India](https://www.restaurantindia.in/news/wingreens-farms-buys-raw-pressery-at-rs-100-cr-valuation.n19706)).
  - Shelf life is ~3 days without HPP, ~21 days with it†. Cold-chain gaps are well documented.
  - Power Gummies revenue fell 20%†.
  - Kapiva spends 45% of expenses on ads ([Entrackr](https://entrackr.com/fintrackr/kapiva-spends-rs-188-cr-on-advertising-in-fy25-posts-rs-342-cr-revenue-10965403)).
  - **No controlled trial shows ABC juice improves skin.** The only evidence is indirect, on carotenoids and beta-carotene (~SPF 4 at best after 10 weeks of supplements) ([PLoS ONE 2012](https://pmc.ncbi.nlm.nih.gov/articles/PMC3296758)†; [Photochem Photobiol 2008](https://www.pubmed.gov/18086246/)†).
  - FSSAI licensing applies, and DMR/ASCI claim limits make "skin juice" marketing legally risky.
  - Kapiva ABC juice was **not found**.
- **Verdict:** **No, not now.** It is a different supply chain (perishable food), a different regulator (FSSAI) and an unprovable skin claim. At most, partner with or resell a licensed local juice brand, with **no skin claims**.

### 5.3 Vending machines with face scanning

- **Demand evidence:**
  - Daalchini claims ~₹2.5 lakh revenue per machine per year (CEO, FY26). UPI has removed the old cash-handling barrier.
  - Machines cost ₹1.5–3.5 lakh†.
  - Beauty vending exists abroad (Benefit, Japan)†.
  - The face-scan **kiosk** concept is proven in Lululab's Dubai store, but as a recommendation kiosk, not a dispenser.
- **Risks:**
  - No scaled face-scan + dispensing machine exists anywhere.
  - Location is everything (vendor guides†); theft and vandalism (Kanpur, 2010†).
  - Stocking cosmetics in heat (Vijayawada summers) risks product degradation.
  - Rule 34 labels must be visible.
  - DPDP consent is needed in a public place.
  - Each machine ties up capital that could go into customer acquisition.
- **Verdict:** **Pilot one "scan kiosk", not a vending machine.** Use a tablet or kiosk in a partner pharmacy, salon or college that does the scan and sends the order to rider delivery or the store counter. Measure scans per day, scan-to-order conversion and cost per acquired customer against CureSkin-style online acquisition. Only then consider dispensing.

### 5.4 B2B software for salons and clinics

- **Demand evidence:**
  - ~300,000 salons; ~14,200 organised chain outlets, projected at 23,300 by 2031. Salon market ~USD 12.6 bn ([Ken Research](https://www.kenresearch.com/industry-reports/india-beauty-salon-market.md)).
  - Naturals plans ~3,000 outlets with a small-city focus (same source). Lakmé Salon is in 190 cities ([IBEF](https://www.ibef.org/research/case-study/styling-india-s-growth-the-indian-salon-landscape)).
  - Salons already pay ₹674–4,000 a month for software. Professional analysers cost ₹1–1.85 lakh†.
  - **None of the five Indian salon-software products checked offers AI skin analysis.**
  - Oliva charges ₹900 per consultation in Vijayawada.
- **Risks:**
  - The scan must be real and validated on Indian skin first (Which? showed failures abroad).
  - SMB salons are price-sensitive and many are cash or WhatsApp-run†.
  - Perfect Corp and GlamAR already sell to brands. Zenoti could add the feature.
  - DPDP: the salon is the data fiduciary and GlowVai the processor, so data-processing agreements are needed.
  - Upsell uplift in Indian salons: no independent data (**UNVERIFIED**).
- **Verdict:** **The strongest expansion. Do it second, after the consumer scan is genuine.** Offer a rupee-priced (e.g., ₹999–2,499/month, *to be tested*), Telugu/English, phone-based scan that produces a printed or WhatsApp report and product suggestions for the salon to sell. Integrate with Invoay or Zylu rather than replacing them. Start with 5–10 Vijayawada salons on a free pilot and measure product attach rate.

---

## FIRST-MOVER AND UNFAIR-ADVANTAGE ASSESSMENT (analysis)

**Is there a first-mover advantage?** Only a narrow and temporary one.
- *For:* no one found combines scan, multi-brand advice, local authenticity-checked delivery and a used-product guarantee in Tier 2 India. Nykaa Now is in 15 cities and not Vijayawada. Tira and Sephora are metro-only. Kaya is not in Vijayawada.
- *Against:*
  - Scans are free everywhere, and the software rents for ~US$250/month.
  - Blinkit and Instamart already deliver beauty in Vijayawada in ~12 minutes.
  - EVERQ (₹34 Cr) and SkinBB launched in 2026 with dermatologist-led positioning.
  - Nykaa targets 25+ Nykaa Now cities by FY27.
  - First-mover advantage in consumer apps rarely holds without network effects or proprietary data.

**Possible unfair advantages: what is real today vs what must be built**

| Advantage | Status | Evidence / caveat |
|---|---|---|
| Local, Telugu-first trust and offline network (auto drivers, campuses, pharmacies) | **Partly built** (referral programme, WhatsApp in Telugu) | 57% of urban users prefer Indic content (IAMAI–Kantar†). Big players can add Telugu quickly. The advantage lies in on-ground relationships, not language alone. |
| Low customer-acquisition cost through physical referrals | **Unproven** | CureSkin spends ~46% of revenue on ads. If ₹10 per verified referral converts, that is a real edge. **Measure it.** |
| Skin-Fit Guarantee on used product | **Live on paper, inconsistent across pages** | Almost no Indian competitor offers it (Plum: credit only). Hard to copy for big platforms because of abuse risk. Needs fraud controls. |
| Indian-skin dataset (consented scans plus outcomes such as reactions, repurchases, refunds) | **Not yet**: today's scores are not image-derived | This could become the true moat, but only with real analysis and DPDP-compliant consent for training. |
| Pharmacy-partner fulfilment (authenticity via licensed stores) | **Claimed, unverified** | Counterfeits are a documented pain point. Publish partner store names and licence numbers to make it credible. |
| Dermatologist backing | **Missing** | The cheapest credibility upgrade available. Partner with a Vijayawada dermatologist or a clinic such as Oliva for referrals. |

**Net assessment.** GlowVai's defensible position is **"the trusted local skin-advice and authenticity layer for Tier 2 Andhra Pradesh"**, not "AI" and not "15-minute delivery". Both of those are commodities. The defensibility comes from offline trust, a guarantee, dermatologist credibility and outcome data, and must be earned quickly before EVERQ, SkinBB or Nykaa Now reach the city.

---

## NEW OPPORTUNITIES SURFACED BY THE RESEARCH (analysis; validate before acting)

1. **"Authenticity-verified" badge and batch/expiry lookup.** Counterfeits (34% of households) and hidden expiry dates (57% couldn't find them) are documented. Show the batch, expiry and source store for every delivered item.
2. **Reaction-safe sampling.** Sell 5–7-day minis or patch-test sachets before full sizes. This lowers refund cost and addresses the no-returns problem. Fabpiks and Smytten prove that sampling demand exists.
3. **Clinic referral funnel.** Use the scan as free triage that sends "see a dermatologist" cases to local clinics (e.g., Oliva at ₹900 a consultation) for a referral fee. Keep it carefully worded as non-diagnostic.
4. **Steroid-cream education campaign in Telugu.** Documented harm (63% OTC sourcing; fairness use). It is a credible, non-promotional trust builder with pharmacies.
5. **Sunscreen-first routines for South India.** 87% of southern melasma patients used no sunscreen, and sunscreen searches are surging. Lead with affordable sunscreen.
6. **Salon retail-attach kit.** A scan plus a shelf of curated SKUs for independent salons (Part 5.4).
7. **Men's grooming in Tier 2.** Amazon says over 75% of repeat men's-grooming customers come from Tier 2 and smaller cities†. It is underserved by skin-advice tools.

---

## SOURCES

All URLs referenced in this report and the underlying research notes (research date 26 Nov 2026). Claims based only on a search snippet are marked † in the body. Grouped by domain.


**adda247.com**

- <https://adda247.com/jobs/wp-content/uploads/sites/9/2025/02/28171012/AP-Socio-Economic-Survey-2024-25.pdf>
- <https://adda247.com/jobs/wp-content/uploads/sites/9/2025/02/28171012/AP-Socio-Economic-Survey-2024-25.pdf)†>

**angelone.in**

- <https://www.angelone.in/news/market-updates/quick-commerce-under-scrutiny-the-dark-side-of-10-minute-deliveries>
- <https://www.angelone.in/news/unlisted-companies/beauty-and-personal-care-startup-puresta-raises-34-crore-to-build-ai-powered-dermatology-platform>

**api.sci.gov.in**

- <https://api.sci.gov.in/supremecourt/2022/35023/35023_2022_6_302_73988_Judgement_01-Sep-2026.pdf>

**apit.ap.gov.in**

- <https://apit.ap.gov.in/assets/files/2025ITC_36265_MS6_E-2%20-%20RTIH.pdf>
- <https://apit.ap.gov.in/assets/files/2025ITC_36424_MS9_E.pdf>

**app.dealroom.co**

- <https://app.dealroom.co/companies/medikno>

**apparelresources.com**

- <https://apparelresources.com/business-news/retail/flipkart-minutes-overtakes-instamart-dark-stores-across-top-10-cities/>

**apps.shopify.com**

- <https://apps.shopify.com/glamar>

**archive.adgully.com**

- <https://archive.adgully.com/the-derma-co-opens-first-exclusive-outlet-in-gurugram-155703.html>

**ascionline.in**

- <https://www.ascionline.in/wp-content/uploads/2025/05/ASCI-Press-Release-Annual-Complaints-Report-2024-25-1.pdf>
- <https://www.ascionline.in/wp-content/uploads/2025/05/Digital-ASCI-Annual-Complaints-Report-2024-25.pdf>
- <https://www.ascionline.in/wp-content/uploads/2025/11/ASCI-Half-Yearly-Complaints-Report-2025-26.pdf>
- <https://www.ascionline.in/wp-content/uploads/2026/05/annual-complaints-report-25-26-final.pdf>
- <https://www.ascionline.in/wp-content/uploads/2026/09/Annual-Report-2025-26.pdf>
- <https://www.ascionline.in/wp-content/uploads/guidelines/ASCI_Codes_Guidelines_Book.pdf>

**asiae.co.kr**

- <https://www.asiae.co.kr/en/article/2022071214474053849>

**ask.pharmaguideline.com**

- <https://ask.pharmaguideline.com/t/cosmetics-retail-sales/3254>

**assets.thehansindia.com**

- <https://assets.thehansindia.com/business/oil-tops-orders-bath-body-category-surges-114-as-vijayawada-embraces-instamarts-10-minute-delivery-revolution-993411>

**azbpartners.com**

- <https://www.azbpartners.com/bank/indias-digital-personal-data-protection-act-phased-rollout-and-key-compliance-milestones/>

**barandbench.com**

- <https://www.barandbench.com/view-point/meity-notifies-final-digital-personal-data-protection-rules-2025>

**beautylish.com**

- <https://www.beautylish.com/a/vxgwi/beauty-vending-machines>

**beautymatter.com**

- <https://www.beautymatter.com/articles/how-tira-is-shaping-the-next-chapter-of-beauty-in-india>
- <https://www.beautymatter.com/articles/purplle-lands-100-million-funding>

**beminimalist.co**

- <https://beminimalist.co/policies/refund-policy>

**bestmediainfo.com**

- <https://bestmediainfo.com/insights/indias-beauty-market-to-grow-at-10-11percent-cagr-in-5-years-nykaa-redseer-report-6950268>
- <https://bestmediainfo.com/mediainfo/mediainfo-marketing/hyaluronic-niacinamide-retinol-why-every-beauty-shelf-feels-the-same-10499518>
- <https://bestmediainfo.com/mediainfo/mediainfo-marketing/hyaluronic-niacinamide-retinol-why-every-beauty-shelf-feels-the-same-10499518)†>

**beta.docker.poz.com**

- <https://beta.docker.poz.com/article/India-condommachines-vandalism-19433-3704/get-pdf>

**bigbasket.com**

- <https://bigbasket.com/pd/1223107/real-activ-beetroot-carrot-juice-helps-gut-health-no-added-sugars-preservative-2-x-1-l>
- <https://bigbasket.com/pd/40117939/kapiva-amla-juice-1-l>
- <https://bigbasket.com/pd/40238786/fresho-signature-apple-carrot-beetroot-juice-cold-pressed-no-added-sugar-preservative-free-200-g>
- <https://www.bigbasket.com/all-offers/d/10-15/beverages/fruit-juices-drinks/>
- <https://www.bigbasket.com/pd/40194525/raw-pressery-cold-extracted-juice-mixed-fruit-200-ml>

**biopatrika.com**

- <https://biopatrika.com/science-society/health/ai-skin-analysis-india-ningen-auriga-study/>

**biospectrumindia.com**

- <https://biospectrumindia.com/news/16/26740/oliva-launches-geneiq-indias-first-dna-based-derma-clinic-application.html>
- <https://www.biospectrumindia.com/article/pdf/8437>

**bis.gov.in**

- <https://www.bis.gov.in/wp-content/uploads/2026/02/scheme-online-review-Feb-26.pdf>

**blog.google**

- <https://blog.google/technology/health/ai-dermatology-preview-io-2021>

**bloomberg.com**

- <https://www.bloomberg.com/news/articles/2024-05-22/reliance-s-new-venture-tira-bets-on-ai-to-push-into-heating-indian-beauty-market>

**bonafideresearch.com**

- <https://www.bonafideresearch.com/product/6509781506/india-nutricosmetics-market>

**boots-uk.com**

- <https://www.boots-uk.com/newsroom/news/boots-becomes-the-first-major-high-street-beauty-retailer-to-offer-the-make-up-exchange-promise>

**boots.com**

- <https://boots.com/return-policy>

**bsmedia.business-standard.com**

- <https://bsmedia.business-standard.com/_media/bs/data/market-reports/equity-brokertips/2025-12/17665661370.41111100.pdf>

**business-standard.com**

- <https://business-standard.com/article/companies/kedaara-buys-majority-stake-in-oliva-skin-hair-clinic-for-usd-65-mn-123031300982_1.html>
- <https://business-standard.com/companies/news/honasa-consumer-s-the-derma-co-hits-annual-revenue-run-rate-of-rs-500-crore-124042200962_1.html>
- <https://business-standard.com/companies/news/quick-commerce-firms-don-t-display-items-best-before-dates-57-shoppers-124101000859_1.html>
- <https://business-standard.com/companies/news/quick-commerce-firms-don-t-display-items-best-before-dates-57-shoppers-124101000859_1.html)†>
- <https://business-standard.com/companies/news/reliance-beauty-buys-sephora-india-rights-from-arvind-fashions-for-rs-99-cr-123110300958_1.html>
- <https://business-standard.com/india-news/world-bank-adb-commit-1-6-bn-for-andhra-capital-amaravati-from-jan-2025-124101800521_1.html>
- <https://business-standard.com/industry/news/cci-seeks-evidence-in-complaint-against-quick-commerce-companies-125040700975_1.html>
- <https://www.business-standard.com/amp/companies/news/amazon-now-dark-stores-expansion-2025-quick-commerce-125120100985_1.html>
- <https://www.business-standard.com/amp/markets/ipo/fmcg-distributors-body-writes-sebi-loss-making-quick-commerce-companies-ipo-125123000929_1.html>
- <https://www.business-standard.com/amp/markets/news/honasa-consumer-stock-hits-10-lower-limit-down-36-in-3-days-post-q2-show-124112100639_1.html>
- <https://www.business-standard.com/article/pti-stories/cdsco-seizes-illegal-cosmetics-worth-rs-4-crore-118100600782_1.html>
- <https://www.business-standard.com/companies/quarterly-results/nykaa-q2fy26-net-profit-triples-to-rs-34-crore-on-strong-sales-125110701801_1.html>
- <https://www.business-standard.com/companies/quarterly-results/nykaa-q4fy25-results-profit-up-193-revenue-rises-24-125053001683_1.html>
- <https://www.business-standard.com/industry/news/amazon-to-take-now-rapid-delivery-service-to-100-cities-in-india-126042700445_1.html>
- <https://www.business-standard.com/markets/capital-market-news/kaya-reports-consolidated-net-loss-of-rs-7-02-crore-in-the-march-2025-quarter-125052901431_1.html>
- <https://www.business-standard.com/markets/ipo/bombay-shaving-company-funding-ipo-plans-2025-125111201683_1.html>

**business.whatsapp.com**

- <https://business.whatsapp.com/products/platform-pricing>

**businessinsider.in**

- <https://www.businessinsider.in/india/news/15-of-indian-households-have-had-severe-allergic-reaction-due-to-cosmetic-products-localcircles/amp_articleshow/96370524.cms>

**businesstoday.in**

- <https://businesstoday.in/amp/technology/news/story/ces-2025-loreal-unveils-cell-bioprint-a-personalised-skin-analysis-device-how-it-works-459835-2025-01-07>
- <https://www.businesstoday.in/amp/technology/news/story/indias-internet-revolution-key-insights-from-kantar-and-iamai-report-461043-2025-01-16>
- <https://www.businesstoday.in/bt-tv/whats-hot/video/centre-steps-in-to-protect-gig-workers-as-quick-commerce-firms-asked-to-drop-10-min-delivery-promise-510807-2026-01-14>
- <https://www.businesstoday.in/india/story/goree-and-chandni-pakistan-made-creams-flagged-for-toxic-heavy-metals-how-did-they-make-their-way-into-india-555969-2026-09-16>
- <https://www.businesstoday.in/india/story/online-festive-shopping-blues-6-in-10-consumers-stuck-with-wrong-or-defective-products-they-couldnt-return-during-diwali-500419-2025-10-31>
- <https://www.businesstoday.in/industry/story/amazon-nows-quick-commerce-push-tier-ii-cities-1000-mfcs-and-a-catch-up-game-527567-2026-04-27>
- <https://www.businesstoday.in/latest/corporate/story/myntra-launches-an-ai-powered-in-depth-skincare-advisor-experience-309919-2021-10-20>
- <https://www.businesstoday.in/latest/corporate/story/quick-commerce-all-india-consumer-products-distributors-federation-knocks-on-cci-door-467018-2025-03-06>
- <https://www.businesstoday.in/latest/trends/story/from-korean-serums-to-french-creams-how-these-indian-cities-are-driving-indias-premium-beauty-boom-532827-2026-05-23>
- <https://www.businesstoday.in/latest/trends/story/swipe-click-delivered-how-quick-commerce-is-powering-indias-40bn-beauty-boom-led-by-genz-515665-2026-02-11>
- <https://www.businesstoday.in/magazine/deep-dive/story/quick-commerce-firms-go-big-on-dark-stores-517751-2026-02-24>
- <https://www.businesstoday.in/markets/ipo-corner/story/zepto-files-udrhp-for-ipo-ed-summons-to-promoters-disclosed-key-details-you-should-know-535685-2026-06-09>
- <https://www.businesstoday.in/markets/stocks/story/nykaa-q2-earnings-net-profit-rises-revenue-crosses-rs-3000-crore-565721-2026-11-04>

**businesswire.com**

- <https://www.businesswire.com/news/home/20200103005398/en/>
- <https://www.businesswire.com/news/home/20210727005069/en>
- <https://www.businesswire.com/news/home/20231026839634/en>
- <https://www.businesswire.com/news/home/20251028817410/en/Perfect-Corp.-Reports-Unaudited-Financial-Results-for-the-Three-Months-and-the-Nine-Months-Ended-September-30-2025>
- <https://www.businesswire.com/news/home/20260108604806/en/>
- <https://www.businesswire.com/news/home/20260224503932/en/perfect-corp.-reports-unaudited-financial-results-for-the-three-months-and-the-full-year-ended-december-31-2025>

**busy.in**

- <https://busy.in/hsn/hsn-96033020.md>

**bwretailworld.com**

- <https://bwretailworld.com/sector/e-commerce-marketplaces/premium-products-make-up-59-of-beauty-quick-commerce-spending>

**capterra.com**

- <https://www.capterra.com/p/10027545/SalonBoost/>
- <https://www.capterra.com/p/131057/ZENOTI/pricing/>
- <https://www.capterra.com/p/247991/Zylu/pricing/>

**capterra.in**

- <https://www.capterra.in/software/170043/salonist>

**cdma.ap.gov.in**

- <https://cdma.ap.gov.in/about-us-35>

**cdsco.gov.in**

- <https://cdsco.gov.in/opencms/export/sites/CDSCO_WEB/Pdf-documents/cosmetics/Guidance_document_cosmetic_import_registration.pdf>
- <https://cdsco.gov.in/opencms/resources/UploadCDSCOWeb/2022/cos_rules/Cosmetics%20Rules%202020.pdf>

**census2011.co.in**

- <https://census2011.co.in/census/metropolitan/344-vijayawada.html>
- <https://census2011.co.in/census/metropolitan/344-vijayawada.html)†>

**ces.tech**

- <https://ces.tech/ces-innovation-awards/2025/micro-led-beauty-mirror>

**chambers.com**

- <https://chambers.com/articles/s-r-data-india-s-digital-personal-data-protection-regime-takes-effect>
- <https://chambers.com/articles/s-r-data-india-s-digital-personal-data-protection-regime-takes-effect)†>

**clickpost.ai**

- <https://www.clickpost.ai/blog/d2c-brands-in-india/skin-care>
- <https://www.clickpost.ai/blog/ecommerce-return-rate-india>

**cloud.google.com**

- <https://cloud.google.com/identity-platform/pricing>

**codingclave.com**

- <https://codingclave.com/guides/salon-management-software-cost-india-2026>

**consumeraffairs.nic.in**

- <https://consumeraffairs.nic.in>

**consumercomplaints.in**

- <https://www.consumercomplaints.in/nykaa-com-return-rejected-unfairly-c3537460>

**consumergoods.com**

- <https://www.consumergoods.com/olay-upgrades-skin-advisor-gen-ai-predictive-modeling>

**cosmeticsbusiness.com**

- <https://cosmeticsbusiness.com/olay-launches-skin-advisor-tool-globally-126408>

**cosmeticsdesign-asia.com**

- <https://cosmeticsdesign-asia.com/Article/2024/08/28/India-beauty-market-analysis-How-to-win-over-beauty-consumers-in-tier-two-and-hree-cities>
- <https://www.cosmeticsdesign-asia.com/Article/2020/07/09/India-s-Twenty-Beauty-aiming-to-roll-out-1-000-make-up-vending-machines-in-light-of-COVID-19>

**cosmeticsdesign.com**

- <https://www.cosmeticsdesign.com/Article/2025/09/12/neutrogena-taps-hautai-to-boost-digital-skin-care-personalization-push>

**cureskin.com**

- <https://cureskin.com/pricing>
- <https://www.cureskin.com/refunds>
- <https://www.cureskin.com/terms>

**daalchini.co.in**

- <https://www.daalchini.co.in/>

**de.statista.com**

- <https://de.statista.com/outlook/cmo/beauty-personal-care/hautpflege/indien>

**deccanchronicle.com**

- <https://deccanchronicle.com/southern-states/andhra-pradesh/ap-ratan-tata-innovation-hub-launched-at-mangalagiri-1898604>
- <https://www.deccanchronicle.com/southern-states/andhra-pradesh/per-capita-income-rayalaseema-districts-lag-behind-visakhapatnam-records-highest-earnings-1948928>

**deccanherald.com**

- <https://www.deccanherald.com/amp/story/india%2Flandmark-supreme-court-ruling-free-sanitary-napkins-and-separate-toilets-mandatory-in-schools-3879959>
- <https://www.deccanherald.com/india/andhra-pradesh/pm-modi-relaunches-amaravati-capital-projects-3522004>
- <https://www.deccanherald.com/india/blinkit-drops-10-minute-delivery-claim-after-labour-ministry-intervention-over-gig-worker-safety-3860810>

**devdiscourse.com**

- <https://www.devdiscourse.com/article/business/2934120-hidden-costs-of-vending-machines-what-to-consider-in-india>
- <https://www.devdiscourse.com/article/health/3698018-fda-cracks-down-on-illegal-cosmetics-in-mumbai-and-thane>

**developers.facebook.com**

- <https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing>

**digit.in**

- <https://www.digit.in/?p=604251>

**dingg.app**

- <https://dingg.app/blogs/dingg-vs-other-salon-software-in-india-feature-by-feature-comparison>
- <https://dingg.app/blogs/why-indian-salons-are-moving-from-manual-to-digital-operations>
- <https://www.dingg.app/pricing>

**doca.gov.in**

- <https://doca.gov.in/ccpa/>

**downtoearth.org.in**

- <https://www.downtoearth.org.in/health/health-min-bans-14-over-the-counter-steroid-creams-60122>

**ecdb.com**

- <https://ecdb.com/resources/sample-data/retailer/swiss-beauty>

**en.wikipedia.org**

- <https://en.wikipedia.org/wiki/Classification_of_Indian_cities>
- <https://en.wikipedia.org/wiki/NTR_district>
- <https://en.wikipedia.org/wiki/Regulation_of_artificial_intelligence>
- <https://en.wikipedia.org/wiki/Revieve_(company)>
- <https://en.wikipedia.org/wiki/Vijayawada>

**entrackr.com**

- <https://entrackr.com/fintrackr/d2c-beauty-brand-plum-turns-around-in-fy25-with-rs-25-cr-pat-10512557>
- <https://entrackr.com/fintrackr/foxtales-revenue-nears-rs-200-cr-in-fy25-losses-jump-38-10945518>
- <https://entrackr.com/fintrackr/healthkarts-revenue-nears-rs-1400-cr-in-fy25-profit-triples-10652315>
- <https://entrackr.com/fintrackr/kapiva-spends-rs-188-cr-on-advertising-in-fy25-posts-rs-342-cr-revenue-10965403>
- <https://entrackr.com/fintrackr/oziva-revenue-grows-25x-in-fy25-cuts-losses-by-90-10479735>
- <https://entrackr.com/fintrackr/smytten-cuts-losses-by-41-in-fy25-revenue-slips-to-rs-111-cr-10244002>
- <https://entrackr.com/fintrackr/the-ayurveda-experience-spends-rs-248-cr-on-advertising-for-rs-440-cr-revenue-in-fy25-10813212>
- <https://entrackr.com/fintrackr/traya-returns-to-losses-in-fy25-as-marketing-and-employee-costs-surge-10961037>
- <https://entrackr.com/fintrackr/wellbeing-nutrition-claims-rs-170-cr-revenue-in-fy25-retail-share-at-25-9765078>
- <https://entrackr.com/news/eternal-eyes-100-inventory-play-for-blinkit-to-improve-margins-9022466>

**epj-conferences.org**

- <https://www.epj-conferences.org/articles/epjconf/pdf/2026/33/epjconf_ips2026_06009.pdf>
- <https://www.epj-conferences.org/articles/epjconf/pdf/2026/33/epjconf_ips2026_06009.pdf)†>

**equentis.com**

- <https://www.equentis.com/blog/?p=58331>

**euromonitor.com**

- <https://www.euromonitor.com/beauty-and-personal-care-in-india/report>
- <https://www.euromonitor.com/colour-cosmetics-in-india/report>
- <https://www.euromonitor.com/premium-beauty-and-personal-care-in-india/report>
- <https://www.euromonitor.com/skin-care-in-india/report>

**exchange4media.com**

- <https://www.exchange4media.com/marketing-news/minimalist-fy26-income-rises-to-rs697-crore-ad-spends-up-to-rs235-crore-157416.html>

**expertmarketresearch.com**

- <https://www.expertmarketresearch.com/reports/india-beauty-supplements-market>
- <https://www.expertmarketresearch.com/reports/india-skin-care-market>

**fashion-headline.com**

- <https://www.fashion-headline.com/article/23353>
- <https://www.fashion-headline.com/article/37877>

**fashionunited.com**

- <https://fashionunited.com/news/business/perfect-corp-records-annual-revenue-growth-despite-one-time-impairment-charge/2026022570769>
- <https://fashionunited.com/news/business/perfect-corp-reports-net-income-growth-in-second-quarter-2026/2026072873737>

**fast2sms.com**

- <https://www.fast2sms.com/pricing>

**firebase.google.com**

- <https://firebase.google.com/docs/auth/limits>
- <https://firebase.google.com/pricing>

**flipkart.com**

- <https://www.flipkart.com/kapiva-aloe-vera-amla-juice-boosts-immunity-no-added-sugar/p/itm541f2bc338429>
- <https://www.flipkart.com/raw-pressery-apple-beetroot-carrot-flush-juice/p/itm08e288da36eae>

**foodbusiness360.com**

- <https://www.foodbusiness360.com/summaries/raw-pressery-juice-relies-on-ethics-innovation-technology-in-fast-growing-market>

**foodnavigator-asia.com**

- <https://foodnavigator-asia.com/Article/2019/08/28/Extract-action-India-s-Second-Nature-juice-firm-seeks-to-conquer-local-market-with-processing-edge>

**fortune.com**

- <https://fortune.com/2017/02/27/olay-skin-advisor-mwc-2017/>
- <https://fortune.com/2024/02/29/face-scanning-ai-apps-are-giving-cosmetics-companies-deeper-connections-and-selling-points-with-customers/>

**foscos.fssai.gov.in**

- <https://foscos.fssai.gov.in>

**franchiseindia.com**

- <https://franchiseindia.com/insights/news/blinkit-services-now-available-in-vijayawada.34653>
- <https://www.franchiseindia.com/insights/en/article/top-10-beauty-salon-franchises-tapping-indias-rising-beauty-spend.59666>

**freepressjournal.in**

- <https://www.freepressjournal.in/brandsutra/targeting-75-pc-revenue-from-made-in-india-products-in-three-to-five-years-sandeep-jain-vega>
- <https://www.freepressjournal.in/business/honasa-consumer-q4-profit-more-than-doubles-to-69-crore-revenue-jumps-23-as-mamaearth-growth-stays-strong>

**fynd.com**

- <https://www.fynd.com/blog/top-ai-skin-analysis-apps-every-beauty-brand-should-know-in-2026>

**glamar.io**

- <https://www.glamar.io/customer-stories/foxtale>
- <https://www.glamar.io/pricing/ai-skin-analysis>

**glowvai.in**

- <https://glowvai.in>
- <https://glowvai.in/sitemap.xml>

**grandviewresearch.com**

- <https://www.grandviewresearch.com/horizon/outlook/makeup-tools-market/india>

**haut.ai**

- <https://haut.ai/>

**hul.co.in**

- <https://www.hul.co.in/news/press-releases/2025/hul-to-acquire-premium-beauty-brand-minimalist/>
- <https://www.hul.co.in/news/press-releases/2026/hul-invests-rs-824-crores-to-acquire-remaining-49-stake-in-zywie-ventures-oziva-divests-198-holding-in-nutritionalab/>
- <https://www.hul.co.in/news/press-releases/2026/results-for-the-quarter-ended-30th-june-2026/>

**iadvl.org**

- <https://www.iadvl.org/about-iadvl>

**iamai.in**

- <https://www.iamai.in/sites/default/files/research/Kantar_%20IAMAI%20report_2024_.pdf>
- <https://www.iamai.in/sites/default/files/research/Kantar_%20IAMAI%20report_2024_.pdf)†>

**ibef.org**

- <https://www.ibef.org/research/case-study/styling-india-s-growth-the-indian-salon-landscape>

**ijdvl.com**

- <https://ijdvl.com/?p=7174>
- <https://ijdvl.com/global-health-dermatology-an-emerging-field-addressing-the-access-to-care-crisis>
- <https://ijdvl.com/topical-corticosteroid-abuse-on-the-face-a-prospective-multicenter-study-of-dermatology-outpatients/>

**imarcgroup.com**

- <https://imarcgroup.com/india-medical-aesthetics-market>
- <https://www.imarcgroup.com/india-beauty-personal-care-market>
- <https://www.imarcgroup.com/india-cold-pressed-juices-market>
- <https://www.imarcgroup.com/india-collagen-market>
- <https://www.imarcgroup.com/india-male-grooming-products-market>
- <https://www.imarcgroup.com/india-skincare-market>
- <https://www.imarcgroup.com/india-vending-machines-market/toc>

**in.fashionnetwork.com**

- <https://in.fashionnetwork.com/news/Health-and-Glow-Beauty-celebrates-25-years-plans-continued-omni-channel-and-product-expansion,1470802.html>
- <https://in.fashionnetwork.com/news/Laneige-enters-quick-commerce-with-launch-on-blinkit,1696208.html>

**inc42.com**

- <https://inc42.com/?p=485361>
- <https://inc42.com/?p=503754>
- <https://inc42.com/?p=543893>
- <https://inc42.com/?p=576233>
- <https://inc42.com/?p=579242>
- <https://inc42.com/?p=90018>
- <https://inc42.com/buzz/amazon-fresh-expands-presence-to-170-cities/>
- <https://inc42.com/buzz/bigbasket-to-slash-geographical-presence-by-half-to-40-cities-report/>
- <https://inc42.com/buzz/blinkit-drops-10-minute-delivery-claim-after-govt-push/>
- <https://inc42.com/buzz/bombay-shaving-company-claims-adjusted-ebitda-profitability-in-fy26-loss-narrows-97/>
- <https://inc42.com/buzz/cureskin-secures-20-mn-to-scale-up-its-ai-powered-dermatology-platform>
- <https://inc42.com/buzz/daalchini-claims-2x-yoy-jump-in-fy26-revenue-to-₹140-cr/>
- <https://inc42.com/buzz/drug-controller-sends-notice-to-amazon-flipkart-indiamart-for-selling-spurious-cosmetics>
- <https://inc42.com/buzz/honasa-consumers-skincare-brand-the-derma-co-hits-arr-of-inr-500-cr>
- <https://inc42.com/buzz/hul-completes-acquisition-of-90-5-stake-in-minimalist>
- <https://inc42.com/buzz/hul-owned-minimalist-turns-profitable-in-fy26-revenue-up-36-yoy/>
- <https://inc42.com/buzz/lifestyle-products-maker-incnut-raises-4-mn-in-series-a-round-from-rpsg-ventures/>
- <https://inc42.com/buzz/mamaearth-parent-honasas-q2-profit-jumps-87-yoy-to-₹73-cr/>
- <https://inc42.com/buzz/meesho-files-updated-drhp-to-raise-inr-4250-cr-via-fresh-issue>
- <https://inc42.com/buzz/myntras-fy25-profit-surges-18x-to-inr-548-cr>
- <https://inc42.com/buzz/pilgrim-crosses-inr-400-cr-revenue-mark-in-fy25>
- <https://inc42.com/buzz/purplle-trims-fy25-net-loss-by-44-to-%E2%82%B969-4-cr/>
- <https://inc42.com/buzz/renee-cosmetics-revenue-crosses-%E2%82%B9400-cr-mark-in-fy26-loss-down-46-yoy/>
- <https://inc42.com/buzz/sugar-cosmetics-raises-%E2%82%B9145-cr-from-a91-at-a-near-80-valuation-cut/>
- <https://inc42.com/buzz/swiggy-q2-loss-narrows-16-yoy-to-%E2%82%B9922-cr-revenue-jumps-36/>
- <https://inc42.com/buzz/traya-pockets-inr-75-cr-to-offer-customised-haircare-solutions>
- <https://inc42.com/buzz/wendor-nets-2-5-mn-to-boost-its-ai-powered-vending-tech>
- <https://inc42.com/buzz/zepto-fy26-loss-jumps-26-yoy-to-₹5905-cr-revenue-doubles/>
- <https://inc42.com/company/foxy/financials/>
- <https://inc42.com/company/oliva/financials/>
- <https://inc42.com/company/wellbeing-nutrition/financials/>
- <https://inc42.com/features/blinkit-inventory-model-quick-commerce-cash-burn-problem>
- <https://inc42.com/features/blinkit-inventory-model-quick-commerce-cash-burn-problem)†>
- <https://inc42.com/features/meesho-lines-up-its-revenue-pieces-ahead-of-ipo>

**india-briefing.com**

- <https://www.india-briefing.com/news/indias-beauty-personal-care-market-investor-insights-39518.html>

**india.entrepreneur.com**

- <https://india.entrepreneur.com/business-news/nykaa-crosses-1-billion-revenue-mark-in-fy26>
- <https://india.entrepreneur.com/news-and-trends/ai-driven-sustainable-strategies-will-set-us-apart-during/485015>
- <https://india.entrepreneur.com/news-and-trends/fy25-has-been-a-strong-year-for-nykaa-falguni-nayar/496352>
- <https://india.entrepreneur.com/news-and-trends/performance-first-beauty-how-indias-30-billion-market/500576>
- <https://india.entrepreneur.com/news-and-trends/renee-cosmetics-raises-usd-30-mn-in-series-c-round-led-by/495579>
- <https://india.entrepreneur.com/news-and-trends/vendekin-technologies-secures-inr-85-crore-in-pre-series-a/428529>

**indiacode.nic.in**

- <https://www.indiacode.nic.in/bitstream/123456789/15256/1/a2019-35.pdf>

**indiamart.com**

- <https://www.indiamart.com/bo-intl/skin-care-products-third-party-manufacturer.html>

**indianpharmapost.com**

- <https://www.indianpharmapost.com/healthcare/purestas-everq-brings-ai-led-skin-assessment-and-dermatologist-care-into-one-platform-21922>
- <https://www.indianpharmapost.com/healthcare/skinbb-launches-ai-powered-dermatologist-led-skincare-ecosystem-for-indian-consumers-21530>

**indianretailer.com**

- <https://www.indianretailer.com/interview/retail-people/profiles/how-swiss-beauty-scaled-25000-retail-touchpoints-and-rs-425-cr>

**indianstartupnews.com**

- <https://indianstartupnews.com/funding/kult-a-startup-using-ai-to-offer-personalised-skincare-recommendations-raises-over-rs-170-crore-in-funding-9030145>

**indiantelevision.com**

- <https://indiantelevision.com/iworld/quick-commerce-makeup-sales-hit-rs-938-crore-in-july-2026/>
- <https://indiantelevision.com/iworld/quick-commerce-makeup-sales-hit-rs-938-crore-in-july-2026/)†>
- <https://indiantelevision.com/mam/dial-ties-up-with-sirona-introduces-first-of-its-kind-multi-product-feminine-hygiene-vending-machines-at-delhi-airport/>
- <https://indiantelevision.com/mam/gen-z-takes-beauty-beyond-metros-as-myntra-reports-200-per-cent-k-beauty-growth/>
- <https://indiantelevision.com/mam/honasa-consumer-ad-spend-rises-17-per-cent-to-rs-241-crore-in-q1/>
- <https://indiantelevision.com/mam/nykaa-adds-14-stores-to-reach-338-as-beauty-and-fashion-growth-accelerates/>
- <https://indiantelevision.com/news-headline/blinkit-expands-in-andhra-pradesh-bringing-hyper-fast-delivery-to-three-more-cities/>

**indianyellowpages.com**

- <https://www.indianyellowpages.com/mumbai/skin-care-machine.htm>

**indiaseatradenews.com**

- <https://indiaseatradenews.com/indias-skincare-and-cosmetics-imports-surge-global-brands-capitalize-on-growing-demand/>

**innoviti.com**

- <https://innoviti.com/blogs/how-beauty-salons-and-parlours-can-reduce-payment-failures-and-revenue-leakage/>

**inventiva.co.in**

- <https://www.inventiva.co.in/?p=412093>

**invoay.com**

- <https://invoay.com/pricing-rupees/>
- <https://www.invoay.com/pricing>

**ioplus.nl**

- <https://ioplus.nl/en/posts/highest-european-certification-for-skin-cancer-detection-app>

**kaya.in**

- <https://www.kaya.in/>

**kenresearch.com**

- <https://www.kenresearch.com/industry-reports/india-beauty-salon-market.md>
- <https://www.kenresearch.com/industry-reports/india-medical-aesthetics-market.md>
- <https://www.kenresearch.com/industry-reports/india-skincare-market.md>

**knnindia.co.in**

- <https://knnindia.co.in/news/newsdetails/state/andhra-pradesh/andhra-pradesh-unveils-ambitious-innovation-and-start-up-policy-for-2024-2029>

**kotakneo.com**

- <https://www.kotakneo.com/financial-results/kaya-ltd-q4fy25-results/>
- <https://www.kotakneo.com/news/stocks/eternal-q2-results-profit-rises-revenue-growth-blinkit-adds-stores/>

**kwipped.com**

- <https://www.kwipped.com/rentals/product/canfield-scientific-visiacr/16219>

**labour.ap.gov.in**

- <https://labour.ap.gov.in>

**laroche-posay.sg**

- <https://laroche-posay.sg/event/spotscan-plus>

**latestly.com**

- <https://www.latestly.com/agency-news/latest-news-deconstruct-turns-profitable-in-fy25-revenue-jumps-manifold-to-rs-130-crore-6834354.html>

**localcircles.com**

- <https://www.localcircles.com/a/press/page/cosmetic-products-reaction>
- <https://www.localcircles.com/a/press/page/fake-products-on-ecommerce-sites>

**loreal.com**

- <https://www.loreal.com/en/articles/science-and-technology/la-roche-posay-spotscan/>

**m.indiamart.com**

- <https://m.indiamart.com/dermacell/dermatology-equipment.html>
- <https://m.indiamart.com/impcat/cosmetic-brush-set.html>
- <https://m.indiamart.com/impcat/make-up-brush.html>
- <https://m.indiamart.com/impcat/professional-makeup-brushes.html>
- <https://m.indiamart.com/impcat/skin-analysis-machine.html>
- <https://m.indiamart.com/impcat/skin-analysis-machine.html)†>
- <https://m.indiamart.com/int11-technologies/vending-machine.html>
- <https://m.indiamart.com/shreepadmavatitechsolutions/vending-machine.html>
- <https://m.indiamart.com/skintekindore>

**macrotrends.net**

- <https://www.macrotrends.net/cities/21435/vijayawada/population>

**marketresearchfuture.com**

- <https://marketresearchfuture.com/reports/india-beauty-tools-market-46567>
- <https://marketresearchfuture.com/reports/india-cold-pressed-juice-market-58339>

**marketsandmarkets.com**

- <https://www.marketsandmarkets.com/Market-Reports/geography/collagen-market/India>
- <https://www.marketsandmarkets.com/Market-Reports/geography/medical-aesthetics-market/india>

**marknteladvisors.com**

- <https://www.marknteladvisors.com/press-release/india-beauty-tools-market-share>

**medicaldialogues.in**

- <https://medicaldialogues.in/amp/news/industry/pharma/cdsco-cancels-kult-apps-cosmetic-import-registrations-over-false-labeling-165567>
- <https://medicaldialogues.in/amp/news/industry/pharma/health-ministry-notifies-cosmetics-rules-2025-empowers-states-to-suspend-licences-152852>
- <https://medicaldialogues.in/amp/news/industry/pharma/health-ministry-notifies-cosmetics-rules-2025-empowers-states-to-suspend-licences-152852)†>
- <https://medicaldialogues.in/news/industry/pharma/cdsco-cancels-skintl-enterprises-cosmetic-import-registrations-over-unregistered-products-labelling-violations-178618>

**meity.gov.in**

- <https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf>
- <https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf>
- <https://www.meity.gov.in/writereaddata/files/GSR313E_10511(1)_0.pdf>

**metricscart.com**

- <https://metricscart.com/quick-commerce-analytics/reports/blinkit/beauty-cosmetics-on-blinkit/>

**mintel.com**

- <https://www.mintel.com/insights/food-and-drink/freshness-is-the-next-frontier-for-indias-juice-market/>

**mobihealthnews.com**

- <https://www.mobihealthnews.com/news/asia/derma-startup-clinikally-bags-26m-go-omnichannel>
- <https://www.mobihealthnews.com/news/skinvision-gets-76m-continue-expanding-skin-cancer-app>

**mohfw.gov.in**

- <https://www.mohfw.gov.in/pdf/Telemedicine.pdf>

**msg91.com**

- <https://msg91.com/in/pricing/sms>

**multibagg.ai**

- <https://www.multibagg.ai/market-pulse/articles/the-derma-co-offline-expansion-concall-cmwamawjl001e2qo6jb9c81a0>

**multiples.vc**

- <https://multiples.vc/private-comps/zenoti>

**newsbytesapp.com**

- <https://www.newsbytesapp.com/news/business/blinkit-zepto-adjust-commission-structures-to-enhance-profitability/story>
- <https://www.newsbytesapp.com/news/business/foxtale-revenue-almost-doubled-to-rs383-cr-in-fy26/tldr>
- <https://www.newsbytesapp.com/news/business/kay-beauty-hits-rs300cr-sales-run-rate-in-q1-fy27/tldr>
- <https://www.newsbytesapp.com/news/business/purplles-revenue-doubles-to-rs1367cr-in-fy25/tldr>
- <https://www.newsbytesapp.com/news/science/nykaas-new-skin-scan-lets-you-selfie-your-way-to-better-skincare/tldr>
- <https://www.newsbytesapp.com/news/science/nykaas-new-skin-scan-lets-you-selfie-your-way-to-better-skincare/tldr)†>

**newsmeter.in**

- <https://newsmeter.in/do-you-know/20-online-shoppers-received-fake-product-at-least-once-in-12-months-survey-742207>
- <https://newsmeter.in/tech-startups/ratan-tata-innovation-hubs-launched-across-six-ap-cities-by-cm-naidu-753772>

**newswire.ca**

- <https://newswire.ca/news-releases/benefit-cosmetics-brings-glam-up--away-automated-retail-kiosks-to-first-canadian-airport-671627934.html>

**ntr.ap.gov.in**

- <https://ntr.ap.gov.in/district-profile>

**nutraingredients.com**

- <https://www.nutraingredients.com/Article/2024/04/24/Skincare-in-India-OZiva-launches-fizzy-drink-with-glutathione/>

**nykaa.com**

- <https://nykaa.com/cancellation-policy>
- <https://nykaa.com/media/wysiwyg/2024/pdf/Nykaa_Beauty_Summit_Report_2024-v5.pdf>
- <https://nykaa.com/vega-make-up-brushes-evs-09-set-of-9/p/18517>
- <https://www.nykaa.com/media/wysiwyg/uiTools/2025-8/transcript-of-13th-agm.pdf>
- <https://www.nykaa.com/skin-compass>
- <https://www.nykaa.com/swiss-beauty-makeup-brushes-pink/p/633628>
- <https://www.nykaa.com/swiss-beauty-professional-makeup-brush-set/p/5649070>
- <https://www.nykaa.com/vega-professional-foundation-brush-vppmb-06/p/9892783>
- <https://www.nykaa.com/vega-set-of-7-make-up-brushes/p/3811>

**oec.world**

- <https://oec.world/profile/bilateral-product/perfumery-cosmetics/reporter/ind>

**olivaclinic.com**

- <https://www.olivaclinic.com/>
- <https://www.olivaclinic.com/vijayawada/>

**openthemagazine.com**

- <https://openthemagazine.com/branding-marketing-and-advertising/too-many-stars-one-bathroom-shelf-can-indias-celebrity-mens-grooming-brands-all-find-a-market>
- <https://openthemagazine.com/business/indias-supplements-market-could-nearly-double-digital-first-brands-want-a-bigger-share-report>

**outlookbusiness.com**

- <https://www.outlookbusiness.com/ampstories/corporate/nykaa-now-leads-with-rapid-growth-in-beauty-deliveries-heres-whats-fueling-it>
- <https://www.outlookbusiness.com/companies/reliance-retail-to-acquire-arvind-fashions-beauty-retail-business-including-sephora-stores>
- <https://www.outlookbusiness.com/corporate/flipkart-minutes-hits-1000-stores-amid-deferred-ipo>
- <https://www.outlookbusiness.com/corporate/swiggy-bets-on-instamarts-inventory-shift-mirrors-rival-blinkits-move>
- <https://www.outlookbusiness.com/corporate/zeptos-food-license-suspended-for-dharavi-facility-over-food-safety-violations>
- <https://www.outlookbusiness.com/economy-and-policy/world-bank-releases-340-mn-for-amaravati-development-additional-150-mn-likely-in-apr>
- <https://www.outlookbusiness.com/in-depth/blinkit-goes-big-in-smaller-cities-can-it-sustain-in-kirana-strongholds>

**outlookindia.com**

- <https://www.outlookindia.com/national/vending-machines-market-in-india-to-grow-at-14-9-cagr-during-2020-2026-daalchini-ceo-news-189120>

**perfectcorp.com**

- <https://perfectcorp.com/business/solutions/online-service/skincare-pro/plan>
- <https://www.perfectcorp.com/business/blog/ai-skincare/four-popular-skin-scanner-features-prices-size>
- <https://www.perfectcorp.com/business/blog/ai-skincare/upsell-with-ai-skin-analysis>
- <https://www.perfectcorp.com/business/news/perfect-corp-partners-with-the-good-glamm-group>
- <https://www.perfectcorp.com/business/solutions/online-service/skincare-pro/plan>

**pharmeasy.in**

- <https://pharmeasy.in/blog/abc-juice-apple-beetroot-carrot-what-it-is-benefits-side-effects-more/>

**pib.gov.in**

- <https://pib.gov.in/PressReleasePage.aspx?PRID=1877733>

**pluckk.in**

- <https://pluckk.in/abc-juice--apple-beetroot-and-carrot>

**plumgoodness.com**

- <https://plumgoodness.com/policies/refund-policy>

**pmc.ncbi.nlm.nih.gov**

- <https://pmc.ncbi.nlm.nih.gov/articles/PMC11723967/>
- <https://pmc.ncbi.nlm.nih.gov/articles/PMC3296758>
- <https://pmc.ncbi.nlm.nih.gov/articles/PMC3296758)†>
- <https://pmc.ncbi.nlm.nih.gov/articles/PMC4065278>
- <https://pmc.ncbi.nlm.nih.gov/articles/PMC8641741>

**prnewswire.com**

- <https://prnewswire.com/in/news-releases/kaya-launches-ai-powered-app-to-revolutionize-personalized-skincare-solutions-302255943.html>
- <https://prnewswire.com/news-releases/loreal-groupe-unveils-loreal-cell-bioprint-a-revolution-in-consumer-skin-intelligence-rooted-in-the-field-of-longevity-science-at-ces-2025-302342348.html>
- <https://prnewswire.com/news-releases/lululab-secures-series-b-funding-led-by-netmarble-301181070.html>
- <https://www.prnewswire.com/ae/news-releases/samsung-spin-off-lululab-to-unveil-ai-beauty-store-a-decision-maker-of-cosmetic-products-in-dubai-mall-881452944.html>

**provenskincare.com**

- <https://www.provenskincare.com/>

**pubmed.gov**

- <https://www.pubmed.gov/18086246/>
- <https://www.pubmed.gov/18086246/)†>

**pulse.d2cinsider.com**

- <https://pulse.d2cinsider.com/cureskin-reports-₹133-crore-revenue-in-fy26-as-net-loss-narrows-48-5/>

**purplle.com**

- <https://www.purplle.com/pr/cancellation-and-returns>

**redseer.com**

- <https://redseer.com/articles/beauty-blitz-2030-mapping-indias-ascent-to-a-40-billion-powerhouse/>
- <https://redseer.com/articles/beauty-personal-care-in-quick-commerce/>
- <https://redseer.com/articles/how-omnichannel-is-powering-indias-beauty-market-growth-at-25-cagr/>
- <https://redseer.com/newsletters/online-beauty-market-updates-june18>
- <https://redseer.com/reports/the-redseer-brand-index/>
- <https://redseer.com/wp-content/uploads/2026/02/India-BPC-2030_Growth-Shifts-and-Opportunities_ExecReport_Redseer-2.pdf>

**refinery29.com**

- <https://www.refinery29.com/2013/07/50667/benefit-cosmetics-vending-machine>

**restaurantindia.in**

- <https://www.restaurantindia.in/news/wingreens-farms-buys-raw-pressery-at-rs-100-cr-valuation.n19706>

**retailcustomerexperience.com**

- <https://www.retailcustomerexperience.com/news/skin-care-startup-offers-ai-enabled-skin-care-kiosk/>

**retaildive.com**

- <https://www.retaildive.com/news/perfect-corp-and-face-haus-partner-to-bring-ai-enhanced-skincare/719457>
- <https://www.retaildive.com/news/perfect-corp-go-private-merger/825065/>

**retailitinsights.com**

- <https://www.retailitinsights.com/doc/revieve-expands-beauty-brand-and-retailer-reach-into-generative-ai-discovery-platforms-starting-with-ai-skin-advisor-for-chatgpt-0001>

**revieve.com**

- <https://www.revieve.com/insider/news/revieve-and-myntra-partner-to-launch-digital-skincare-advisor-experience-in-india>
- <https://www.revieve.com/insider/news/revieve-announces-series-a-raise>

**ril.com**

- <https://www.ril.com/sites/default/files/2025-07/Tira_Beauty_Limited.pdf>

**rupeezy.in**

- <https://rupeezy.in/stocks/honasa-consumer-ltd>

**salonist.io**

- <https://www.salonist.io/pricing>

**sec.gov**

- <https://www.sec.gov/Archives/edgar/data/0001899830/000110465926082398/tm2619936d1_ex99-1.htm>

**sephora.com**

- <https://www.sephora.com/beauty/returns-exchanges>
- <https://www.sephora.com/beauty/returns-exchanges)†>

**skinive.com**

- <https://skinive.com/>

**smergers.com**

- <https://smergers.com/industry-watch/indian-salon-industry/>

**softwareadvice.com**

- <https://www.softwareadvice.com/salon/dingg-profile>

**soranews24.com**

- <https://soranews24.com/2023/11/12/tokyo-has-a-new-vending-machine-where-everything-inside-is-free%E3%80%90photos%E3%80%91/amp/>

**ssrana.in**

- <https://ssrana.in/articles/meity-plans-to-cut-short-dpdp-compliance-timeline-and-notify-cross-border-restrictions-for-sdfs/>

**staffnews.in**

- <https://www.staffnews.in/2017/07/7th-cpc-house-rent-allowance-hra-finance-ministry-om.html>
- <https://www.staffnews.in/2017/07/7th-cpc-house-rent-allowance-hra-finance-ministry-om.html)†>

**startupindia.gov.in**

- <https://www.startupindia.gov.in/content/sih/en/startupgov/startup_recognition_page.html>

**startuptalky.com**

- <https://startuptalky.com/quick-commerce-real-cost-d2c-brands/>

**static.franchiseindia.com**

- <https://static.franchiseindia.com/insights/en/article/vending-machine-cost-investment-in-india.56234>
- <https://static.franchiseindia.com/insights/en/article/vending-machine-cost-investment-in-india.56234)†>

**static.pib.gov.in**

- <https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf>

**statista.com**

- <https://www.statista.com/outlook/cmo/beauty-personal-care/india>
- <https://www.statista.com/outlook/cmo/beauty-personal-care/india)†>

**store.mintel.com**

- <https://store.mintel.com/report/india-ingestible-beauty-market-report>

**stores.nykaa.com**

- <https://stores.nykaa.com/nykaa-luxe-cosmetics-store-sriram-nagar-vijayawada-543606/Home>
- <https://stores.nykaa.com/nykaa-on-trend-cosmetics-store-gandhipuram-rajahmundry-343650/Home>

**stores.thebodyshop.in**

- <https://stores.thebodyshop.in/amp/the-body-shop-cosmetics-store-labbipet-vijayawada-258040/Home>

**storyboard18.com**

- <https://storyboard18.com/brand-marketing/nykaa-ups-marketing-spends-to-rs-995-crore-in-fy25-ai-influencers-drive-28-customer-growth-78127.htm>
- <https://www.storyboard18.com/amp/brand-marketing/mens-grooming-gains-lifestyle-edge-as-flipkart-amazon-post-up-to-80-yoy-growth-88232.htm>
- <https://www.storyboard18.com/brand-makers/myntra-to-zepto-platforms-cash-in-on-cosmetics-boom-k-beauty-soars-75-on-amazon-75592.htm>
- <https://www.storyboard18.com/brand-marketing/nykaa-raises-stake-in-d2c-skincare-brand-dot-acquires-earth-rhythm-39489.htm>
- <https://www.storyboard18.com/digital/meity-seeks-industry-views-on-fast-tracking-dpdp-act-rollout-proposes-12-month-compliance-timeline-88332.htm>
- <https://www.storyboard18.com/how-it-works/india-fastest-growing-bpc-market-globally-to-reach-34-billion-by-2028-nykaa-beauty-trends-report-41726.htm>
- <https://www.storyboard18.com/how-it-works/non-metros-close-gap-55-of-prestige-beauty-brands-sales-from-non-metros-nykaa-41812.htm>

**superkalam.com**

- <https://superkalam.com/current-affairs/29-12-2025/aiims-google-develop-ai-powered-app-to-expand-skincare-pg12-0cc269d3-adfc-4685-b6fb-f5907eeadf50>

**sustainabilityreports.com**

- <https://www.sustainabilityreports.com/kaya/2025/annual-report>

**techcrunch.com**

- <https://techcrunch.com/2024/06/17/can-quick-commerce-leapfrog-e-commerce-in-india>
- <https://techcrunch.com/2024/06/17/can-quick-commerce-leapfrog-e-commerce-in-india)†>

**techjockey.com**

- <https://techjockey.com/detail/salon360>
- <https://www.techjockey.com/detail/invoay-spa-salon-software>

**techradar.com**

- <https://www.techradar.com/home/small-appliances/i-looked-into-samsungs-ai-powered-micro-led-mirror-and-now-im-ready-for-some-scientifically-backed-looksmaxxing>

**telanganatoday.com**

- <https://telanganatoday.com/pakistan-made-cosmetics-worth-rs-7-lakh-seized-in-hyderabad-wider-network-suspected>

**thc.nic.in**

- <https://www.thc.nic.in/Central%20Governmental%20Acts/Consumer%20Protection%20Act,%202019.pdf>
- <https://www.thc.nic.in/Central%20Governmental%20Acts/Drugs%20and%20Magic%20Remedies%20(Objectionable%20Advertisements)%20Act,%201954.pdf>
- <https://www.thc.nic.in/Central%20Governmental%20Rules/Consumer%20Protection%20(E-Commerce)%20Rules,%202020.pdf>
- <https://www.thc.nic.in/Central%20Governmental%20Rules/Legal%20Metrology%20(Packaged%20Commodities)%20Rules,%202011.pdf>
- <https://www.thc.nic.in/Central%20Governmental%20Rules/Medical%20Device%20Rules,%202017.pdf>
- <https://www.thc.nic.in/Central%20Governmental%20Rules/e%20Cosmetics%20Rules,%202020.pdf>
- <https://www.thc.nic.in/Tripura%20State%20Lagislation%20Acts/Drugs%20and%20Cosmetics%20Act,%201940.pdf>

**thedermaco.com**

- <https://thedermaco.com/blogs/skin-care/the-derma-co-ai-skin-test-works-app-vs-website>
- <https://thedermaco.com/blogs/skin-care/the-derma-co-ai-skin-test-works-app-vs-website)†>

**thehansindia.com**

- <https://www.thehansindia.com/andhra-pradesh/guntur-krishna-turn-educational-hub-598826>

**thekredible.com**

- <https://thekredible.com/blogs/shraddha-kapoor-backed-power-gummies-sees-20-revenue-drop-in-fy24>

**theprint.in**

- <https://theprint.in/ani-press-releases/kult-app-launches-in-india-tech-driven-beauty-app-with-under-2-hour-deliveries-in-mumbai-and-less-than-48-hours-pan-india/1251008/>
- <https://theprint.in/feature/indias-fake-goods-boom-9-in-10-urban-shoppers-have-bought-knockoffs-says-survey/2880659>
- <https://theprint.in/feature/tira-turns-two-indias-beauty-playground-gets-bigger-bolder-and-more-beautiful/2586472/>
- <https://theprint.in/india/ai-driven-app-to-help-diagnose-skin-diseases-launched-by-aiims-nurithm-labs/974594>
- <https://theprint.in/india/allergic-reaction-to-fake-products-survey-finds-1-in-4-households-face-issues-with-cosmetics/1275303>

**thereportcubes.com**

- <https://www.thereportcubes.com/report-store/cold-pressed-juice-market-india>

**thesouthfirst.com**

- <https://thesouthfirst.com/health/instagram-skin-doctors-vs-real-dermatologists-dakshin-health-summit-exposes-digital-quackery-crisis>
- <https://thesouthfirst.com/health/instagram-skin-doctors-vs-real-dermatologists-dakshin-health-summit-exposes-digital-quackery-crisis)†>

**tirabeauty.com**

- <https://www.tirabeauty.com/article/articles/from-virtual-try-on-to-beauty-quizzes-tiras-tech-that-transform-shopping>
- <https://www.tirabeauty.com/collection/tira-express>

**trai.gov.in**

- <https://www.trai.gov.in/release-publication/directions>
- <https://www.trai.gov.in/sites/default/files/2024-09/Direction_20082024.pdf>
- <https://www.trai.gov.in/sites/default/files/2024-09/Direction_30082024_0.pdf>
- <https://www.trai.gov.in/sites/default/files/2024-11/Direction_28102024_0.pdf>
- <https://www.trai.gov.in/sites/default/files/2024-12/Direction_30112024.pdf>
- <https://www.trai.gov.in/sites/default/files/2026-11/Regulation_TCCCPR_04112026.pdf>

**trendhunter.com**

- <https://www.trendhunter.com/trends/beauty-kiosks>

**tribuneindia.com**

- <https://www.tribuneindia.com/news/business/zeptos-license-suspended-in-mumbais-dharavi-for-food-safety-non-compliance>

**troveskin.com**

- <https://www.troveskin.com/>

**tweaktown.com**

- <https://www.tweaktown.com/news/102435/samsung-can-diagnose-face-and-skin-conditions-with-its-new-mirror-display/index.html>

**ulta.com**

- <https://www.ulta.com/returns>

**upstox.com**

- <https://upstox.com/news/upstox-originals/investing/from-shelf-to-screen-the-digital-makeover-of-beauty/article-179966>

**valueresearchonline.com**

- <https://www.valueresearchonline.com/stocks/325958/honasa-consumer-ltd/>

**vega.co.in**

- <https://www.vega.co.in/about-us>

**vendiman.com**

- <https://vendiman.com/?p=5761>

**vendingtimes.com**

- <https://www.vendingtimes.com/news/product-sampling-vending-machine-debuts-in-india/>

**wareiq.com**

- <https://wareiq.com/resources/blogs/amazon-return-policy/>

**wendor.in**

- <https://wendor.in/?p=10721>

**whalesbook.com**

- <https://www.whalesbook.com/corporate-news/English/consumer-products/Kaya-Ltd-Sees-Steep-FY26-Net-Loss-of-indian-rupee96-Cr-Equity-Turns-Negative/6a0d809481d22035d81cfc4f>

**whatsappbusiness.com**

- <https://whatsappbusiness.com/wp-json/wab/v1/pricing?market=IN&currency=INR&category=Authentication>

**which.co.uk**

- <https://www.which.co.uk/news/article/can-you-trust-ai-skin-analysers-a7Uhd1Q5mhUa>

**wikipedia.org**

- <https://Www.Wikipedia.org/wiki/List_of_educational_institutions_in_Vijayawada-Guntur_Region>

**wikiwand.com**

- <https://wikiwand.com/en/articles/Tira_(cosmetics)>

**ximpex.in**

- <https://ximpex.in/import/artists-brushes-writing-brushes-and-similar-brushes-for-the/2023>

**ycombinator.com**

- <https://www.ycombinator.com/launches/Ndm-clara-by-clinikally-clinical-grade-skin-analysis-with-ai>

**yourstory.com**

- <https://yourstory.com/2019/07/hyderabad-startup-skinkraft-data-customised-skincare>
- <https://yourstory.com/2021/06/ai-platform-eskindoctor-skincare-dermatology-startup>
- <https://yourstory.com/2022/03/funding-personal-care-brand-cureskin-series-a-round-led-jsw-ventures/amp>
- <https://yourstory.com/2023/09/clinikally-dermatology-ycombinator-tribe-goodwater-kunal-shah>
- <https://yourstory.com/2024/11/daalchini-revenue-growth-vending-machine-startup-ai-ml-retail>
- <https://yourstory.com/2024/11/distribution-woes-inventory-correction-mamaearth-honasa-consumer>
- <https://yourstory.com/2024/11/distribution-woes-inventory-correction-mamaearth-honasa-consumer)†>
- <https://yourstory.com/2024/12/myntra--m-now-30-minute-delivery-rising-competition-quick-commerce>
- <https://yourstory.com/2025/01/shoppers-unhappy-return-policies-counterfeit-goods-ecommerce-platforms>
- <https://yourstory.com/2025/10/reliance-scales-quick-commerce-to-1000-cities-across-5000-pin-codes>
- <https://yourstory.com/2026/01/reliance-scales-quick-commerce-to-16-million-daily-orders>
- <https://yourstory.com/2026/07/bombay-shaving-company-posts-139-rise-in-revenues-for-fy26>
- <https://yourstory.com/2026/07/nykaa-appoints-ankit-jain-to-lead-quick-commerce-arm-nykaa-now>

**zenoti.com**

- <https://www.zenoti.com/>

**zoutons.com**

- <https://zoutons.com/news/amazon-returns-policy-account-history-2026>
- <https://zoutons.com/news/d2c-beauty-return-windows-compared-2026>
- <https://zoutons.com/news/plum-return-policy-2026>

**zylu.co**

- <https://www.zylu.co/pricing>

---

## OPEN QUESTIONS (could not be verified)

**About GlowVai itself**
1. Whether **"GLOW VAI Technologies Pvt. Ltd."** is incorporated, plus its CIN, registered address and GSTIN. The site's "Studio 4B, Design District, Hyderabad 500081" could not be checked. Run an MCA lookup.
2. GlowVai's off-site presence: Google index status, news coverage, Instagram, X and LinkedIn followers, reviews, Startup India recognition, and the "Work Wizards Innovations" partnership mentioned in the founder story. The search budget ran out before these could be run.
3. Whether the "1,200+ scans", "4.9/5", the 5 "Active" hubs, "licensed partner pharmacies", "HDFC 10% off" and "rider transit insurance" are backed by real data or contracts.
4. Who manufactures the 6 own-label products, and whether they physically exist.
5. What the Google Apps Script backend stores (a Google Sheet or Drive?), who can access it, and where it is hosted.

**Market and consumers**

6. Andhra Pradesh- or Vijayawada-specific beauty spend and online order data.
7. A beauty-specific return rate for India.
8. Survey share of skincare purchases driven by dermatologist recommendation and word of mouth.
9. Studies of product suitability for humid climates in India, and Fitzpatrick skin-type distribution.
10. The Vijayawada Census 2011 population (sources conflict: about 10.2–10.5 lakh for the municipal corporation, about 14.8 lakh for the urban agglomeration).
11. The number of dermatologists in Vijayawada.

**Competitors**

12. Zepto, Amazon Now and Flipkart Minutes coverage in Vijayawada.
13. Health & Glow, Tira and Sephora store presence in Vijayawada (none found).
14. Nykaa Skin Scan details (snippet only); Purplle skin analyser (not found); Meitu, Shiseido and CNDP tools.
15. Olay, Proactiv and Clinique money-back guarantee terms.
16. Any Indian cosmetic or skin-reaction insurance product, including embedded e-commerce cover from ACKO, Digit and others.
17. Financials for Lakmé, Lotus, Himalaya, Biotique, Re'equil, Swiss Beauty and Health & Glow; Sephora India's recent revenue; Amazon and Flipkart beauty GMV.
18. Kult's return policy, and whether its import registrations were restored after the February 2026 cancellation.
19. Indian prices for VISIA, Meicet and Observ analysers.
20. Beauty vending at scale in India; Twenty Beauty's outcome.

**Regulation**

21. Official texts of the CCPA guidelines: Misleading Ads 2022, Endorsement Know-hows 2023, Dark Patterns 2023, and IS 19000:2022.
22. The Legal Metrology rule on what e-commerce listings must display.
23. CDSCO S.O. (Feb 2020) on medical-device software; the AI clause in the Telemedicine Guidelines; MeitY's AI governance guidelines.
24. DLT registration fees; Truecaller SDK terms; how Firebase delivers SMS in India.
25. FSSAI thresholds, juice shelf-life norms, GST rates after the September 2025 changes, and the Andhra Pradesh Shops & Establishments process.
26. Whether the DPDP 18-month timeline has been shortened.
27. Whether a cosmetics retail licence is needed in Andhra Pradesh (the reading of the 2020 Rules suggests not).

**Growth**

28. Gross margins on beauty accessories in India.
29. The dollar size of the India nutricosmetics market.
30. Independent data on salon upsell lift from skin analysis.
31. Profitability of vending machines (claims of a 25–35% margin and 12–18 month payback are undocumented).

---

## APPENDIX — Face-scan code evidence (Part 1.2)

The production bundle `https://glowvai.in/_next/static/immutable/chunks/1aztfsivvdlae.js` was fetched on 26 Nov 2026. Excerpts below are minified; a fixed score table, the scoring function and the upload call are shown.

```js
{boy_under_18:{label:"Boy (Under 18)",score:68},boy_18_21:{label:"Boy (Aged 18–21)",score:72},
 man_middle:{label:"Middle-aged Man",score:70},man_older:{label:"Older Man",score:66},
 woman_older:{label:"Older Woman",score:68},girl_under_18:{label:"Girl (Under 18)",score:69},
 girl_18_23:{label:"Girl (Aged 18–23)",score:74},bright_face:{label:"Bright / Well-lit Face",score:76}}

async analyseFrame(e,a="girl_18_23"){let t=l[a]||l.girl_18_23,i=t.score,
  s=c(i+2),r=c(i-1),n=c(i+1),o=c(i-2) ... return{overall:i,subScores:{hydration:s,texture:r,tone:n,clarity:o}, ...}}
// note: the image argument `e` is never read

fetch("https://script.google.com/macros/s/AKfycbwz…/exec",{method:"POST",body:JSON.stringify({action:"create",
  data:{session_id,name,phone,email,demographic,skin_concern,image_base64:e.capturedImage||"",
        overall_score,sub_scores,location,ip,browser,os}})})
```

Analysis: a developer placeholder that was never replaced is the most likely explanation. Either way, the public "AI" claims should match what ships.
