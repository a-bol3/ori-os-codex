// ============================================
// Blog / Press Front Matter
// ============================================

export interface BaseContentMeta {
  title: string;
  slug: string;
  date: string; // ISO string
  summary?: string;
  tags?: string[];
  readingTimeMinutes?: number;
}

export type BlogPostMeta = BaseContentMeta

export type PressArticleMeta = BaseContentMeta

// ============================================
// Help Center Types
// ============================================

export interface HelpHeroContent {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
}

export interface HelpCategoryItem {
  id: string;
  title: string;
  description: string;
}

export interface HelpCategoriesContent {
  title: string;
  items: HelpCategoryItem[];
}

export interface HelpFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface HelpFaqsContent {
  title: string;
  items: HelpFaqItem[];
}

export interface HelpContactContent {
  title: string;
  subtitle: string;
  inApp: string;
  email: string;
}

export interface HelpCenterContent {
  hero: HelpHeroContent;
  categories: HelpCategoriesContent;
  faqs: HelpFaqsContent;
  contact: HelpContactContent;
}

// ============================================
// Community Types
// ============================================

export interface CommunityHeroContent {
  title: string;
  subtitle: string;
}

export interface CommunityChannel {
  title: string;
  description: string;
  frequency?: string;
  guidelines?: string[];
  cta?: string;
}

export interface CommunityWhyJoinContent {
  title: string;
  points: string[];
}

export interface CommunityContributeContent {
  title: string;
  points: string[];
}

export interface CommunityCtaContent {
  title: string;
  subtitle: string;
  button: string;
}

export interface CommunityContent {
  hero: CommunityHeroContent;
  whyJoin: CommunityWhyJoinContent;
  channels: {
    officeHours: CommunityChannel;
    slack: CommunityChannel;
    webinars: CommunityChannel;
  };
  contribute: CommunityContributeContent;
  cta: CommunityCtaContent;
}

// ============================================
// Status Types
// ============================================

export type StatusLevel = 'operational' | 'partial' | 'major';

export interface StatusHeroContent {
  title: string;
  subtitle: string;
  badgeOperational: string;
  badgePartial: string;
  badgeMajor: string;
}

export interface StatusComponentItem {
  id: string;
  name: string;
  description: string;
  status: StatusLevel;
  uptime: string;
}

export interface StatusComponentsContent {
  title: string;
  subtitle: string;
  items: StatusComponentItem[];
}

export interface StatusHistoryFilters {
  last24h: string;
  last7d: string;
  last30d: string;
}

export interface StatusIncidentLabelSet {
  investigating: string;
  identified: string;
  monitoring: string;
  resolved: string;
  scheduledMaintenance: string;
}

export interface StatusIncidentTimelineEntry {
  time: string;
  status: string;
  message: string;
}

export interface StatusIncidentSample {
  id: number;
  title: string;
  date: string;
  status: string;
  impact: string;
  timeline: StatusIncidentTimelineEntry[];
  nextSteps?: string;
}

export interface StatusHistoryContent {
  title: string;
  subtitle: string;
  empty: string;
  filters: StatusHistoryFilters;
  labels: StatusIncidentLabelSet;
}

export interface StatusUptimeLegend {
  operational: string;
  degraded: string;
  partial: string;
  outage: string;
}

export interface StatusUptimeContent {
  title: string;
  subtitle: string;
  legend: StatusUptimeLegend;
}

export interface StatusFooterContent {
  title: string;
  subtitle: string;
  subscribeCta: string;
  rssLabel: string;
  emailLabel: string;
  note: string;
}

export interface StatusPageContent {
  hero: StatusHeroContent;
  overview: {
    title: string;
    subtitle: string;
  };
  badges: {
    operational: string;
    partial: string;
    major: string;
  };
  components: StatusComponentsContent;
  history: StatusHistoryContent;
  uptime: StatusUptimeContent;
  footer: StatusFooterContent;
  incidents: StatusIncidentSample[];
}

// ============================================
// Docs Types
// ============================================

export interface DocsHeroContent {
  title: string;
  subtitle: string;
}

export interface DocsSectionItem {
  id: string;
  title: string;
  description: string;
}

export interface DocsSection {
  id: string;
  title: string;
  description: string;
  color: string;
  badge: string;
  items: string[];
}

export interface DocsContent {
  hero: DocsHeroContent;
  sections: DocsSection[];
}

// ============================================
// API Types
// ============================================

export interface ApiHeroContent {
  title: string;
  subtitle: string;
}

