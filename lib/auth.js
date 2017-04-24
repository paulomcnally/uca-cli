/*jslint es6 */

const request = require('request');
const prompt = require('prompt');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const ora = require('ora');
const Help = require('./help');
const progress = require('./progress');

const help = new Help();

class Auth {

  /**
  * Check if cache accessToken exists
  */
  check() {
    let exists = fs.existsSync(this.getFilePath());
    if (!exists) {
      help.error('Requiere Autenticación');
      process.exit(0);
    }
  }

  /**
   * Load accessToken data from .uca file
   */
  accessToken() {
    // check after use accessToken
    this.check();

    // read data
    let data = fs.readFileSync(this.getFilePath(), 'utf8');
    return data;
  }

  /**
  * Directory to download accessToken file
  */
  getDirectory () {
    // set HOME env based OS
    if (process.platform == "win32") {
      process.env.HOME = process.env.USERPROFILE;
    }

    // set directory path
    let directory = process.env.HOME + path.sep + 'Documents' + path.sep;

    // check if exists directory
    if (!fs.existsSync(directory)) {

      // create directory
      fs.mkdirSync(directory);
    }

    return directory;
  };

  /**
  * accessToken file stored path
  */
  getFilePath () {
    let directory = this.getDirectory();
    let fileName = '.uca';
    let filePath = path.join(directory, fileName);
    return filePath;
  };

  /**
  * Store data to .uca file
  */
  save (data) {
    fs.writeFileSync(this.getFilePath(), data, 'utf8');
  };

  /**
  * Resource with base url
  */
  apiResource (resource) {
    return config.api.url + resource;
  }

  /**
  * Sign Up
  */
  signUp () {
    let context = this;

    prompt.start();

    let schema = {
      properties: {
        firstName: {
          description: 'Primer y segundo nombre',
          message: 'Esta información es requerida.',
          required: true
        },
        lastName: {
          description: 'Primer y segundo apellido',
          message: 'Esta información es requerida.',
          required: true
        },
        studentCardNumber: {
          description: 'Número de carnét',
          message: 'Esta información es requerida.',
          required: true
        },
        email: {
          description: 'Correo electrónico',
          message: 'Esta información es requerida.',
          required: true
        },
        password: {
          description: 'Contraseña',
          message: 'Esta información es requerida.',
          required: true,
          hidden: true
        }
      }
    };

    prompt.get(schema, (err, params) => {
      // star progress
      progress.start();

      request.post({
        url: context.apiResource('students'),
        form: params
      }, (err, httpResponse, body) => {
        // stop progress
        progress.stop();

        let json = JSON.parse(body);

        if(err) {
          console.log(err.error.message);
        } else if (json.hasOwnProperty('id')) {
          console.log('Usuario creado con éxito.');
        } else {
          console.log(json);
        }
      });
    });
  }

  /**
  * Sign In
  */
  signIn () {
    let context = this;

    prompt.start();

    let schema = {
      properties: {
        email: {
          description: 'Correo electrónico',
          message: 'Esta información es requerida.',
          required: true
        },
        password: {
          description: 'Contraseña',
          message: 'Esta información es requerida.',
          required: true,
          hidden: true
        }
      }
    };

    prompt.get(schema, (err, params) => {
      // star progress
      progress.start();

      params.ttl = 31556926;

      request.post({
        url: context.apiResource('students/login'),
        form: params
      }, (err, httpResponse, body) => {
        // stop progress
        progress.stop();

        let json = JSON.parse(body);

        if(err) {
          console.log(err.error.message);
        } else if (json.hasOwnProperty('id')) {
          context.save(json.id);
          help.success('Sesión iniciada con éxito.');
        } else {
          console.log(json.error.message);
        }
      });
    });
  }

}

module.exports = Auth;
