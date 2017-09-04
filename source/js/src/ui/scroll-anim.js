import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromEvent';

let scrollAnimations,
	scrollAnimationKeys,
	activeClass,
	onloadAnimations,
	baseOffset;

export default function init(){
	activeClass = 'active';
	baseOffset = 0.1;

	setupScrollAnimation();

	Observable.fromEvent(window, 'scroll')
		.map(() => getCurrentTop() + window.innerHeight)
		.subscribe(handleScroll);

	handleScroll(getCurrentTop() + window.innerHeight);
}

function setupScrollAnimation(){
	let scrollAnimationElements = document.querySelectorAll('.js-scroll-anim');
	scrollAnimationElements = Array.from(scrollAnimationElements);

	onloadAnimations = [];

	scrollAnimations = scrollAnimationElements.reduce((acc, el) => {
		if(el.classList.contains('onload')){
			onloadAnimations.push(el);
			return acc;
		}

		let { top } = el.getBoundingClientRect();
		let offset = el.dataset.scrollOffset || baseOffset;
		top = Math.round(top) + getCurrentTop() + (offset * window.innerHeight);
		top = Math.max(top, 0);
		acc[top] = el;
		return acc;
	}, {});

	scrollAnimationKeys = Object.keys(scrollAnimations);
	scrollAnimationKeys.sort();

	if(onloadAnimations.length){
		onloadAnimations.map((el) => {
			el.classList.add('active');
		});
	}
}

function handleScroll(scroll){
	for(let i = 0; i < scrollAnimationKeys.length; i++){
		let animScroll = scrollAnimationKeys[i];
		if(scroll >= animScroll){
			scrollAnimations[scrollAnimationKeys[i]].classList.add(activeClass);
		}
	}
}

function getCurrentTop(){
	return window.scrollY || window.pageYOffset;
}
