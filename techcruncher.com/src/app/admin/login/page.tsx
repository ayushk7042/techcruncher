"use client";

import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAdminAuth } from "@/components/admin/auth-provider";
import { Spinner } from "@/components/admin/ui";
import { Logo } from "@/components/site/logo";
import { errorMessage } from "@/lib/api/client";

function LoginForm() {
  const { admin, ready, login } = useAdminAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  // Only follow same-site admin paths after sign-in.
  const destination = next && next.startsWith("/admin/") ? next : "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("expired") ? "Your session expired. Sign in again." : "");

  useEffect(() => {
    if (ready && admin) router.replace(destination);
  }, [ready, admin, router, destination]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email.trim(), password);
      router.replace(destination);
    } catch (err) {
      setError(errorMessage(err, "Sign-in failed"));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm">
      <Logo href={null} />
      <h1 className="headline mt-8 text-[34px] uppercase">Newsroom sign-in</h1>
      <p className="mt-2 text-[13.5px] text-ink-soft">Editors and administrators only.</p>

      <div className="mt-8 space-y-6">
        <label className="block">
          <span className="eyebrow mb-1 block">Email</span>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full border-b border-line bg-transparent text-[15px] text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-ink"
          />
        </label>
        <label className="block">
          <span className="eyebrow mb-1 block">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full border-b border-line bg-transparent text-[15px] text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-ink"
          />
        </label>
      </div>

      <p role="alert" className="mt-4 min-h-[18px] text-[13px] text-accent">
        {error}
      </p>

      <button type="submit" disabled={busy} className="btn-primary mt-2 h-12 w-full">
        {busy ? <Spinner className="h-3.5 w-3.5" /> : null}
        Sign in
        {!busy && <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
