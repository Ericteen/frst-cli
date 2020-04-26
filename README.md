# frst-cli

> A template downloader cli.

## Getting Started

```bash
$ npx frst-cli create <project-name>
$ cd <project-name>
$ npm install
$ npm run dev
```

or Yarn:

```bash
$ yarn create frst-cli create <project-name>
$ cd <project-name>
$ yarn
$ yarn run dev
```

or add globally:

```bash
$ npm install -g frst-cli
$ frst create <project-name>
```

## Customization

Edit `lib/config/repos.js` and `lib/config/inquirerConfig.js` to add your custom repositories. Then you can download your own template repositories.

e.g.

```js
// inquirerConfig.js
module.exports = [
  {
    name: 'React',
    value: 'react'
  }
]

// repos.js
module.exports = {
  react: 'https://github.com/react-boilerplate/react-boilerplate.git'
}
```