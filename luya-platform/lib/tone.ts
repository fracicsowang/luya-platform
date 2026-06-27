/** Literal Tailwind class strings per tone. Written out in full so the v4
 *  compiler sees them (dynamic `bg-${x}` would be purged). */
export type Tone =
  | "green" | "blue" | "sky" | "emerald" | "amber" | "violet" | "indigo"
  | "teal" | "slate" | "gray" | "red" | "yellow" | "purple" | "orange";

export const TONE_BADGE: Record<Tone, string> = {
  green: "bg-green-100 text-green-700 ring-green-600/20",
  blue: "bg-blue-100 text-blue-700 ring-blue-600/20",
  sky: "bg-sky-100 text-sky-700 ring-sky-600/20",
  emerald: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
  amber: "bg-amber-100 text-amber-800 ring-amber-600/20",
  violet: "bg-violet-100 text-violet-700 ring-violet-600/20",
  indigo: "bg-indigo-100 text-indigo-700 ring-indigo-600/20",
  teal: "bg-teal-100 text-teal-700 ring-teal-600/20",
  slate: "bg-slate-100 text-slate-700 ring-slate-600/20",
  gray: "bg-gray-100 text-gray-600 ring-gray-500/20",
  red: "bg-red-100 text-red-700 ring-red-600/20",
  yellow: "bg-yellow-100 text-yellow-800 ring-yellow-600/20",
  purple: "bg-purple-100 text-purple-700 ring-purple-600/20",
  orange: "bg-orange-100 text-orange-700 ring-orange-600/20",
};

/** Stronger fill used for actor chips on workflow steps. */
export const TONE_CHIP: Record<Tone, string> = {
  green: "bg-green-600 text-white",
  blue: "bg-blue-600 text-white",
  sky: "bg-sky-600 text-white",
  emerald: "bg-emerald-600 text-white",
  amber: "bg-amber-500 text-white",
  violet: "bg-violet-600 text-white",
  indigo: "bg-indigo-600 text-white",
  teal: "bg-teal-600 text-white",
  slate: "bg-slate-600 text-white",
  gray: "bg-gray-500 text-white",
  red: "bg-red-600 text-white",
  yellow: "bg-yellow-500 text-white",
  purple: "bg-purple-600 text-white",
  orange: "bg-orange-600 text-white",
};

/** Soft tint used for a step card border/background by actor. */
export const TONE_SOFT: Record<Tone, string> = {
  green: "border-green-200 bg-green-50",
  blue: "border-blue-200 bg-blue-50",
  sky: "border-sky-200 bg-sky-50",
  emerald: "border-emerald-200 bg-emerald-50",
  amber: "border-amber-200 bg-amber-50",
  violet: "border-violet-200 bg-violet-50",
  indigo: "border-indigo-200 bg-indigo-50",
  teal: "border-teal-200 bg-teal-50",
  slate: "border-slate-200 bg-slate-50",
  gray: "border-gray-200 bg-gray-50",
  red: "border-red-200 bg-red-50",
  yellow: "border-yellow-200 bg-yellow-50",
  purple: "border-purple-200 bg-purple-50",
  orange: "border-orange-200 bg-orange-50",
};
