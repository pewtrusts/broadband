import Element from '@UI/element';
import s from './styles.scss';
import PS from 'pubsub-setter';
import { stateModule as S } from 'stateful-dead';
import { GTMPush } from '@Utils';
import sanitizeHTML from 'sanitize-html';

const sanitizeOptions = {
  // slightly edited defaults
  allowedTags: [ 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre'], // removed <a> and <iframe>
  disallowedTagsMode: 'discard',
  allowedAttributes: {
    a: [ 'href', 'name', 'target' ],
    // We don't currently allow img itself by default, but this
    // would make sense if we did. You could add srcset here,
    // and if you do the URL is checked for safety
    img: [ 'src' ]
  },
  // Lots of these won't come up by default because we don't allow them
  selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],
  // URL schemes we permit
  allowedSchemes: [ 'http', 'https', 'ftp', 'mailto' ],
  allowedSchemesByTag: {},
  allowedSchemesAppliedToAttributes: [ 'href', 'src', 'cite' ],
  allowProtocolRelative: false // changed to false
};

export default class ListView extends Element {


    prerender() {
        //container
        var view = super.prerender();
        this.name = 'ListView';
        this.app.listView = this;
        if (this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add(s.listContainer);
        view.innerHTML = this.renderList();
        return view;
    }
    sanitize(html){
      var sanitized = sanitizeHTML(html.replace(/&para;/g,'</p><p>'), sanitizeOptions);
      if ( sanitized.match(/^<\w+[^>]*>/) ){ // if supplied text starts with an html tag
        return sanitized;
      } else { //ie just text , not supplied as html
        return '<p>' + sanitized + '</p>';
      }
    }
    renderList(){
      return this.model.data.reduce((acc, cur) => {
            var section = `
            <div class="js-list-item ${s.listItem}" id="list-item-${cur.id}">
              <div class="${s.itemHeader} flex space-between"><p>${cur.state}</p><p>${cur.year !== 'Not specified' ? cur.year : 'no date'}</p></div>
              <h2 class="${s.itemHed}">${cur.name}</h2>
              <p class="${s.itemTitle}">${cur.title.replace(/\.+ *$/,'')} ${ this.model.names[cur.name + ' ' + cur.state] > 1 ? ' <span class="' + s.parens + '">(' + cur.topic + ')</span>' : ''}</p>
              <div class="flex space-between">
                <p class=${s.category}><strong>Category:</strong> ${this.model.dictionary[cur.category]}</p>
                <p class=${s.topic}><strong>Topic:</strong> ${cur.topic}${ cur.subtopic ? ' (' + cur.subtopic + ')' : ''}</p>
              </div>
              ${this.sanitize(cur.description)}
              <button aria-expanded="false" aria-label="Reveal relevant language from state code" role="button" class="js-relevant-button ${s.relevantButton}">read relevant code</button>
              <div id="relevent-code" class="js-relevant-text ${s.relevantText}">
                <h3>State Code</h3>
                <button aria-label="Close text box with relevant language from state code" class="js-close-relevant ${s.closeRelevant}"></button>
                ${this.sanitize(cur.relevant_text)}
              </div>
            </div>
          `;
            return acc + section;
        }, '');
    }
    init() {
        this.updateListBind = this.updateList.bind(this);
        this.listItems = this.el.querySelectorAll('.js-list-item');
        this.matchingListItems = Array.from(this.listItems).slice();
        this.relevantButtons = this.el.querySelectorAll('.js-relevant-button');
        this.closeRelevantButtons = this.el.querySelectorAll('.js-close-relevant');
        var showPageBind = this.showPage.bind(this);
        PS.setSubs([
            ['page', showPageBind],
            ['listIDs', this.updateListBind],
            ['sort', this.sortList.bind(this)],
            ['showGlossary', this.toggle.bind(this)]
        ]);
        this.relevantButtons.forEach(btn => {
          btn.addEventListener('click', function(){
            this.setAttribute('aria-expanded', true);
            this.parentElement.querySelector('.js-relevant-text').classList.add(s.show);
            GTMPush('Broadband|RelevantText|' + this.parentElement.querySelector('h2').textContent)
          });
        });
        this.closeRelevantButtons.forEach(btn => {
          btn.addEventListener('click', function(){
            this.parentElement.classList.remove(s.show);
            this.parentElement.parentElement.querySelector('.js-relevant-button').setAttribute('aria-expanded', false);
          });
        });
    }
    toggle(msg, data){
          if ( data ){
              this.el.classList.add(s.hide)
          } else {
              this.el.classList.remove(s.hide)
          }
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
    showChurning(bool){
      if ( bool ) {
        requestAnimationFrame(() => {
          this.el.classList.add(s.isChurning);
        });
      } else {
        requestAnimationFrame(() => {
          this.el.classList.remove(s.isChurning);
        });
      }
    }
    updateList() {
      var arr = Array.from(this.listItems);
       this.matchingListItems = arr.filter(item => {
          return this.app.listIDs.indexOf(item.id) !== -1;
        });
       S.setState('page', 0);
       S.setState('page', 1);
       this.showChurning(false);
    }
    sortList(msg,data) {
      var direction = data[0];
      var field = data[1];
      this.model.data.sort((a,b) => field === 'category' ? this.app.sortNum(this.model.dictionary[a[field]], this.model.dictionary[b[field]], direction) : field !== 'year' ? this.app.sortAlpha(a[field],b[field], direction) : this.app.sortNum(a[field],b[field], direction));
      requestAnimationFrame(() => {
        this.el.innerHTML = this.renderList();
        this.listItems = this.el.querySelectorAll('.js-list-item');
        this.updateListBind();
      });
    }
}