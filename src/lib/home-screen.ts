/**
 * True Apple/Google Wallet .pkpass needs server certificates we don't have.
 * Practical alternative: install PWA / add to home screen + download vCard.
 */

export function canInstallPwa(): boolean {
  if (typeof window === "undefined") return false;
  return "BeforeInstallPromptEvent" in window || isIos();
}

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function homeScreenInstructions(): string {
  if (isIos()) {
    return "On iPhone: Safari → Share → Add to Home Screen. Your card stays one tap away. (Full Apple Wallet passes need Apple certificates — coming later.)";
  }
  return "On Android: browser menu → Install app / Add to Home screen. Pair with Save on phone for Contacts. (Google Wallet passes need merchant setup — home screen is the practical path today.)";
}

let deferredPrompt: Event | null = null;

export function captureInstallPrompt(e: Event) {
  e.preventDefault();
  deferredPrompt = e;
}

export async function promptInstall(): Promise<boolean> {
  const ev = deferredPrompt as null | (Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> });
  if (!ev?.prompt) return false;
  await ev.prompt();
  const choice = await ev.userChoice;
  deferredPrompt = null;
  return choice.outcome === "accepted";
}
