import Element from '@UI/element';
import s from './styles.scss';
import PS from 'pubsub-setter';
import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';


export default class ListView extends Element {


    prerender() {
        //container
        var view = super.prerender();
        this.name = 'ListView';
        if (this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        var html = this.model.data.reduce((acc, cur) => {
            var section = `
            <div class="js-list-item ${s.listItem}" id="list-item-${cur.id}">
              <p class="${s.state}">${cur.state}</p>
              <h2>${cur.name}${ this.model.names[cur.name + ' ' + cur.state] > 1 ? ' <span class="' + s.parens + '">(' + cur.topic + ')</span>' : ''}</h2>
              <p><strong>Section:</strong> ${cur.title}</p>
              <p><strong>Topic:</strong> ${cur.topic}${ cur.subtopic ? ' (' + cur.subtopic + ')' : ''}</p>
              <p>${cur.description}</p>
            </div>
          `;
            return acc + section;
        }, '');

        view.innerHTML = html;
        return view;
    }

    init() {
        this.listItems = this.el.querySelectorAll('.js-list-item');
        this.matchingListItems = Array.from(this.listItems).slice();
        var showPageBind = this.showPage.bind(this);
        PS.setSubs([
            ['page', showPageBind],
            ['listIDs', this.updateList.bind(this)]
        ]);
    }
    showPage(msg, data) {
        if (data === 0 ){
          return;
        }
        this.listItems.forEach(item => {
            item.setAttribute('hidden', 'hidden');
        });
        for (let i = this.app.itemsPerPage * (data - 1); i < this.app.itemsPerPage * data; i++) {
            if ( this.matchingListItems[i] ){
              this.matchingListItems[i].removeAttribute('hidden');
            }
        }
    }
    updateList(msg,data) {
      var arr = Array.from(this.listItems);
       this.matchingListItems = arr.filter(item => {
          return data.indexOf(item.id) !== -1;
        });
       S.setState('page', 0);
       S.setState('page', 1);
    }
}