import { getSupabase } from "./client";

export type UserRole = "owner" | "cashier";

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export interface SignUpData {
  username: string;
  password: string;
  role: UserRole;
  businessName: string;
  ownerName: string;
  businessType: string;
}

// ── Local auth helpers (used when Supabase not configured) ───────────────────
const LOCAL_USERS_KEY = "sz_local_users";

interface LocalUser {
  username: string;
  passwordHash: string;
  salt: string; // FIX: Added per-user salt
  role: UserRole;
  businessName: string;
  ownerName: string;
  businessType: string;
  gstPercent: number;
  upiId?: string;
}

// FIX: Replaced insecure djb2 hash with SHA-256 + per-user salt via Web Crypto API
async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getLocalUsers(): LocalUser[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalUser[]): void {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

export async function signUp(data: SignUpData): Promise<AuthResult> {
  const sb = getSupabase();

  if (!sb) {
    const users = getLocalUsers();
    const exists = users.some((u) => u.username === data.username.toLowerCase().trim());
    if (exists) return { ok: false, error: "Username already taken" };
    // FIX: Generate salt and hash password properly
    const salt = generateSalt();
    const passwordHash = await hashPassword(data.password, salt);
    users.push({
      username: data.username.toLowerCase().trim(),
      passwordHash,
      salt,
      role: data.role,
      businessName: data.businessName.trim(),
      ownerName: data.ownerName.trim(),
      businessType: data.businessType,
      gstPercent: 5,
    });
    saveLocalUsers(users);
    return { ok: true };
  }

  const email = `${data.username.toLowerCase().trim()}@servezy.app`;
  const { data: authData, error } = await sb.auth.signUp({ email, password: data.password });
  if (error) return { ok: false, error: error.message };

  if (authData.user) {
    const { error: profileError } = await sb.from("profiles").insert({
      id: authData.user.id,
      username: data.username.toLowerCase().trim(),
      role: data.role,
      business_name: data.businessName.trim(),
      owner_name: data.ownerName.trim(),
      business_type: data.businessType,
      gst_percent: 5,
      currency_symbol: "₹",
    });
    if (profileError) return { ok: false, error: profileError.message };
  }

  return { ok: true };
}

export async function signIn(username: string, password: string): Promise<AuthResult & {
  userId?: string;
  role?: UserRole;
  businessName?: string;
  businessType?: string;
  gstPercent?: number;
  upiId?: string;
  ownerName?: string;
}> {
  const sb = getSupabase();

  if (!sb) {
    const users = getLocalUsers();
    const user = users.find((u) => u.username === username.toLowerCase().trim());
    if (!user) return { ok: false, error: "Username not found" };
    // FIX: Use async SHA-256 hash with stored salt; handle legacy accounts without salt
    let match = false;
    if (user.salt) {
      const hash = await hashPassword(password, user.salt);
      match = hash === user.passwordHash;
    } else {
      // Legacy fallback: old djb2 hash migration path — force password reset isn't viable,
      // so re-hash on successful legacy check and upgrade the record
      let legacyHash = 0;
      for (let i = 0; i < password.length; i++) {
        const c = password.charCodeAt(i);
        legacyHash = (legacyHash << 5) - legacyHash + c;
        legacyHash |= 0;
      }
      if (String(legacyHash) === user.passwordHash) {
        match = true;
        // Upgrade to secure hash in-place
        const salt = generateSalt();
        const newHash = await hashPassword(password, salt);
        user.salt = salt;
        user.passwordHash = newHash;
        saveLocalUsers(users);
      }
    }
    if (!match) return { ok: false, error: "Incorrect password" };
    return {
      ok: true,
      userId: `local_${user.username}`,
      role: user.role,
      businessName: user.businessName,
      businessType: user.businessType,
      gstPercent: user.gstPercent ?? 5,
      upiId: user.upiId,
      ownerName: user.ownerName,
    };
  }

  const email = `${username.toLowerCase().trim()}@servezy.app`;
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false, error: "No session" };

  const { data: profile, error: pErr } = await sb
    .from("profiles")
    .select("role, business_name, business_type, gst_percent, upi_id, owner_name")
    .eq("id", user.id)
    .single();

  if (pErr || !profile) return { ok: false, error: "Profile not found" };

  return {
    ok: true,
    userId: user.id,
    role: profile.role as UserRole,
    businessName: profile.business_name,
    businessType: profile.business_type,
    gstPercent: profile.gst_percent ?? 5,
    upiId: profile.upi_id,
    ownerName: profile.owner_name,
  };
}

export async function signOut(): Promise<void> {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
}

export async function getCurrentUserId(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) {
    const raw = typeof window !== "undefined" ? localStorage.getItem("vynn_session") : null;
    if (!raw) return null;
    try {
      const s = JSON.parse(raw);
      return s.userId ?? null;
    } catch {
      return null;
    }
  }
  const { data } = await sb.auth.getUser();
  return data.user?.id ?? null;
}
