"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@ori-os/ui";
import Link from "next/link";
import { Cookie } from "lucide-react";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already consented
        const consented = localStorage.getItem("cookie-consent");
        if (!consented) {
            // Show banner after a short delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500">
            <Card className="border-tangerine/20 shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Cookie className="h-5 w-5 text-tangerine" />
                        We use cookies
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                        We use cookies to enhance your experience, analyze our traffic, and for security purposes.
                        By clicking "Accept", you consent to our use of cookies.
                        Read our <Link href="/privacy" className="text-primary hover:underline underline-offset-4">Privacy Policy</Link>.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setIsVisible(false)}>
                        Necessary Only
                    </Button>
                    <Button size="sm" onClick={handleAccept}>
                        Accept
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
