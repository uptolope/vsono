// ────────────────────────────────────────────────────────────────────────────────
// SonoPrep – Client-side analytics
// Integrated with Google Analytics and Microsoft UET
// ────────────────────────────────────────────────────────────────────────────────

declare global {
  function gtag(...args: any[]): void;
  var uetq: any[];
}

export function trackCheckoutStarted(product: string, price: number): void {
  if (typeof window === "undefined") return;
  try {
    console.log("[analytics] checkout_started", { product, price });
    
    // Google Analytics
    if (typeof gtag !== "undefined") {
      gtag("event", "begin_checkout", {
        value: price,
        currency: "USD",
        items: [
          {
            item_name: product,
            item_category: "Education",
            price: price,
            quantity: 1,
          },
        ],
      });
    }

    // Microsoft UET
    if (typeof window !== "undefined") {
      window.uetq = window.uetq || [];
      window.uetq.push("event", "", {
        revenue_value: price,
        currency: "USD",
      });
    }
  } catch (error) {
    console.error("[analytics] trackCheckoutStarted error:", error);
  }
}

export function trackSignup(source: string): void {
  if (typeof window === "undefined") return;
  try {
    console.log("[analytics] signup", { source });
    
    // Google Analytics
    if (typeof gtag !== "undefined") {
      gtag("event", "sign_up", {
        method: source,
      });
    }

    // Microsoft UET
    if (typeof window !== "undefined") {
      window.uetq = window.uetq || [];
      window.uetq.push("event", "", {
        revenue_value: 0,
        currency: "USD",
      });
    }
  } catch (error) {
    console.error("[analytics] trackSignup error:", error);
  }
}

export function trackDemoEngagement(
  action: string,
  data?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  try {
    console.log("[analytics] demo_engagement", { action, ...data });
    
    // Google Analytics
    if (typeof gtag !== "undefined") {
      gtag("event", `demo_${action}`, {
        ...data,
      });
    }
  } catch (error) {
    console.error("[analytics] trackDemoEngagement error:", error);
  }
}

export function trackPurchase(
  transactionId: string,
  price: number,
  product: string
): void {
  if (typeof window === "undefined") return;
  try {
    console.log("[analytics] purchase", { transactionId, price, product });
    
    // Google Analytics
    if (typeof gtag !== "undefined") {
      gtag("event", "purchase", {
        transaction_id: transactionId,
        value: price,
        currency: "USD",
        items: [
          {
            item_name: product,
            item_category: "Education",
            price: price,
            quantity: 1,
          },
        ],
      });
    }

    // Microsoft UET
    if (typeof window !== "undefined") {
      window.uetq = window.uetq || [];
      window.uetq.push("event", "", {
        revenue_value: price,
        currency: "USD",
      });
    }
  } catch (error) {
    console.error("[analytics] trackPurchase error:", error);
  }
}

export function trackLogin(): void {
  if (typeof window === "undefined") return;
  try {
    console.log("[analytics] login");
    
    // Google Analytics
    if (typeof gtag !== "undefined") {
      gtag("event", "login", {
        method: "email",
      });
    }
  } catch (error) {
    console.error("[analytics] trackLogin error:", error);
  }
}

export function trackPageView(pageName: string): void {
  if (typeof window === "undefined") return;
  try {
    console.log("[analytics] page_view", { page: pageName });
    
    // Google Analytics auto-tracks page views, but you can add custom ones
    if (typeof gtag !== "undefined") {
      gtag("event", "page_view", {
        page_title: pageName,
        page_path: window.location.pathname,
      });
    }
  } catch (error) {
    console.error("[analytics] trackPageView error:", error);
  }
}