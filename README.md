# APEx Algorithms Catalogue Web

A portal website for discovering APEx Algorithms.

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

To deploy the website, run the [`Deployment`](https://github.com/ESA-APEx/apex-algorithms-catalogue-web/actions/workflows/deployment.yml) workflow manually. The site URL is https://algorithms-catalogue.apex.esa.int/.

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
| `npm run test`            | Run UI test using Playwright                                                                       |
| `npm run download-source` | Download contents from ESA-APEx/apex_algorithms repository, and store them in `./contents/` folder |