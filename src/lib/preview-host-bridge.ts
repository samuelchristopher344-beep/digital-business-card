/**
 * Preview-host bridge for the Grok embedder chrome.
 *
 * When the app runs inside the Grok preview iframe the host can drive
 * navigation and discover routes. Outside that environment these helpers
 * are no-ops so the production build stays clean.
 */

import { isGrokEmbedderOrigin } from "@/lib/preview-embedder-origin";

type RouteLike = {
  fullPath?: string;
  children?: RouteLike[];
};

export function collectRoutePathsFromTree(routeTree: unknown): string[] {
  const paths = new Set<string>();

  function walk(node: RouteLike | null | undefined) {
    if (!node) return;
    if (typeof node.fullPath === "string" && node.fullPath) {
      paths.add(node.fullPath);
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child);
    }
  }

  walk(routeTree as RouteLike);
  return [...paths].sort();
}

type BridgeOptions = {
  navigate: (path: string) => void;
  getRoutePaths: () => string[];
};

/**
 * Installs a lightweight postMessage bridge when embedded in a trusted
 * Grok preview parent. Returns an uninstall function for useEffect cleanup.
 */
export function installPreviewHostBridge(options: BridgeOptions): () => void {
  if (typeof window === "undefined") return () => {};

  const parentOrigin = (() => {
    try {
      return document.referrer ? new URL(document.referrer).origin : "";
    } catch {
      return "";
    }
  })();

  if (!parentOrigin || !isGrokEmbedderOrigin(parentOrigin)) {
    return () => {};
  }

  function onMessage(event: MessageEvent) {
    if (event.origin !== parentOrigin) return;
    const data = event.data;
    if (!data || typeof data !== "object") return;

    if (data.type === "preview-navigate" && typeof data.path === "string") {
      options.navigate(data.path);
      return;
    }

    if (data.type === "preview-request-routes") {
      try {
        window.parent.postMessage(
          { type: "preview-routes", paths: options.getRoutePaths() },
          parentOrigin,
        );
      } catch {
        // cross-origin or detached parent — ignore
      }
    }
  }

  window.addEventListener("message", onMessage);

  // Announce readiness so the host can request routes.
  try {
    window.parent.postMessage({ type: "preview-bridge-ready" }, parentOrigin);
  } catch {
    // ignore
  }

  return () => {
    window.removeEventListener("message", onMessage);
  };
}
