import { PrismaClient } from "@prisma/client";
import { categorySeeds } from "./seeds/categories";
import { exerciseSeeds } from "./seeds/exercises";

const prisma = new PrismaClient();

async function seedCategories(): Promise<Map<string, string>> {
  const categoryIdBySlug = new Map<string, string>();

  for (const category of categorySeeds) {
    const upsertedCategory = await prisma.exerciseCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: {
        slug: category.slug,
        name: category.name
      }
    });

    categoryIdBySlug.set(category.slug, upsertedCategory.id);
  }

  return categoryIdBySlug;
}

async function seedExercises(categoryIdBySlug: Map<string, string>): Promise<void> {
  const allowedPairs = new Set(
    exerciseSeeds.map((exercise) => `${exercise.categorySlug}::${exercise.name}`)
  );

  for (const exercise of exerciseSeeds) {
    const categoryId = categoryIdBySlug.get(exercise.categorySlug);

    if (!categoryId) {
      throw new Error(`Category not found for slug: ${exercise.categorySlug}`);
    }

    await prisma.exercise.upsert({
      where: {
        name_categoryId: {
          name: exercise.name,
          categoryId
        }
      },
      update: {
        equipmentType: exercise.equipmentType ?? null,
        isActive: true
      },
      create: {
        name: exercise.name,
        categoryId,
        equipmentType: exercise.equipmentType ?? null,
        isActive: true
      }
    });
  }

  const existingExercises = await prisma.exercise.findMany({
    select: {
      id: true,
      name: true,
      category: {
        select: {
          slug: true
        }
      }
    }
  });

  for (const existingExercise of existingExercises) {
    const pairKey = `${existingExercise.category.slug}::${existingExercise.name}`;
    const isAllowed = allowedPairs.has(pairKey);
    if (isAllowed) {
      continue;
    }

    await prisma.exercise.update({
      where: { id: existingExercise.id },
      data: { isActive: false }
    });
  }
}

async function main(): Promise<void> {
  const categoryIdBySlug = await seedCategories();
  await seedExercises(categoryIdBySlug);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed successfully");
  })
  .catch(async (error: unknown) => {
    await prisma.$disconnect();
    console.error("Seed failed", error);
    process.exit(1);
  });
