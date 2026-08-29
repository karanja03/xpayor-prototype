const palette = [
  { bg: "bg-indigo-50", fg: "text-indigo-600" },
  { bg: "bg-slate-100", fg: "text-slate-600" },
  { bg: "bg-cyan-50", fg: "text-cyan-700" },
  { bg: "bg-violet-50", fg: "text-violet-700" },
  { bg: "bg-orange-50", fg: "text-orange-700" },
  { bg: "bg-green-50", fg: "text-green-700" },
];

export function avatarFor(name: string): { initials: string; bg: string; fg: string } {
  const words = name.replace(/[()&]/g, "").split(" ").filter((w) => w.length > 1);
  const initials = ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? name[1] ?? "")).toUpperCase();
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const p = palette[hash % palette.length];
  return { initials: initials || name.slice(0, 2).toUpperCase(), bg: p.bg, fg: p.fg };
}
