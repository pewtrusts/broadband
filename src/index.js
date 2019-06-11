/* global process */
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "StringHelpers|FadeInText" }]*/ //allow StringHelpers to be iported (defined) and not being explicitly called
																			// without triggering eslint error
import { StringHelpers } from '@Utils'; // string helpers is an IIFE
import Broadband from './broadband.js';
import './css/styles.scss';


const selector = '#pew-app';
const App = new Broadband(selector, { // extends PCTApp-js. PCTApp-js's constructor method is called, p1 contaiuner, p2 options
	needsRouter: false
});
if ( process.env.NODE_ENV === 'development' || window.IS_PRERENDERING ){ // process development means using WebPack dev server. window is prerendering means in
	console.log('init app prerender');
    App.prerender();
} else {
    App.init();
    console.log('init app init');
}