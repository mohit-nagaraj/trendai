"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { Toaster, toast } from "sonner";

function Loader() {
  return (
    <span className="inline-block align-middle mr-2">
      <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin block" />
    </span>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace("/");
      } else {
        setCheckingAuth(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDisplayName("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Signed in successfully!", { duration: 2000 });
      setTimeout(() => router.push("/"), 500); // let toast show
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "An error occurred";
      setError(msg);
      toast.error(msg, { duration: 2000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    if (!displayName.trim()) {
      setError("Display name is required");
      toast.error("Display name is required", { duration: 2000 });
      setIsLoading(false);
      return;
    }
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match", { duration: 2000 });
      setIsLoading(false);
      return;
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : "/",
        },
      });
      if (error) throw error;
      toast.success("Sign up successful! Check your email.", { duration: 2000 });
      setShowEmailConfirmation(true);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "An error occurred";
      setError(msg);
      toast.error(msg, { duration: 2000 });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              {isSignUp ? "Sign up for Final Round AI" : "Sign in to Final Round AI"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showEmailConfirmation ? (
              <div className="flex flex-col items-center justify-center py-8">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="12" fill="#22c55e"/>
                  <path d="M8 12.5l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="mt-4 text-green-600 text-lg font-semibold text-center">
                  Check your email to confirm your account.
                </div>
              </div>
            ) : (
              <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="border rounded px-3 py-2 bg-card text-foreground"
                  autoComplete="email"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="border rounded px-3 py-2 bg-card text-foreground"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
                {isSignUp && (
                  <>
                    <input
                      type="password"
                      placeholder="Repeat password"
                      value={repeatPassword}
                      onChange={e => setRepeatPassword(e.target.value)}
                      required
                      className="border rounded px-3 py-2 bg-card text-foreground"
                      autoComplete="new-password"
                    />
                    <input
                      type="text"
                      placeholder="Display name"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      required
                      className="border rounded px-3 py-2 bg-card text-foreground"
                      autoComplete="name"
                    />
                  </>
                )}
                {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground rounded px-4 py-2 font-semibold disabled:opacity-50 flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading && <Loader />}
                  {isLoading
                    ? isSignUp
                      ? "Signing up..."
                      : "Signing in..."
                    : isSignUp
                      ? "Sign up"
                      : "Sign in"}
                </button>
              </form>
            )}
            {!showEmailConfirmation && (
              <div className="mt-4 text-center">
                {isSignUp ? (
                  <>
                    Already have an account?{' '}
                    <button className="underline text-primary" onClick={() => setIsSignUp(false)}>
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{' '}
                    <button className="underline text-primary" onClick={() => setIsSignUp(true)}>
                      Sign up
                    </button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
} 