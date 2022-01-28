# yearn.finance

<img src="https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.translatedPercentage&url=https://api.locize.app/badgedata/e4f1bb87-9ed4-4f7c-8adc-d6ca4a329e52&suffix=%+translated&link=https://www.locize.com" />

## Contributing

Code style follows prettier conventions (`yarn prettier`). Commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) spec.

### Initial Setup

- Fork the [original repo](https://github.com/yearn/yearn-finance-v3/) into your GitHub account
- Clone the forked repo from your GitHub account to your local machine

  ```
  git clone https://github.com/<your-gh>/yearn-finance-v3.git
  ```

- Set origin to your fork. This is where you push your changes to. This is done automatically by the step above.

  ```
  git remote add origin https://github.com/<your-gh>/yearn-finance-v3
  ```

- Set upstream to original repo.

  ```
  git remote add upstream https://github.com/yearn/yearn-finance-v3.git
  ```

- Create `.env` file in root directory of repo then copy contents of `.env.example` to `.env`
  ```
  cp .env.example .env
  ```
  - `REACT_APP_INFURA_PROJECT_ID` should remain blank because we are currently using Alchemy as our provider

### Making Changes

- Create a new local branch from upstream/develop for each PR that you will submit
  ```
  git fetch
  git checkout -b <your branch name> upstream/develop
  ```
- Commit your changes as you work
  ```
  git add .
  git commit -S -m "message"
  ```
  - [info about verified commits](https://docs.github.com/en/github/authenticating-to-github/managing-commit-signature-verification)

### Pushing Changes to your Repo

- Commits are squashed when PR is merged so rebasing is optional
- When ready to push
  ```
  git fetch
  git merge upstream/develop
  git push origin <branch-name>
  ```

### Submitting Pull Request

- Go to your GitHub and navigate to your forked repo
- Click on `Pull requests` and then click on `New pull request`
- Click on `compare across forks`
- Click on `compare:` and select branch that you want to create a pull request for then click on `create pull request`

## Development

```
yarn dev
```

- To enable Dev Mode set `REACT_APP_ALLOW_DEV_MODE=true` in your `.env`
- Wallet Address Override can be activated by navigating to Settings in the app and clicking `Enable Dev Mode`

## Production

```
yarn build
yarn start
```

## Translations

We use i18n react with locize cli to update/download translations.

Refer to main repo for documentation:
https://github.com/locize/locize-cli

Sync with: `npm run syncLocales` **must provide api key**

Check sync changes with: `npm run checkLocales`

Download locales with: `npm run downloadLocales`
