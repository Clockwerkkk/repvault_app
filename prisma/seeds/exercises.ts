export type ExerciseSeed = {
  name: string;
  categorySlug: string;
  equipmentType?: string;
};

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type ParsedGroup = {
  title: string;
  exercises: string[];
};

const headingToApiSlug: Array<{ startsWith: string; apiCategorySlug: string }> = [
  { startsWith: "Грудь", apiCategorySlug: "chest" },
  { startsWith: "Спина", apiCategorySlug: "back" },
  { startsWith: "Бицепс", apiCategorySlug: "biceps" },
  { startsWith: "Трицепс", apiCategorySlug: "triceps" },
  { startsWith: "Плечи", apiCategorySlug: "shoulders" },
  { startsWith: "Ягодицы", apiCategorySlug: "legs" },
  { startsWith: "Квадрицепсы", apiCategorySlug: "legs" },
  { startsWith: "Икры", apiCategorySlug: "legs" },
  { startsWith: "Пресс", apiCategorySlug: "abs-core" }
];

function parseExercisesMarkdown(markdown: string): ParsedGroup[] {
  const lines = markdown.split(/\r?\n/);
  const groups: ParsedGroup[] = [];
  let currentGroup: ParsedGroup | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^#\s+\*\*(.+)\*\*\s*$/);
    if (headingMatch) {
      currentGroup = { title: headingMatch[1].trim(), exercises: [] };
      groups.push(currentGroup);
      continue;
    }

    const exerciseMatch = line.match(/^\d+\.\s+(.+?)\s*$/);
    if (exerciseMatch && currentGroup) {
      currentGroup.exercises.push(exerciseMatch[1].trim());
    }
  }

  return groups;
}

function resolveCategorySlug(groupTitle: string): string {
  const mapping = headingToApiSlug.find((item) => groupTitle.startsWith(item.startsWith));
  if (!mapping) {
    throw new Error(`Unknown category heading in exercises.md: ${groupTitle}`);
  }

  return mapping.apiCategorySlug;
}

function loadExerciseSeedsFromMarkdown(): ExerciseSeed[] {
  const currentFilePath = fileURLToPath(import.meta.url);
  const projectRoot = path.resolve(path.dirname(currentFilePath), "../..");
  const markdownPath = path.join(projectRoot, "exercises.md");
  const markdownContent = fs.readFileSync(markdownPath, "utf8");
  const groups = parseExercisesMarkdown(markdownContent);
  const seeds: ExerciseSeed[] = [];

  for (const group of groups) {
    const categorySlug = resolveCategorySlug(group.title);
    for (const exerciseName of group.exercises) {
      seeds.push({
        name: exerciseName,
        categorySlug
      });
    }
  }

  return seeds;
}

export const exerciseSeeds: ExerciseSeed[] = loadExerciseSeedsFromMarkdown();
