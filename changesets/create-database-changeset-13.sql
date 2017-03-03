CREATE TABLE modelBaseline (
  modelId INT NOT NULL,
  baseline JSONB NOT NULL,
  PRIMARY KEY (modelId),
  FOREIGN KEY (modelId) REFERENCES model(id)
);
