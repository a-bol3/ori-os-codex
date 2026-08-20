import { HeroSection } from '@/components/marketing/hero-section';
import { FeaturesSection } from '@/components/marketing/features-section';
import { BentoSection } from '@/components/marketing/bento-section';
import { CTASection } from '@/components/marketing/cta-section';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { SectionProgressIndicator } from '@/components/marketing/section-progress-indicator';

const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'features', label: 'Capabilities' },
    { id: 'bento', label: 'Ecosystem' },
    { id: 'cta', label: 'Private beta' },
];

export default function HomePage() {
    return (
        <div className="min-h-screen bg-background">
            <MarketingHeader />
            <SectionProgressIndicator sections={sections} />
            <main>
                <section id="hero">
                    <HeroSection />
                </section>
                <section id="features">
                    <FeaturesSection />
                </section>
                <section id="bento">
                    <BentoSection />
                </section>
                <section id="cta">
                    <CTASection />
                </section>
            </main>
            <MarketingFooter />
        </div>
    );
}
