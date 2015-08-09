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