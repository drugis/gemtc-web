DROP TABLE patavitask;

ALTER TABLE model add column taskId INT;

ALTER TABLE model add column linearModel VARCHAR NOT NULL DEFAULT 'fixed';
