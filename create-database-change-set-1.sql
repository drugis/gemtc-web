
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
