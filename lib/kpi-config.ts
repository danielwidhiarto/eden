// KPI Configuration with scoring rules based on Emmanuel's PI Reference

export interface KPIConfig {
  id: string;
  title: string;
  description: string;
  weight: number; // in percentage
  targetDescription: string;
  measurementDate: string;
  unit: string;
  inputType: "number" | "percentage" | "score";
  // Scoring rules: array of { min, max, score }
  scoringRules: { min: number; max: number; score: number }[];
}

export const KPI_CONFIGS: KPIConfig[] = [
  {
    id: "pi-jurusan",
    title: "PI Jurusan / School",
    description: "Kinerja Unit berdasarkan nilai PI Jurusan/School",
    weight: 10,
    targetDescription: "Score 4 dan PI Fokus Tercapai",
    measurementDate: "Des",
    unit: "score",
    inputType: "number",
    scoringRules: [
      { min: 0, max: 3.49, score: 1 },
      { min: 3.5, max: 3.99, score: 2 },
      { min: 4.0, max: 4.49, score: 3 },
      { min: 4.5, max: 5.09, score: 4 },
      { min: 5.1, max: 5.5, score: 5 },
      { min: 5.51, max: 6, score: 6 },
    ],
  },
  {
    id: "hibah-penelitian",
    title: "Keterlibatan dalam Hibah Penelitian",
    description: "Terlibat sebagai ketua atau anggota skema hibah penelitian (internal atau eksternal BINUS)",
    weight: 10,
    targetDescription: "1 keterlibatan",
    measurementDate: "Nov",
    unit: "keterlibatan",
    inputType: "number",
    scoringRules: [
      { min: 0, max: 0, score: 1 },
      { min: 1, max: 1, score: 4 },
      { min: 2, max: 999, score: 6 },
    ],
  },
  {
    id: "video-based-learning",
    title: "Video Based Learning",
    description: "Jumlah Video Based Learning yang dibuat dalam 1 tahun",
    weight: 15,
    targetDescription: "5-7 videos",
    measurementDate: "Nov",
    unit: "videos",
    inputType: "number",
    scoringRules: [
      { min: 0, max: 0, score: 1 },
      { min: 1, max: 2, score: 2 },
      { min: 3, max: 4, score: 3 },
      { min: 5, max: 7, score: 4 },
      { min: 8, max: 10, score: 5 },
      { min: 11, max: 999, score: 6 },
    ],
  },
  {
    id: "mooc",
    title: "Massive Open Online Course",
    description: "Jumlah MOOC yang published di LMS Binus MOOC (Global Recognition / CSR / Internal)",
    weight: 15,
    targetDescription: "1 MOOC",
    measurementDate: "Oct",
    unit: "MOOC",
    inputType: "number",
    scoringRules: [
      { min: 0, max: 0, score: 1 },
      { min: 1, max: 1, score: 4 },
      { min: 2, max: 999, score: 6 },
    ],
  },
  {
    id: "artikel-socs",
    title: "# of Article Uploaded",
    description: "Jumlah artikel yang dipublikasikan pada web SoCS dalam satu tahun",
    weight: 15,
    targetDescription: "12 artikel (1/bulan)",
    measurementDate: "Nov",
    unit: "artikel",
    inputType: "number",
    scoringRules: [
      { min: 0, max: 0, score: 1 },
      { min: 1, max: 6, score: 2 },
      { min: 7, max: 11, score: 3 },
      { min: 12, max: 23, score: 4 },
      { min: 24, max: 35, score: 5 },
      { min: 36, max: 999, score: 6 },
    ],
  },
  {
    id: "ojt",
    title: "On Job Training (OJT)",
    description: "Berdasarkan penilaian dan pengamatan langsung dari tim SoCS yang memberikan penugasan",
    weight: 15,
    targetDescription: "Score 4",
    measurementDate: "Dec",
    unit: "score",
    inputType: "score",
    scoringRules: [
      { min: 1, max: 1, score: 1 },
      { min: 2, max: 2, score: 2 },
      { min: 3, max: 3, score: 3 },
      { min: 4, max: 4, score: 4 },
      { min: 5, max: 5, score: 5 },
      { min: 6, max: 6, score: 6 },
    ],
  },
  {
    id: "scopus-paper",
    title: "International Paper (Scopus)",
    description: "Jumlah paper internasional terindeks scopus yang dihasilkan (status: Accepted)",
    weight: 10,
    targetDescription: "1 paper accepted",
    measurementDate: "Dec",
    unit: "paper",
    inputType: "number",
    scoringRules: [
      { min: 0, max: 0, score: 1 },
      { min: 1, max: 1, score: 4 },
      { min: 2, max: 2, score: 5 },
      { min: 3, max: 999, score: 6 },
    ],
  },
  {
    id: "tugas-khusus",
    title: "Tugas Khusus (BeeFest & ICPC)",
    description: "Kepanitiaan BeeFest dan ICPC - persentase tugas yang diselesaikan",
    weight: 10,
    targetDescription: "100% selesai",
    measurementDate: "Dec",
    unit: "%",
    inputType: "percentage",
    scoringRules: [
      { min: 0, max: 69.99, score: 1 },
      { min: 70, max: 75.99, score: 2 },
      { min: 76, max: 89.99, score: 3 },
      { min: 90, max: 94.99, score: 4 },
      { min: 95, max: 99.99, score: 5 },
      { min: 100, max: 100, score: 6 },
    ],
  },
];

