// Robert Penner's easeInOutQuad

// find the rest of his easing functions here: http://robertpenner.com/easing/
// find them exported for ES6 consumption here: https://github.com/jaxgeller/ez.js

function easeInOutQuad(t, b, c, d){
	t /= d / 2;
	if(t < 1){
		return c / 2 * t * t + b;
	}
	t--;
	return -c / 2 * (t * (t - 2) - 1) + b;
}

function easeOutQuad(t, b, c, d) {
	return -c *(t/=d)*(t-2) + b;
}

export {easeInOutQuad, easeOutQuad};
