import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { blankCard, createId, sampleCard, uniqueSlug, type Card } from "@/lib/card-model";

export type StatKey = "view" | "qr" | "copy" | "website" | "whatsapp" | "vcard";

export type ScanItem = { id: string; text: string; at: number };

type Stats = Record<StatKey, number>;

type CardStore = {
  cards: Card[];
  seeded: boolean;
  stats: Record<string, Stats>;
  scans: ScanItem[];
  addCard: () => string;
  updateCard: (id: string, patch: Partial<Card>) => void;
  removeCard: (id: string) => void;
  track: (id: string, key: StatKey) => void;
  addScan: (text: string) => void;
  removeScan: (id: string) => void;
  clearScans: () => void;
  reset: () => void;
};

const emptyStats = (): Stats => ({ view: 0, qr: 0, copy: 0, website: 0, whatsapp: 0, vcard: 0 });

export const useCardStore = create<CardStore>()(
  persist(
    (set, get) => ({
      cards: [],
      seeded: false,
      stats: {},
      scans: [],
      addCard: () => {
        const id = createId();
        const slug = uniqueSlug(get().cards, "new-card", id);
        const card = blankCard(id, slug);
        set({ cards: [card, ...get().cards] });
        return id;
      },
      updateCard: (id, patch) => {
        set({
          cards: get().cards.map((card) => (card.id === id ? { ...card, ...patch, content: patch.content ?? card.content } : card)),
        });
      },
      removeCard: (id) => set({ cards: get().cards.filter((card) => card.id !== id) }),
      track: (id, key) => {
        const current = get().stats[id] ?? emptyStats();
        set({ stats: { ...get().stats, [id]: { ...current, [key]: current[key] + 1 } } });
      },
      addScan: (text) => {
        const next = { id: createId(), text: text.slice(0, 500), at: Date.now() };
        set({ scans: [next, ...get().scans].slice(0, 30) });
      },
      removeScan: (id) => set({ scans: get().scans.filter((item) => item.id !== id) }),
      clearScans: () => set({ scans: [] }),
      reset: () => set({ cards: [], stats: {}, scans: [], seeded: true }),
    }),
    { name: "dbc-store" },
  ),
);

export function useHydrated(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (useCardStore.persist.hasHydrated()) setReady(true);
    return useCardStore.persist.onFinishHydration(() => setReady(true));
  }, []);
  return ready;
}

export function useSeededCards(): boolean {
  const ready = useHydrated();
  useEffect(() => {
    if (!ready) return;
    const state = useCardStore.getState();
    if (state.seeded) return;
    if (state.cards.length === 0) {
      useCardStore.setState({ cards: [sampleCard()], seeded: true });
    } else {
      useCardStore.setState({ seeded: true });
    }
  }, [ready]);
  return ready;
}
