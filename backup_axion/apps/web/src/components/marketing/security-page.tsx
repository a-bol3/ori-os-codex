'use client'

import { motion } from 'framer-motion'
import {
  Shield,
  Server,
  Lock,
  Database,
  Users,
  Eye,
  Code,
  FileCheck,
  AlertTriangle,
  Mail,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LegalPageLayout } from './legal-page-layout'

// Security content from spec
const content = {
  hero: {
    title: "Security at Ori‑OS",
    subtitle: "We take the security of your data seriously and design Ori‑OS with modern security practices from day one.",
  },
  intro: {
    paragraph1: "Ori‑OS is used to store and process sensitive business information, including B2B contact data and client workspaces. Our goal is to protect that information with appropriate technical and organizational measures for a lean, EU‑based SaaS platform.",
    paragraph2: "No system can ever be perfectly secure, but we work continuously to reduce risk, monitor our environment, and respond quickly if something goes wrong.",
  },
  sections: {
    infrastructure: {
      title: "Infrastructure security",
      icon: Server,
      points: [
        "Ori‑OS runs on reputable infrastructure providers with data centers located in the EU where possible.",
        "Access to production infrastructure is restricted to authorized team members with a legitimate need, protected by strong authentication and access controls.",
        "We use network‑level security controls provided by our hosting providers, such as firewalls and security groups, to limit exposure.",
        "We maintain regular backups of critical data and test our ability to restore from backups.",
      ],
    },
    application: {
      title: "Application security",
      icon: Code,
      points: [
        "All access to Ori‑OS occurs over HTTPS, encrypting data in transit between your browser and our servers.",
        "Passwords are stored using industry‑standard hashing algorithms; we never store plain‑text passwords.",
        "We implement session management practices that aim to reduce the risk of unauthorized use of logged‑in sessions.",
        "We design features to mitigate common web vulnerabilities (such as injection attacks and cross‑site scripting) and fix issues promptly when discovered.",
        "We apply the principle of least privilege in our code and configuration so components and users only have access to what they need.",
      ],
    },
    dataProtection: {
      title: "Data protection",
      icon: Database,
      points: [
        "Data in transit between Ori‑OS and your browser is encrypted using TLS.",
        "Data at rest is stored using mechanisms provided by our hosting providers; where appropriate, we use disk or volume encryption.",
        "Customer data is logically separated at the application level by workspaces to prevent unintended cross‑access.",
        "We log important actions within the application to support security investigations and basic audit needs.",
      ],
    },
    accessControl: {
      title: "Access control and internal practices",
      icon: Users,
      points: [
        "Internal access to systems and customer data is limited to team members who need it to perform their roles, such as support engineers investigating specific issues.",
        "We use unique accounts and strong authentication for internal tools and production systems.",
        "Team members are expected to follow confidentiality obligations and handle customer data responsibly.",
        "We periodically review access permissions to keep them aligned with current responsibilities.",
      ],
    },
    monitoringIncidents: {
      title: "Monitoring and incident response",
      icon: Eye,
      points: [
        "We collect logs and metrics to monitor system health and detect unusual activity.",
        "When we detect or are informed of a potential security incident, we investigate promptly and take steps to contain and mitigate any impact.",
        "If an incident affecting personal data occurs, we will notify affected customers without undue delay, consistent with our legal obligations and our Data Processing Agreement.",
      ],
    },
    developmentPractices: {
      title: "Development practices",
      icon: Code,
      points: [
        "We follow a change‑management process for deploying updates to Ori‑OS, including testing and staged rollout where appropriate.",
        "We prefer simple, well‑understood designs over unnecessary complexity that can introduce security risk.",
        "We maintain a public changelog and roadmap so customers can see how Ori‑OS evolves over time.",
      ],
    },
    compliance: {
      title: "Compliance and data protection",
      icon: FileCheck,
      points: [
        "Ori‑OS is built with EU‑centric privacy expectations in mind. We aim to support our customers in meeting their GDPR obligations when they use Ori‑OS as part of their revenue operations.",
        "We provide features such as suppression lists, lawful‑basis fields, audit logs, and export/delete actions to help customers implement their own compliance processes.",
        "Our Privacy Policy and GDPR page describe our role as controller and processor and explain how we handle personal data.",
      ],
    },
    responsibleDisclosure: {
      title: "Responsible disclosure",
      icon: AlertTriangle,
      paragraphs: [
        "If you believe you have found a security vulnerability in Ori‑OS, we encourage responsible disclosure.",
        "Please email us at security@ori‑craftlabs.com with a description of the issue, how it can be reproduced, and any relevant technical details.",
        "We ask that you do not publicly disclose the vulnerability until we have had a reasonable opportunity to investigate and address it.",
        "We appreciate researchers who help us improve the security of Ori‑OS and will acknowledge valid reports where appropriate.",
      ],
    },
    contact: {
      title: "Questions about security",
      icon: Mail,
      paragraph: "If you have questions about Ori‑OS security, infrastructure, or data protection practices, please contact us at security@ori‑craftlabs.com. For privacy‑specific questions, you can also reach us at privacy@ori‑craftlabs.com.",
    },
  },
}