// Calculate score based on value and scoring rules
export function calculateScore(value: number, rules: KPIConfig["scoringRules"]): number {
  for (const rule of rules) {
    if (value >= rule.min && value <= rule.max) {
      return rule.score;
    }
  }
  return 1; // default to lowest score
}

// Calculate overall weighted score
export function calculateOverallScore(
  kpiValues: Record<string, number>
): { overall: number; details: { id: string; score: number; weighted: number }[] } {
  let totalWeighted = 0;
  let totalWeight = 0;
  const details: { id: string; score: number; weighted: number }[] = [];

  for (const config of KPI_CONFIGS) {
    const value = kpiValues[config.id] ?? 0;
    const score = calculateScore(value, config.scoringRules);
    const weighted = score * (config.weight / 100);
    
    details.push({ id: config.id, score, weighted });
    totalWeighted += weighted;
    totalWeight += config.weight;
  }

  // Normalize to 6-point scale
  const overall = (totalWeighted / (totalWeight / 100));

  return { overall, details };
}

// Get status indicator based on score
export function getScoreStatus(score: number): "success" | "warning" | "error" {
  if (score >= 4) return "success";
  if (score >= 3) return "warning";
  return "error";
}

// Get emoji indicator
export function getScoreEmoji(score: number): string {
  if (score >= 5) return "🟢";
  if (score >= 4) return "🟢";
  if (score >= 3) return "🟡";
  return "🔴";
}

// Format a single scoring rule as a human-readable range
//   { min: 5.51, max: 6 }   -> "5.51 – 6.00"
//   { min: 2,   max: 999 } -> "≥ 2"
//   { min: 100, max: 100 } -> "= 100"
export function formatScoreRule(
  rule: { min: number; max: number },
  unit?: string
): string {
  const formatNum = (n: number): string => {
    if (Number.isInteger(n)) return String(n);
    return n.toFixed(2).replace(/\.?0+$/, "");
  };
  const suffix = unit === "%" ? "%" : "";
  if (rule.min === rule.max) {
    return `= ${formatNum(rule.min)}${suffix}`;
  }
  if (rule.max === 999) {
    return `≥ ${formatNum(rule.min)}${suffix}`;
  }
  return `${formatNum(rule.min)} – ${formatNum(rule.max)}${suffix}`;
}

// Get the formatted threshold for the maximum (score 6) range of a KPI
export function getScore6Target(config: KPIConfig): string {
  const rule = config.scoringRules.find((r) => r.score === 6);
  if (!rule) return "—";
  return formatScoreRule(rule, config.unit === "%" ? "%" : undefined);
}
