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