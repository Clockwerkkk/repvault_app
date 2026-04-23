export type CategorySeed = {
  slug: string;
  name: string;
};

export const categorySeeds: CategorySeed[] = [
  { slug: "chest", name: "Грудь" },
  { slug: "back", name: "Спина" },
  { slug: "legs", name: "Ноги" },
  { slug: "shoulders", name: "Плечи" },
  { slug: "biceps", name: "Бицепс" },
  { slug: "triceps", name: "Трицепс" },
  { slug: "abs-core", name: "Пресс/Кор" }
];
