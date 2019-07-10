import Element from '@UI/element';
import glossary from '@Project/partials/glossary.md';
import s from './styles.scss';
import PS from 'pubsub-setter';
import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';


export default class Glossary extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'Glossary';
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add(s.glossary);
        view.innerHTML = glossary;
        
              //close button 
        var btn = document.createElement('button');
        btn.classList.add(s.closeGlossary, 'js-close-glossary');
        btn.setAttribute('aria-label','Close glossary');

        view.insertAdjacentElement('afterbegin', btn);

        return view;
    }
    init(){
        this.el.querySelector('.js-close-glossary').addEventListener('click', function(){
            S.setState('showGlossary', false);
        });
        PS.setSubs([
            ['showGlossary', this.toggle.bind(this)]
        ]);
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    toggle(msg,data){
        if ( data ) {
            this.el.classList.add(s.show);
        } else {
            this.el.classList.remove(s.show);
        }
    }
}