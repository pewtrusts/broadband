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
/*        PS.setSubs([
            ['selectHIA', this.activate.bind(this)]
        ]);*/
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
}