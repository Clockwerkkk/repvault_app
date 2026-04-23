-- Phase 7.5: bodyweight-friendly set logging
ALTER TABLE "set_entries"
ALTER COLUMN "weight_kg" DROP NOT NULL;
