import { getPool } from "@/lib/db-pool";
import type { Profile, ThemeId } from "@/lib/profile";
import { slugify } from "@/lib/profile";

export type CardRow = {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  role: string;
  organization: string;
  tagline: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  github: string;
  note: string;
  focus: string[];
  theme: string;
  is_public: boolean;
};

export function rowToProfile(row: CardRow): Profile {
  return {
    fullName: row.full_name ?? "",
    role: row.role ?? "",
    organization: row.organization ?? "",
    tagline: row.tagline ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    website: row.website ?? "",
    location: row.location ?? "",
    github: row.github ?? "",
    note: row.note ?? "",
    focus: Array.isArray(row.focus) ? row.focus : [],
    theme: (row.theme as ThemeId) || "brass",
    username: row.username ?? "",
  };
}

function newId(): string {
  return crypto.randomUUID();
}

export async function getCardByUserId(userId: string): Promise<CardRow | null> {
  const pool = getPool();
  if (!pool) return null;
  const { rows } = await pool.query<CardRow>(
    `SELECT * FROM cards WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function getPublicCardByUsername(username: string): Promise<CardRow | null> {
  const pool = getPool();
  if (!pool) return null;
  const slug = slugify(username);
  if (!slug) return null;
  const { rows } = await pool.query<CardRow>(
    `SELECT * FROM cards WHERE username = $1 AND is_public = true LIMIT 1`,
    [slug],
  );
  return rows[0] ?? null;
}

export type UpsertResult =
  | { ok: true; card: CardRow }
  | { ok: false; error: string; status: number };

export async function upsertCardForUser(
  userId: string,
  profile: Profile,
): Promise<UpsertResult> {
  const pool = getPool();
  if (!pool) {
    return { ok: false, error: "Database not configured", status: 503 };
  }

  const username = slugify(profile.username || profile.fullName);
  if (!username) {
    return { ok: false, error: "Pick a username (letters and numbers)", status: 400 };
  }
  if (username === "demo") {
    return { ok: false, error: "Username 'demo' is reserved", status: 400 };
  }

  // Username taken by someone else?
  const taken = await pool.query<{ user_id: string }>(
    `SELECT user_id FROM cards WHERE username = $1 LIMIT 1`,
    [username],
  );
  if (taken.rows[0] && taken.rows[0].user_id !== userId) {
    return { ok: false, error: "That username is already taken", status: 409 };
  }

  const existing = await getCardByUserId(userId);
  const theme = ["brass", "signal", "tide", "ink"].includes(profile.theme)
    ? profile.theme
    : "brass";
  const focus = (profile.focus ?? []).map((t) => t.trim()).filter(Boolean).slice(0, 6);

  if (existing) {
    const { rows } = await pool.query<CardRow>(
      `UPDATE cards SET
        username = $1,
        full_name = $2,
        role = $3,
        organization = $4,
        tagline = $5,
        email = $6,
        phone = $7,
        website = $8,
        location = $9,
        github = $10,
        note = $11,
        focus = $12,
        theme = $13,
        is_public = true,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14 AND user_id = $15
      RETURNING *`,
      [
        username,
        profile.fullName ?? "",
        profile.role ?? "",
        profile.organization ?? "",
        profile.tagline ?? "",
        profile.email ?? "",
        profile.phone ?? "",
        profile.website ?? "",
        profile.location ?? "",
        profile.github ?? "",
        profile.note ?? "",
        focus,
        theme,
        existing.id,
        userId,
      ],
    );
    return { ok: true, card: rows[0] };
  }

  const id = newId();
  const { rows } = await pool.query<CardRow>(
    `INSERT INTO cards (
      id, user_id, username, full_name, role, organization, tagline,
      email, phone, website, location, github, note, focus, theme, is_public
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,true)
    RETURNING *`,
    [
      id,
      userId,
      username,
      profile.fullName ?? "",
      profile.role ?? "",
      profile.organization ?? "",
      profile.tagline ?? "",
      profile.email ?? "",
      profile.phone ?? "",
      profile.website ?? "",
      profile.location ?? "",
      profile.github ?? "",
      profile.note ?? "",
      focus,
      theme,
    ],
  );
  return { ok: true, card: rows[0] };
}
