'use strict';
var inquirer = require('inquirer');
const request = require('request');
const prompt = require('prompt');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const Api = require('./api');
const Auth = require('./auth');
const Help = require('./help');
const ora = require('ora');
const progress = require('./progress');

let clock = (start) => {
  if ( !start ) return process.hrtime();
  var end = process.hrtime(start);
  return Math.round((end[0]*1000) + (end[1]/1000000));
}

const api = new Api();
const auth = new Auth();
const help = new Help();

class Uca {

  /**
  * Subject
  */
  quiz () {
    let context = this;
    context.subject((subjectId) => {
      context.unity(subjectId, (unityId) => {
        context.getQuestion(unityId);
      });
    });
  }

  /**
  * Subject
  */
  subject (cb) {
    let context = this;

    // star progress
    progress.start();

    // http request
    let subjects = api.get('Subjects', null, auth.accessToken());

    // stop progress
    progress.stop();

    let items = [];

    subjects.forEach((subject) => {
      items.push({
        key: subject.id,
        name: subject.name,
        value: subject.id
      });
    });

    // question options
    var question = {
      type: 'list',
      name: 'subjectId',
      message: 'Selecciona una asignatura.',
      choices: items,
      filter: function (val) {
        return val;
      }
    };

    inquirer.prompt(question).then(function (answers) {
      cb(answers.subjectId);
      //context.unity(answers.subjectId);
    });
  }

  unity(subjectId, cb) {
    let context = this;

    // star progress
    progress.start();

    // http request
    let units = api.get('Units', {
      where: {
        subject_id: subjectId
      }
    }, auth.accessToken());

    // stop progress
    progress.stop();

    let items = [];

    units.forEach((unit) => {
      items.push({
        key: unit.id,
        name: unit.name,
        value: unit.id
      });
    });

    // question options
    var question = {
      type: 'list',
      name: 'unityId',
      message: 'Selecciona una unidad.',
      choices: items,
      filter: function (val) {
        return val;
      }
    };

    inquirer.prompt(question).then(function (answers) {
      cb(answers.unityId);
    });
  }

  getQuestion(unityId) {
    let context = this;

    // star progress
    progress.start();

    // http request
    let question = api.post('Questions/random', {
      unityId: unityId
    }, auth.accessToken());

    let startTime = clock();

    // stop progress
    progress.stop();

    if (question.length == 0) {
      help.success('Ya ha completado esta unidad.');
      process.exit(0);
    } else {
      let items = [];

      question.responses.forEach((response) => {
        items.push({
          key: response.id,
          name: response.text,
          value: response.id
        });
      });

      // question options
      var options = {
        type: 'list',
        name: 'responseId',
        message: question.text,
        choices: items,
        filter: function (val) {
          return val;
        }
      };

      inquirer.prompt(options).then(function (answers) {
        // calculate time
        let seconds = clock(startTime);

        // params to store
        let params = {
          unityId: unityId,
          questionId: question.id,
          responseId: answers.responseId,
          createdAt: new Date(),
          seconds: seconds
        }

        // star progress
        progress.start();

        // store response data
        api.post('Quiz', params, auth.accessToken());

        // stop progress
        progress.stop();

        // call next question
        context.getQuestion(unityId);
      });
    }
  };

  points () {
    let context = this;
    context.subject((subjectId) => {
      context.unity(subjectId, (unityId) => {
        // star progress
        progress.start();

        let points = api.post('Quiz/points', { unityId: unityId }, auth.accessToken());

        // stop progress
        progress.stop();

        help.success(points.points);
      });
    });
  }
}

module.exports = Uca;
