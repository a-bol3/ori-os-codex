import {
    HeroSection,
    LogoCarousel,
    StatsSection,
    WorkflowSection,
    FeaturesSection,
    TestimonialsSection,
    PricingSection,
    CTASection
} from '@/components/marketing'

export default function LandingPage() {
    return (
        <div className="bg-coffee-bean text-white">
            <HeroSection />
            <LogoCarousel />
            <StatsSection />
            <WorkflowSection />
            <FeaturesSection />
            <TestimonialsSection />
            <PricingSection />
            <CTASection />
        </div>
    )
}
