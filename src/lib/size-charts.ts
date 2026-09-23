// Garment measurements in inches (flat, across the garment where noted).
// Women's shirt and trouser rows follow common Pakistani ready-to-wear grading;
// men's rows are placeholders. Replace every table with measurements taken from
// your own patterns before launch.
export const sizes = ["XS", "S", "M", "L", "XL"] as const;

export type Chart = {
  title: string;
  fit: string;
  rows: [label: string, values: number[]][];
};

export const charts: Record<string, Chart> = {
  "women-shirt": {
    title: "Shirt",
    fit: "Regular fit",
    rows: [
      ["Length", [50, 50, 50, 50, 50]],
      ["Shoulder", [13.5, 14, 14.5, 15.25, 16]],
      ["Chest (across)", [18.5, 19.5, 20.5, 22.25, 24]],
      ["Front border", [35, 35, 35, 35, 35]],
      ["Arm hole", [9, 9.5, 10, 10.75, 11.5]],
      ["Sleeve length", [22, 22.5, 23, 23.5, 24]],
      ["Sleeve opening", [11, 11, 11, 11, 11]],
    ],
  },
  "women-trouser": {
    title: "Trouser",
    fit: "Straight / culotte",
    rows: [
      ["Length", [35.125, 36, 36.875, 37.75, 38.625]],
      ["Waist relaxed (across)", [13, 14, 15, 16, 17]],
      ["Waist extended (across)", [19, 20, 21, 22, 23]],
      ["Hip (across)", [19.5, 21, 22.5, 24, 25.5]],
      ["Thigh (across)", [11.75, 12.5, 13.25, 14, 14.75]],
      ["Bottom opening", [11.25, 12, 12.75, 13.5, 14.25]],
    ],
  },
  "men-kameez": {
    title: "Kameez / kurta",
    fit: "Regular fit",
    rows: [
      ["Length", [38, 39, 40, 41, 42]],
      ["Shoulder", [16.5, 17, 17.5, 18, 18.5]],
      ["Chest (across)", [20, 21, 22, 23, 24]],
      ["Sleeve length", [23, 23.5, 24, 24.5, 25]],
      ["Collar", [14.5, 15, 15.5, 16, 16.5]],
    ],
  },
  "men-shalwar": {
    title: "Shalwar",
    fit: "Traditional",
    rows: [
      ["Length", [39, 40, 41, 42, 43]],
      ["Waist relaxed (across)", [14, 15, 16, 17, 18]],
      ["Bottom opening", [8, 8.5, 9, 9.5, 10]],
    ],
  },
};

// A product's sizeChart value picks which tables its size guide shows.
export const chartSets: Record<string, { label: string; charts: string[] }> = {
  "women-suit": {
    label: "Women's suits",
    charts: ["women-shirt", "women-trouser"],
  },
  "women-shirt": { label: "Women's shirts", charts: ["women-shirt"] },
  "men-suit": {
    label: "Men's kameez shalwar",
    charts: ["men-kameez", "men-shalwar"],
  },
  "men-kurta": { label: "Men's kurtas", charts: ["men-kameez"] },
};

export function chartSetFor(key: string | null | undefined, category = "") {
  if (key && chartSets[key]) return key;
  return category === "Men" ? "men-suit" : "women-suit";
}
