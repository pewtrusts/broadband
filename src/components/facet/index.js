import Element from '@UI/element';
import s from './styles.scss';
import arrowSVG from 'html-loader!./arrow.svg';
import PS from 'pubsub-setter';
import { stateModule as S } from 'stateful-dead';
import tippy from 'tippy.js';
//import { GTMPush } from '@Utils';



export default class Facet extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'Facet';
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add(s.facet);
        
        //heading
        var heading = document.createElement('div');
        heading.textContent = this.model.dictionary[this.data.key] || '[Uncategorized]';
        heading.insertAdjacentHTML('beforeend', arrowSVG);
        heading.classList.add('js-facet-heading', s.searchFacetHeading);

        //body
        var body = document.createElement('div');
        body.classList.add(s.searchFacetBody);

        //list
        var list = document.createElement('ul');
        this.data.values.forEach(topic => {
            var listItem = document.createElement('li');
            listItem.innerHTML = `${topic.key} (<span class="js-topic-count">${topic.count}</span>)`;
            listItem.dataset.value = topic.key;
            listItem.dataset.type = this.data.key === 'state' ? 'state' : this.data.key === 'year' ? 'year' : 'topic';
            listItem.dataset.key = this.data.key;
            listItem.classList.add(s.facetItem, 'js-facet-item', 'js-facet-item-topic');
            listItem.setAttribute('role','button');
            if ( this.model.topicToCategory[topic.key] && this.model.topicToCategory[topic.key].definition !== "" ){
                listItem.classList.add(s.hasDefinition);
                let btn = document.createElement('button');
                btn.classList.add('js-definition-button');
                btn.dataset.tippyContent = this.model.topicToCategory[topic.key].definition;
                listItem.appendChild(btn);
            }

            list.appendChild(listItem);
            
            //sublist
            if ( ['state','year'].indexOf(this.data.key) === -1 && topic.values.length > 1 ){ // values are nested by subtopic. all have at least one (key === ''), more if there are actual keys/subtopics
                topic.values.forEach(subtopic => {
                    var subitem = document.createElement('li');
                    subitem.innerHTML = `&nbsp;&nbsp;-- ${subtopic.key} (<span class="js-topic-count">${subtopic.values.length}</span>)`;
                    subitem.classList.add(s.facetItem, 'js-facet-item');
                    subitem.dataset.value = subtopic.key;
                    subitem.dataset.type = 'subtopic';
                    subitem.dataset.key = this.data.key;
                    subitem.dataset.topic = topic.key;
                    subitem.setAttribute('role','button');
                    if ( this.model.topicToCategory[subtopic.key] && this.model.topicToCategory[subtopic.key].definition !== "" ){
                        subitem.classList.add(s.hasDefinition);
                        let btn = document.createElement('button');
                        btn.classList.add('js-definition-button');
                        btn.dataset.tippyContent = this.model.topicToCategory[subtopic.key].definition;
                        subitem.appendChild(btn);
                    }

                    list.appendChild(subitem);
                });
            }
        });

        body.appendChild(list)

        view.appendChild(heading);
        view.appendChild(body);

        return view;
    }
    set isOpen(bool){
        this._isOpen = bool;
        if ( bool ) {
            this.el.classList.add(s.isOpen);
        } else {
            this.el.classList.remove(s.isOpen);
        }
    }
    get isOpen(){
        return this._isOpen;
    }
    set isEmpty(bool) {
        this._isEmpty = bool;
        if ( bool ) {
            this.isOpen = false;
            this.el.classList.add(s.isEmpty);
        } else {
            this.el.classList.remove(s.isEmpty);
        }
    }
    get isEmpty() {
        return this._isEmpty;
    }
    init(){
        var _this = this;
        PS.setSubs([
            ['clearAll', this.clearAllFilters.bind(this)]
        ]);
        this.isOpen = false;
        this.facetHeading = this.el.querySelector('.js-facet-heading');
        this.facetItems = this.el.querySelectorAll('.js-facet-item'); // these are rendered and initialized in component/facet
        this.definitionButtons = this.el.querySelectorAll('.js-definition-button');
       // var _this = this;
        this.facetItems.forEach(item => {
            Object.defineProperty(item, 'isDisabled', { // IE11 is tripping up on writing a property to `item`; says isDisabled is read-only. it may be something to do withthe
                                                        // Nodelist.prototype.forEach polyfill
                value: false,
                writable: true
            });
            item.addEventListener('click', function(e){
                e.stopPropagation();
                if ( this.isDisabled ) {
                    return;
                }
                if ( !this.isSelected ){
                    _this.app.listView.showChurning.call(_this.app.listView, true);
                    S.setState('filter.' + this.dataset.type, this.dataset.value);
                    this.isSelected = true;
                    this.classList.add(s.isSelected);
                } else {
                    _this.app.listView.showChurning.call(_this.app.listView, true);
                    S.setState('filter.' + this.dataset.type, null);
                    this.isSelected = false;
                    this.classList.remove(s.isSelected);
                }
            });
        });
        this.facetHeading.addEventListener('click', () => {
            if ( this.isEmpty ) {
                return;
            }
            this.isOpen = !this.isOpen;
        });
        tippy(this.definitionButtons);
        this.definitionButtons.forEach(btn => {
            btn.addEventListener('click', function(e){
                e.stopPropagation();

            });
        });
    }
    clearAllFilters(msg,data) {
        if ( data ) {
            this.facetItems.forEach(facet => {
                facet.isSelected = false;
                facet.classList.remove(s.isSelected);
                S.setState('filter.' + facet.dataset.type, null);
            });
            this.isOpen = false;
        }
    }
}