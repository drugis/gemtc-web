CREATE TABLE PataviTask (
  id SERIAL NOT NULL,
  method varchar,
  problem JSONB,
  result TEXT,
  PRIMARY KEY(id)
);
