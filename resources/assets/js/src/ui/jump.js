import {easeInOutQuad, easeOutQuad} from '../util/easing';

let maxDuration,
	minDuration,
	maxDurHeight,
	wheelEventName,

	jmpTmpMaxDuration,
	jmpTmpMinDuration,
	optionsUser,

	element,

	start,
	stop,
	offset,

	easing,
	durationEasing,
	a11y,

	distance,
	duration,

	timeStart,
	timeElapsed,

	nextScroll,

	callback,

	animationID;

function init(mxDur, mnDur, mxDurHeight){
	minDuration = mnDur || 750;
	maxDuration = (mxDur || 1500) - minDuration;
	maxDurHeight = mxDurHeight || 5000;

	const pageHeight = getDocumentHeight() - (getViewportHeight() * 0.5);

	if(maxDurHeight > pageHeight){
		maxDurHeight = pageHeight;
	}

	easing = easeInOutQuad;
	durationEasing = easeOutQuad;
	a11y = false;

	if('onwheel' in document.createElement('div')){
		wheelEventName = 'wheel';
	}else{
		wheelEventName = document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
	}

	addEventListeners();
}

function addEventListeners(){
	document.addEventListener(wheelEventName, cancelAnimation, false);
}

function cancelAnimation(){
	if(animationID !== undefined){
		cancelAnimationFrame(animationID);
		animationID = undefined;
		timeStart = false;
	}
}

function getDocumentHeight(){
	const body = document.body,
		html = document.documentElement;

	return Math.max(body.scrollHeight, body.offsetHeight, html.scrollHeight, html.offsetHeight);
}

function getViewportHeight(){
	return Math.max(document.documentElement.clientHeight, window.innerHeight);
}

function top(element) {
	return element.getBoundingClientRect().top + start;
}

function location() {
	return window.scrollY || window.pageYOffset;
}

function loop(timeCurrent){
	if(!timeStart){
		timeStart = timeCurrent;
	}

	timeElapsed = timeCurrent - timeStart;

	nextScroll = easing(timeElapsed, start, distance, duration);

	window.scrollTo(0, nextScroll);

	if(timeElapsed < duration){
		animationID = requestAnimationFrame(loop);
	}else{
		done();
	}
}

function done(){
	window.scrollTo(0, start + distance);

	if(element && a11y) {
		element.setAttribute('tabindex', '-1');
		element.focus();
	}

	if(typeof callback === 'function'){
		callback();
	}

	if(optionsUser){
		maxDuration = jmpTmpMaxDuration;
		minDuration = jmpTmpMinDuration;
		optionsUser = false;
	}

	animationID = undefined;
	timeStart = false;
}

function jump(target, cb, offset, options){
	if(!target){
		return;
	}

	if(options){
		optionsUser = true;
		jmpTmpMaxDuration = maxDuration;
		jmpTmpMinDuration = minDuration;

		minDuration = options.minDuration || minDuration;
		maxDuration = options.maxDuration ? options.maxDuration - minDuration : maxDuration;
	}

	start = location();
	callback = cb;
	offset = offset || 0;

	switch(typeof target){
	case 'number':
		element = false;
		a11y = false;
		stop = start + target;
		break;

	case 'object':
		element = target;
		stop = top(element);
		break;

	case 'string':
		element = document.querySelector(target);
		stop = top(element);
		break;
	}

	if(element){
		const dataOffset = +element.getAttribute('data-offset');
		if(dataOffset){
			offset = dataOffset;
		}
		const dataMinDuration = +element.getAttribute('data-min-duration');
		const dataMaxDuration = +element.getAttribute('data-max-duration');
		minDuration = dataMinDuration || minDuration;
		maxDuration = dataMaxDuration ? dataMaxDuration - minDuration : maxDuration;
	}

	distance = stop - start + offset;
	let durDistance = Math.abs(distance);

	let distanceChange = durDistance / maxDurHeight;
	if(durDistance >= maxDurHeight){
		distanceChange = 1;
	}

	const durationChangeRate = durationEasing(distanceChange, 0, 1, 1);
	duration = maxDuration * durationChangeRate + minDuration;

	cancelAnimation();
	animationID = requestAnimationFrame(loop);
}

export default {
	init: init,
	jump: jump
};
