/* global PUBLICPATH process */
//utils
import Papa from 'papaparse';
import { stateModule as S } from 'stateful-dead';
import * as d3 from 'd3-collection';
//import PS from 'pubsub-setter';

//import { publishWindowResize } from '@Utils';

//data 
import data from './data/data.csv';

//views
import Sidebar from './views/sidebar/';
import Results from './views/results/';

// app prototype
import PCTApp from '@App';

//static content

//publishWindowResize(S);

//const fieldsForMetadata = [{key:'state', parent: null}, {key:'category', parent: null}, {key:'topic', parent: 'category'}, {key:'subtopic', parent: 'topic' }];

const model = {

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
        this.getDataAndPushViews();
    }
    /*onViewsReady(){
        //adjust heading height
        var height = document.querySelector('.js-dropdown').offsetHeight + document.querySelector('.js-legend').offsetHeight;
        document.querySelector('.js-instruct-heading').style.height = height + 'px';
    }*/
    getDataAndPushViews() {
        getRuntimeData.call(this).then((v) => {

            model.data = v;
            /* set data-hash attribute on container on prerender. later on init the hash will be compared against the data fetched at runtime to see
               if it is the same or not. if note the same, views will have to be rerendered. */
            this.model = model;
            if ( window.IS_PRERENDERING ) {
                this.el.setAttribute('data-data-hash', JSON.stringify(v).hashCode()); // hashCode is helper function from utils, imported and IIFE'd in index.js
            } else if (process.env.NODE_ENV === 'production' && this.el.dataset.dataHash != JSON.stringify(v).hashCode()) {
                this.el.setAttribute('data-data-mismatch', true);
                this.model.isMismatched = true;
            }
            this.nestData();
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
            } else { // env === production and window is not prerendering
                this.views.forEach(view => {
                    console.log('about to init:', view);
                    view.init(this);
                });
            }
        });
    }
    init() {
        super.init();
        this.bodyEventListenerBind = this.bodyEventListenerHandler.bind(this);
        /*PS.setSubs([
            
        ]);*/
        if (process.env.NODE_ENV !== 'development') {
            this.getDataAndPushViews();
        }
        console.log(this);
    }
    pushViews() {
        this.views.push(
            this.createComponent(Sidebar, 'div#pct-sidebar'),
            this.createComponent(Results, 'div#pct-results'),
        );
    }
    nestData() {
        this.model.nestedData = d3.nest().key(d => d.category).key(d => d.topic).key(d => d.subtopic).entries(this.model.data);
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
}