export interface ApiSectionItem {
  id: string;
  title: string;
  description: string;
}

export interface ApiSection {
  id: string;
  title: string;
  color: string;
  badge: string;
  items: string[];
}

export interface ApiContent {
  hero: ApiHeroContent;
  sections: ApiSection[];
  quickStartCode: string;
}

// ============================================
// Roadmap Types
// ============================================

export interface RoadmapColumnContent {
  title: string;
  subtitle: string;
  iconColor: string;
  iconBg: string;
}

export interface RoadmapItem {
  id: string;
  column: 'now' | 'next' | 'later';
  name: string;
  description: string;
}

export interface RoadmapHeroContent {
  title: string;
  subtitle: string;
}

export interface RoadmapFooterContent {
  note: string;
}

export interface RoadmapContent {
  hero: RoadmapHeroContent;
  columns: {
    now: RoadmapColumnContent;
    next: RoadmapColumnContent;
    later: RoadmapColumnContent;
  };
  items: {
    now: RoadmapItem[];
    next: RoadmapItem[];
    later: RoadmapItem[];
  };
  footer: RoadmapFooterContent;
}

// ============================================
// Changelog Types
// ============================================

export type ChangelogEntryType = 'new' | 'improved' | 'fixed';

export interface ChangelogHeroContent {
  title: string;
  subtitle: string;
}

export interface ChangelogFilterLabels {
  all: string;
  features: string;
  improvements: string;
  fixes: string;
}

export interface ChangelogEntryLabelSet {
  new: string;
  improved: string;
  fixed: string;
}

export interface ChangelogChange {
  type: ChangelogEntryType;
  text: string;
}

export interface ChangelogSampleEntry {
  id: string;
  version: string;
  title: string;
  date: string;
  changes: ChangelogChange[];
}

export interface ChangelogContent {
  hero: ChangelogHeroContent;
  filters: ChangelogFilterLabels;
  entryLabels: ChangelogEntryLabelSet;
  releases: ChangelogSampleEntry[];
  footerNote: string;
}

// ============================================
// Security Types
// ============================================

export interface SecurityHeroContent {
  title: string;
  subtitle: string;
}

export interface SecuritySection {
  title: string;
  paragraphs?: string[];
  points?: string[];
}

export interface SecurityContactContent {
  title: string;
  paragraph: string;
  email: string;
}

export interface SecurityPageContent {
  hero: SecurityHeroContent;
  intro: SecuritySection;
  infrastructure: SecuritySection;
  application: SecuritySection;
  dataProtection: SecuritySection;
  accessControl: SecuritySection;
  monitoringIncidents: SecuritySection;
  developmentPractices: SecuritySection;
  compliance: SecuritySection;
  responsibleDisclosure: SecuritySection;
  contact: SecurityContactContent;
}

// ============================================
// Integrations Types
// ============================================

export interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  status: 'available' | 'coming_soon' | 'beta';
}

export interface IntegrationsContent {
  hero: {
    title: string;
    subtitle: string;
  };
  categories: {
    id: string;
    name: string;
    description: string;
  }[];
  integrations: IntegrationItem[];
}

// ============================================
// About Types
// ============================================

export interface AboutContent {
  hero: {
    title: string;
    subtitle: string;
  };
  problem: {
    title: string;
    description: string;
  };
  approach: {
    title: string;
    description: string;
  };
  whoWeBuildFor: {
    title: string;
    items: string[];
  };
  principles: {
    title: string;
    items: { title: string; description: string }[];
  };
  founder: {
    title: string;
    name: string;
    role: string;
    bio: string;
  };
}

// ============================================
// Contact Types
// ============================================

export interface ContactContent {
  hero: {
    title: string;
    subtitle: string;
  };
  form: {
    title: string;
    fields: { name: string; label: string; type: string; required: boolean }[];
    submitLabel: string;
  };
  otherWays: {
    title: string;
    items: { title: string; description: string; cta: string }[];
  };
}

// ============================================
// Careers Types
// ============================================

