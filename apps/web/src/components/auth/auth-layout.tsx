import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-coffee-bean relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                            backgroundSize: '40px 40px',
                        }}
                    />
                </div>

                {/* Decorative blobs */}
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-tangerine/30 rounded-none blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-tangerine/20 rounded-none blur-3xl" />

                <div className="relative flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-none bg-gradient-to-br from-tangerine to-tangerine/80 flex items-center justify-center">
                            <span className="text-white font-bold text-xl">O</span>
                        </div>
                        <span className="font-semibold text-2xl text-white">Ori-OS</span>
                    </Link>

                    {/* Main content */}
                    <div className="max-w-md">
                        <h1 className="text-4xl font-bold text-white mb-6">
                            One input,{' '}
                            <span className="text-tangerine">complete intelligence</span>
                        </h1>
                        <p className="text-lg text-white/70 mb-8">
                            Unify your go-to-market operations in one powerful platform. Find,
                            enrich, engage, and analyze—all from a single source of truth.
                        </p>
                        <div className="flex items-center gap-4 text-white/60 text-sm">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-tangerine" />
                                <span>AI-Powered</span>
                            </div>
                            <div className="w-1 h-1 rounded-none bg-white/40" />
                            <span>14-day free trial</span>
                            <div className="w-1 h-1 rounded-none bg-white/40" />
                            <span>No credit card</span>
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-none p-6 max-w-md">
                        <p className="text-white/90 mb-4">
                            "Ori-OS replaced 5 different tools. The unified platform has saved
                            us countless hours."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-none bg-tangerine/20 flex items-center justify-center text-tangerine font-medium">
                                SC
                            </div>
                            <div>
                                <div className="text-white font-medium">Sarah Chen</div>
                                <div className="text-white/60 text-sm">VP of Sales, TechCorp</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
                <div className="w-full max-w-md">{children}</div>
            </div>
        </div>
    );
}
