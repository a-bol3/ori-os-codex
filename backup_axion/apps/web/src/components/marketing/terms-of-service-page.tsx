'use client'

import { LegalPageLayout } from './legal-page-layout'

export function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="January 2026">
      <p className="text-amber-400/80 bg-amber-500/10 border border-amber-500/20 p-4 mb-6">
        <strong>Draft outline in plain English (not final contract).</strong> To be converted into full Terms with legal review.
      </p>

      <h2>1. Introduction</h2>
      <p>
        These Terms of Service ("Terms") govern your access to and use of Ori-OS and related services provided by Ori-CraftLabs ("we", "us").
      </p>
      <p>
        By creating an account, accessing, or using Ori-OS, you agree to be bound by these Terms. If you are using Ori-OS on behalf of a company, you represent that you have authority to bind that company.
      </p>

      <h2>2. Account registration</h2>
      <ul>
        <li>You must provide accurate information when creating an account.</li>
        <li>You are responsible for safeguarding your login credentials and any activity under your account.</li>
        <li>You must notify us promptly if you suspect unauthorized access.</li>
      </ul>

      <h2>3. Use of Ori-OS</h2>
      <p><strong>You agree to:</strong></p>
      <ul>
        <li>Use Ori-OS only for lawful business purposes.</li>
        <li>Comply with these Terms and applicable laws when using Ori-OS.</li>
        <li>Ensure that your users do not misuse Ori-OS.</li>
      </ul>
      <p><strong>You agree not to:</strong></p>
      <ul>
        <li>Use Ori-OS to send unlawful spam or abusive communications.</li>
        <li>Attempt to circumvent technical limitations or security measures.</li>
        <li>Use Ori-OS to violate third-party terms of service (for example, scraping from websites that expressly forbid it).</li>
        <li>Reverse engineer or attempt to derive the source code of Ori-OS, except where permitted by law.</li>
      </ul>
      <p>We may suspend or terminate access if we reasonably believe these rules are being violated.</p>

      <h2>4. Subscriptions, billing, and renewals</h2>
      <ul>
        <li>Ori-OS is provided on a subscription basis (e.g., monthly or yearly plans).</li>
        <li>Fees, billing intervals, and plan features are described on our pricing page or in your order.</li>
        <li>Subscriptions renew automatically at the end of each term unless canceled according to our cancellation policy.</li>
        <li>We may change our pricing with reasonable notice. Price changes will apply at renewal unless otherwise agreed.</li>
        <li>You are responsible for paying all applicable fees and taxes.</li>
      </ul>

      <h2>5. Trials and beta features</h2>
      <ul>
        <li>We may offer free trials or beta features with limited functionality or for a limited period.</li>
        <li>We may modify or discontinue trials and beta features at any time without notice.</li>
      </ul>

      <h2>6. Customer data and intellectual property</h2>
      <ul>
        <li>You retain ownership of the data you upload or create in Ori-OS.</li>
        <li>You grant us a limited license to use that data as necessary to provide and improve the service, and as otherwise described in our Privacy Policy and DPA.</li>
        <li>We retain ownership of Ori-OS, including all software, features, and documentation.</li>
      </ul>

      <h2>7. Confidentiality</h2>
      <p>Each party may receive confidential information from the other during the course of using Ori-OS. Both parties agree to:</p>
      <ul>
        <li>Use confidential information only for the purposes of the agreement.</li>
        <li>Take reasonable measures to protect it.</li>
        <li>Not disclose it to third parties except as permitted.</li>
      </ul>

      <h2>8. Warranties and disclaimers</h2>
      <p>Ori-OS is provided "as is" and "as available."</p>
      <p>To the extent permitted by law, we:</p>
      <ul>
        <li>Do not guarantee that Ori-OS will be error-free or uninterrupted.</li>
        <li>Do not promise specific results from using Ori-OS.</li>
      </ul>
      <p>You are responsible for verifying that Ori-OS fits your needs and for complying with any legal requirements that apply to your business.</p>

      <h2>9. Limitation of liability</h2>
      <p>To the extent permitted by law:</p>
      <ul>
        <li>Our total liability under these Terms is limited to the fees you paid us in the 12 months before the event giving rise to the claim.</li>
        <li>We are not liable for indirect, incidental, special, or consequential damages, including loss of profits or business opportunities.</li>
        <li>Nothing in this section limits liability that cannot be excluded under applicable law (for example, for fraud).</li>
      </ul>

      <h2>10. Term and termination</h2>
      <ul>
        <li>These Terms remain in effect while you have an Ori-OS account or continue to use the service.</li>
        <li>You may cancel your subscription according to the process described in the app or your order.</li>
        <li>We may suspend or terminate your access if you materially breach these Terms and fail to remedy the breach after reasonable notice.</li>
        <li>After termination, your access to Ori-OS will end, but we may retain certain data as necessary to comply with legal obligations or for legitimate business purposes.</li>
      </ul>

      <h2>11. Governing law and disputes</h2>
      <p>
        Specify governing law and jurisdiction (e.g., the laws of [country] and courts of [city/country]) with your lawyer.
      </p>

      <h2>12. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. If we make material changes, we will notify you (for example, via email or in-app notice). Continued use of Ori-OS after changes take effect constitutes your acceptance of the updated Terms.
      </p>
    </LegalPageLayout>
  )
}
