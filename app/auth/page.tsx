"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { Toaster, toast } from "sonner";

function Loader() {
  return (
    <span className="inline-block align-middle mr-2">
      <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin block" />
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
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : "/",
        },
      });
      if (error) throw error;
      toast.success("Sign up successful! Check your email.", { duration: 2000 });
      setTimeout(() => router.push("/auth/sign-up-success"), 500);
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
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={repeatPassword}
                  onChange={e => setRepeatPassword(e.target.value)}
                  required
                  className="border rounded px-3 py-2 bg-card text-foreground"
                  autoComplete="new-password"
                />
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
          </CardContent>
        </Card>
      </div>
    </>
  );
} 