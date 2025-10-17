// Create constraints for User nodes
// This ensures email uniqueness and improves query performance

// Create unique constraint on User.email
CREATE CONSTRAINT user_email_unique IF NOT EXISTS
FOR (u:User) REQUIRE u.email IS UNIQUE;

// Create unique constraint on User.id
CREATE CONSTRAINT user_id_unique IF NOT EXISTS
FOR (u:User) REQUIRE u.id IS UNIQUE;

// Create index on User.id for faster lookups
CREATE INDEX user_id_index IF NOT EXISTS
FOR (u:User) ON (u.id);
