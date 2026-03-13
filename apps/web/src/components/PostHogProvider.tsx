"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "phc_placeholder";
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

if (typeof window !== "undefined" && POSTHOG_KEY !== "phc_placeholder") {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // we capture manually below
    capture_pageleave: true,
    persistence: "localStorage",
  });
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (POSTHOG_KEY === "phc_placeholder") return;
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogAnalyticsProvider({ children }: { children: React.ReactNode }) {
  if (POSTHOG_KEY === "phc_placeholder") {
    // Still wrap children but skip PostHog init (no key configured)
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}

// ── Manual event helpers to import anywhere in the app ────────────────────────
export const analytics = {
  trackProductView: (product: { id: string; name: string; category: string; price: number }) => {
    if (POSTHOG_KEY === "phc_placeholder") return;
    posthog.capture("product_viewed", { product_id: product.id, product_name: product.name, category: product.category, price: product.price });
  },
  trackAddToCart: (product: { id: string; name: string; price: number }) => {
    if (POSTHOG_KEY === "phc_placeholder") return;
    posthog.capture("add_to_cart", { product_id: product.id, product_name: product.name, price: product.price });
  },
  trackCheckoutStarted: (cartValue: number, itemCount: number) => {
    if (POSTHOG_KEY === "phc_placeholder") return;
    posthog.capture("checkout_started", { cart_value: cartValue, item_count: itemCount });
  },
  trackSearch: (query: string, resultCount: number) => {
    if (POSTHOG_KEY === "phc_placeholder") return;
    posthog.capture("search_performed", { query, result_count: resultCount });
  },
  trackConfiguratorStarted: (bikeSlug: string) => {
    if (POSTHOG_KEY === "phc_placeholder") return;
    posthog.capture("configurator_started", { bike_slug: bikeSlug });
  },
};
