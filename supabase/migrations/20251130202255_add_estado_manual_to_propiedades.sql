/*
  # Add estado_manual column to propiedades table

  ## Description
  Adds a new boolean column `estado_manual` to track whether the property status
  has been manually changed by an admin/agent. This prevents automatic syncs from
  overwriting manual status changes.

  ## New Column
  - `estado_manual` (boolean) - Indicates if status was manually set by admin
    - Default: false (automatic status updates allowed)
    - When true: Protects status from automatic updates (except "No disponible")
    - When false: Status can be updated by sync operations

  ## Use Cases
  1. Admin marks property as "Reservada" → estado_manual = true
     - Sync won't change it to "Disponible" even if Sheet says so
     - Sync CAN change it to "No disponible" (property removed/sold)
  
  2. Property synced from Sheet as "Disponible" → estado_manual = false
     - Future syncs can update status normally
     - Admin can later change and lock it

  ## Security
  - No changes to RLS policies needed
  - New field inherits existing access policies from propiedades table
  - Only admins can update properties, so estado_manual is admin-controlled

  ## Index
  - Creates index for efficient filtering during sync operations
*/

-- Add estado_manual column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'propiedades' AND column_name = 'estado_manual'
  ) THEN
    ALTER TABLE propiedades ADD COLUMN estado_manual boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Create index for efficient filtering during sync operations
CREATE INDEX IF NOT EXISTS idx_propiedades_estado_manual ON propiedades(estado_manual);

-- Add comment to the column for documentation
COMMENT ON COLUMN propiedades.estado_manual IS
'Indicates if property status was manually set by admin. When true, automatic syncs will not change status (except to "No disponible"). When false, status can be updated by sync operations.';