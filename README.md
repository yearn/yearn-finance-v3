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

## Contributing

Code style follows prettier conventions (`yarn prettier`). Commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) spec.
.

### Working from a forked repo

- set remote to your fork

`$ git remote set-url origin https://github.com/pentcle/yearn-finance-v3`


- set upstream to original repo 


`$ git remote add upstream https://github.com/yearn/yearn-finance-v3.git`

`$ git pull upstream master --rebase`


- soft reset to squash your commits

`$ git reset --soft <SHA of commit prior to your first one>`

`$ git add .`

`$ git commit -S -m "message"`

`$ git push --force`


- info about verified commits

https://docs.github.com/en/github/authenticating-to-github/managing-commit-signature-verification
