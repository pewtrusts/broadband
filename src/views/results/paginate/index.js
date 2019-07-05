import Element from '@UI/element';
import s from './styles.scss';
import PS from 'pubsub-setter';
import { stateModule as S } from 'stateful-dead';
import arrowSVG from 'html-loader!./arrow.svg';



export default class Paginate extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'Paginate';
        this.pageCount = Math.ceil(this.model.data.length / this.data.itemsPerPage);
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add(s.pagination)
        //count
        var count = document.createElement('div');
        count.classList.add('js-pagination-count');
        view.appendChild(count);

        //group
        var controls = document.createElement('div');
        controls.classList.add(s.paginationControls);

        //prev button
        var prev = document.createElement('button');
        prev.setAttribute('type','button');
        prev.setAttribute('disabled','disabled');
        prev.setAttribute('role', 'button');
        prev.classList.add(s.btn, s.btnPrev, 'js-paginate-button-prev');
        prev.innerHTML = arrowSVG;
        controls.appendChild(prev);

        //go to first
        var goToFirst = document.createElement('button');
        goToFirst.setAttribute('type','button');
        goToFirst.setAttribute('role', 'button');
        goToFirst.classList.add(s.btn, 'js-paginate-button-first');
        goToFirst.textContent = '...';
        controls.appendChild(goToFirst);

        //pages
        var max = this.pageCount;// < 7 ? this.pageCount : 7;
        for ( let i = 1; i <= max; i++ ){
            let page = document.createElement('button');
            page.setAttribute('role', 'button');
            page.classList.add(s.btn, 'js-paginate-button-page');
            page.setAttribute('type','button');
            if ( i == 1 ){
                page.setAttribute('disabled','disabled');
            }
            page.dataset.page = i;
            page.textContent = i;
            controls.appendChild(page);
        }

        //go to last
        var goToLast = document.createElement('button');
        goToLast.setAttribute('type','button');
        goToLast.setAttribute('role', 'button');
        goToLast.classList.add(s.btn, 'js-paginate-button-last');
        goToLast.textContent = '...';
        controls.appendChild(goToLast);

        //next
        var next = document.createElement('button');
        next.setAttribute('type','button');
        next.setAttribute('role', 'button');
        next.classList.add(s.btn, s.btnNext, 'js-paginate-button-next');
        next.innerHTML = arrowSVG;
        controls.appendChild(next);

        view.appendChild(controls);
        return view;
    }
    init(){
        this.prevButton = this.el.querySelector('.js-paginate-button-prev');
        this.firstButton = this.el.querySelector('.js-paginate-button-first');
        this.pageButtons = this.el.querySelectorAll('.js-paginate-button-page');
        this.lastButton = this.el.querySelector('.js-paginate-button-last');
        this.nextButton = this.el.querySelector('.js-paginate-button-next');
        this.paginationCount = this.el.querySelector('.js-pagination-count');
        PS.setSubs([
            ['page', this.update.bind(this)]
        ]);
        
        //page buttons
        this.pageButtons.forEach(button => {
            button.addEventListener('click', function(){
                S.setState('page', +this.dataset.page);
            });
        });
        //prev button
        this.prevButton.addEventListener('click', function(){
            S.setState('page', +S.getState('page') - 1);
        });
        //next button
        this.nextButton.addEventListener('click', function(){
            S.setState('page', +S.getState('page') + 1);
        });
        //go to first button
        this.firstButton.addEventListener('click', () => {
            S.setState('page', 1);
        });
        //go to last button
        this.lastButton.addEventListener('click', () => {
            S.setState('page', this.pageCount);
        });
    }
    update(msg,data){
        if ( data === 0 ){
            return;
        }
        this.pageCount = Math.ceil(this.model.filteredData.length / this.data.itemsPerPage);
        //handle disabled attributes
        this.el.querySelector('.js-paginate-button-page[disabled]').removeAttribute('disabled');
        this.el.querySelector(`.js-paginate-button-page[data-page="${data}"]`).setAttribute('disabled','disabled');

        //update results count
        var max = Math.min(this.data.itemsPerPage * data, this.model.filteredData.length);
        var min = this.data.itemsPerPage * data - (this.data.itemsPerPage - 1);
        this.paginationCount.textContent = `${min}–${max} of ${this.model.filteredData.length} results`;

        //toggle prev/next buttons disabled
        if ( data === 1 ){
            this.prevButton.setAttribute('disabled', 'disabled');
        } else {
            this.prevButton.removeAttribute('disabled');
        }
        
        if ( data === this.pageCount ){
            this.nextButton.setAttribute('disabled', 'disabled');
        } else {
            this.nextButton.removeAttribute('disabled');
        }
        //toggle presence of got first and go to last
        this.updateFirstAndLast.call(this, data);

        this.updateButtonRange.call(this, data);
    }
    updateButtonRange(data){
        var start = +data < 5 ? 0 : +data > this.pageCount - 3 ? this.pageCount - 7 : +data - 4;
        var end = Math.min(this.pageCount, start + 7);
        this.pageButtons.forEach(button => {
            button.setAttribute('hidden','hidden');
        });
        for ( let i = start; i < end; i++){
            this.pageButtons[i].removeAttribute('hidden');
        }
    }
    updateFirstAndLast(page = S.getState('page')){
        if ( this.pageCount <= 7 ){
            this.firstButton.setAttribute('hidden','hidden');
            this.lastButton.setAttribute('hidden','hidden');
            return;
        } 
        if ( page <= 4 ){
            this.lastButton.removeAttribute('hidden');
            this.firstButton.setAttribute('hidden', 'hidden');
            return;
        }
        if ( page >= this.pageCount - 3 ){
            this.firstButton.removeAttribute('hidden');
            this.lastButton.setAttribute('hidden', 'hidden');
            return;
        }
        this.firstButton.removeAttribute('hidden');
        this.lastButton.removeAttribute('hidden');
    }
}