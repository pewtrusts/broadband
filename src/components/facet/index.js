import Element from '@UI/element';
import s from './styles.scss';
//import PS from 'pubsub-setter';
import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';



export default class Facet extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'Facet';
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add('wire');
        
        //heading
        var heading = document.createElement('div');
        heading.textContent = this.data.key;
        heading.classList.add(s.searchFacetHeading);

        //body
        var body = document.createElement('div');
        body.classList.add(s.searchFacetBody);

        //list
        var list = document.createElement('ul');
        this.data.values.forEach(topic => {
            var listItem = document.createElement('li');
            listItem.innerHTML = `${topic.key} (<span class="js-topic-count">${topic.count}</span>)`;
            listItem.dataset.value = topic.key;
            listItem.dataset.type = this.data.key === 'state' ? 'state' : 'topic';
            listItem.dataset.key = this.data.key;
            listItem.classList.add(s.facetItem, 'js-facet-item', 'js-facet-item-topic');
            listItem.setAttribute('role','button');

            
            //sublist
            if ( this.data.key !== 'state' && topic.values.length > 1 ){ // values are nested by subtopic. all have at least one (key === ''), more if there are actual keys/subtopics
                let sublist = document.createElement('ul');
                topic.values.forEach(subtopic => {
                    var subitem = document.createElement('li');
                    subitem.textContent = `${subtopic.key} (${subtopic.values.length})`;
                    subitem.classList.add('js-facet-item');
                    subitem.dataset.value = subtopic.key;
                    subitem.dataset.type = 'subtopic';
                    subitem.setAttribute('role','button');

                    sublist.appendChild(subitem);
                });
                listItem.appendChild(sublist);
            }

            list.appendChild(listItem);
        });

        body.appendChild(list)

        view.appendChild(heading);
        view.appendChild(body);

        return view;
    }
    init(){
        this.facetItems = this.el.querySelectorAll('.js-facet-item'); // these are rendered and initialized in component/facet
       // var _this = this;
        this.facetItems.forEach(item => {
            item.addEventListener('click', function(e){
                e.stopPropagation();
                if ( this.isDisabled ) {
                    return;
                }
                if ( !this.isSelected ){
                    S.setState('filter.' + this.dataset.type, this.dataset.value);
                    this.isSelected = true;
                    this.classList.add(s.isSelected);
                } else {
                    S.setState('filter.' + this.dataset.type, null);
                    this.isSelected = false;
                    this.classList.remove(s.isSelected);
                }
            });
        });
    }
}