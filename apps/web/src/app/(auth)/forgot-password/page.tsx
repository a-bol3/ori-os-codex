'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Input, Label } from '@ori-os/ui';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <div className="w-16 h-16 mx-auto mb-6 rounded-none bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
                <p className="text-muted-foreground mb-8">
                    We've sent a password reset link to{' '}
                    <span className="font-medium text-foreground">{email}</span>
                </p>
                <Button variant="outline" asChild>
                    <Link href="/login">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to login
                    </Link>
                </Button>
                <p className="mt-6 text-sm text-muted-foreground">
                    Didn't receive the email?{' '}
                    <button
                        onClick={() => setIsSubmitted(false)}
                        className="text-tangerine hover:underline font-medium"
                    >
                        Click to resend
                    </button>
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Mobile logo */}
            <div className="lg:hidden mb-8">
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-none bg-gradient-to-br from-tangerine to-tangerine/80 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">O</span>
                    </div>
                    <span className="font-semibold text-xl text-foreground">Ori-OS</span>
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                    Reset your password
                </h1>
                <p className="text-muted-foreground">
                    Enter your email and we'll send you a link to reset your password
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@company.com"
                        icon={<Mail className="h-4 w-4" />}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <Button
                    type="submit"
                    variant="accent"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center">
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Sending...
                        </span>
                    ) : (
                        <>
                            Send reset link
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                <Link
                    href="/login"
                    className="text-tangerine hover:underline font-medium inline-flex items-center"
                >
                    <ArrowLeft className="mr-1 h-3 w-3" />
                    Back to login
                </Link>
            </p>
        </motion.div>
    );
}
