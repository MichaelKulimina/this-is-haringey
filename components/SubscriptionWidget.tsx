"use client";

import { useState } from "react";
import { Category } from "@/lib/types";

interface SubscriptionWidgetProps {
  categories: Category[];
  defaultCategoryId?: string;
}

export default function SubscriptionWidget({
  categories,
  defaultCategoryId,
}: SubscriptionWidgetProps) {
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>(
    defaultCategoryId ? [defaultCategoryId] : []
  );
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function toggleCategory(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email) return setError("Please enter your email address.");
    if (selected.length === 0)
      return setError("Please select at least one category.");
    if (!consent)
      return setError("Please agree to the Privacy Policy to continue.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, categories: selected }),
      });
      if (!res.ok) throw new Error("Something went wrong.");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-primary-light border border-primary/20 rounded-2xl p-8 text-center">
        <div className="text-3xl mb-3">✉️</div>
        <h3 className="font-semibold text-foreground text-lg mb-1">
          Check your inbox
        </h3>
        <p className="text-muted text-sm">
          We&apos;ve sent you a confirmation email. Click the link to activate
          your subscription.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-foreground mb-1">
        Never miss what&apos;s on
      </h2>
      <p className="text-muted text-sm mb-6">
        Get a weekly email with upcoming events in the categories you care about.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="sub-email" className="block text-sm font-medium text-foreground mb-1.5">
            Email address
          </label>
          <input
            id="sub-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Categories */}
        <fieldset>
          <legend className="block text-sm font-medium text-foreground mb-2">
            Which categories?
          </legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selected.includes(cat.id)
                    ? "bg-primary text-white border-primary"
                    : "bg-background text-muted border-border hover:border-primary"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </fieldset>

        {/* GDPR consent */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 accent-primary"
          />
          <span className="text-sm text-muted">
            I agree to the{" "}
            <a href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </a>
            . You can unsubscribe at any time.
          </span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          {submitting ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
