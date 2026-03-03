'use client'

import { LegalPageLayout } from './legal-page-layout'

export function GDPRPage() {
  return (
    <LegalPageLayout title="GDPR" lastUpdated="January 2026">
      <p className="text-amber-400/80 bg-amber-500/10 border border-amber-500/20 p-4 mb-6">
        <strong>Draft overview for GDPR page (not a DPA).</strong> To be reviewed by counsel.
      </p>

      <h2>1. GDPR at Ori-OS</h2>
      <p>
        Ori-OS is built for EU-based agencies and tech teams. We aim to support our customers in meeting their GDPR obligations when they use Ori-OS to process personal data, especially B2B contact data.
      </p>
      <p>This page explains:</p>
      <ul>
        <li>When we act as controller vs processor.</li>
        <li>How Ori-OS supports common GDPR requirements.</li>
        <li>Where to find our Data Processing Agreement (DPA) and sub-processor list.</li>
      </ul>

      <h2>2. Our role: controller vs processor</h2>
      <ul>
        <li>We are a <strong>controller</strong> for your Ori-OS account data, website usage, and billing data.</li>
        <li>We are a <strong>processor</strong> for the data you and your users store in Ori-OS about your own contacts and clients.</li>
      </ul>
      <p>As a processor, we:</p>
      <ul>
        <li>Only process personal data on your documented instructions (mainly the actions you perform through Ori-OS).</li>
        <li>Implement security measures appropriate for our size and risk profile.</li>
        <li>Help you respond to certain data subject requests, as described below and in our DPA.</li>
        <li>Inform you of data breaches affecting your data without undue delay, where required.</li>
      </ul>

      <h2>3. Lawful basis support</h2>
      <p>
        You are responsible for choosing your lawful basis for processing contacts (legitimate interest, contract, consent, etc.) and for documenting it.
      </p>
      <p>Ori-OS supports this by:</p>
      <ul>
        <li>Allowing you to store lawful-basis information at contact or list level.</li>
        <li>Keeping timestamps and notes for when and why a contact was added.</li>
        <li>Providing export capabilities that include lawful-basis fields so you can produce records if needed.</li>
      </ul>

      <h2>4. Data subject rights support</h2>
      <p>Ori-OS is not a substitute for your own processes, but it can help you respond to:</p>
      <ul>
        <li><strong>Access requests</strong> – you can search for a contact and export their data.</li>
        <li><strong>Correction</strong> – you can update inaccurate fields for a contact.</li>
        <li><strong>Deletion</strong> – you can delete contacts and associated events (subject to your retention policies and our backups).</li>
        <li><strong>Objection / restriction</strong> – you can assign tags, update lawful-basis fields, and use suppression to stop further processing for marketing.</li>
      </ul>
      <p>
        We will respond to data subject requests that we receive directly as controller for our own users. When we receive a request that relates to data you control, we may refer the person to you.
      </p>

      <h2>5. Sub-processors and data location</h2>
      <ul>
        <li>We use third-party providers (sub-processors) to host and operate Ori-OS.</li>
        <li>We aim to host production data in the EU when possible.</li>
        <li>Some providers may store or access data from outside the EU; in these cases, we use appropriate safeguards, such as Standard Contractual Clauses.</li>
        <li>We maintain a list of current sub-processors that you can review. We will notify customers of material changes where required.</li>
      </ul>

      <h2>6. Data transfers</h2>
      <p>When personal data is transferred outside the EU/EEA, we:</p>
      <ul>
        <li>Assess whether the destination country has an adequacy decision.</li>
        <li>If not, rely on Standard Contractual Clauses or other lawful mechanisms.</li>
        <li>Evaluate additional technical or organizational measures when needed.</li>
      </ul>

      <h2>7. Security measures</h2>
      <p>We implement reasonable security measures to protect personal data processed in Ori-OS, including:</p>
      <ul>
        <li>Infrastructure security (secured hosting, access management).</li>
        <li>Logical access control for our team.</li>
        <li>Logging of important actions in the app.</li>
        <li>Backup and recovery processes.</li>
      </ul>
      <p>For more details, see our Security page.</p>

      <h2>8. Data Processing Agreement (DPA)</h2>
      <p>We offer a DPA that governs our role as a processor. It includes:</p>
      <ul>
        <li>Subject matter and duration of processing.</li>
        <li>Type and categories of data.</li>
        <li>Our obligations and customer obligations.</li>
        <li>Sub-processor conditions.</li>
        <li>Security measures and incident notification.</li>
      </ul>
      <p>
        You can review and accept our DPA through the app, or contact us at <strong>privacy@ori-craftlabs.com</strong> to discuss it.
      </p>

      <h2>9. DPIAs and high-risk processing</h2>
      <p>
        If you are required to perform a Data Protection Impact Assessment (DPIA) for your use of Ori-OS (for example, large-scale profiling or sensitive processing), we can provide technical information about our platform to support your assessment.
      </p>
      <p>
        We cannot perform DPIAs on your behalf or give legal advice, but we can help answer technical questions about data flows and security.
      </p>
    </LegalPageLayout>
  )
}
