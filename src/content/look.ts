/** Each category gets one brick colour from the logo's palette, used on its tile and tags. */
export const categoryColor: Record<string, { bg: string; lip: string; ink: "light" | "dark" }> = {
  "lego-cars": { bg: "#e2283a", lip: "#a8172a", ink: "light" },
  rc: { bg: "#f8a721", lip: "#c97c05", ink: "dark" },
  "rc-sets": { bg: "#f88e1a", lip: "#c2620a", ink: "dark" },
  military: { bg: "#4f5b3a", lip: "#363f27", ink: "light" },
  "6-stud": { bg: "#2f8f8c", lip: "#1f6664", ink: "light" },
  frames: { bg: "#1b1d22", lip: "#000000", ink: "light" },
  buildings: { bg: "#a8145b", lip: "#760c3f", ink: "light" },
  diecast: { bg: "#8d97a5", lip: "#5f6875", ink: "dark" },
  diy: { bg: "#3d7b83", lip: "#295860", ink: "light" },
  toys: { bg: "#f2f0ea", lip: "#c9c5bb", ink: "dark" },
};
export const colorOf = (id: string) => categoryColor[id] ?? categoryColor.toys;
