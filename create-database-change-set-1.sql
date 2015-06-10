
CREATE TABLE Account (id SERIAL NOT NULL,
  email VARCHAR,
  name VARCHAR NOT NULL,
  firstName VARCHAR NOT NULL,
  lastName VARCHAR NOT NULL,
  PRIMARY KEY (id)
);

-- table to hold auth2 details
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
  problem TEXT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(owner) REFERENCES Account(id)
);

CREATE TABLE Model (
  id SERIAL NOT NULL,
  analysisId INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(analysisId) REFERENCES Analysis(id)
);

CREATE TABLE PataviTask (
  id SERIAL NOT NULL,
  modelId INT NOT NULL,
  method varchar,
  problem TEXT,
  result TEXT,
  PRIMARY KEY(id),
  FOREIGN KEY(modelId) REFERENCES Model(id)
);
