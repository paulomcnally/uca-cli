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
    }, auth.accessToken(), 'filter');

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

  /**
   * Me
   */
  me () {
    // star progress
    progress.start();

    let me = api.get('students/me', null, auth.accessToken());

    // stop progress
    progress.stop();

    console.log(me);
  }

  /**
  * WorkGroups
  */
  workGroups (subjectId, groupId, cb) {
    let context = this;

    // star progress
    progress.start();

    // http request
    let workGroups = api.get('WorkGroups', {
      where: {
        subjectId: subjectId,
        groupId: groupId
      }
    }, auth.accessToken(), 'filter');

    // stop progress
    progress.stop();

    let items = [];

    workGroups.forEach((workGroup) => {
      items.push({
        key: workGroup.id,
        name: workGroup.name,
        value: workGroup.id
      });
    });

    // question options
    var question = {
      type: 'list',
      name: 'workGroupId',
      message: 'Selecciona un grupo de trabajo.',
      choices: items,
      filter: function (val) {
        return val;
      }
    };

    inquirer.prompt(question).then(function (answers) {
      cb(answers.workGroupId);
    });
  }

  /**
  * Groups
  */
  groups (subjectId, cb) {
    let context = this;

    // star progress
    progress.start();

    // http request
    let groups = api.get('Groups', {
      where: {
        subjectId: subjectId
      }
    }, auth.accessToken(), 'filter');

    // stop progress
    progress.stop();

    let items = [];

    groups.forEach((group) => {
      items.push({
        key: group.id,
        name: group.code,
        value: group.id
      });
    });

    // question options
    var question = {
      type: 'list',
      name: 'groupId',
      message: 'Selecciona un grupo.',
      choices: items,
      filter: function (val) {
        return val;
      }
    };

    inquirer.prompt(question).then(function (answers) {
      cb(answers.groupId);
    });
  }

  /**
  * WorkGroup Evaluations
  */
  workGroupEvaluations (unityId, workGroupId) {
    let context = this;

    // star progress
    progress.start();

    // http request
    let evaluations = api.get('WorkGroupEvaluations', {
      where: {
        unityId: unityId,
        workGroupId: workGroupId
      },
      include: [
        'topic'
      ]
    }, auth.accessToken(), 'filter');

    // stop progress
    progress.stop();

    let totalPoints = 0;
    let totalPointsEarned = 0;

    evaluations.forEach((evaluation) => {
      totalPoints = totalPoints + evaluation.points;
      totalPointsEarned = totalPointsEarned  + evaluation.pointsEarned;
      help.value(evaluation.topic.text, evaluation.pointsEarned + ' de ' + evaluation.points + ' | ' + evaluation.observation);
    });

    if (totalPoints === 0) {
      help.error('Esta unidad aún no se ha evaluado.');
    } else {
      help.value('TOTAL', totalPointsEarned + ' de ' + totalPoints);
    }
  }

  //WorkGroup Evaluations
  groupPoints () {
    let context = this;
    context.subject((subjectId) => {
      context.unity(subjectId, (unityId) => {
        context.groups(subjectId, (groupId) => {
          context.workGroups(subjectId, groupId, (workGroupId) => {
            context.workGroupEvaluations(workGroupId, unityId);
          });
        });
      });
    });
  }

}

module.exports = Uca;
