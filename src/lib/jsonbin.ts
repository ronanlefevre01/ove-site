// src/lib/jsonbin.ts
const API = import.meta.env.VITE_JSONBIN_API || "https://api.jsonbin.io/v3";
const MASTER = import.meta.env.VITE_JSONBIN_MASTER_KEY || "";
const READ = import.meta.env.VITE_JSONBIN_READ_KEY || "";
const MEMBERS_BIN = import.meta.env.JSONBIN_MEMBERS_BIN || "";

type HeadersInit = Record<string, string>;

function headers({ write = false }: { write?: boolean } = {}): HeadersInit {
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (write && MASTER) h["X-Master-Key"] = MASTER;     // écriture
  if (!write && READ)  h["X-Access-Key"] = READ;       // lecture privée
  return h;
}

export type Member = {
  email: string;
  password: string;           // démo: clair (en prod: hash)
  name?: string;
  company?: string;
  role?: "client" | "admin";
  active: boolean;
  createdAt: string;
};

type MembersDoc = { members: Record<string, Member> };

async function readMembers(): Promise<MembersDoc> {
  if (!MEMBERS_BIN) throw new Error("JSONBIN_MEMBERS_BIN manquant");
  const r = await fetch(`${API}/b/${MEMBERS_BIN}/latest`, { headers: headers() });
  if (!r.ok) throw new Error("readMembers failed");
  const j = await r.json();
  return (j?.record as MembersDoc) || { members: {} };
}

async function writeMembers(doc: MembersDoc) {
  if (!MEMBERS_BIN) throw new Error("JSONBIN_MEMBERS_BIN manquant");
  const r = await fetch(`${API}/b/${MEMBERS_BIN}`, {
    method: "PUT",
    headers: headers({ write: true }),
    body: JSON.stringify(doc),
  });
  if (!r.ok) throw new Error("writeMembers failed");
  return r.json();
}

/* ---- API publique ---- */
export async function upsertMember(m: Omit<Member, "createdAt" | "active"> & { active?: boolean }) {
  const doc = await readMembers();
  const key = m.email.trim().toLowerCase();
  const exists = doc.members[key];
  
  doc.members[key] = {
    email: key,
    password: m.password,
    name: m.name,
    company: m.company,
    role: m.role || "client",
    active: m.active ?? (exists?.active ?? true),
    createdAt: exists?.createdAt || new Date().toISOString(),
  };
  await writeMembers(doc);
}

export async function setMemberActive(email: string, active: boolean) {
  const doc = await readMembers();
  const key = email.trim().toLowerCase();
  if (!doc.members[key]) throw new Error("Membre introuvable");
  doc.members[key].active = active;
  await writeMembers(doc);
}

export async function removeMember(email: string) {
  const doc = await readMembers();
  const key = email.trim().toLowerCase();
  delete doc.members[key];
  await writeMembers(doc);
}

export async function verifyLogin(email: string, password: string): Promise<Member | null> {
  const doc = await readMembers();
  const key = email.trim().toLowerCase();
  const m = doc.members[key];
  if (!m || !m.active) return null;
  if (m.password !== password) return null;   // démo
  return m;
}
