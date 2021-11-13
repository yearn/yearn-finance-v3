# yearn.finance

<img src="https://img.shields.io/badge/dynamic/json.svg?style=plastic&color=2096F3&label=locize&query=%24.translatedPercentage&url=https://api.locize.app/badgedata/e4f1bb87-9ed4-4f7c-8adc-d6ca4a329e52&suffix=%+translated&link=https://www.locize.com" />

## Setup

```
cp .env.example to .env
```

And then populate .env with your endpoints

## Development

```
$ yarn dev
```

## Production

```
$ yarn build
$ yarn start
```

## Translations

We use i18n react with locize cli to update/download translations.

Refer to main repo for documentation:
https://github.com/locize/locize-cli

Sync with: `npm run syncLocales` **must provide api key**

Check sync changes with: `npm run checkLocales`

Download locales with: `npm run downloadLocales`

## Contributing

Code style follows prettier conventions (`yarn prettier`). Commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) spec.
.

### Working from a forked repo

- Getting Started

- set upstream to your fork

`$ git remote add upstream https://github.com/<your-gh>>/yearn-finance-v3`

- set origin to original repo

`$ git remote add origin https://github.com/yearn/yearn-finance-v3.git`

`$ git pull origin master --rebase`

- soft reset to squash your commits (optional)

`$ git reset --soft <SHA of commit prior to your first one>`

`$ git add .`

`$ git commit -S -m "message"`

- push to your fork

`$ git push upstream <branch-name> --force`

- info about verified commits

https://docs.github.com/en/github/authenticating-to-github/managing-commit-signature-verification
