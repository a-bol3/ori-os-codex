'use server';

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        await signIn("credentials", { email, password, redirectTo: "/dashboard" });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return "Something went wrong.";
            }
        }
        throw error;
    }
}

export async function registerAction(formData: FormData) {
    try {
        // Placeholder for registration logic
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // Simulate DB call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Auto sign in after registration
        await signIn("credentials", { email, password, redirectTo: "/dashboard" });
    } catch (error) {
        if (error instanceof AuthError) {
            return "Registration failed. Please try again.";
        }
        throw error;
    }
}

export async function logoutAction() {
    await signOut({ redirectTo: "/" });
}
