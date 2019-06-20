import Element from '@UI/element';
import Facet from '@Project/components/facet';
//import s from './styles.scss';
//import PS from 'pubsub-setter';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';



export default class FilterView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'FilterView';
        this.facets = this.model.nestedData.map(d => {
            return this.createComponent(Facet, 'div.js-search-facet-group', {data: d});
        });
        this.addChildren(this.facets);
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add('wire');
        return view;
    }
    init(){
        this.app.facetItems = this.el.querySelectorAll('.js-facet-item'); // these are rendered and initialized in component/facet
        this.app.updateCounts = this.updateCounts; // elevates updateCounts method to property of app because it is triggered in app
/*        PS.setSubs([
        ]);*/
/*        PS.setSubs([
            ['selectHIA', this.activate.bind(this)]
        ]);*/
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    updateCounts(){ // updateCounts is set in init() to be a method of the App. 
        this.nestData();
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
                    disableFacet();
                    return;
                }
                var match = d.values.find(v => v.key === value);
                if ( match ) {
                    countSpan.textContent = type === 'subtopic' ? match.values.length : match.count;
                    enableFacet();
                } else {
                    countSpan.textContent = 0;
                    disableFacet();
                }
            }
            var countSpan = facet.querySelector('.js-topic-count');
            var type = facet.dataset.type;
            var key = facet.dataset.key;
            var value = facet.dataset.value;
            var datum = this.model.nestedData.find(d => d.key === key);
            if ( type === 'topic' || type === 'state' ) {
                setCountAndStatus(datum, value);
            } else { // type === 'subtopic'
                let subdatum = datum ? datum.values.find(v => v.key === facet.dataset.topic) : null;
                setCountAndStatus(subdatum);
            }
        });
    }
}