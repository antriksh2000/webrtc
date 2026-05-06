import { useMemo, useState } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const initialFormState = {
  email: "",
  password: "",
};

export default function App() {
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const helperText = useMemo(
    () =>
      result
        ? `Welcome back, ${result.user.name}. Your session token has been generated.`
        : "Use your Mongo-backed account credentials to sign in.",
    [result],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Unable to sign in.");
      }

      setResult(payload);
      setFormData(initialFormState);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-grid bg-[size:36px_36px] opacity-20" />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-10 lg:grid-cols-[1.1fr_520px] lg:px-8">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary-foreground/90">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Secure access for your MERN dashboard
          </div>
          <div className="max-w-2xl space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Shadcn-inspired login screen for a modern MERN app.
            </h1>
            <p className="text-lg text-slate-300">
              This starter pairs a React frontend with an Express and MongoDB auth API so you can
              move from UI to authentication without rebuilding the basics.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-sm font-medium text-slate-200">Design system</p>
              <p className="mt-2 text-sm text-slate-400">
                Tailwind styling and shadcn-style components keep the UI reusable and consistent.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <p className="text-sm font-medium text-slate-200">Backend ready</p>
              <p className="mt-2 text-sm text-slate-400">
                Login requests post directly to an Express endpoint backed by MongoDB and JWT.
              </p>
            </div>
          </div>
        </section>

        <Card className="border-white/10 bg-slate-950/80 shadow-glow">
          <CardHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>{helperText}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="demo@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <span className="text-xs text-slate-400">Minimum 8 characters</span>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                />
              </div>

              {error ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              {result ? (
                <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-slate-100">
                  Signed in as <span className="font-semibold">{result.user.email}</span>
                </div>
              ) : null}

              <Button className="w-full gap-2" size="lg" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Continue to dashboard"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

