const chalk = require('chalk');

class Help {

  success(value) {
    console.log(chalk.green(`✓ ${value}`));
  }

  error(value) {
    console.log(chalk.red(`✗ ${value}`));
  }

  /**
   * Print header name
   */
  header(value) {
    console.log(chalk.white.bold(value.toUpperCase()));
  }

  /**
   * Values
   */
  value(caption, value) {
    console.log(chalk.white.bold(caption) + ': ' + chalk.green(value));
  }

  /**
   * Print command name
   */
  command(value) {
    console.log(chalk.white.bold(`    ${value}`));
  }

  /**
   * Print command description
   */
  description(value) {
    console.log(`    ${value}`);
    console.log('');
  }

  /**
   * Print all commands
   */
  print () {
    // name
    this.header('NOMBRE');
    this.description('uca');

    // commands
    this.header('Comandos');

    // login
    this.command('help');
    this.description('Muestra la auyuda.');

    // login
    this.command('login');
    this.description('Iniciar sesión.');

    // add
    this.command('add');
    this.description('Registro de alumno.');

    // quiz
    this.command('quiz');
    this.description('Evaluación de conocimientos.');

    // points
    this.command('points');
    this.description('Muestra los puntos acumulados por cada exámen.');

    // points group
    this.command('points group');
    this.description('Muestra los puntos acumulados por grupo.');
  }
}

module.exports = Help;
