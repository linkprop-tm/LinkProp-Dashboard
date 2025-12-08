/*
  # Remove preferencias_m2_max column from usuarios table

  ## Overview
  This migration removes the `preferencias_m2_max` column from the `usuarios` table as it is no longer needed.

  ## Changes
  1. Drop Column
     - Remove `preferencias_m2_max` from `usuarios` table
     - This column stored the maximum square meters preference for properties

  ## Important Notes
  - This is a destructive operation - the column and its data will be permanently removed
  - Ensure the frontend no longer depends on this field before applying
*/

-- Drop the preferencias_m2_max column
ALTER TABLE usuarios DROP COLUMN IF EXISTS preferencias_m2_max;