export interface CareersContent {
  hero: {
    title: string;
    subtitle: string;
  };
  whyJoin: {
    title: string;
    items: { title: string; description: string }[];
  };
  howWeWork: {
    title: string;
    items: string[];
  };
  hiringPhilosophy: {
    title: string;
    description: string;
  };
  futureRoles: {
    title: string;
    description: string;
    roles: string[];
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
}

// ============================================
// Pricing Types
// ============================================

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  priceNote?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export interface PricingContent {
  hero: {
    title: string;
    subtitle: string;
  };
  plans: PricingPlan[];
  faq: {
    title: string;
    items: { question: string; answer: string }[];
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
}

// ============================================
// Features Types
// ============================================

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

export interface FeaturesContent {
  hero: {
    title: string;
    subtitle: string;
  };
  categories: {
    id: string;
    name: string;
    description: string;
  }[];
  features: FeatureItem[];
}

// ============================================
// Home Page Types
// ============================================

export interface HomeHeroBadge {
  text: string;
  icon: string;
}

export interface HomeHeroCta {
  label: string;
  href: string;
  variant: string;
}

export interface HomeHeroContent {
  title: string;
  subtitle: string;
  badge: HomeHeroBadge;
  primaryCta: HomeHeroCta;
  secondaryCta: HomeHeroCta;
  bullets: string[];
  trustBadges: string[];
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
}

export interface WorkflowFeatureCardCta {
  label: string;
  href: string;
}

export interface WorkflowFeatureCard {
  id: string;
  title: string;
  subtitle: string;
  metricLabel: string;
  metricValue: string;
  cta: WorkflowFeatureCardCta;
}

export interface HomeWorkflowContent {
  title: string;
  subtitle: string;
  steps: WorkflowStep[];
  featureCard: WorkflowFeatureCard;
}

export interface HomeContent {
  pageId: string;
  hero: HomeHeroContent;
  workflow: HomeWorkflowContent;
}

// ============================================
// Demo Page Types
// ============================================

export interface DemoHeroContent {
  title: string;
  headline: string;
  subtitle: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
}

export interface DemoSection {
  id: string;
  title: string;
  description: string;
  points: string[];
}

export interface DemoWhoFor {
  title: string;
  audiences: string[];
}

export interface DemoNextSteps {
  title: string;
  description: string;
  points: string[];
  note: string;
}

export interface DemoContent {
  pageId: string;
  hero: DemoHeroContent;
  demoSections: DemoSection[];
  whoFor: DemoWhoFor;
  nextSteps: DemoNextSteps;
  cta: {
    primary: {
      label: string;
      href: string;
    };
    secondary: {
      label: string;
      href: string;
    };
  };
}

// ============================================
// Lead Intelligence Section Types
// ============================================

export interface LeadIntelligenceContent {
  headline: string;
  subheadline: string;
  keyPoints: string[];
  outcomeCallout: string;
  cta: {
    label: string;
    href: string;
  };
}

// ============================================
// Trust Logos Types
// ============================================

export interface TrustLogo {
  id: string;
  label: string;
}

export interface TrustLogosContent {
  title: string;
  logos: TrustLogo[];
}

// ============================================
// Testimonials Types
// ============================================

export interface TestimonialCard {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
}

export interface TestimonialsContent {
  title: string;
  subtitle: string;
  cards: TestimonialCard[];
}

// ============================================
// Extended Home Content
// ============================================

export interface HomeContentExtended {
  pageId: string;
  hero: HomeHeroContent;
  trustLogos: TrustLogosContent;
  workflow: HomeWorkflowContent;
  testimonials: TestimonialsContent;
}

// ============================================
// SEO Studio Types
// ============================================

export interface SeoStudioHeroCta {
  label: string;
  href: string;
  variant: string;
}

export interface SeoStudioHeroContent {
  title: string;
  titleHighlight?: string;
  subtitle: string;
  badge?: string;
  primaryCta: SeoStudioHeroCta;
  secondaryCta: SeoStudioHeroCta;
}

export interface SeoStudioColumn {
  title: string;
  icon?: string;
  body: string;
  points: string[];
}

export interface SeoStudioStep {
  title: string;
  description: string;
}

export interface SeoStudioSection {
  id: string;
  title: string;
  subtitle?: string;
  layout: 'single' | 'columns' | 'steps';
  icon?: string;
  body?: string;
  bullets?: string[];
  points?: string[];
  columns?: SeoStudioColumn[];
  steps?: SeoStudioStep[];
  cta?: {
    label: string;
    href: string;
  };
}

export interface SeoStudioContent {
  pageId: string;
  hero: SeoStudioHeroContent;
  sections: SeoStudioSection[];
  carousels?: CardCarouselSection[];
}

// ============================================
// Card Carousel Types (Endless Horizontal Scroll)
// ============================================

export interface CardCarouselCard {
  id: string;
  label?: string;
  title: string;
  description: string;
  tag?: string;
  href: string;
  cta?: string;
}

export interface CardCarouselSection {
  id: string;
  title: string;
  subtitle?: string;
  cards: CardCarouselCard[];
}
