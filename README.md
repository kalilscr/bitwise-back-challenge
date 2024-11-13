## Description

Small project to work with github api.

some technologies used:
- vitest
- mikroorm
- nestjs
- biomejs
- supertest

## Project setup

add a .env file(you can see the variables needed in .env.example) and then:


```bash
$ pnpm install
```

## Compile and run the project

```bash

# up the postgres database image
$ docker compose up

# watch mode
$ pnpm run start:dev

```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

you can also test the routes using insomnia client or the client of your preference(import the Insomnia_2024-11-07.json in the root directory).

## Resources

To generate a token to fully access the github API take a look at the official documentation:

[Github Docs - authenticating-to-the-rest-api](https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api?apiVersion=2022-11-28)

[Github Docs - managing-your-personal-access-tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)


