'use client'

import { LegalPageLayout } from './legal-page-layout'

export function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="January 2026">
      <p className="text-amber-400/80 bg-amber-500/10 border border-amber-500/20 p-4 mb-6">
        <strong>Non-binding draft.</strong> You must have a qualified lawyer review and adapt this to your actual stack, vendors, and jurisdictions.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Ori-CraftLabs ("we", "us", "our") builds and operates Ori-OS, a B2B software-as-a-service ("SaaS") platform that helps agencies, consultancies, and tech companies run their revenue operations.
      </p>
      <p>This Privacy Policy explains how we collect, use, and protect personal data when:</p>
      <ul>
        <li>You visit our website and marketing pages.</li>
        <li>You create an Ori-OS account or log in.</li>
        <li>You use Ori-OS as a customer or as an end-user invited by a customer.</li>
        <li>You contact us for support, sales, or partnerships.</li>
      </ul>
      <p>
        We operate primarily from the EU and aim to comply with applicable EU data protection law (including the GDPR) when we act as a controller or processor.
      </p>

      <h2>2. Roles: controller vs processor</h2>
      <p>Depending on the context, we may act as:</p>
      <p><strong>Data controller for:</strong></p>
      <ul>
        <li>Your Ori-OS account information (e.g., name, email, login).</li>
        <li>Billing and subscription data.</li>
        <li>Product analytics about how you use Ori-OS.</li>
        <li>Website and marketing data (e.g., cookies, contact forms).</li>
      </ul>
      <p><strong>Data processor for:</strong></p>
      <ul>
        <li>The personal data you and your team upload or create inside Ori-OS, including B2B contacts, companies, notes, and campaign events.</li>
        <li>Any other personal data you decide to process through Ori-OS on behalf of your own clients.</li>
      </ul>
      <p>
        When we act as a processor, we process personal data only according to our customer's documented instructions and our Data Processing Agreement (DPA).
      </p>

      <h2>3. What data we collect</h2>
      <p>We may collect and process the following categories of personal data:</p>

      <h3>3.1 Account and profile data</h3>
      <ul>
        <li>Name.</li>
        <li>Work email address.</li>
        <li>Password hash or SSO identifiers.</li>
        <li>Role, job title, and organization name.</li>
        <li>Preferred language and localisation settings.</li>
      </ul>

      <h3>3.2 Subscription and billing data</h3>
      <ul>
        <li>Billing contact details.</li>
        <li>Company details (legal name, address, VAT number where applicable).</li>
        <li>Payment method details provided to our payment processor (we do not store full card details ourselves).</li>
        <li>Plan information, invoices, and transaction history.</li>
      </ul>

      <h3>3.3 Product usage and log data</h3>
      <ul>
        <li>Actions taken in the product (e.g., login events, settings changes, campaign creation, imports/exports).</li>
        <li>Device and browser information (type, version, IP address at time of access).</li>
        <li>Session identifiers, error logs, performance metrics.</li>
        <li>Aggregate usage metrics (e.g., number of contacts, emails sent, automations triggered).</li>
      </ul>

      <h3>3.4 Customer contact data (processed on your behalf)</h3>
      <p>When you use Ori-OS to store and manage contacts, we may process:</p>
      <ul>
        <li>Names, job titles, and company affiliations.</li>
        <li>Business email addresses and phone numbers.</li>
        <li>Business social profiles (e.g., LinkedIn) if you choose to store them.</li>
        <li>Campaign participation (emails sent, replies, meetings booked).</li>
        <li>Notes, tags, lawful-basis indicators, and other metadata you decide to store.</li>
      </ul>
      <p>
        You are responsible for ensuring you have a lawful basis to collect and use this data and that your use of Ori-OS complies with applicable laws and third-party terms.
      </p>

      <h3>3.5 Website, cookies, and marketing data</h3>
      <ul>
        <li>Pages visited, buttons clicked, referrer, and time spent.</li>
        <li>IP address, browser type, and device information.</li>
        <li>Cookie identifiers or similar technologies, depending on your consent.</li>
        <li>Information you submit through forms (e.g., demo requests, contact forms, newsletter sign-ups).</li>
      </ul>

      <h2>4. How we use your data</h2>
      <p>We use personal data for the following purposes, based on the legal bases described below:</p>

      <h3>4.1 To provide and maintain Ori-OS</h3>
      <ul>
        <li>Creating and managing user accounts and workspaces.</li>
        <li>Providing core features (lead database, campaigns, automations, CRM, workspace).</li>
        <li>Processing billing and renewing subscriptions.</li>
        <li>Providing support and responding to requests.</li>
      </ul>
      <p><strong>Legal basis:</strong> performance of a contract and steps taken at your request before entering into a contract.</p>

      <h3>4.2 To improve Ori-OS</h3>
      <ul>
        <li>Understanding how features are used.</li>
        <li>Debugging issues and improving performance.</li>
        <li>Developing new capabilities and better UX.</li>
      </ul>
      <p><strong>Legal basis:</strong> our legitimate interests in improving and developing our services, balanced against your privacy rights. We may anonymise or aggregate data for analytics where possible.</p>

      <h3>4.3 To communicate with you</h3>
      <ul>
        <li>Service-related emails (onboarding, security alerts, plan changes).</li>
        <li>Responding to inbound emails and support tickets.</li>
        <li>Marketing communications where permitted (product updates, newsletters, offers).</li>
      </ul>
      <p><strong>Legal basis:</strong> performance of a contract (service messages), legitimate interest, and/or consent (for marketing emails where required). You can opt out of marketing communications at any time.</p>

      <h3>4.4 To comply with legal obligations</h3>
      <ul>
        <li>Keeping records for tax, accounting, and regulatory purposes.</li>
        <li>Responding to lawful requests from authorities.</li>
        <li>Enforcing our Terms of Service and preventing fraud or abuse.</li>
      </ul>
      <p><strong>Legal basis:</strong> compliance with a legal obligation and our legitimate interests.</p>

      <h2>5. Legal bases for processing (GDPR)</h2>
      <p>Under GDPR, we rely on:</p>
      <ul>
        <li><strong>Contractual necessity</strong> – to provide Ori-OS when you sign up.</li>
        <li><strong>Legitimate interests</strong> – to improve the service, protect our systems, and support users.</li>
        <li><strong>Consent</strong> – when required for cookies/analytics and certain marketing communications.</li>
        <li><strong>Legal obligations</strong> – where we must keep or share data for legal reasons.</li>
      </ul>
      <p>When we process B2B contacts on your behalf, you are responsible for identifying and documenting the lawful basis for your own use of that data.</p>

      <h2>6. How we share data</h2>
      <p>We do not sell personal data.</p>
      <p>We may share data with:</p>
      <ul>
        <li><strong>Service providers / sub-processors:</strong> Hosting providers (e.g., EU-based VPS/hosting), email infrastructure providers, payment processors, analytics and logging services, customer support tools.</li>
        <li><strong>Professional advisors:</strong> Lawyers, accountants, or auditors when necessary and appropriate.</li>
        <li><strong>Authorities:</strong> If required by law or to protect rights, safety, or property.</li>
      </ul>
      <p>We require service providers to process personal data only according to our instructions and with appropriate security measures.</p>
      <p>A current list of sub-processors is made available on our website or upon request.</p>

      <h2>7. International transfers</h2>
      <p>Where we transfer personal data outside the EU/EEA (for example, to a service provider in another country), we will:</p>
      <ul>
        <li>Use countries with an adequacy decision; or</li>
        <li>Put in place appropriate safeguards such as Standard Contractual Clauses; and</li>
        <li>Assess the risk of the transfer and implement additional measures where needed.</li>
      </ul>

      <h2>8. Data retention</h2>
      <p>We keep personal data only as long as necessary for the purposes described above, including:</p>
      <ul>
        <li>For as long as your account is active and for a reasonable period afterward to maintain records and resolve issues.</li>
        <li>For the periods required by applicable tax and accounting laws.</li>
        <li>As agreed with customers in our DPA (for processor data).</li>
      </ul>
      <p>You can request deletion of your account or certain data. Some data may remain in backups for a limited period or where we must retain it by law.</p>

      <h2>9. Your rights</h2>
      <p>Subject to applicable law, you may have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of inaccurate or incomplete data.</li>
        <li>Request deletion of your data ("right to be forgotten") in certain circumstances.</li>
        <li>Object to processing based on legitimate interests.</li>
        <li>Restrict processing of your data in certain cases.</li>
        <li>Receive your data in a portable format.</li>
        <li>Withdraw consent where we rely on consent (e.g., for newsletters).</li>
      </ul>
      <p>To exercise these rights, contact us using the details below. We may need to verify your identity before responding.</p>
      <p>If we process data on behalf of a customer (as a processor), we will redirect your request to the relevant customer when appropriate.</p>

      <h2>10. Cookies and similar technologies</h2>
      <p>We may use cookies and similar technologies to:</p>
      <ul>
        <li>Keep you logged in.</li>
        <li>Remember your preferences.</li>
        <li>Understand website usage and improve our content.</li>
        <li>Support marketing campaigns where permitted.</li>
      </ul>
      <p>Where required by law, we ask for your consent before setting non-essential cookies. You can withdraw consent at any time using our cookie settings or by adjusting your browser settings.</p>
      <p>A more detailed cookies overview is provided in our Cookie Policy.</p>

      <h2>11. Security</h2>
      <p>We implement reasonable technical and organizational measures to protect personal data, including:</p>
      <ul>
        <li>Using reputable hosting providers with security controls.</li>
        <li>Limiting access to personal data to authorized personnel.</li>
        <li>Using secure communication (HTTPS) for data in transit.</li>
        <li>Applying least-privilege principles and access control within Ori-OS.</li>
        <li>Monitoring for unusual activity and responding to incidents.</li>
      </ul>
      <p>No system is completely secure. We cannot guarantee absolute security, but we strive to protect your data appropriately for the size and scope of our business.</p>

      <h2>12. Children</h2>
      <p>Ori-OS is a B2B service and not intended for children under 16. We do not knowingly collect personal data from children in this age group.</p>

      <h2>13. Changes to this Policy</h2>
      <p>We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top and, where appropriate, notify you via the service or email.</p>

      <h2>14. Contact</h2>
      <p>If you have questions or concerns about this Policy or how we process personal data, please contact us at:</p>
      <ul>
        <li><strong>Email:</strong> privacy@ori-craftlabs.com</li>
        <li><strong>Postal address:</strong> Company legal address and country</li>
      </ul>
      <p>You can also lodge a complaint with your local data protection authority if you believe your rights have been violated.</p>
    </LegalPageLayout>
  )
}
