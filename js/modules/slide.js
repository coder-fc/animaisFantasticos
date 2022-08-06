import debounce from './debounce.js';

export class Slide {
    constructor(slide, container) {
        this.slide = document.querySelector(slide);
        this.container = document.querySelector(container);
        this.dist = { finalPosition: 0, startX: 0, movement: 0 };
        this.activeClass = 'active';
        this.changeEvent = new Event('changeEvent');
    }

    transition(active) {
        this.slide.style.transition = active ? 'transform .3s' : '0';
    }

    moveSlide(distX) {
        this.dist.movePosition = distX
        this.slide.style.transform = `translate3d(${distX}px, 0, 0)`
    }

    uptadePosition(clientX) {
        this.dist.movement = (this.dist.startX - clientX) * 1.6;
        return this.dist.finalPosition - this.dist.movement;
    }

    onStart(event) {
        let moveType;
        if (event.type === 'mousedown') {
            event.preventDefault();
            this.dist.startX = event.clientX;
            moveType = 'mousemove';
        } else {
            this.dist.startX = event.changedTouches[0].clientX;
            moveType = 'touchmove'
        }
        this.container.addEventListener(moveType, this.onMove);
        this.transition(false);
    }

    onMove(event) {
        const pointerPosition = (event.type === 'mousemove') ? event.clientX : event.changedTouches[0].clientX;
        const finalPosition = this.uptadePosition(pointerPosition);
        this.moveSlide(finalPosition);
    }

    onEnd(event) {
        const moveType = (event.type === 'mouseup') ? 'mousemove' : 'touchmove';
        this.container.removeEventListener(moveType, this.onMove);
        this.dist.finalPosition = this.dist.movePosition;
        this.transition(true);
        this.changeSlideOnEnd();
    }

    changeSlideOnEnd() {
        if(this.dist.movement > 120 && this.index.next !== undefined) {
            this.activeNextSlide();
        } else if (this.dist.movement < -120 && this.index.prev !== undefined) {
            this.activePrevSlide();
        } else {
            this.changeSlide(this.index.active);
        };
    }

    addEventsSlide() {
        this.container.addEventListener('mousedown', this.onStart);
        this.container.addEventListener('touchstart', this.onStart);
        this.container.addEventListener('mouseup', this.onEnd);
        this.container.addEventListener('touchend', this.onEnd);
    }

    // Configurações do slide

    slidePosition(slide) {
        const margin = (this.container.offsetWidth - slide.offsetWidth) / 2;
        return -(slide.offsetLeft - margin);
    }

    slidesConfig() {
        this.slideArray = [...this.slide.children].map((element) => {
            const position = this.slidePosition(element);
            return { position, element };
        });
    } 

    slidesIndexNav(index) {
        const last = this.slideArray.length - 1;
        this.index = {
            prev: index ? index - 1 : undefined,
            active: index,
            next: index === last ? undefined : index + 1,
        }
    }

    changeSlide(index) {
        const activeSlide = this.slideArray[index]; 
        this.moveSlide(this.slideArray[index].position);
        this.slidesIndexNav(index);
        this.dist.finalPosition = activeSlide.position;
        this.changeActiveClass();
        this.container.dispatchEvent(this.changeEvent);
    }

    changeActiveClass() {
        this.slideArray.forEach((item) => item.element.classList.remove(this.activeClass));
        this.slideArray[this.index.active].element.classList.add(this.activeClass);
    }

    activePrevSlide() {
        if (this.index.prev !== undefined) this.changeSlide(this.index.prev);
    }

    activeNextSlide() {
        if (this.index.next !== undefined) this.changeSlide(this.index.next);
    }

    onResize() {
        setTimeout(() => {
            this.slidesConfig();
            this.changeSlide(this.index.active);
        }, 1000);
    }

    addResizeEvent() {
        window.addEventListener('resize', this.onResize)
    }

    bindEvent() {
        this.onStart = this.onStart.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onEnd = this.onEnd.bind(this);
        this.activeNextSlide = this.activeNextSlide.bind(this);
        this.activePrevSlide = this.activePrevSlide.bind(this);
        this.onResize = debounce(this.onResize.bind(this), 200);
    }

    init() {
        this.bindEvent();
        this.transition(true);
        this.addEventsSlide();
        this.slidesConfig();
        this.addResizeEvent();
        this.changeSlide(0);
        return this;
    }
}

export default class SlideNav extends Slide {
    constructor (slide, container) {
        super(slide, container);
        this.controlEventsBind();
    }

    addArrow(prev, next) {
        this.prevElement = document.querySelector(prev);
        this.nextElement = document.querySelector(next);
        this.addArrowEvent();
    }

    addArrowEvent() {
        this.prevElement.addEventListener('click', this.activePrevSlide);
        this.nextElement.addEventListener('click', this.activeNextSlide);
    }
    createControl() {
        const control = document.createElement('ul');
        control.dataset.control = 'slide';
        
        this.slideArray.forEach((item, index) => {
            control.innerHTML += `<li><a href="#slide${index + 1}">${index + 1}</a></li>`
        });

        this.container.appendChild(control);
        return control;
    }

    controlEvent(item, index) {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            this.changeSlide(index);
        });
        this.container.addEventListener('changeEvent', this.controlActiveItem);
    }

    controlActiveItem() {
        this.controlArray.forEach((item) => item.classList.remove(this.activeClass));
        this.controlArray[this.index.active].classList.add(this.activeClass);
    }

    controlAdd(customControl) {
        this.control = document.querySelector(customControl) || this.createControl();
        this.controlArray = [...this.control.children];
        this.controlActiveItem();
        this.controlArray.forEach(this.controlEvent);
    }

    controlEventsBind() {
        this.controlEvent = this.controlEvent.bind(this);
        this.controlActiveItem = this.controlActiveItem.bind(this);
    }
}