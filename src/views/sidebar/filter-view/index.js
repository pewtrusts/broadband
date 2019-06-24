import Element from '@UI/element';
import Facet from '@Project/components/facet';
import s from './styles.scss';
import PS from 'pubsub-setter';
import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';



export default class FilterView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'FilterView';
        this.stateFacet = this.createComponent(Facet, 'div.js-search-facet-group', {data: this.model.nestedData.find(d => d.key === 'state'), renderToSelector: '#state-facets-group'});
        this.yearFacet = this.createComponent(Facet, 'div.js-search-facet-group', {data: this.model.nestedData.find(d => d.key === 'year'), renderToSelector: '#year-facets-group'});
        this.topicFacets = this.model.nestedData.filter(d => ['state','year'].indexOf(d.key) === -1).map(d => {
            return this.createComponent(Facet, 'div.js-search-facet-group', {data: d, renderToSelector: '#topic-facets-group'});
        });
        this.addChildren([
            this.stateFacet,
            ...this.topicFacets,
            this.yearFacet
        ]);
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }

        // state group
        var stateGroup = document.createElement('div');
        stateGroup.id = 'state-facets-group';
        view.appendChild(stateGroup);
        
        // topic group
        var group = document.createElement('div');
        group.classList.add(s.topicFacetsGroup, 'has-children');
        group.id = 'topic-facets-group';
        group.innerHTML = '<h2>Categories/Topics</h2>';
        view.appendChild(group);
        
        // year group
        var yearGroup = document.createElement('div');
        yearGroup.id = 'year-facets-group';
        view.appendChild(yearGroup);


        return view;
    }

    init(){
        this.app.facetItems = this.el.querySelectorAll('.js-facet-item'); // these are rendered and initialized in component/facet
        this.app.updateCounts = this.updateCounts; // elevates updateCounts method to property of app because it is triggered in app
/*        PS.setSubs([
        ]);*/
        PS.setSubs([
            ['counts', this.updateFacetGroupStatus.bind(this)]
        ]);
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    updateCounts(){ // updateCounts is set in init() to be a method of the App. 
        this.nestData();
        this.counts = {};
        console.log(this.model.nestedData);
        this.facetItems.forEach(facet => {  
            function disableFacet(){
                facet.setAttribute('disabled', 'disabled');
                facet.isDisabled = true;
            }
            function enableFacet(){
                facet.removeAttribute('disabled');
                facet.isDisabled = false;
            }
            function setCountAndStatus(d){
                if ( !d ){
                    countSpan.textContent = 0;
                    this.counts[facet.dataset.key] = this.counts[facet.dataset.key] ? this.counts[facet.dataset.key] + 0 : 0;  
                    disableFacet();
                    return;
                }
                var match = d.values.find(v => v.key === value);
                if ( match ) {
                    let n = type === 'subtopic' ? match.values.length : match.count;
                    countSpan.textContent = n;
                    this.counts[d.key] = this.counts[d.key] ? this.counts[d.key] + n : n;  
                    enableFacet();
                } else {
                    countSpan.textContent = 0;
                    this.counts[d.key] = this.counts[d.key] ? this.counts[d.key] + 0 : 0;  
                    disableFacet();
                }
            }
            var countSpan = facet.querySelector('.js-topic-count');
            var type = facet.dataset.type;
            var key = facet.dataset.key;
            var value = facet.dataset.value;
            var datum = this.model.nestedData.find(d => d.key === key);
            if ( type === 'topic' || type === 'state' || type === 'year' ) {
                setCountAndStatus.call(this, datum, value);
            } else { // type === 'subtopic'
                let subdatum = datum ? datum.values.find(v => v.key === facet.dataset.topic) : null;
                setCountAndStatus.call(this, subdatum);
            }
        });
        S.setState('counts', this.counts);
    }
    updateFacetGroupStatus(msg, data){
        console.log(msg,data,this.children);
        this.children.forEach(Facet => {
            if ( this.app.counts[Facet.data.key] === 0 ) {
                Facet.isEmpty = true;
            } else {
                Facet.isEmpty = false;
            }
        });
    }
}