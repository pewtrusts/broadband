import Element from '@UI/element';
import s from './styles.scss';
import PS from 'pubsub-setter';
import { stateModule as S } from 'stateful-dead';
import { GTMPush } from '@Utils';

export default class Sort extends Element {
    
    prerender(){
         //container
        var button = super.prerender();
        this.name = 'Sort';
        if ( this.prerendered && !this.rerender) {
            return button; // if prerendered and no need to render (no data mismatch)
        }
        button.classList.add(s.sortButton);
        button.textContent = this.data.field === 'name' ? 'law' : this.data.field;
        button.setAttribute('role', 'button');
        button.value = this.data.field;
        return button;
    }
    set isDisabled(bool){
        this._isDisabled = bool;
        if ( bool ){
            this.el.classList.add(s.isDisabled);
        } else {
            this.el.classList.remove(s.isDisabled);
        }
    }
    get isDisabled(){
        return this._isDisabled;
    }
    set isActive(bool){
        this._isActive = bool;
        if ( bool ) {
            this.el.classList.add(s.isActive);
            if ( this.app.activeFilter && this.app.activeFilter !== this ){
                this.app.activeFilter.isActive = false;
                this.app.activeFilter.isAscending = true;
            }
            this.app.activeFilter = this;
        } else {
            this.el.classList.remove(s.isActive);
        }
    }
    get isActive(){
        return this._isActive;
    }
    set isAscending(bool){
        this._isAscending = bool;
        if ( bool ) {
            this.el.classList.add(s.isAscending);
        } else {
            this.el.classList.remove(s.isAscending);
        }
    }
    get isAscending(){
        return this._isAscending;
    }
    init(){
        var _this = this;
        this.isAscending = true;
        this.isDisabled = false;
        this.el.addEventListener('click', function(){
            _this.clickHandler.call(_this, this.value);
        });
       /* Object.defineProperty(this, 'isDisabled', { // IE11 is tripping up on writing a property to `this`; says isDisabled is read-only. it may be something to do withthe
                                                    // Nodelist.prototype.forEach polyfill
            value: false,
            writable: true
        });*/

       PS.setSubs([
              ['listIDs', this.toggleSorter.bind(this)]
         ]);
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    // TO DO: sorts are Components and should have direct response to listIDs message
    toggleSorter(){
        console.log(this.model.tally);
        var type = this.data.field;
        if ( this.model.tally[type].size < 2 ) {
            this.isDisabled = true;
        } else {
            this.isDisabled = false;
        }
    }
   clickHandler(value){
        if ( this.isDisabled ){
            return;
        }
        function setState(){
            S.setState('sort', [( this.isAscending ? 'ascending' : 'descending' ), value]);
            GTMPush(`Broadband|Sort|${value}|${this.isAscending ? 'ascending' : 'descending'}`);
            this.isActive = true;
        }
        var setStateBind = setState.bind(this);
        this.app.listView.showChurning.call(this.app.listView, true);
        if ( this.isActive ){
            this.isAscending = !this.isAscending;
        }
        if ( window.requestIdleCallback ){
            requestIdleCallback(setStateBind, {timeout: 1000});
        } else {
            setTimeout(() => {
                setStateBind();
            },500);
        }

    }
}