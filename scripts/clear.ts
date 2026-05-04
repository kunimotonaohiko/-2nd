import db from '../lib/db';

const result = db.prepare('DELETE FROM meetings').run();
db.exec("DELETE FROM sqlite_sequence WHERE name = 'meetings'");

console.log(`${result.changes} 件の会議を削除しました。`);
