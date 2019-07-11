import Element from '@UI/element';
import s from './styles.scss';
import ListView from './list-view';
import Paginate from './paginate';
import SortControls from './sort-controls';
import Glossary from './glossary';
//import PS from 'pubsub-setter';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';

export default class Results extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'Results';
        this.addChildren([
            this.createComponent(Paginate, 'div#pagination-top', {data: {itemsPerPage: this.app.itemsPerPage}}),
            this.createComponent(SortControls, 'div#sort-controls'),
            this.createComponent(Glossary, 'div#glossary'),
            this.createComponent(ListView, 'div#list-view', {data: {itemsPerPage: this.app.itemsPerPage}}),
            this.createComponent(Paginate, 'div#pagination-bottom', {data: {itemsPerPage: this.app.itemsPerPage}})
        ]);
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add(s.results);
        return view;
    }
    init(){

        //subscribe to secondary dimension , drilldown, details
    }
    
}