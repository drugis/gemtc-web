
CREATE TABLE Account (id SERIAL NOT NULL,
  email varchar,
  name varchar NOT NULL,
  firstName varchar NOT NULL,
  lastName varchar NOT NULL,
  PRIMARY KEY (id)
);

-- table to hold auth2 details 
CREATE TABLE UserConnection (tokenId varchar NOT NULL,
  providerId varchar(255) NOT NULL,
  accessToken varchar(255) NOT NULL,
  expireTime bigint,
  refreshToken varchar(255),
  tokenType varchar(255) NOT NULL,
  userId SERIAL NOT NULL,
  PRIMARY KEY (tokenId),
  FOREIGN KEY(userId) REFERENCES Account(id)
);

CREATE TABLE Analysis (id SERIAL NOT NULL,
  owner int NOT NULL,
  title varchar NOT NULL,
  problem TEXT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY(owner) REFERENCES Account(id)
);