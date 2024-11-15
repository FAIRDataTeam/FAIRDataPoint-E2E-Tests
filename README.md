# FAIR Data Point E2E Tests

> E2E test suite for the [FAIR Data Point](https://github.com/FAIRDataTeam/FAIRDataPoint), [FAIR Data Point Client](https://github.com/FAIRDataTeam/FAIRDataPoint-client) and [Open Refine Metadata Extension](https://github.com/FAIRDataTeam/OpenRefine-metadata-extension) based on [Cypress](https://www.cypress.io).


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

| ENV | Default |
| --- | --- |
| SERVER_IMAGE | `fairdata/fairdatapoint:develop` |
| CLIENT_IMAGE | `fairdata/fairdatapoint-client:develop` |
| OPEN_REFINE_IMAGE | `fairdata/openrefine-metadata-extension:develop` |

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for more details.
