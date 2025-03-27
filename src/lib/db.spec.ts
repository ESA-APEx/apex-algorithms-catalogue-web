import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initDb, executeQuery } from './db';
import { Database } from 'duckdb-async';

vi.mock('duckdb-async', () => {
    return {
        Database: {
            create: vi.fn(),
        },
    };
});

const mockDbInstance = {
    run: vi.fn(),
    connect: vi.fn(),
    all: vi.fn(),
};

describe('Database Module', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        global.db = null; 
        global.dbInitPromise = null; 
    });

    it('should initialize the database on first call to initDb', async () => {
        (Database.create as jest.Mock).mockResolvedValue(mockDbInstance);

        const db = await initDb();

        expect(db).toBe(mockDbInstance);
        expect(Database.create).toHaveBeenCalledWith(':memory:');
        expect(mockDbInstance.run).toHaveBeenCalledWith(`SET home_directory='./tmp';`);
        expect(mockDbInstance.run).toHaveBeenCalledWith(`INSTALL httpfs;`);
        expect(mockDbInstance.run).toHaveBeenCalledWith(`LOAD httpfs;`);
    });

    it('should return existing database instance if already initialized', async () => {
        (Database.create as jest.Mock).mockResolvedValue(mockDbInstance);
        await initDb();

        const db = await initDb();

        expect(db).toBe(mockDbInstance);
        expect(Database.create).toHaveBeenCalledTimes(1);
    });

    it('should execute a query using the database', async () => {
        (Database.create as jest.Mock).mockResolvedValue(mockDbInstance);
        await initDb();

        const mockQueryResult = [{ id: 1, name: 'Test' }];
        mockDbInstance.connect.mockResolvedValue({
            all: vi.fn().mockResolvedValue(mockQueryResult),
        });

        const result = await executeQuery('SELECT * FROM test;');

        expect(result).toEqual(mockQueryResult);
        expect(mockDbInstance.connect).toHaveBeenCalled();
    });

    it('should initialize the database if not already initialized when executing a query', async () => {
        (Database.create as jest.Mock).mockResolvedValue(mockDbInstance);
        const mockQueryResult = [{ id: 1, name: 'Test' }];
        mockDbInstance.connect.mockResolvedValue({
            all: vi.fn().mockResolvedValue(mockQueryResult),
        });

        const result = await executeQuery('SELECT * FROM test;');

        expect(result).toEqual(mockQueryResult);
        expect(Database.create).toHaveBeenCalledWith(':memory:');
    });
});
