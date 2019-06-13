import Element from '@UI/element';
import s from './styles.scss';
import PS from 'pubsub-setter';
import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';



export default class Paginate extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'Paginate';
        this.pageCount = Math.ceil(this.model.data.length / this.data.itemsPerPage);
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add('wire');

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
        prev.classList.add(s.btn, s.btnPrev, 'js-paginate-button-prev');
        controls.appendChild(prev);

        //pages
        var max = this.pageCount < 7 ? this.pageCount : 7;
        for ( let i = 1; i <= max; i++ ){
            let page = document.createElement('button');
            page.classList.add('js-paginate-button-page');
            page.setAttribute('type','button');
            if ( i == 1 ){
                page.setAttribute('disabled','disabled');
            }
            page.dataset.page = i;
            page.textContent = i;
            controls.appendChild(page);
        }

        //go to last
        if ( this.pageCount > 7 ){
            let goToLast = document.createElement('button');
            goToLast.setAttribute('type','button');
            goToLast.textContent = '...';
            controls.appendChild(goToLast);
        }

        //next
        var next = document.createElement('button');
        next.setAttribute('type','button');
        next.classList.add(s.btn, s.btnNext, 'js-paginate-button-next');
        controls.appendChild(next);

        view.appendChild(controls);
        return view;
    }
    init(){
        var updateBind = this.update.bind(this);
        PS.setSubs([
            ['page', updateBind]
        ]);
        S.setState('page', 1);
        
        //page buttons
        document.querySelectorAll('.js-paginate-button-page').forEach(button => {
            button.addEventListener('click', function(){
                S.setState('page', +this.dataset.page);
            });
        });
        //prev button
        document.querySelector('.js-paginate-button-prev').addEventListener('click', function(){
            S.setState('page', +S.getState('page') - 1);
        });
        //next button
        document.querySelector('.js-paginate-button-next').addEventListener('click', function(){
            S.setState('page', +S.getState('page') + 1);
        });
    }
    update(msg,data){
        //handle disabled attributes
        document.querySelector('.js-paginate-button-page[disabled]').removeAttribute('disabled');
        document.querySelector(`.js-paginate-button-page[data-page="${data}"]`).setAttribute('disabled','disabled');

        //update results count
        var max = Math.min(this.data.itemsPerPage * data, this.model.data.length);
        var min = this.data.itemsPerPage * data - (this.data.itemsPerPage - 1);
        document.querySelector('.js-pagination-count').textContent = `${min}–${max} of ${this.model.data.length} results`;

        //toggle prev/next buttons disabled
        if ( data === 1 ){
            document.querySelector('.js-paginate-button-prev').setAttribute('disabled', 'disabled');
        } else {
            document.querySelector('.js-paginate-button-prev').removeAttribute('disabled');
        }
        if ( data === this.pageCount ){
            document.querySelector('.js-paginate-button-next').setAttribute('disabled', 'disabled');
        } else {
            document.querySelector('.js-paginate-button-next').removeAttribute('disabled');
        }

    }
}