-- Convert reports.category from a single enum to an array of enums
ALTER TABLE reports
  ALTER COLUMN category TYPE waste_category[]
  USING ARRAY[category];
