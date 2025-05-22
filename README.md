# FAIR Data Point E2E Tests

> E2E test suite for the [FAIR Data Point][1], [FAIR Data Point Client][2], based on [Cypress][4].


## Project Structure

- `/cypress`
    - Contains all test files following the standard [Cypress structure](https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Support-file).
- `/fdp`
    - Contains the configuration to run FDP and other associated services in Docker.
    - The actual docker compose.yml file is generated during initialization.
- `/scripts`
    - Additional utility scripts.
- `/cypress.json`
    - Contains the default configuration and env.
    - You can overwrite env values [with a `cypress.env.json` file](https://docs.cypress.io/guides/guides/environment-variables.html#Option-2-cypress-env-json).


## Environment Variables

When initializing the `compose.yml` file, the following ENV variables can be used to choose different images to test.

| Name | Example | Default |
| --- | --- | --- |
| SERVER_VERSION | `1.16` | `develop` |
| CLIENT_VERSION | `1.16` | `develop` |

## Running the tests

Makefile contains several commands to work with the project.

- `make install` - install all the dependencies to run the tests
- `make init` - initialize docker compose file so that the project can run
- `make start` - start all containers
- `make stop` - stop all containers
- `make run` - run tests in headless mode
- `make open` - open Cypress app, good for local development
- `make ci` - shortcut for the whole workflow in CI
- `make clean` - clean all generated files

For convenience, it is also possible to run the tests through `npm run test`.
To add [cypress cli options][5], use `--`, e.g. `npm run test -- <cypress options>`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for more details.


[1]: https://github.com/FAIRDataTeam/FAIRDataPoint
[2]: https://github.com/FAIRDataTeam/FAIRDataPoint-client
[4]: https://www.cypress.io
[5]: https://docs.cypress.io/app/references/command-line#Commands
