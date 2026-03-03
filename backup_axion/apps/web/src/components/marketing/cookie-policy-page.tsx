'use client'

import { LegalPageLayout } from './legal-page-layout'

export function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" lastUpdated="January 2026">
      <p className="text-amber-400/80 bg-amber-500/10 border border-amber-500/20 p-4 mb-6">
        <strong>Draft Cookie Policy overview.</strong>
      </p>

      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files that websites store on your device to remember certain information about you. Similar technologies include local storage, pixels, and tags. We refer to all of these as "cookies" in this policy.
      </p>

      <h2>2. How we use cookies</h2>
      <p>We use cookies on the Ori-OS website and app to:</p>
      <ul>
        <li>Keep you logged in and maintain sessions.</li>
        <li>Remember your preferences (e.g., language, cookie settings).</li>
        <li>Understand how visitors use our website so we can improve it.</li>
        <li>Support marketing campaigns and measure their effectiveness, where permitted.</li>
      </ul>

      <h2>3. Types of cookies</h2>
      
      <h3>Strictly necessary cookies</h3>
      <ul>
        <li>Required for the website and app to function (e.g., authentication cookies).</li>
        <li>Cannot be switched off using our cookie banner.</li>
      </ul>

      <h3>Preference cookies</h3>
      <ul>
        <li>Remember your settings and choices.</li>
        <li>Enhance your experience but are not essential.</li>
      </ul>

      <h3>Analytics cookies</h3>
      <ul>
        <li>Help us understand how users interact with the website (e.g., which pages are visited).</li>
        <li>We may use privacy-focused analytics tools when possible.</li>
      </ul>

      <h3>Marketing cookies</h3>
      <ul>
        <li>Used to track visitors across websites and deliver relevant advertising, if we use such services.</li>
      </ul>

      <h2>4. Cookie consent</h2>
      <p>Where required by law (for example in the EU/EEA), we ask for your consent before placing non-essential cookies (analytics and marketing cookies).</p>
      <p>You can:</p>
      <ul>
        <li>Change your cookie preferences using our cookie banner or settings.</li>
        <li>Block or delete cookies via your browser settings. Note that this may affect how our site or app functions.</li>
      </ul>

      <h2>5. Updates</h2>
      <p>We may update this Cookie Policy from time to time, for example if we add new services or change providers.</p>
    </LegalPageLayout>
  )
}
