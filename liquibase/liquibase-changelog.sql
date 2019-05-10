-- liquibase formatted sql

--changeset reidd:01
CREATE TABLE Account (id SERIAL NOT NULL,
  email VARCHAR,
  name VARCHAR NOT NULL,
  firstName VARCHAR NOT NULL,
  lastName VARCHAR NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE UserConnection (tokenId VARCHAR NOT NULL,
  googleUserId VARCHAR(255) NOT NULL,
  accessToken VARCHAR(255) NOT NULL,
  expireTime BIGINT,
  refreshToken VARCHAR(255),
  tokenType VARCHAR(255) NOT NULL,
  userId INT NOT NULL,
  PRIMARY KEY (tokenId),
  FOREIGN KEY(userId) REFERENCES Account(id)
);

CREATE TABLE Analysis (id SERIAL NOT NULL,
  owner INT NOT NULL,
  title VARCHAR NOT NULL,
  outcome varchar(255) NOT NULL,
  problem JSONB NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(owner) REFERENCES Account(id)
);

CREATE TABLE Model (
  id SERIAL NOT NULL,
  title VARCHAR NOT NULL,
  analysisId INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(analysisId) REFERENCES Analysis(id)
);

CREATE TABLE PataviTask (
  id SERIAL NOT NULL,
  modelId INT NOT NULL,
  method varchar,
  problem JSONB,
  result TEXT,
  PRIMARY KEY(id),
  FOREIGN KEY(modelId) REFERENCES Model(id)
);

--changeset reidd:02
DROP TABLE patavitask;

ALTER TABLE model add column taskId INT;

ALTER TABLE model add column linearModel VARCHAR NOT NULL DEFAULT 'fixed';

--changeset reidd:03
ALTER TABLE analysis DROP COLUMN outcome;
ALTER TABLE analysis ADD COLUMN outcome JSONB NOT NULL DEFAULT '{"name": "automatically generated name"}';

ALTER TABLE model ADD COLUMN modelType JSONB NOT NULL DEFAULT '{"type": "network"}';

--changeset reidd:04
ALTER TABLE model ADD COLUMN burn_in_iterations INT NOT NULL DEFAULT 5000;
ALTER TABLE model ADD COLUMN inference_iterations INT NOT NULL DEFAULT 20000;
ALTER TABLE model ADD COLUMN thinning_factor INT NOT NULL DEFAULT 10;

--changeset reidd:06
BEGIN;

ALTER TABLE model ADD COLUMN likelihood VARCHAR(255);
ALTER TABLE model ADD COLUMN link VARCHAR(255);

UPDATE model SET likelihood = 'normal', link='identity' ;
UPDATE model SET likelihood = 'binom', link='logit' FROM analysis
  WHERE model.analysisid = analysis.id AND (analysis.problem->'entries'->0->>'responders')::int IS NOT NULL;

ALTER TABLE model ALTER likelihood SET NOT NULL;
ALTER TABLE model ALTER link SET NOT NULL;

ALTER TABLE model ADD COLUMN outcome_scale DOUBLE PRECISION;

COMMIT;
--changeset reidd:07
ALTER TABLE model ADD COLUMN heterogeneity_prior JSONB;

--changeset reidd:08
ALTER TABLE model ADD COLUMN regressor JSONB;
ALTER TABLE analysis ADD COLUMN primaryModel INT;
ALTER TABLE analysis ADD FOREIGN KEY(primaryModel) REFERENCES model(id);
--changeset reidd:09
ALTER TABLE model ADD COLUMN sensitivity JSONB;

--changeset reidd:10
-- change taskid to be new patavi URIs
UPDATE model SET taskid = NULL ;
ALTER TABLE model ALTER COLUMN taskid TYPE VARCHAR(128) ;
ALTER TABLE model RENAME COLUMN taskid TO taskUrl ;

--changeset reidd:11
-- add archive colum
ALTER TABLE model ADD COLUMN "archived" boolean NOT NULL DEFAULT FALSE ;
ALTER TABLE model ADD COLUMN "archived_on" date;

--changeset reidd:12
CREATE TABLE funnelplot (
  plotId SERIAL NOT NULL,
  modelId INT NOT NULL,
  t1 INT NOT NULL,
  t2 INT NOT NULL,
  biasDirection VARCHAR NOT NULL,
  PRIMARY KEY (plotid, modelId, t1, t2)
);

--changeset reidd:13
CREATE TABLE modelBaseline (
  modelId INT NOT NULL,
  baseline JSONB NOT NULL,
  PRIMARY KEY (modelId),
  FOREIGN KEY (modelId) REFERENCES model(id)
);

--changeset reidd:14
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

DROP TABLE UserConnection;
ALTER TABLE account ADD COLUMN username VARCHAR;

--changeset reidd:15
ALTER TABLE account ADD COLUMN password VARCHAR DEFAULT '';

--changeset reidd:16
ALTER TABLE account DROP COLUMN name;

--changeset keijserj:17
START TRANSACTION;
ALTER TABLE funnelplot ADD CONSTRAINT funnelplot_modelid_fkey FOREIGN KEY (modelId) REFERENCES model(id) ON DELETE CASCADE;
ALTER TABLE modelBaseline DROP CONSTRAINT modelbaseline_modelid_fkey;
ALTER TABLE modelBaseline ADD CONSTRAINT modelbaseline_modelid_fkey FOREIGN KEY (modelId) REFERENCES model(id) ON DELETE CASCADE;
ALTER TABLE model DROP CONSTRAINT model_analysisid_fkey;
ALTER TABLE model ADD CONSTRAINT model_analysisid_fkey FOREIGN KEY (analysisId) REFERENCES analysis(id) ON DELETE CASCADE;
COMMIT;
--rollback START TRANSACTION;
--rollback ALTER TABLE funnelplot DROP CONSTRAINT funnelplot_modelid_fkey;
--rollback ALTER TABLE modelBaseline DROP CONSTRAINT modelbaseline_modelid_fkey;
--rollback ALTER TABLE modelBaseline ADD CONSTRAINT modelbaseline_modelid_fkey FOREIGN KEY (modelId) REFERENCES model(id);
--rollback ALTER TABLE model DROP CONSTRAINT model_analysisid_fkey;
--rollback ALTER TABLE model ADD CONSTRAINT model_analysisid_fkey FOREIGN KEY (analysisId) REFERENCES analysis(id);
--rollback COMMIT;
