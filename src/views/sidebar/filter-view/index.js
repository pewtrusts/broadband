import Element from '@UI/element';
import Facet from '@Project/components/facet';
//import s from './styles.scss';
import PS from 'pubsub-setter';
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
        this.facetItems = this.el.querySelectorAll('.js-facet-item-topic'); // these are rendered and initialized in component/facet
        PS.setSubs([
            ['listIDs', this.updateCounts.bind(this)]
        ]);
/*        PS.setSubs([
            ['selectHIA', this.activate.bind(this)]
        ]);*/
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    updateCounts(){ // updateCounts is a method of the view and not facet components so that it only runs once per update
        /* eslint no-debugger: off */
        this.app.nestData();
        console.log(this.model.nestedData);
        this.facetItems.forEach(facet => {
            var countSpan = facet.querySelector('.js-topic-count');
            var type = facet.dataset.type;
            var key = facet.dataset.key;
            var value = facet.dataset.value;
            var datum = this.model.nestedData.find(d => d.key === key);
            if ( !datum ){
                countSpan.textContent = 0;
                return;
            }
            if ( type === 'topic' || type === 'state' ) {
                let match = datum.values.find(v => v.key === value);
                if ( match ) {
                    countSpan.textContent = match.count || match.values[0].values.length;  // TODO:  not sure why some datums are missing count properties. must be something in app.nestData
                } else {
                    countSpan.textContent = 0;
                }
            }
            if ( value === "Legislative Intent" ){
                debugger;
            }
        });
    }
}