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

Retrieves aggregated benchmark statistics from all services, grouped by service ID or scenario ID.

##### Response

- **200 OK**: Returns a JSON array of benchmark statistics.
- **500 Internal Server Error**: Error fetching benchmark data.

##### Example Response

```json
[
  {
    "runs": 100,
    "scenario_id": "service_1",
    "success_count": 90,
    "failed_count": 10
  }
]
```

##### Response Fields

- `runs` (number): The total number of test runs.
- `scenario_id` (string): The unique identifier of the service or scenario.
- `success_count` (number): The total count of successful runs.
- `failed_count` (number): The total count of failed runs.

#### `GET /api/services/{id}/benchmarks.json`

##### Description

Retrieves aggregated benchmark statistics from a specified service.

#### Parameters

- `id` (path parameter): The unique identifier of the service or scenario.

##### Response

- **200 OK**: Returns a JSON object of benchmark statistics.
- **500 Internal Server Error**: Error fetching benchmark data.

##### Example Response

```json
{
  "scenario": "service_1",
  "data": [
    {
      "cpu": 107,
      "memory": 390564,
      "costs": 4,
      "duration": 195.48,
      "input_pixel": 2.95,
      "max_executor_memory": 1.54,
      "network_received": 7047668,
      "start_time": "2024-11-24T16:47:28.000Z",
      "status": "success"
    },
    {
      "cpu": 174,
      "memory": 602696,
      "costs": 4,
      "duration": 155.36,
      "input_pixel": 2.95,
      "max_executor_memory": 1.57,
      "network_received": 1414923468,
      "start_time": "2024-11-19T20:44:02.000Z",
      "status": "success"
    }
  ]
}
```

##### Response Fields

- `scenario_id` (string): The ID of the scenario for which data is retrieved.
- `data` (array): An array of benchmarking data objects, each containing:
  - `cpu` (number): CPU usage in seconds.
  - `costs` (number): Costs associated with the benchmark.
  - `memory` (number): Memory usage in MB-seconds.
  - `duration` (number): Duration of the test in seconds.
  - `start_time` (string): The start time of the test in ISO 8601 format.
  - `input_pixel` (number): Input pixel usage in mega-pixels.
  - `max_executor_memory` (number): Maximum executor memory used in GB.
  - `network_received` (number): Amount of data received over the network in bytes.
  - `status` (string): Status of the benchmark ('success' or 'failed').

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
{
  "data": [
    {
      "scenario_id": "service_1",
      "runs": 100,
      "success_count": 90,
      "failed_count": 10,
      "success_rate": 90.0
    }
  ]
}
```

#### `GET /api/admin/scenarios/{id}/benchmarks.json`

##### Description

Retrieves detailed benchmark data for a specific scenario with date filtering.

##### Path Parameters

- `id` (string): The unique identifier of the scenario.

##### Query Parameters

- `start` (string, optional): Start date for filtering in YYYY-MM-DD format.
- `end` (string, optional): End date for filtering in YYYY-MM-DD format. Required if `start` is provided.
- `status` (string, optional): Filter by benchmark status. Valid values: `passed`, `failed`, `all`. Default: `all`.
- `limit` (number, optional): Number of results per page. Range: 1-1000. Default: 100.
- `offset` (number, optional): Number of results to skip for pagination. Default: 0.
- `sort` (string, optional): Field to sort by. Valid values: `start_time`, `duration`, `cpu`, `memory`, `costs`, `status`. Default: `start_time`.
- `order` (string, optional): Sort order. Valid values: `asc`, `desc`. Default: `desc`.
- `include_aggregates` (boolean, optional): Include aggregate statistics in response. Default: false.

##### Response

- **200 OK**: Returns a JSON object with detailed benchmark data and metadata.
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
    "status": "passed"
  }
]
```

##### Admin Response Fields

**Data Fields**:

- `cpu` (number): CPU usage in seconds.
- `memory` (number): Memory usage in MB-seconds.
- `costs` (number): Costs associated with the benchmark.
- `duration` (number): Duration of the test in seconds.
- `input_pixel` (number): Input pixel usage in mega-pixels.
- `max_executor_memory` (number): Maximum executor memory used in GB.
- `network_received` (number): Amount of data received over the network in bytes.
- `start_time` (string): The start time of the test in ISO 8601 format.
- `status` (string): Status of the benchmark ('passed' or 'failed').
