# database

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build database` to build the library.

## Running Migrations

To run database migrations, use the NPM script:

```bash
npm run migrate
```

### Environment Variables

The migration script reads the following environment variables with defaults:

| Variable     | Required | Default     | Description                    |
| :----------- | :------: | :---------- | :----------------------------- |
| PG_HOST      |    No    | localhost   | PostgreSQL host                |
| PG_PORT      |    No    | 5432        | PostgreSQL port                |
| PG_DATABASE  |    No    | lems-local  | PostgreSQL database name       |
| PG_USER      |    No    | postgres    | PostgreSQL username            |
| PG_PASSWORD  |    No    | postgres    | PostgreSQL password            |

Example:
```bash
PG_HOST=localhost PG_PORT=5432 PG_DATABASE=lems-local PG_USER=postgres PG_PASSWORD=postgres npm run migrate
```

## Configuring

Applications using this library to connect to a database must have the following env variables defined:

| Variable    | Required |     Default (if optional) |
| :---------- | :------: | ------------------------: |
| MONGODB_URI |    No    | mongodb://127.0.0.1:27017 |
