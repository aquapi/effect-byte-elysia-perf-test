import { Type } from '@sinclair/typebox';
import { Database } from 'bun:sqlite';
import { Byte } from '@bit-js/byte';
import schemaValidator from '../utils/typeboxVld';

const User = Type.Object({
  name: Type.String()
});

const db = new Database('./database.db', { create: true });
db.exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)');

const addUser = db.query('INSERT INTO users (name) VALUES ($name) RETURNING *');

export default new Byte()
  .post('/users', {
    body: schemaValidator(User)
  }, (ctx) => {
    ctx.status = 201;
    return ctx.json(addUser.all({ $name: ctx.state.body.name }));
  });
