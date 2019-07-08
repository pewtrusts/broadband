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
import topicToCategory from './data/topic-to-category.json';

//views
import Sidebar from './views/sidebar/';
import Results from './views/results/';

// app prototype
import PCTApp from '@App';

//static content

const itemsPerPage = 10;

const categories = [
    'programmatic',
    'competition',
    'definition',
    'funding',
    'infrastructure',
    'other',
];
const model = {
    dictionary,
    stateAbbreviations,
    topicToCategory
};

function addIDs(data) {
    data.forEach(function(d, i) {
        d.id = i;
    });
}
function addCategories(data) {
    data.forEach(function(d){
        d.category = topicToCategory[d.topic] ? topicToCategory[d.topic].category : '';
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
                addCategories(results.data);
                resolveWrapper(results.data);
            },
            download: true,
            error: function(error, file) {
                rejectWrapper({ error, file });
            },
            header: true,
            skipEmptyLines: true,
            transform: function(value, header){
                if ( header === 'year' && value === '' ) {
                    return 'Not specified';
                }
                return value;
            }
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
    sortTopics(a,b){
        if ( this.model.topicToCategory[a] === undefined && this.model.topicToCategory[b] === undefined ) {
            return this.sortAlpha(a,b,'ascending');
        }
        if ( this.model.topicToCategory[a] === undefined ) {
            return 1;
        }
        if ( this.model.topicToCategory[b] === undefined ) {
            return -1;
        }
        return this.model.topicToCategory[a].order - this.model.topicToCategory[b].order;
    }
    /*onViewsReady(){
        //adjust heading height
        var height = document.querySelector('.js-dropdown').offsetHeight + document.querySelector('.js-legend').offsetHeight;
        document.querySelector('.js-instruct-heading').style.height = height + 'px';
    }*/
    sortCategories(a,b){
        return categories.indexOf(a.category) - categories.indexOf(b.category);
    }
    getDataAndPushViews() {
        getRuntimeData.call(this).then((v) => {

            model.data = v.sort((a,b) => this.sortAlpha(a.subtopic,b.subtopic)).sort((a,b) => this.sortAlpha(a.topic,b.topic)).sort(this.sortCategories).sort((a,b) => this.sortAlpha(a.name,b.name)).sort((a,b) => this.sortAlpha(a.state,b.state));
            /* set data-hash attribute on container on prerender. later on init the hash will be compared against the data fetched at runtime to see
               if it is the same or not. if note the same, views will have to be rerendered. */
            this.model = model;
            this.filters = {
                state: '',
                topic: '',
                subtopic: '',
                year: ''
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
            ...d3.nest().key(d => d.category).sortKeys((a,b) => this.sortCategories({category: a},{category: b})).key(d => d.topic).sortKeys(this.sortTopics.bind(this)).key(d => d.subtopic).sortKeys(this.sortTopics.bind(this)).entries(this.model.filteredData),
            {
                key: 'year',
                values: d3.nest().key(d => d.year).sortKeys((a,b) => this.sortNum(a,b,'descending')).entries(this.model.filteredData)
            }
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
            return ( this.filters.state === '' || this.filters.state === d.state ) && ( this.filters.topic === '' || this.filters.topic === d.topic ) && ( this.filters.subtopic === '' || this.filters.subtopic === d.subtopic ) && ( this.filters.year === '' || this.filters.year === d.year );
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
                var count = ['state','year'].indexOf(category.key) === -1 ? datum.values.reduce(function(acc,cur){
                        return acc + cur.values.length;
                    },0) : datum.values.length;
                datum.count = count;
            });
        });
    }
}