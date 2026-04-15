# APEx Algorithm Catalogue

A portal website for discovering algorithms onboarded onto APEx.

## Development

Follow these steps to start developing the site:

1. Install Volta for Nodejs version manager. Follow the guidelines here https://docs.volta.sh/guide/getting-started.

2. Install the Nodejs with correct version using Volta:

```sh
$ volta install node@20.17.0
```

3. Clone the repository.

```sh
$ git clone git@github.com:ESA-APEx/apex-algorithms-catalogue-web.git
$ cd apex-algorithms-catalogue-web
```

4. Install dependencies.

```sh
$ npm install
```

5. Run the dev server.

```sh
$ npm run dev
```

6. Preview the homepage url `https://localhost:4321/algorithms-catalogue` on your browser.

## UI Testing

This project uses [Playwright](https://playwright.dev/) for UI testing. The test scripts are stored in `tests` folder.

Before running the tests, install the Playwright first:

```sh
$ npx playwright install --with-deps
```

After the installation, the tests can be run using command below:

```sh
$ npm run test
```

## CI/CD

The [`Test & build`](https://github.com/ESA-APEx/apex-algorithms-catalogue-web/actions/workflows/build.yml) workflow will run every time a new commit is detected in the main branch. This workflow will run the UI testing, create a release tag, and build + push a docker image to a registry automatically. The image version is determined using semver version and conventional commits. Read more details about the versioning system here https://www.conventionalcommits.org/en/v1.0.0/.

To deploy the website, follow these steps:

- Go to this repo https://github.com/ESA-APEx/Terraform-Projects/.
- Change the image version here https://github.com/ESA-APEx/Terraform-Projects/blob/main/algorithms-catalogue-web/locals.tf. You can specify different versions for dev and prod envs.
- Push the changes to the main branch. The deployment workflow will be running automatically.

> - Prod url: https://algorithm-catalogue.apex.esa.int/
> - Dev url: https://algorithm-catalogue.dev.apex.esa.int/

## Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                                                                             |
| :------------------------ | :------------------------------------------------------------------------------------------------- |
| `npm install`             | Install dependencies                                                                               |
| `npm run dev`             | Start local dev server at `localhost:4321`                                                         |
| `npm run build`           | Build your production site to `./dist/`                                                            |
| `npm run preview`         | Preview your build locally, before deploying                                                       |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check`                                                   |
| `npm run astro -- --help` | Get help using the Astro CLI                                                                       |
| `npm run test`            | Run all tests                                                                                      |
| `npm run test-unit`       | Run unit tests using Vitest                                                                        |
| `npm run test-e2e`        | Run E2E tests using Playwright                                                                     |
| `npm run download-source` | Download contents from ESA-APEx/apex_algorithms repository, and store them in `./contents/` folder |

## API Documentation

### Endpoints

#### `GET /api/services/benchmarks.json`

##### Description

Retrieves the latest benchmark status for each scenario.

##### Response

- **200 OK**: Returns a JSON array of benchmark status per scenario.
- **500 Internal Server Error**: Error fetching benchmark data.

##### Example Response

```json
[
  {
    "scenario_id": "service_1",
    "status": "healthy",
    "last_test_datetime": "2024-11-24T16:47:28.000Z"
  }
]
```

##### Response Fields

- `scenario_id` (string): The unique identifier of the scenario.
- `status` (string): The status of the benchmark ('health', 'warning', 'critical', or 'no benchmark').
- `last_test_datetime` (string): The datetime of the most recent test run in ISO 8601 format.

#### `GET /api/services/{id}/benchmarks.json`

##### Description

Retrieves benchmark data for a specified service or scenario, limited to successful runs within the default time period.

##### Parameters

- `id` (path parameter): The unique identifier of the service or scenario.

##### Response

- **200 OK**: Returns a JSON object of benchmark data.
- **500 Internal Server Error**: Error fetching benchmark data.

##### Example Response

```json
{
  "service_id": "service_1",
  "data": [
    {
      "cpu": 107,
      "memory": 390564,
      "costs": 4,
      "duration": 195.48,
      "input_pixel": 2.95,
      "max_executor_memory": 1.54,
      "network_received": 7047668,
      "area_size": 100.5,
      "start_time": "2024-11-24T16:47:28.000Z",
      "scenario_id": "service_1"
    }
  ]
}
```

##### Response Fields

- `service_id` (string): The ID of the service for which data is retrieved.
- `data` (array): An array of benchmarking data objects, each containing:
  - `cpu` (number): CPU usage in seconds.
  - `costs` (number): Costs associated with the benchmark.
  - `memory` (number): Memory usage in MB-seconds.
  - `duration` (number): Duration of the test in seconds.
  - `start_time` (string): The start time of the test in ISO 8601 format.
  - `input_pixel` (number): Input pixel usage in mega-pixels.
  - `max_executor_memory` (number): Maximum executor memory used in GB.
  - `network_received` (number): Amount of data received over the network in bytes.
  - `area_size` (number): Area size in square kilometers.
  - `scenario_id` (string): The scenario ID for this benchmark entry.

### Admin API Endpoints

The admin API endpoints provide advanced querying capabilities with additional features like date filtering.

#### `GET /api/admin/services/benchmarks.json`

##### Description

Retrieves comprehensive benchmark statistics from all services with date filtering.

##### Query Parameters

- `start` (string, optional): Start date for filtering in YYYY-MM-DD format.
- `end` (string, optional): End date for filtering in YYYY-MM-DD format.

##### Response

- **200 OK**: Returns a JSON object with benchmark data.
- **400 Bad Request**: Invalid query parameters.
- **500 Internal Server Error**: Error fetching benchmark data.

##### Example Response

```json
[
  {
    "runs": 100,
    "scenario_id": "service_1",
    "success_count": 90,
    "failed_count": 10,
    "last_test_datetime": "2024-11-24T16:47:28.000Z",
    "last_test_phase": "run-job",
    "status": "healthy"
  }
]
```

##### Response Fields

- `runs` (number): The total number of test runs.
- `scenario_id` (string): The unique identifier of the scenario.
- `success_count` (number): The total count of successful runs.
- `failed_count` (number): The total count of failed runs.
- `last_test_datetime` (string): The datetime of the most recent test run in ISO 8601 format.
- `last_test_phase` (string): The phase of the most recent test run.
- `status` (string): The status of the most recent test run ('healthy', 'warning', 'critical', or 'no benchmark').

#### `GET /api/admin/services/{id}/benchmarks.json`

##### Description

Retrieves detailed benchmark data for a specific scenario with date filtering.

##### Path Parameters

- `id` (string): The unique identifier of the scenario.

##### Query Parameters

- `start` (string, optional): Start date for filtering in YYYY-MM-DD format.
- `end` (string, optional): End date for filtering in YYYY-MM-DD format.

##### Response

- **200 OK**: Returns a JSON array with detailed benchmark data.
- **400 Bad Request**: Invalid query parameters or scenario ID.
- **500 Internal Server Error**: Error fetching benchmark data.

##### Example Response

```json
[
  {
    "cpu": 107,
    "memory": 390564,
    "costs": 4,
    "duration": 195.48,
    "input_pixel": 2.95,
    "max_executor_memory": 1.54,
    "network_received": 7047668,
    "start_time": "2024-11-24T16:47:28.000Z",
    "test_phase_end": "run-job",
    "test_outcome": "passed",
    "status": "healthy"
  }
]
```

##### Response Fields

- `cpu` (number): CPU usage in seconds.
- `memory` (number): Memory usage in MB-seconds.
- `costs` (number): Costs associated with the benchmark.
- `duration` (number): Duration of the test in seconds.
- `input_pixel` (number): Input pixel usage in mega-pixels.
- `max_executor_memory` (number): Maximum executor memory used in GB.
- `network_received` (number): Amount of data received over the network in bytes.
- `start_time` (string): The start time of the test in ISO 8601 format.
- `test_phase_end` (string): The phase in which the test ended (e.g., 'create-job', 'run-job').
- `test_outcome` (string): The outcome of the test (e.g., 'passed', 'failed').
- `status` (string): Status of the benchmark ('health', 'warning', 'critical', or 'no benchmark').
