import { downloadFileName, toVCard, type Profile } from "@/lib/profile";
import { recordSave } from "@/lib/card-analytics";

/** Download a .vcf — works with Apple Contacts, Google Contacts, and most phones. */
export function downloadVCard(profile: Profile, cardKey?: string) {
  const blob = new Blob([toVCard(profile)], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = downloadFileName(profile);
  a.click();
  URL.revokeObjectURL(url);
  if (cardKey) recordSave(cardKey);
}

/** Try OS share sheet with the contact file attached (Android/iOS friendly). */
export async function shareVCardToPhone(profile: Profile, cardKey?: string): Promise<"shared" | "downloaded" | "aborted"> {
  const file = new File([toVCard(profile)], downloadFileName(profile), {
    type: "text/vcard",
  });
  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
    share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
  };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({
        files: [file],
        title: profile.fullName || "Contact",
        text: "Save this Calling Card contact",
      });
      if (cardKey) recordSave(cardKey);
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "aborted";
    }
  }
  downloadVCard(profile, cardKey);
  return "downloaded";
}

export const SAVE_PHONE_HELP = {
  apple: "On iPhone: open the .vcf → Add Contact. Or use Share → Contacts.",
  google: "On Android: open the .vcf → Save to contacts / Google account.",
  both: "The contact file (.vcf) is the universal way to save on Apple and Google phones. Nobody else is notified when you save.",
} as const;
