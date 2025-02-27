import { Database } from 'duckdb-async';

let db: Database | null = null;
let dbInitPromise: Promise<Database> | null = null;

const initDb = async () => {

    if (db) {
        return db;
    }

    if (dbInitPromise) {
        return await dbInitPromise;
    }

    dbInitPromise = (async () => {
        console.log('Initializing DB');
        const dbInstance = await Database.create(':memory:');

        console.log('Setting DuckDB home directory');
        await dbInstance.run(`SET home_directory='./tmp';`);

        console.log('Installing httpfs');
        await dbInstance.run(`INSTALL httpfs;`);
        await dbInstance.run(`LOAD httpfs;`);

        console.log('Database initialized');

        db = dbInstance;
        return dbInstance;
    })();

    return await dbInitPromise;

}
export const executeQuery = async (query: string): Promise<any[]> => {
    if (!db) {
        db = await initDb();
    }
    const connection = await db.connect();
    return (await connection.all(query)) as any[];
}