import Element from '@UI/element';
import s from './styles.scss';
import FilterView from './filter-view';
import MapView from './map-view';
//import PS from 'pubsub-setter';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';



export default class Sidebar extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'Sidebar';
        this.addChildren([
            this.createComponent(MapView, 'div#map-view'),
            this.createComponent(FilterView, 'div#filter-view')
        ]);
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add(s.sidebar);
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