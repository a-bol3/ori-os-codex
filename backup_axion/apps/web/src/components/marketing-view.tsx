'use client'

import { useAppStore } from '@/lib/store'
import {
  MarketingHeader,
  HeroSection,
  FeaturesSection,
  BentoSection,
  WorkflowSection,
  StatsSection,
  LogoCarousel,
  TestimonialsSection,
  PricingSection,
  CTASection,
  MarketingFooter,
  MarketingIntelligencePage,
  MarketingCRMPage,
  MarketingAutomationPage,
  MarketingEngagementPage,
  MarketingAnalyticsPage,
  MarketingContentPage,
  MarketingSeoStudioPage,
  PrivacyPolicyPage,
  GDPRPage,
  SecurityPage,
  CookiePolicyPage,
  TermsOfServicePage,
  FeaturesPage,
  PricingPage,
  IntegrationsPage,
  ChangelogPage,
  RoadmapPage,
  AboutPage,
  BlogPage,
  CareersPage,
  PressPage,
  ContactPage,
  DocsPage,
  APIPage,
  HelpPage,
  CommunityPage,
  StatusPage,
  DemoPage,
} from '@/components/marketing'

export function MarketingView() {
  const { marketingPage } = useAppStore()

  // Render individual product pages
  switch (marketingPage) {
    case 'intelligence':
      return <MarketingIntelligencePage />
    case 'crm':
      return <MarketingCRMPage />
    case 'automation':
      return <MarketingAutomationPage />
    case 'engagement':
      return <MarketingEngagementPage />
    case 'analytics':
      return <MarketingAnalyticsPage />
    case 'content':
      return <MarketingContentPage />
    case 'seo-studio':
      return <MarketingSeoStudioPage />
    // Pricing
    case 'pricing':
      return <PricingPage />
    // Product pages
    case 'features':
      return <FeaturesPage />
    case 'integrations':
      return <IntegrationsPage />
    case 'changelog':
      return <ChangelogPage />
    case 'roadmap':
      return <RoadmapPage />
    // Company pages
    case 'about':
      return <AboutPage />
    case 'blog':
      return <BlogPage />
    case 'careers':
      return <CareersPage />
    case 'press':
      return <PressPage />
    case 'contact':
      return <ContactPage />
    // Resources pages
    case 'docs':
      return <DocsPage />
    case 'api':
      return <APIPage />
    case 'help':
      return <HelpPage />
    case 'community':
      return <CommunityPage />
    case 'status':
      return <StatusPage />
    case 'demo':
      return <DemoPage />
    // Legal pages
    case 'privacy':
      return <PrivacyPolicyPage />
    case 'gdpr':
      return <GDPRPage />
    case 'security':
      return <SecurityPage />
    case 'cookies':
      return <CookiePolicyPage />
    case 'terms':
      return <TermsOfServicePage />
    // Home
    case 'home':
    default:
      return (
        <div className="min-h-screen bg-coffee-bean text-white">
          <MarketingHeader />
          <main>
            <HeroSection />
            <LogoCarousel />
            <StatsSection />
            <WorkflowSection />
            <FeaturesSection />
            <TestimonialsSection />
            <PricingSection />
            <CTASection />
          </main>
          <MarketingFooter />
        </div>
      )
  }
}