function SecuritySection({
  title,
  icon: Icon,
  points,
  index
}: {
  title: string
  icon: React.ElementType
  points: string[]
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-gunmetal border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-vivid-tangerine/20 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-vivid-tangerine" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">{title}</h3>
              <ul className="space-y-3">
                {points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-vivid-tangerine shrink-0 mt-0.5" />
                    <span className="text-white/70 text-sm leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function SecurityParagraphSection({
  title,
  icon: Icon,
  paragraphs,
  index,
}: {
  title: string
  icon: React.ElementType
  paragraphs: string[]
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-gunmetal border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-vivid-tangerine/20 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-vivid-tangerine" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">{title}</h3>
              <div className="space-y-4">
                {paragraphs.map((paragraph, i) => (
                  <p key={i} className="text-white/70 text-sm leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function SecurityPage() {
  return (
    <LegalPageLayout title="Security" lastUpdated="2024-05-22">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="h-16 w-16 bg-vivid-tangerine/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-vivid-tangerine" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {content.hero.title}
            </h1>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              {content.hero.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <p className="text-white/70 leading-relaxed">
              {content.intro.paragraph1}
            </p>
            <p className="text-white/70 leading-relaxed">
              {content.intro.paragraph2}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Security Sections */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <SecuritySection
              title={content.sections.infrastructure.title}
              icon={content.sections.infrastructure.icon}
              points={content.sections.infrastructure.points}
              index={0}
            />
            <SecuritySection
              title={content.sections.application.title}
              icon={content.sections.application.icon}
              points={content.sections.application.points}
              index={1}
            />
            <SecuritySection
              title={content.sections.dataProtection.title}
              icon={content.sections.dataProtection.icon}
              points={content.sections.dataProtection.points}
              index={2}
            />
            <SecuritySection
              title={content.sections.accessControl.title}
              icon={content.sections.accessControl.icon}
              points={content.sections.accessControl.points}
              index={3}
            />
            <SecuritySection
              title={content.sections.monitoringIncidents.title}
              icon={content.sections.monitoringIncidents.icon}
              points={content.sections.monitoringIncidents.points}
              index={4}
            />
            <SecuritySection
              title={content.sections.developmentPractices.title}
              icon={content.sections.developmentPractices.icon}
              points={content.sections.developmentPractices.points}
              index={5}
            />
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
        <div className="max-w-5xl mx-auto">
          <SecuritySection
            title={content.sections.compliance.title}
            icon={content.sections.compliance.icon}
            points={content.sections.compliance.points}
            index={0}
          />
        </div>
      </section>

      {/* Responsible Disclosure */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <SecurityParagraphSection
            title={content.sections.responsibleDisclosure.title}
            icon={content.sections.responsibleDisclosure.icon}
            paragraphs={content.sections.responsibleDisclosure.paragraphs}
            index={0}
          />
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gunmetal/30">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="h-12 w-12 bg-vivid-tangerine/20 flex items-center justify-center mx-auto mb-6">
              <Mail className="h-6 w-6 text-vivid-tangerine" />
            </div>
            <h2 className="text-2xl font-bold mb-4">{content.sections.contact.title}</h2>
            <p className="text-white/60 mb-6 max-w-xl mx-auto">
              {content.sections.contact.paragraph}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:security@ori-craftlabs.com"
                className="flex items-center gap-2 px-6 py-3 bg-vivid-tangerine hover:bg-tangerine-dark text-white transition"
              >
                <Mail className="h-4 w-4" />
                security@ori‑craftlabs.com
              </a>
              <a
                href="mailto:privacy@ori-craftlabs.com"
                className="flex items-center gap-2 px-6 py-3 bg-gunmetal border border-white/20 hover:border-vivid-tangerine/50 text-white transition"
              >
                <Lock className="h-4 w-4" />
                privacy@ori‑craftlabs.com
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-4">Ready to learn more?</h2>
            <p className="text-white/60 mb-6">
              Review our GDPR compliance page or start a free trial to see Ori-OS in action.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-vivid-tangerine hover:bg-tangerine-dark text-white"
                onClick={() => window.location.href = '/?page=gdpr'}
              >
                View GDPR Page
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Start Free Trial
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </LegalPageLayout>
  )
}
