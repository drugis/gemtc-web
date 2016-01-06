ALTER TABLE model ADD COLUMN regressor JSONB;
ALTER TABLE analysis ADD COLUMN primaryModel INT;
ALTER TABLE analysis ADD FOREIGN KEY(primaryModel) REFERENCES model(id);