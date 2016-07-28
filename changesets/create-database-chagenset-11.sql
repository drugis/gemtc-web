-- add archive colum
ALTER TABLE model ADD COLUMN "archived" boolean NOT NULL DEFAULT FALSE ;
ALTER TABLE model ADD COLUMN "archived_on" date;
