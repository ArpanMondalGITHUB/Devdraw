import { pool } from "./pool.ts";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

// User queries
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const { rows } = await pool.query<User>(
    `SELECT * FROM "User" WHERE email = $1 LIMIT 1`,
    [email]
  );
  return rows[0] ?? null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const { rows } = await pool.query<User>(
    `SELECT * FROM "User" WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<Pick<User, "id" | "name" | "email" | "createdAt">> => {
  const { rows } = await pool.query<Pick<User, "id" | "name" | "email" | "createdAt">>(
    `INSERT INTO "User" (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, "createdAt"`,
    [data.name, data.email, data.password]
  );
  return rows[0]!;
};

// RefreshToken queries
export const createRefreshToken = async (data: {
  token: string;
  userId: string;
  expiresAt: Date;
}): Promise<void> => {
  await pool.query(
    `INSERT INTO "RefreshToken" (token, "userId", "expiresAt")
     VALUES ($1, $2, $3)`,
    [data.token, data.userId, data.expiresAt]
  );
};

export const findRefreshToken = async (
  token: string
): Promise<RefreshToken | null> => {
  const { rows } = await pool.query<RefreshToken>(
    `SELECT * FROM "RefreshToken" WHERE token = $1 LIMIT 1`,
    [token]
  );
  return rows[0] ?? null;
};

export const deleteRefreshToken = async (token: string): Promise<void> => {
  await pool.query(`DELETE FROM "RefreshToken" WHERE token = $1`, [token]);
};

export const deleteAllRefreshTokens = async (userId: string): Promise<void> => {
  await pool.query(`DELETE FROM "RefreshToken" WHERE "userId" = $1`, [userId]);
};

export const updateUser = async (
  id:string,
  updates:{name?:string,email?:string }
): Promise<User | null> => {
  const fields = [];
  const values = [];
  let i = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${i++}`);
    values.push(updates.name);
  }
  if (updates.email !== undefined) {
    fields.push(`email = $${i++}`);
    values.push(updates.email);
  }

  if(fields.length === 0) return findUserById(id);

  values.push(id);
  const {rows} = await pool.query<User>(
    `UPDATE "User" SET ${fields.join(", ")}, "updatedAt" = now()
    WHERE id = $${i} RETURNING *`,
    values
  );
  return rows[0] ?? null;
}

export const deleteUser = async (id:string): Promise<void> => {
  await pool.query(`DELETE FROM "User" WHERE ID = $1`,[id]);
};