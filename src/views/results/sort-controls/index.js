import Element from '@UI/element';
import Sort from '@Project/components/sort'
import s from './styles.scss';
import PS from 'pubsub-setter';
import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';

const sortFields = ['state', 'category', 'topic', 'year', 'name'];

export default class SortControls extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'SortControls';
        this.addChildren(sortFields.map(field => this.createComponent(Sort, 'button#sort-' + field, {renderToSelector: '#sort-wrapper', data: {field}})));
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add(s.sortControls);

        //wrapper
        var wrapper = document.createElement('div');
        wrapper.id = 'sort-wrapper';
        view.appendChild(wrapper);


        //glossary button 
        var btn = document.createElement('button');
        btn.setAttribute('role', 'button');
        btn.setAttribute('aria-expanded', false);
        btn.textContent = 'Show glossary';
        btn.classList.add(s.glossaryBtn, 'js-glossary-btn');

        view.appendChild(btn);
        return view;
    }
    init(){
        this.children[0].isActive = true;
        this.glossaryBtn = this.el.querySelector('.js-glossary-btn');
        this.glossaryBtn.addEventListener('click', function(){
            var currentState = S.getState('showGlossary');
            S.setState('showGlossary', !currentState);
        });
       PS.setSubs([
             ['showGlossary', this.toggle.bind(this)]
         ]);
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    toggle(msg,data){
        if ( data ){
            this.glossaryBtn.textContent = 'Hide glossary';
            this.glossaryBtn.setAttribute('aria-expanded', true);
            this.glossaryBtn.classList.add(s.isOpen);
        } else {
            this.glossaryBtn.textContent = 'Show glossary';
            this.glossaryBtn.setAttribute('aria-expanded', false);
            this.glossaryBtn.classList.remove(s.isOpen);
        }
    }
}