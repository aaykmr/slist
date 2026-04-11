-- Make `slist` use caching_sha2_password (works with Prisma; avoids sha256_password).
-- Password must match DATABASE_URL (default: slist). Database name default: slist (edit GRANT if different).
--
-- ERROR 1396 on ALTER USER usually means that user@host row does not exist yet — this script
-- creates missing host entries with CREATE USER IF NOT EXISTS, then ALTER + GRANT.

CREATE USER IF NOT EXISTS 'slist'@'%' IDENTIFIED WITH caching_sha2_password BY 'slist';
CREATE USER IF NOT EXISTS 'slist'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'slist';

ALTER USER 'slist'@'%' IDENTIFIED WITH caching_sha2_password BY 'slist';
ALTER USER 'slist'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'slist';

GRANT ALL PRIVILEGES ON `slist`.* TO 'slist'@'%';
GRANT ALL PRIVILEGES ON `slist`.* TO 'slist'@'localhost';

FLUSH PRIVILEGES;
