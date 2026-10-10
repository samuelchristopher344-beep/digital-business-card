/** Multiple cards per person — local store. Active card drives share/edit. */

import {
  EMPTY_PROFILE,
  type Profile,
  readStoredProfile,
  writeStoredProfile,
  slugify,
} from "./profile";

export type StoredCard = {
  id: string;
  label: string;
  profile: Profile;
  updatedAt: number;
};

const CARDS_KEY = "cc.cards.v1";
const ACTIVE_KEY = "cc.cards.active.v1";
const MAX_CARDS = 4;

function readRaw(): StoredCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CARDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredCard[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(cards: StoredCard[]) {
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

/** Migrate single profile into multi-card store once. */
export function ensureCardStore(): StoredCard[] {
  let cards = readRaw();
  if (cards.length === 0) {
    const existing = readStoredProfile();
    const profile = existing ?? { ...EMPTY_PROFILE };
    const card: StoredCard = {
      id: crypto.randomUUID(),
      label: profile.role?.trim() || profile.organization?.trim() || "Primary",
      profile,
      updatedAt: Date.now(),
    };
    cards = [card];
    writeRaw(cards);
    localStorage.setItem(ACTIVE_KEY, card.id);
  }
  return cards;
}

export function listCards(): StoredCard[] {
  return ensureCardStore().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getActiveCardId(): string {
  ensureCardStore();
  const id = localStorage.getItem(ACTIVE_KEY);
  const cards = readRaw();
  if (id && cards.some((c) => c.id === id)) return id;
  return cards[0]?.id || "";
}

export function getActiveCard(): StoredCard | null {
  const cards = listCards();
  const id = getActiveCardId();
  return cards.find((c) => c.id === id) || cards[0] || null;
}

export function setActiveCard(id: string) {
  const cards = readRaw();
  const card = cards.find((c) => c.id === id);
  if (!card) return;
  localStorage.setItem(ACTIVE_KEY, id);
  writeStoredProfile(card.profile);
}

export function saveActiveProfile(profile: Profile) {
  const cards = ensureCardStore();
  const id = getActiveCardId();
  const next = cards.map((c) =>
    c.id === id ? { ...c, profile, updatedAt: Date.now(), label: c.label || profile.role || "Card" } : c,
  );
  writeRaw(next);
  writeStoredProfile(profile);
}

export function createCard(label = "New card"): StoredCard | null {
  const cards = ensureCardStore();
  if (cards.length >= MAX_CARDS) return null;
  const card: StoredCard = {
    id: crypto.randomUUID(),
    label,
    profile: { ...EMPTY_PROFILE, username: slugify(label) || `card-${cards.length + 1}` },
    updatedAt: Date.now(),
  };
  writeRaw([card, ...cards]);
  localStorage.setItem(ACTIVE_KEY, card.id);
  writeStoredProfile(card.profile);
  return card;
}

export function renameCard(id: string, label: string) {
  const cards = readRaw().map((c) => (c.id === id ? { ...c, label, updatedAt: Date.now() } : c));
  writeRaw(cards);
}

export function deleteCard(id: string) {
  let cards = readRaw().filter((c) => c.id !== id);
  if (cards.length === 0) {
    const card: StoredCard = {
      id: crypto.randomUUID(),
      label: "Primary",
      profile: { ...EMPTY_PROFILE },
      updatedAt: Date.now(),
    };
    cards = [card];
    localStorage.setItem(ACTIVE_KEY, card.id);
    writeStoredProfile(card.profile);
  } else if (getActiveCardId() === id) {
    localStorage.setItem(ACTIVE_KEY, cards[0].id);
    writeStoredProfile(cards[0].profile);
  }
  writeRaw(cards);
}

export { MAX_CARDS };
