import svg4everybody from 'svg4everybody';
import Promise from 'promise-polyfill';
import 'whatwg-fetch';


export default function init(){
	svg4everybody();

	if (!window.Promise) {
		window.Promise = Promise;
	}
}

// matches polyfill
window.Element && function(ElementPrototype) {
	ElementPrototype.matches = ElementPrototype.matches ||
	ElementPrototype.matchesSelector ||
	ElementPrototype.webkitMatchesSelector ||
	ElementPrototype.msMatchesSelector ||
	function(selector) {
		var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
		while (nodes[++i] && nodes[i] != node);
		return !!nodes[i];
	};
}(Element.prototype);

// closest polyfill
window.Element && function(ElementPrototype) {
	ElementPrototype.closest = ElementPrototype.closest ||
	function(selector) {
		var el = this;
		while (el.matches && !el.matches(selector)) el = el.parentNode;
		return el.matches ? el : null;
	};
}(Element.prototype);
