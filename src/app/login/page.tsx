"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { setTokenCookie } from "@/lib/auth-utils";
import { fetcher } from "@/components/lib/fetcher";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (error) setError("");
    };

    const handleCheckboxChange = () => {
        setFormData((prev) => ({ ...prev, rememberMe: !prev.rememberMe }));
    }; const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!formData.email.trim() || !formData.password) {
            setError("Please enter both email and password");
            setIsLoading(false);
            return;
        }        try {
            console.log("Attempting login with:", { email: formData.email, rememberMe: formData.rememberMe });

            const data = await fetcher<any>("/api/auth/login", undefined, {
                method: "POST",
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    rememberMe: formData.rememberMe,
                }),
            });            console.log("Login response:", data);

            // Handle different response formats
            let token, user;
            
            if (data.success && data.data?.token && data.data?.user) {
                // Format: { success: true, data: { token: "...", user: {...} } }
                token = data.data.token;
                user = data.data.user;
            } else if (data.token && data.user) {
                // Format: { token: "...", user: {...} }
                token = data.token;
                user = data.user;
            } else if (data.success && data.token && data.user) {
                // Format: { success: true, token: "...", user: {...} }
                token = data.token;
                user = data.user;
            }

            if (token && user) {
                console.log('Login successful with token:', token.substring(0, 20) + '...');
                toast.success("Login successful! Welcome back.");

                const maxAge = formData.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
                setTokenCookie(token, maxAge);

                const userRole = user.role;
                let redirectPath = '/dashboard';
                if (userRole === 'ADMIN') {
                    redirectPath = '/dashboard/admin';
                } else if (userRole === 'DOSEN') {
                    redirectPath = '/dashboard/dosen';
                } else if (userRole === 'MAHASISWA') {
                    redirectPath = '/dashboard/mahasiswa';
                }

                router.push(redirectPath);
            } else {
                const errorMessage = data.error ?? data.message ?? "Invalid credentials";
                setError(errorMessage);
                toast.error(errorMessage);
            }
        } catch (error: any) {
            console.error("Login error:", error);
            
            let errorMessage: string;
            if (error?.status) {
                // Handle specific HTTP status codes
                switch (error.status) {
                    case 401:
                        errorMessage = "Invalid email or password";
                        break;
                    case 403:
                        errorMessage = "Account access denied";
                        break;
                    case 404:
                        errorMessage = "Login service not found";
                        break;
                    case 500:
                        errorMessage = "Server error. Please try again later";
                        break;
                    default:
                        errorMessage = error.message || `Server error (${error.status})`;
                }
            } else {
                errorMessage = error?.message || "Connection error. Please try again later.";
            }

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gray-50">
            <div className="w-full max-w-md">
                <div className="mb-8 flex flex-col items-center text-center">
                    <h1 className="text-3xl font-bold">HiringGo</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Login to your account to continue
                    </p>
                </div>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl">Login</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit} aria-label="Login form">
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm mb-4">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    className="focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                    aria-describedby="email-error"
                                    aria-invalid={error ? "true" : "false"}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium">
                                        Password
                                    </label>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    className="focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                    aria-describedby="password-error"
                                    aria-invalid={error ? "true" : "false"}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="rememberMe"
                                    checked={formData.rememberMe}
                                    onCheckedChange={handleCheckboxChange}
                                    disabled={isLoading}
                                />
                                <label
                                    htmlFor="rememberMe"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Remember me
                                </label>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Logging in...
                                    </>
                                ) : (
                                    "Login"
                                )}
                            </Button>
                            <div className="mt-4 text-center text-sm">
                                Don't have an account?{" "}
                                <Link href="/register" className="text-primary hover:underline">
                                    Register
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}