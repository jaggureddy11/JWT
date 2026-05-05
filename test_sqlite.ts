import Database from 'better-sqlite3';

const db = new Database('test.db', { verbose: console.log });
db.exec('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY)');
console.log('Success');
