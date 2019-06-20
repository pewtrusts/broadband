import Element from '@UI/element';
import s from './styles.scss';
import mapSVG from 'html-loader!./map.svg';
import chroma from 'chroma-js';
import PS from 'pubsub-setter';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';

const gradient = ['#B5D5F2', '#296EC3', '#15317E'];

export default class MapView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'MapView';
        this.colorScale = chroma.scale(gradient).domain([0, this.model.stateMax]);
/*        this.addChildren([
        ]);*/
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.innerHTML = mapSVG;
        view.classList.add(s.mapView);
        view.classList.add('wire');

        this.colorMap(view);

        return view;
    }
    init(){
        PS.setSubs([
            ['listIDs', () => {
                this.colorMap.call(this);
            }]
        ]);
    }
    colorMap(container = this.el){
        container.querySelectorAll('.state__path').forEach(path => {
            path.style.fill = '#E1E1E1';
        });
        this.model.nestedData.find(d => d.key === 'state').values.forEach(datum => {
            var path = container.querySelector('.state-' + this.model.stateAbbreviations[datum.key] + ' path');
            path.style.fill = this.colorScale(datum.count);
        });
    }
}