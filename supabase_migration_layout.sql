-- Add field layout columns to fields table
ALTER TABLE fields ADD COLUMN IF NOT EXISTS layout_type text default 'grid';
ALTER TABLE fields ADD COLUMN IF NOT EXISTS layout_rows integer default 6;
ALTER TABLE fields ADD COLUMN IF NOT EXISTS layout_cols integer default 8;
ALTER TABLE fields ADD COLUMN IF NOT EXISTS layout_zones jsonb;

-- Description:
-- layout_type: 'grid' or 'custom' to specify how the field is organized
-- layout_rows: number of rows in grid layout
-- layout_cols: number of columns in grid layout
-- layout_zones: JSON array of zone objects {id, name, row, col, crop_type, irrigation_type, color, notes}
