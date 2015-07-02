ALTER TABLE analysis DROP COLUMN outcome;
ALTER TABLE analysis ADD COLUMN outcome JSONB NOT NULL DEFAULT '{"name": "automatically generated name"}';

ALTER TABLE model ADD COLUMN modelType JSONB NOT NULL DEFAULT '{"type": "network"}';