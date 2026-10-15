"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Button } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-mel atau kata laluan tidak sah. Sila cuba semula.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            R
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-tight">
              Sistem Pemantauan
            </h1>
            <p className="text-xs text-gray-500 leading-tight">Pengurusan Risiko</p>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-gray-700 mb-6">Log Masuk</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-mel"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="nama@organisasi.gov.my"
          />
          <Input
            label="Kata Laluan"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />

          {error && (
            <div
              role="alert"
              className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700"
            >
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            Log Masuk
          </Button>
        </form>
      </div>
      <p className="text-center text-xs text-gray-400 mt-4">
        Sistem Pemantauan Pengurusan Risiko &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
}
