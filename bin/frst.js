#!/usr/bin/env node

const chalk = require('chalk')
const semver = require('semver')
const requiredVersion = require('../package.json').engines.node
const didYouMean = require('didyoumean')
const { Command } = require('commander')
const { version } = require('../package.json')
const enhanceErrorMessages = require('../lib/util/enhanceErrorMessages')

didYouMean.threshold = 0.6

function checkNodeVersion (wanted, id) {
  if (!semver.satisfies(process.version, wanted)) {
    console.log(chalk.red(
      'You are using Node ' + process.version + ', but this version of ' + id +
      ' requires Node ' + wanted + '.\nPlease upgrade your Node version.'
    ))
    process.exit(1)
  }
}

checkNodeVersion(requiredVersion, 'frst-cli')

const program = new Command()

program
  .version(version)
  .usage('<command> [options]')

program
  .command('create <app-name>')
  .description('Create a project with template')
  .action((name, cmd) => {
    require('../lib/create')(name)
  })

program.on('--help', () => {
  console.log()
  console.log(`Run ${chalk.cyan('frst <command> --help')} for detailed usage of given command.`)
  console.log()
})

program
  .arguments('<command>')
  .action((cmd) => {
    program.outputHelp()
    console.log('  ' + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
    console.log()
    suggestCommands(cmd)
  })

enhanceErrorMessages('missingArgument', argName => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', optionName => {
  return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
  return `Missing required argument for option ${chalk.yellow(option.flags)}` + (
    flag ? `, got ${chalk.yellow(flag)}` : ''
  )
})

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

function suggestCommands (cmd) {
  const availableCommands = program.commands.map(cmd => {
    return cmd._name
  })

  const suggestion = didYouMean(cmd, availableCommands)
  if (suggestion) {
    console.log(chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`))
  }
}
