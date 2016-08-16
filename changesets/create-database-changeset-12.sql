CREATE TABLE funnelplot (
  id SERIAL NOT NULL,
  modelId INT NOT NULL,
  t1 INT NOT NULL,
  t2 INT NOT NULL,
  biasDirection INT NOT NULL,
  PRIMARY KEY (id, modelId, t1, t2)
);
