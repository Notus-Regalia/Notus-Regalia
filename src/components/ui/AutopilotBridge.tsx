"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { startBridge } from "@/utils/autopilot-bridge";
import { isRootTab } from "@/utils/routes";

/** Paths the home page's ClientWrapper renders itself, switching tabs without loading a new page. */
const inWrapper = (path: string) => {
  const first = path.replace(/^\/+/, "").split("/")[0] ?? "";
  return first === "" || isRootTab(first);
};

/**
 * Lets a portfolio in PORTFOLIO_ORIGINS demo the site live inside its frame (utils/autopilot-bridge.ts). It does
 * nothing unless the page is framed by one of those origins.
 */
export default function AutopilotBridge({ origins }: { origins: string[] }) {
  const router = useRouter();
  const key = origins.join(" ");
  useEffect(
    () =>
      startBridge({
        origins: key ? key.split(" ") : [],
        busy: () => Boolean(document.querySelector(".nr-loading-screen")),
        navigate: (path) => {
          // ClientWrapper follows popstate, so a tab change there needs no new page (and no loading screen).
          if (inWrapper(window.location.pathname) && inWrapper(path)) {
            window.history.pushState({}, "", path);
            window.dispatchEvent(new PopStateEvent("popstate"));
          } else {
            router.push(path);
          }
        },
        // GSAP ScrollSmoother draws the page behind the real scroll position.
        visualY: () => {
          const content = document.getElementById("smooth-content");
          return content ? -content.getBoundingClientRect().top : window.scrollY;
        },
      }),
    [key, router],
  );
  return null;
}
