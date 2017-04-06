const ora = require('ora');

const spinner = ora('Espera un momento porfavor...')

class Progress {
  start() {
    spinner.start();
  }

  stop() {
    spinner.stop();
  }
}

module.exports = new Progress();
