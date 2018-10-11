'use strict';
define([
  'bowser',
  'signin/signin',
  '../../public/css/gemtc-drugis.css',
  'font-awesome/css/font-awesome.min.css'
], function(bowser, singinModule) {
  window.bowser = bowser;
  singinModule.initialize();
});
