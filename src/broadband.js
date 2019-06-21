/* global PUBLICPATH process */
//utils
import Papa from 'papaparse';
import { stateModule as S } from 'stateful-dead';
import * as d3 from 'd3-collection';
import PS from 'pubsub-setter';

//import { publishWindowResize } from '@Utils';

//data 
import data from './data/data.csv';
import dictionary from './data/dictionary.json';
import stateAbbreviations from './data/state-abbreviations.json';

//views
import Sidebar from './views/sidebar/';
import Results from './views/results/';

// app prototype
import PCTApp from '@App';

//static content

const itemsPerPage = 10;

const categories = [
    'state',
    'programmatic',
    'competition',
    'definition',
    'funding',
    'infrastructure',
    'other'
];
const model = {
    dictionary,
    stateAbbreviations
};

function addIDs(data) {
    data.forEach(function(d, i) {
        d.id = i;
    });
}

function getRuntimeData() {
    var publicPath = '';
    if (process.env.NODE_ENV === 'production' && !window.IS_PRERENDERING) { // production build needs to know the public path of assets
        // for dev and preview, assets are a child of root; for build they
        // are in some distant path on sitecore
        publicPath = PUBLICPATH; // TODO: set PUBLICPATH using define plugin in webpack.build.js
    }
    return new Promise((resolveWrapper, rejectWrapper) => {
        Papa.parse(publicPath + data, {
            complete: function(results) {
                addIDs(results.data);
                resolveWrapper(results.data);
            },
            download: true,
            error: function(error, file) {
                rejectWrapper({ error, file });
            },
            header: true,
            skipEmptyLines: true
        });
    });
}

