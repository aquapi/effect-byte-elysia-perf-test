import { Database } from 'bun:sqlite';

const command = `oha -n=100000 --json --no-tui --ipv4 --method=POST http://127.0.0.1:3000/users -d="{ name: "foo" }"`;
const db = new Database('./database.db');

for (const item of new Bun.Glob('./src/**/*.ts').scanSync('.')) {
  const proc = Bun.spawn(['bun', 'run', item], { stdout: 'ignore' });

  console.log(item);
  Bun.sleepSync(5000);

  console.log((await Bun.$`${{ raw: command }}`.json()).rps);
  proc.kill();

  db.exec(`DELETE FROM users WHERE 1=1`);
}
