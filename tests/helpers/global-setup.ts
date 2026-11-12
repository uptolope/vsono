import { dropDatabase, migrateDeploy, recreateDatabase, TEST_DB_NAME } from "./db";

/** Builds a fresh database from the repo's migrations before any test runs. */
export default async function setup() {
  const url = await recreateDatabase(TEST_DB_NAME);
  await migrateDeploy(url);

  return async () => {
    await dropDatabase(TEST_DB_NAME);
  };
}
