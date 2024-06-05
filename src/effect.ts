import { Schema } from '@effect/schema';
import { BunHttpServer, BunRuntime } from '@effect/platform-bun';
import * as Http from '@effect/platform/HttpServer';
import { Effect, Layer, Config } from 'effect';
import * as Sql from '@effect/sql';
import * as Sqlite from '@effect/sql-sqlite-bun';

const User = Schema.Struct({
  name: Schema.String
});

const UserWithId = Schema.Struct({
  id: Schema.Number,
  name: Schema.String
});

const DbLive = Sqlite.client.layer({
  filename: Config.succeed('./database.db')
});

const ServerLive = BunHttpServer.server.layer({ port: 3000 });

Effect.gen(function* () {
  const sql = yield* Sql.client.Client;

  yield* sql`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)`;

  const addUser = Sql.schema.findAll({
    Request: User,
    Result: UserWithId,
    execute: (user) => sql`INSERT INTO users ${sql.insert(user)} RETURNING *`
  });

  return Http.router.empty.pipe(
    Http.router.post(
      '/users',
      Http.request.schemaBodyJson(User).pipe(
        Effect.flatMap(addUser),
        Effect.flatMap((users) => Http.response.json(users, { status: 201 }))
      )
    ),
    Http.server.serve()
  );
}).pipe(
  Layer.unwrapEffect,
  Layer.provide(Layer.merge(ServerLive, DbLive)),
  Layer.launch,
  BunRuntime.runMain
);
