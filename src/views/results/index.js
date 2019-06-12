import Element from '@UI/element';
import s from './styles.scss';
import ListView from './list-view';
//import PS from 'pubsub-setter';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';



export default class Results extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'Results';
        this.addChildren([
            this.createComponent(ListView, 'div#list-view')
        ]);
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add(s.results);
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