export default class Broadband extends PCTApp {
    prerender() { //App.prerender is called only if env = development or window isPrerendering 
        this.itemsPerPage = itemsPerPage;
        this.getDataAndPushViews();
    }
    sortAlpha(a,b, direction = 'ascending'){
        var sorted = [a,b].sort();
        return direction === 'ascending' ? sorted.indexOf(a) - sorted.indexOf(b) : sorted.indexOf(b) - sorted.indexOf(a);
    }
    sortNum(a,b, direction = 'ascending'){
        if ( direction === 'ascending' ){
            return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
         } else {
            return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
         }
    }
    /*onViewsReady(){
        //adjust heading height
        var height = document.querySelector('.js-dropdown').offsetHeight + document.querySelector('.js-legend').offsetHeight;
        document.querySelector('.js-instruct-heading').style.height = height + 'px';
    }*/
    getDataAndPushViews() {
        function sortCategories(a,b){
            return categories.indexOf(a.category) - categories.indexOf(b.category);
        }
        getRuntimeData.call(this).then((v) => {

            model.data = v.sort((a,b) => this.sortAlpha(a.subtopic,b.subtopic)).sort((a,b) => this.sortAlpha(a.topic,b.topic)).sort(sortCategories).sort((a,b) => this.sortAlpha(a.name,b.name)).sort((a,b) => this.sortAlpha(a.state,b.state));
            /* set data-hash attribute on container on prerender. later on init the hash will be compared against the data fetched at runtime to see
               if it is the same or not. if note the same, views will have to be rerendered. */
            this.model = model;
            this.filters = {
                state: '',
                topic: '',
                subtopic: ''
            };
            if ( window.IS_PRERENDERING ) {
                this.el.setAttribute('data-data-hash', JSON.stringify(v).hashCode()); // hashCode is helper function from utils, imported and IIFE'd in index.js
            } else if (process.env.NODE_ENV === 'production' && this.el.dataset.dataHash != JSON.stringify(v).hashCode()) {
                this.el.setAttribute('data-data-mismatch', true);
                this.model.isMismatched = true;
            }
            this.filterData(null); // using this fn to keep things DRY; will make this.model.filteredData a copy of this.model.data
            this.nestData();
            this.summarizeData();
            this.pushViews();
            if (process.env.NODE_ENV === 'development' || window.IS_PRERENDERING) {
                Promise.all(this.views.map(view => view.isReady)).then(() => {
                    //this.onViewsReady();
                    if (process.env.NODE_ENV === 'development') {
                        this.init();
                    } else {
                        document.dispatchEvent(new Event('all-views-ready'));
                    }
                });
            } else {
                this.views.forEach(view => {
                    console.log('about to init:', view);
                    view.init(this);
                });
                S.setState('page', 1);
            }
        });
    }
    summarizeData(){
        this.model.stateMax = Math.max(...this.model.nestedData.find(d => d.key === 'state').values.map(v => v.values.length));
        this.model.names = d3.nest().key(d => d.name + ' ' + d.state).rollup(v => v.length).object(this.model.data);
    }
    init() {
        this.itemsPerPage = itemsPerPage;
        var env = process.env.NODE_ENV;
        super.init();
        this.bodyEventListenerBind = this.bodyEventListenerHandler.bind(this);
        PS.setSubs([
           ['filter', this.filterData.bind(this)]
        ]);
        if (env !== 'development') {
            this.getDataAndPushViews();
        } else {
            this.views.forEach(view => {
                console.log('about to init:', view);
                view.init(this);
            });
            S.setState('page', 1);
        }
    }
    pushViews() {
        this.views.push(
            this.createComponent(Sidebar, 'div#pct-sidebar'),
            this.createComponent(Results, 'div#pct-results'),
        );
    }
    nestData() {
        /*function sortData(data){
            data.forEach(function(d){
                if ( d.key !== 'state' ){
                    d.values.sort(function(a,b){
                        return b.count - a.count;
                    });
                } 
            });
            return data;
        }*/
        this.model.nestedData = [
            {
                key: 'state',
                values: d3.nest().key(d => d.state).entries(this.model.filteredData)
            },
            ...d3.nest().key(d => d.category).key(d => d.topic).key(d => d.subtopic).entries(this.model.filteredData)
        ];
        this.addFlatCounts();
    }
    setMetadata(field) {
        var set = new Set(this.model.data.map(d => d[field]));
        this.model[field + 's'] = [...set];
    }
    cleanKey(key) {
        console.log(key);
        if (key === undefined) {
            return 'null';
        }
        key = typeof key === 'string' ? key : key[0];
        if (key === '') {
            return 'none';
        }
        key = key.toLowerCase().replace(/['"”’“‘,.!?;()&:/]/g, '').doCamelCase();
        console.log(key);
        return key;
    }
    bodyEventListenerHandler(msg, data) {
        var handler = this.bodyClickClear;
        if (data !== null) {
            document.body.addEventListener('click', handler);
        } else {
            document.body.removeEventListener('click', handler);
        }
    }
    bodyClickClear() {
        if (!document.body.UIControlIsOpen && !S.getState('showAllDetails')) {
            console.log('bodyclick');
            //S.setState('selectPrimaryGroup', null);
        }
    }
    filterData(msg,data){
        if ( msg ){ // user triggers to filter data will include a msg; data will be null to undo a filter or a string to perform a filter; when initializing, the msg will be null
            let toArray = msg.split('.');
            let key = toArray[1];
            if ( data ){
                this.filters[key] = data;
            } else {
                this.filters[key] = '';
            }
        }
        // all topics and subtopics within categories are mutually exclusive, i.e., no items belong to more than one, so this filtering can be pretty simple
        this.model.filteredData = this.model.data.filter(d => {
            return ( this.filters.state === '' || this.filters.state === d.state ) && ( this.filters.topic === '' || this.filters.topic === d.topic ) && ( this.filters.subtopic === '' || this.filters.subtopic === d.subtopic );
        });
        this.listIDs = this.model.filteredData.map(d => 'list-item-' + d.id);
        if ( msg ) {
            this.updateCounts();
            S.setState('listIDs', this.listIDs);
        } 
    }
    addFlatCounts(){
        this.model.nestedData.forEach(category => { // if not a topic (not as state) the count has to iterate over the subtopic values (hence the redice fn); if a state, there are no subtopic values
            category.values.forEach(datum => {
                var count = category.key !== 'state' ? datum.values.reduce(function(acc,cur){
                        return acc + cur.values.length;
                    },0) : datum.values.length;
                datum.count = count;
            });
        });
    }
}