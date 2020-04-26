const path = require('path')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const chalk = require('chalk')
const validateProjectName = require('validate-npm-package-name')
const downloadRemote = require('./download.js')
const logSymbols = require('log-symbols')
const Ora = require('ora')
const TPL_TYPE = require('./config/repos')
const inquirerConfigs = require('./config/inquirerConfig')

module.exports = async function create (projectName) {
  const cwd = process.cwd()
  const targetDir = path.resolve(cwd, projectName)
  const name = path.relative(cwd, projectName)

  const result = validateProjectName(name)
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`))
    result.errors && result.errors.forEach(err => {
      console.error(chalk.red.dim('Error: ' + err))
    })
    result.warnings && result.warnings.forEach(warn => {
      console.error(chalk.red.dim('Warning: ' + warn))
    })
    process.exit(1)
  }

  if (fs.existsSync(targetDir)) {
    const { action } = await inquirer.prompt([
      {
        name: 'action',
        type: 'list',
        message: `Target directory ${targetDir} already exists. Pick an action: `,
        choices: [
          {
            name: 'Overwrite', value: 'overwrite'
          },
          {
            name: 'Cancel', value: false
          }
        ]
      }
    ])
    if (!action) {
      return
    } else if (action === 'overwrite') {
      console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
      await fs.remove(targetDir)
    }
  }

  const initChoices = [
    {
      name: 'H5',
      value: 'h5'
    },
    {
      name: 'React',
      value: 'react'
    }
  ]
  const filteredConfigs = inquirerConfigs.filter(item => item.name !== '')

  const { boilerplateType, author, description, version } = await inquirer.prompt([
    {
      name: 'boilerplateType',
      type: 'list',
      default: 'vue',
      choices: [
        ...filteredConfigs,
        ...initChoices
      ],
      message: 'Select the boilerplate type.'
    }, {
      type: 'input',
      name: 'description',
      message: 'Please input your project description.',
      default: 'description',
      validate (val) {
        return true
      },
      transformer (val) {
        return val
      }
    }, {
      type: 'input',
      name: 'author',
      message: 'Please input your author name.',
      default: 'Anonymous',
      validate (val) {
        return true
      },
      transformer (val) {
        return val
      }
    }, {
      type: 'input',
      name: 'version',
      message: 'Please input your version.',
      default: '0.0.1',
      validate (val) {
        const reg = /^\d+\.\d+\.\d+$/i
        const pass = reg.test(val)
        if (pass) {
          return true
        }
        return 'Please enter a valid version'
      },
      transformer (val) {
        return val
      }
    }
  ])

  const remoteUrl = TPL_TYPE[boilerplateType]
  console.log(logSymbols.success, `Creating template of project ${boilerplateType} in ${targetDir}`)
  const spinner = new Ora({
    text: `Download template from ${remoteUrl}\n`
  })

  spinner.start()
  downloadRemote(remoteUrl, projectName).then(res => {
    console.log(res)
    fs.readFile(`./${projectName}/package.json`, 'utf-8', function (err, data) {
      if (err) {
        spinner.stop()
        spinner.error(err)
        return
      }
      const packageJson = JSON.parse(data)
      packageJson.name = projectName
      packageJson.description = description
      packageJson.author = author
      packageJson.version = version

      const updatePackageJson = JSON.stringify(packageJson, null, 2)
      fs.writeFile(`./${projectName}/package.json`, updatePackageJson, function (err) {
        spinner.stop()
        if (err) {
          console.error(err)
        } else {
          console.log(logSymbols.success, chalk.green(`Successfully created project template of ${boilerplateType}\n`))
          console.log(`${chalk.grey(`cd ${projectName}`)}\n${chalk.grey('yarn install')}\n${chalk.grey('yarn serve')}\n`)
        }
        process.exit()
      })
    })
  }).catch((err) => {
    console.log(logSymbols.error, err)
    spinner.fail(chalk.red('Sorry, it must be something error,please check it out. \n'))
    process.exit(-1)
  })
}
