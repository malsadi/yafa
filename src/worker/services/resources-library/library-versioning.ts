import { ConflictError } from '../../core/errors';

/**
 * Runs a library batch. A save made from an older version is refused
 * ("someone else changed this", 9.1), as is lending more than is left
 * (D-108), when the database's triggers stop it.
 */
export async function runLibraryBatch(
  db: D1Database,
  statements: D1PreparedStatement[],
): Promise<void> {
  try {
    await db.batch(statements);
  } catch (error) {
    if (error instanceof Error && error.message.includes('stale')) {
      throw new ConflictError('resources-library.stale');
    }
    if (error instanceof Error && error.message.includes('over-lent')) {
      throw new ConflictError('resources-library.over-lent');
    }
    throw error;
  }
}
