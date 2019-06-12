import Element from '@UI/element';
import s from './styles.scss';
//import PS from 'pubsub-setter';
//import { stateModule as S } from 'stateful-dead';
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
            listItem.textContent = `${topic.key} (${topic.count})`;
            
            //sublist
            if ( this.data.key !== 'state' && topic.values.length > 1 ){ // values are nested by subtopic. all have at least one (key === ''), more if there are actual keys/subtopics
                let sublist = document.createElement('ul');
                topic.values.forEach(subtopic => {
                    var subitem = document.createElement('li');
                    subitem.textContent = `${subtopic.key} (${subtopic.values.length})`;
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
/*        PS.setSubs([
            ['selectHIA', this.activate.bind(this)]
        ]);*/
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
}