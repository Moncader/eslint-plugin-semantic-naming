'use strict';

var rule = require('../../../lib/rules/semantic-naming');
var eslint = require("eslint").linter;
var RuleTester = require("eslint").RuleTester;

var tTester = new RuleTester(eslint);
tTester.run('semantic-naming', rule, {
  valid: [
    // Parameters
    'function foo(pArg1, pArg2) {}',
    'var tMyFunction = function foo(pArg1, pArg2) {}',

    // Members
    'var mFoo = 1;var tHello = mFoo;function test() {var mBar = mFoo;function meme(){var tHoo = mBar;}}',

    // Locals
    'var tFoo = 1;var tBar = tFoo;',

    // Constants
    'var MY_CONSTANT_123 = 23;',

    // Counters
    'var i, il;',

    // Whitelisted
    {
      code: 'function foo(pArg1, global) {}',
      options: [{whitelist: ['global']}]
    },
    {
      code: 'function foo() {var global = 1;}',
      options: [{whitelist: ['global']}]
    },
    {
      code: 'function foo() {var global = 1;function bar(){console.log(global);}}',
      options: [{whitelist: ['global']}]
    },
    {
      code: 'var global = 1;',
      options: [{whitelist: ['global']}]
    }
  ],

  invalid: [
    // Length check
    {
      code: 'function foo(p) {}',
      errors: [{message: "'p' must have a length of 2 or more"}]
    },

    // Second char check
    {
      code: 'function foo(parg) {}',
      errors: [{message: "The second character of 'parg' must be a capital letter or a digit"}]
    },

    // Parameters
    {
      code: 'function foo(arg1, pArg2) {}',
      errors: [{message: "Parameter 'arg1' must be prefixed with 'p'"}]
    },
    {
      code: 'var tMyFunction = function foo(pArg1, arg2) {}',
      errors: [{message: "Parameter 'arg2' must be prefixed with 'p'"}]
    },

    // Members
    {
      code: 'var tFoo = 1;var tHello = tFoo;function test() {var tBar = tFoo;}',
      errors: [{message: "Member or Closure Variable 'tFoo' must be prefixed with 'm or c'"}]
    },

    // Locals
    {
      code: 'var mFoo = 1; var tBar = mFoo;',
      errors: [{message: "Local 'mFoo' must be prefixed with 't'"}]
    }
  ]
});
