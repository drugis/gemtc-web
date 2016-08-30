CREATE TABLE funnelplot (
  plotId SERIAL NOT NULL,
  modelId INT NOT NULL,
  t1 INT NOT NULL,
  t2 INT NOT NULL,
  biasDirection VARCHAR NOT NULL,
  PRIMARY KEY (plotid, modelId, t1, t2)
);
