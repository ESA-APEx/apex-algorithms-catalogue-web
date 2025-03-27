import { Database } from 'duckdb-async';

global.db = null;
global.dbInitPromise = null;

export const initDb = async () => {

    if (db) {
        return db;
    }

    try {
        if (dbInitPromise) {
            return await dbInitPromise;
        }

        dbInitPromise = (async () => {
            console.log('Initializing DB');
            const dbInstance = await Database.create('./tmp/database.duckdb');

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
    } catch (error) {
        console.log('Cannot connect to DB: ' + String(error));        
        return null;
    }
}

export const executeQuery = async (query: string): Promise<any[] | null> => {
    try {
        if (!db) {
            db = await initDb();
        }
        if (db) {
            const connection = await db.connect();
            return (await connection.all(query)) as any[];
        }
        console.log('Cannot execute query because DB is not initialized.');
        return [];
    } catch (error) {
        console.log('Cannot execute query: ' + String(error));
        throw error;
    }
}