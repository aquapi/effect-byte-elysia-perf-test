import { Database } from 'bun:sqlite';

const command = `oha -n=20000 --ipv4 --no-tui --json --method POST http://127.0.0.1:3000/users -d '{"name":"foo"}' -H 'Content-Type: application/json'`;
const db = new Database('./database.db');
const result = {} as Record<string, any>;

for (const item of new Bun.Glob('./src/**/*.ts').scanSync('.')) {
  const proc = Bun.spawn(['bun', 'run', item], { stdout: 'ignore' });
  Bun.sleepSync(5000);

  result[item] = await Bun.$`${{ raw: command }}`.json();
  proc.kill();

  db.exec(`DELETE FROM users WHERE 1=1`);
}

Bun.write('./result.json', JSON.stringify(result, null, 4));
