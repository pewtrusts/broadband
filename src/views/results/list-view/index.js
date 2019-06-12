import Element from '@UI/element';
import s from './styles.scss';
import PS from 'pubsub-setter';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';


export default class ListView extends Element {


    prerender(){
         //container
        var view = super.prerender();
        this.name = 'ListView';
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add('wire');

        var html = this.model.data.reduce((acc,cur, i) => {
          var section = `
            <div class="${s.listItem} js-page-${Math.ceil((i + 1) / this.data.itemsPerPage)} ${ i < 10 ? s.isOnPage : 'nope' }">
              <h2>${cur.title}</h2>
              <p><strong>State:</strong> ${cur.state}</p>
              <p><strong>Topic:</strong> ${cur.topic}</p>
              <p><strong>Name:</strong> ${cur.name}</p>
              <p>${cur.description}</p>
            </div>
          `;
          return acc + section;
        },'');

        view.innerHTML = html;
        return view;
    }

    init(){
        var showPageBind = this.showPage.bind(this);
        PS.setSubs([
            ['page', showPageBind]
        ]);
    }
    showPage(msg,data){
        document.querySelectorAll('.' + s.isOnPage).forEach(item => {
            item.classList.remove(s.isOnPage);
        });
        document.querySelectorAll('.js-page-' + data).forEach(item => {
            item.classList.add(s.isOnPage);
        });

    }
}