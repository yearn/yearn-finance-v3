# yearn.finance

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
We use i18n react with locize cli to update/download translations
`npm install -g locize-cli`

Refer to main repo for documentation:
https://github.com/locize/locize-cli

Sync with: `npm run syncLocales`

## Contributing

Code style follows prettier conventions (`yarn prettier`). Commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) spec.
.

### Working from a forked repo

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
