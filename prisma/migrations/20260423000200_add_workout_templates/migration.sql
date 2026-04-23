-- Phase 7.6: workout templates
CREATE TABLE "workout_templates" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "workout_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "workout_template_exercises" (
  "id" TEXT NOT NULL,
  "template_id" TEXT NOT NULL,
  "exercise_id" TEXT NOT NULL,
  "order_index" INTEGER NOT NULL,
  CONSTRAINT "workout_template_exercises_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "workout_template_exercises_template_id_exercise_id_key"
ON "workout_template_exercises"("template_id", "exercise_id");

CREATE INDEX "workout_templates_user_id_created_at_idx"
ON "workout_templates"("user_id", "created_at");

CREATE INDEX "workout_template_exercises_template_id_order_index_idx"
ON "workout_template_exercises"("template_id", "order_index");

ALTER TABLE "workout_templates"
ADD CONSTRAINT "workout_templates_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workout_template_exercises"
ADD CONSTRAINT "workout_template_exercises_template_id_fkey"
FOREIGN KEY ("template_id") REFERENCES "workout_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workout_template_exercises"
ADD CONSTRAINT "workout_template_exercises_exercise_id_fkey"
FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
