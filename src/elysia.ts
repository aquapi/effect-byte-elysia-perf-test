import { t, Elysia, type Static } from 'elysia';
import { Database } from 'bun:sqlite';

const User = t.Object({
  name: t.String()
});

const UserWithId = t.Object({
  id: t.Number(),
  name: t.String()
});

const Users = t.Array(UserWithId);
type Users = Static<typeof Users>;

const db = new Database('./database.db', { create: true });
db.exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)');

const addUser = db.query('INSERT INTO users (name) VALUES ($name) RETURNING *');

new Elysia()
  .post('/users', (ctx) => {
    ctx.set.status = 201;
    return addUser.all({ $name: ctx.body.name }) as Users;
  }, { body: User, response: Users })
  .listen(3000);
