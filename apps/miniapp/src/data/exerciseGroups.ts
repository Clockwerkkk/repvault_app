import exercisesMarkdown from "../../../../exercises.md?raw";
import type { ExerciseListItem } from "../types";

export type ExerciseGroup = {
  id: string;
  title: string;
  exerciseNames: string[];
};

type ParsedGroup = {
  title: string;
  exerciseNames: string[];
};

function toId(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[()\-/,.:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMarkdownGroups(markdown: string): ParsedGroup[] {
  const lines = markdown.split("\n");
  const groups: ParsedGroup[] = [];
  let currentGroup: ParsedGroup | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^#\s+\*\*(.+)\*\*\s*$/);
    if (headingMatch) {
      currentGroup = {
        title: headingMatch[1].trim(),
        exerciseNames: []
      };
      groups.push(currentGroup);
      continue;
    }

    if (!currentGroup) {
      continue;
    }

    const exerciseMatch = line.match(/^\d+\.\s+(.+?)\s*$/);
    if (exerciseMatch) {
      currentGroup.exerciseNames.push(exerciseMatch[1].trim());
    }
  }

  return groups;
}

const parsedGroups = parseMarkdownGroups(exercisesMarkdown);

export const exerciseGroups: ExerciseGroup[] = parsedGroups.map((group) => ({
  id: toId(group.title),
  title: group.title,
  exerciseNames: group.exerciseNames
}));

const groupById = new Map<string, ExerciseGroup>();
for (const group of exerciseGroups) {
  groupById.set(group.id, group);
}

function buildItemLookup(items: ExerciseListItem[]): Map<string, ExerciseListItem[]> {
  const map = new Map<string, ExerciseListItem[]>();
  for (const item of items) {
    const key = normalizeValue(item.name);
    const current = map.get(key) ?? [];
    current.push(item);
    map.set(key, current);
  }
  return map;
}

function pickByNames(
  itemsByName: Map<string, ExerciseListItem[]>,
  markdownExerciseName: string
): ExerciseListItem[] {
  const normalizedMarkdownName = normalizeValue(markdownExerciseName);
  const matched = itemsByName.get(normalizedMarkdownName);
  if (matched && matched.length > 0) {
    return matched;
  }

  return [];
}

export function getItemsForGroup(items: ExerciseListItem[], groupId: string): ExerciseListItem[] {
  const group = groupById.get(groupId);
  if (!group) {
    return [];
  }

  const itemsByName = buildItemLookup(items);
  const usedIds = new Set<string>();
  const orderedItems: ExerciseListItem[] = [];

  for (const markdownExerciseName of group.exerciseNames) {
    const matched = pickByNames(itemsByName, markdownExerciseName);
    for (const item of matched) {
      if (usedIds.has(item.id)) {
        continue;
      }
      usedIds.add(item.id);
      orderedItems.push({
        ...item,
        name: markdownExerciseName
      });
    }
  }

  return orderedItems;
}

export function getCatalogGroups(
  items: ExerciseListItem[]
): Array<{ id: string; title: string; items: ExerciseListItem[] }> {
  return exerciseGroups
    .map((group) => ({
      id: group.id,
      title: group.title,
      items: getItemsForGroup(items, group.id)
    }))
    .filter((group) => group.items.length > 0);
}
