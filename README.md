# FAIR Data Point E2E Tests

> E2E test suite for the [FAIR Data Point][1], [FAIR Data Point Client][2], based on [Cypress][4].


## Project Structure

- `/cypress`
    - Contains all test files following the standard [Cypress structure](https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests.html#Support-file).
- `/compose`
    - Git [submodule] of the [FAIRDataTeam/compose] repository, containing docker compose files for the FDP stack.
- `/cypress.json`
    - Contains the default configuration and env.
    - You can overwrite env values [with a `cypress.env.json` file](https://docs.cypress.io/guides/guides/environment-variables.html#Option-2-cypress-env-json).

## Cloning the project

Because the project uses git submodules, the easiest way to clone in one go is as follows:

```bash
git clone --recurse-submodules <project-url>
```

For more information on working with git submodules, see the corresponding section in the [git book].

## Environment Variables

End-to-end tests are run against a local FDP stack running in docker containers defined in the [FAIRDataTeam/compose] repo.

These docker compose files use the latest available images, but you can override the image version by specifying any of the following environment variables:

- `FDP_VERSION`
- `FDP_CLIENT_VERSION`

For example:

```bash
export FDP_VERSION=1.20.2
```

## Running the tests

1. Run the docker compose file corresponding to the stack you want to test.
   ```bash
   cd compose/fdp/ephemeral/v1
   docker compose up -d 
   ```
   See [FAIRDataTeam/compose] for detailed instructions on other available stacks.
2. Run the tests using npm's `npx`:
   ```bash
   npx cypress run [options]
   ```
   See [cypress run docs] and [cypress cli options] for more info.
3. Tear down the FDP compose stack when finished
   ```bash
   docker compose down [--volumes]
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for more details.


[1]: https://github.com/FAIRDataTeam/FAIRDataPoint
[2]: https://github.com/FAIRDataTeam/FAIRDataPoint-client
[4]: https://www.cypress.io
[cypress run docs]: https://docs.cypress.io/app/references/command-line#How-to-run-commands
[cypress cli options]: https://docs.cypress.io/app/references/command-line#Commands
[git book]: https://git-scm.com/book/en/v2/Git-Tools-Submodules#_cloning_submodules
[submodule]: https://git-scm.com/docs/gitsubmodules
[FAIRDataTeam/compose]: https://github.com/FAIRDataTeam/compose
