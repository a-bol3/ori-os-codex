
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, CreditCard, Zap, ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';

export default function BillingPage() {
    const [status, setStatus] = useState<any>(null);
    const [usage, setUsage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/billing/status').then(res => res.json()),
            fetch('/api/billing/usage').then(res => res.json())
        ])
            .then(([statusData, usageData]) => {
                setStatus(statusData);
                setUsage(usageData);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleUpgrade = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/billing/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ returnUrl: window.location.href }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Checkout error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-none h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const isPro = status?.isPro;

    return (
        <div className="max-w-6xl mx-auto py-10 px-6">
            <div className="mb-12 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-foreground mb-4"
                >
                    Billing & Subscriptions
                </motion.h1>
                <p className="text-muted-foreground text-lg">Manage your plan and maximize your outreach efficiency</p>
            </div>

            {isPro && (
                <div className="mb-10 p-6 rounded-none border border-primary/20 bg-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-none bg-primary/20 flex items-center justify-center outline outline-4 outline-primary/10">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Active Subscription: <span className="text-primary">PRO Plan</span></h3>
                            <p className="text-sm text-muted-foreground">Your next billing date is {new Date(status.currentPeriodEnd).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            )}

            {!isPro && usage && !usage.isPro && (
                <div className="mb-10 p-6 rounded-none border border-orange-500/20 bg-orange-500/5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                            <h3 className="text-lg font-semibold">Free Tier Usage</h3>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {usage.emailsUsed} / {usage.emailLimit} emails sent this month
                        </span>
                    </div>
                    <div className="w-full bg-muted rounded-none h-3 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(usage.emailsUsed / usage.emailLimit) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full ${usage.emailsUsed >= usage.emailLimit ? 'bg-red-500' : usage.emailsUsed >= usage.emailLimit * 0.8 ? 'bg-orange-500' : 'bg-green-500'}`}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        {usage.emailsRemaining > 0
                            ? `${usage.emailsRemaining} emails remaining until ${new Date(usage.periodEnd).toLocaleDateString()}`
                            : 'Limit reached. Upgrade to PRO for unlimited sending.'}
                    </p>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Plan */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-8 rounded-none border border-border bg-card relative overflow-hidden"
                >
                    <div className="mb-6">
                        <h3 className="text-xl font-bold mb-2">Starter</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">$0</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {['1 Domain', '3 Mailboxes', '500 Contacts', 'Basic Analytics'].map((feat) => (
                            <li key={feat} className="flex items-center gap-3 text-sm">
                                <Check className="w-4 h-4 text-green-500" />
                                <span>{feat}</span>
                            </li>
                        ))}
                    </ul>

                    {!isPro ? (
                        <button disabled className="w-full py-3 rounded-none bg-muted text-muted-foreground font-medium cursor-not-allowed">
                            Current Plan
                        </button>
                    ) : (
                        <button className="w-full py-3 rounded-none border border-border hover:bg-muted transition-colors font-medium">
                            Manage via Portal
                        </button>
                    )}
                </motion.div>

                {/* Pro Plan */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-8 rounded-none border-2 border-primary bg-primary/5 relative overflow-hidden flex flex-col highlight-shadow"
                >
                    <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-none uppercase tracking-wider">
                        Popular
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-bold mb-2">Professional</h3>
                        <div className="flex items-baseline gap-1 text-primary">
                            <span className="text-4xl font-bold">$49</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                    </div>

                    <ul className="space-y-4 mb-8 flex-grow">
                        {[
                            'Unlimited Domains',
                            'Unlimited Mailboxes',
                            'Unlimited Contacts',
                            'AI-Powered Lead Discovery',
                            'Automated Warm-up Plan',
                            'Advanced Multi-step Workflows',
                            'Priority Support'
                        ].map((feat) => (
                            <li key={feat} className="flex items-center gap-3 text-sm">
                                <Zap className="w-4 h-4 text-primary fill-primary/20" />
                                <span className="font-medium">{feat}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={handleUpgrade}
                        disabled={isPro || submitting}
                        className="w-full py-4 rounded-none bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPro ? 'Manage Active Plan' : submitting ? 'Processing...' : 'Upgrade Now'}
                        {!isPro && !submitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </motion.div>
            </div>

            <div className="mt-16 bg-muted/30 rounded-none p-8 border border-border/50 text-center max-w-4xl mx-auto">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-card rounded-none shadow-sm">
                        <CreditCard className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h4 className="text-lg font-semibold mb-2">Secure Payments</h4>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                    We use Stripe for secure payment processing. We do not store your credit card information on our servers. You can cancel your subscription at any time.
                </p>
            </div>

            <style jsx>{`
                .highlight-shadow {
                    box-shadow: 0 0 30px -10px hsl(var(--primary) / 0.3);
                }
            `}</style>
        </div>
    );
}
