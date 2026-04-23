-- Create enums
CREATE TYPE "WorkoutStatus" AS ENUM ('active', 'completed');
CREATE TYPE "SetType" AS ENUM ('working', 'warmup');

-- Create tables
CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "telegram_user_id" TEXT NOT NULL,
  "username" TEXT,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exercise_categories" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "exercise_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exercises" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category_id" TEXT NOT NULL,
  "equipment_type" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "workouts" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT 'Workout',
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finished_at" TIMESTAMP(3),
  "status" "WorkoutStatus" NOT NULL DEFAULT 'active',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "workout_exercises" (
  "id" TEXT NOT NULL,
  "workout_id" TEXT NOT NULL,
  "exercise_id" TEXT NOT NULL,
  "order_index" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workout_exercises_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "set_entries" (
  "id" TEXT NOT NULL,
  "workout_exercise_id" TEXT NOT NULL,
  "set_index" INTEGER NOT NULL,
  "weight_kg" DECIMAL(6,2) NOT NULL,
  "reps" INTEGER NOT NULL,
  "set_type" "SetType" NOT NULL DEFAULT 'working',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "set_entries_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "users_telegram_user_id_key" ON "users"("telegram_user_id");
CREATE UNIQUE INDEX "exercise_categories_slug_key" ON "exercise_categories"("slug");
CREATE UNIQUE INDEX "exercises_name_category_id_key" ON "exercises"("name", "category_id");
CREATE UNIQUE INDEX "workout_exercises_workout_id_exercise_id_key" ON "workout_exercises"("workout_id", "exercise_id");

-- Create indexes
CREATE INDEX "exercises_category_id_idx" ON "exercises"("category_id");
CREATE INDEX "exercises_name_idx" ON "exercises"("name");
CREATE INDEX "workouts_user_id_started_at_idx" ON "workouts"("user_id", "started_at");
CREATE INDEX "workouts_user_id_status_idx" ON "workouts"("user_id", "status");
CREATE INDEX "workout_exercises_workout_id_idx" ON "workout_exercises"("workout_id");
CREATE INDEX "workout_exercises_exercise_id_idx" ON "workout_exercises"("exercise_id");
CREATE INDEX "set_entries_workout_exercise_id_idx" ON "set_entries"("workout_exercise_id");
CREATE INDEX "set_entries_workout_exercise_id_set_index_idx" ON "set_entries"("workout_exercise_id", "set_index");

-- Add foreign keys
ALTER TABLE "exercises"
  ADD CONSTRAINT "exercises_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "exercise_categories"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "workouts"
  ADD CONSTRAINT "workouts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workout_exercises"
  ADD CONSTRAINT "workout_exercises_workout_id_fkey"
  FOREIGN KEY ("workout_id") REFERENCES "workouts"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workout_exercises"
  ADD CONSTRAINT "workout_exercises_exercise_id_fkey"
  FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "set_entries"
  ADD CONSTRAINT "set_entries_workout_exercise_id_fkey"
  FOREIGN KEY ("workout_exercise_id") REFERENCES "workout_exercises"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
