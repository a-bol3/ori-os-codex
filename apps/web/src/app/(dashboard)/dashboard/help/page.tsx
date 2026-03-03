'use client';

import { motion } from 'framer-motion';
import { HelpCircle, Book, MessageCircle, Video, FileText } from 'lucide-react';

export default function HelpPage() {
    return (
        <div className="max-w-6xl mx-auto py-10 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold text-foreground mb-4">
                    Help & Support
                </h1>
                <p className="text-muted-foreground text-lg">
                    Get the help you need to make the most of Ori-OS
                </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
                {[
                    { icon: Book, title: 'Documentation', description: 'Comprehensive guides and API references', href: '/dashboard/help/docs' },
                    { icon: Video, title: 'Video Tutorials', description: 'Step-by-step video walkthroughs', href: '/dashboard/help/tutorials' },
                    { icon: MessageCircle, title: 'Community Forum', description: 'Connect with other users and get answers', href: '/dashboard/help/community' },
                    { icon: FileText, title: 'Knowledge Base', description: 'Search our library of helpful articles', href: '/dashboard/help/kb' },
                ].map((item, i) => (
                    <motion.a
                        key={item.title}
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 rounded-none border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all group text-center"
                    >
                        <div className="inline-flex p-4 rounded-none bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4">
                            <item.icon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                    </motion.a>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-12 p-8 rounded-none border border-primary/20 bg-primary/5 text-center"
            >
                <h3 className="text-2xl font-bold mb-2">Need More Help?</h3>
                <p className="text-muted-foreground mb-6">
                    Our support team is here to assist you
                </p>
                <a
                    href="mailto:support@ori-os.com"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                    <MessageCircle className="w-5 h-5" />
                    Contact Support
                </a>
            </motion.div>
        </div>
    );
}
