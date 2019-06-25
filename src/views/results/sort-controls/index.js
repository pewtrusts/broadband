import Element from '@UI/element';
import Sort from '@Project/components/sort'
//import s from './styles.scss';
//import PS from 'pubsub-setter';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';

const sortFields = ['state', 'category', 'topic', 'year', 'name'];

export default class SortControls extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'SortControls';
        this.addChildren(sortFields.map(field => this.createComponent(Sort, 'button#sort-' + field, {data: {field}})));
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        return view;
    }
    init(){
        this.children[0].isActive = true;
/*        PS.setSubs([
            ['selectHIA', this.activate.bind(this)]
        ]);*/
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
}