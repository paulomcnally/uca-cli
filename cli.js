#!/usr/bin/env node
'use strict';
const meow = require('meow');
const Auth = require('./lib/auth');
const Uca = require('./lib/uca');
const Help = require('./lib/help');


// instance class
let auth = new Auth();
let uca = new Uca();
let help = new Help();


const cli = meow(`ddd`, {
  alias: {
    h: 'type'
  }
});

switch (cli.input[0]) {
  case 'help':
    help.print();
  break;
  case 'login':
    auth.signIn();
  break;
  case 'add':
    auth.signUp();
  break;
  case 'quiz':
    uca.quiz();
  break;

  case 'points':
    uca.points();
  break;
  default:
    help.print();
}
