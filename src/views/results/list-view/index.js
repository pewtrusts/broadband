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
        view.classList.add(s.listContainer);
        view.innerHTML = this.renderList();
        return view;
    }
    renderList(){
      return this.model.data.reduce((acc, cur) => {
            var section = `
            <div class="js-list-item ${s.listItem}" id="list-item-${cur.id}">
              <div class="${s.itemHeader} flex space-between"><p>${cur.state}</p><p>${cur.year !== 'Not specified' ? cur.year : 'no date'}</p></div>
              <h2 class="${s.itemHed}">${cur.name}${ this.model.names[cur.name + ' ' + cur.state] > 1 ? ' <span class="' + s.parens + '">(' + cur.topic + ')</span>' : ''}</h2>
              <p class="${s.itemTitle}">${cur.title.replace(/\.+ *$/,'')}</p>
              <div class="flex space-between">
                <p><strong>Category:</strong> ${this.model.dictionary[cur.category]}</p>
                <p><strong>Topic:</strong> ${cur.topic}${ cur.subtopic ? ' (' + cur.subtopic + ')' : ''}</p>
              </div>
              <p>${cur.description}</p>
            </div>
          `;
            return acc + section;
        }, '');
    }
    init() {
        this.updateListBind = this.updateList.bind(this);
        this.listItems = this.el.querySelectorAll('.js-list-item');
        this.matchingListItems = Array.from(this.listItems).slice();
        var showPageBind = this.showPage.bind(this);
        PS.setSubs([
            ['page', showPageBind],
            ['listIDs', this.updateListBind],
            ['sort', this.sortList.bind(this)]
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
    updateList() {
      var arr = Array.from(this.listItems);
       this.matchingListItems = arr.filter(item => {
          return this.app.listIDs.indexOf(item.id) !== -1;
        });
       S.setState('page', 0);
       S.setState('page', 1);
    }
    sortList(msg,data) {
      var direction = data[0];
      var field = data[1];
      this.model.data.sort((a,b) => field !== 'year' ? this.app.sortAlpha(a[field],b[field], direction) : this.app.sortNum(a[field],b[field], direction));
      this.el.innerHTML = this.renderList();
      this.listItems = this.el.querySelectorAll('.js-list-item');
      this.updateListBind();
    }
}