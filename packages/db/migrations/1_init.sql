-- Up Migration
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "User" (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL UNIQUE,
  password    TEXT        NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "RefreshToken" (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid(),
  token       TEXT        NOT NULL UNIQUE,
  "userId"    TEXT        NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
