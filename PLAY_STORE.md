# Publish Calling Card to Google Play Store

Your app is already wrapped with **Capacitor**. The website loads inside a native Android shell.

Live web app: https://digital-business-card-samuelchristopher344-beep.vercel.app  
App ID: `com.christoflightx.callingcard`  
App name: **Calling Card**

---

## Status checklist

| Step | Status |
|------|--------|
| Web app live | Done |
| Capacitor config | Done |
| GitHub Action builds APK + AAB | Done |
| Google Play developer account ($25) | **You must do this** |
| Upload AAB + store listing | **You must do this** |
| Closed testing (if required) | **You must do this** |
| Production publish | After Google review |

I cannot pay the $25 or complete identity verification for you. Only you can finish those Google steps.

---

## Step 1 — Get the Android package (free)

1. Open: https://github.com/samuelchristopher344-beep/digital-business-card/actions  
2. Click **Build Android APK / AAB**  
3. Click **Run workflow** → **Run workflow**  
4. Wait until it finishes (green check)  
5. Open the run → **Artifacts**  
6. Download:
   - **Calling-Card-debug-apk** — install on your phone to test  
   - **Calling-Card-play-aab** — file for Play Console  

---

## Step 2 — Google Play developer account ($25 once)

1. Go to https://play.google.com/console  
2. Sign in with your Google account  
3. Pay the **one-time $25** fee  
4. Complete identity verification (government ID)  

Without this, the app cannot appear on the Play Store.

---

## Step 3 — Create the app in Play Console

1. **Create app**  
2. App name: **Calling Card**  
3. Default language: English (or your preference)  
4. App or game: **App**  
5. Free or paid: **Free**  
6. Accept declarations  

Package name must stay: `com.christoflightx.callingcard` (already set in Capacitor).

---

## Step 4 — Upload the AAB

1. Play Console → your app → **Testing** → **Closed testing** (recommended first)  
2. Create a new release  
3. Upload the **.aab** from the GitHub artifact  
4. Add release notes (e.g. “First release of Calling Card”)  
5. Save → Review → Start rollout to closed testers  

**New personal accounts (after Nov 2023):** Google often requires **at least 12 testers opted in for 14 continuous days** before you can go to production.

---

## Step 5 — Store listing (required)

Fill in:

- Short description (up to 80 characters)  
- Full description  
- App icon (512×512 PNG)  
- Feature graphic (1024×500)  
- Phone screenshots (at least 2)  
- **Privacy policy URL** — host a simple page on your site, e.g.  
  `https://digital-business-card-samuelchristopher344-beep.vercel.app/privacy`  
  (add this page if it does not exist yet)  

Also complete:

- **Data safety** form (you collect email if users sign up)  
- Content rating questionnaire  
- Target audience  

---

## Step 6 — Production

After closed testing rules are met (if any):

1. **Production** → Create release → use the same or a new AAB  
2. Submit for review  
3. When approved, users can search **Calling Card** and tap **Install**  

---

## Optional: your own signing key (recommended before production)

For a production-grade upload key, create a keystore once on a computer:

```bash
keytool -genkeypair -v -keystore calling-card-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

Then add GitHub repo secrets:

- `ANDROID_KEYSTORE_BASE64` — base64 of the `.jks` file  
- `ANDROID_KEYSTORE_PASSWORD`  
- `ANDROID_KEY_ALIAS`  
- `ANDROID_KEY_PASSWORD`  

Re-run the workflow so the AAB is signed with your key.

**Keep the keystore file safe.** If you lose it, updating the app on Play becomes very hard.

---

## What I (Grok) can and cannot do

| Can do | Cannot do |
|--------|-----------|
| Capacitor setup in the repo | Pay Google $25 for you |
| GitHub Action to build APK/AAB | Verify your identity with Google |
| Guide + privacy page in the app | Click “Publish” in your Play Console |
| Fix code issues | Create the Play developer account |

---

## Quick path if you only have a phone

1. Use GitHub **Actions** on the phone browser to run the workflow and download the APK  
2. Install the APK to test  
3. When you have $25, open Play Console on the phone or any computer and follow Steps 2–6  

Your app is ready to package. Publishing is the Google account + upload + listing steps above.
