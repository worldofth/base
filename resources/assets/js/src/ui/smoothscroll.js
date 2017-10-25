import jump from './jump';

let	pageUrl;

function init(){
	jump.init();

	pageUrl = location.hash ? stripHash(location.href) : location.href;
}

function onClick(e) {
	if(!isInPageLink(e.target)){
		return;
	}

	e.stopPropagation();
	e.preventDefault();

	let offset = 0;
	let options = {};

	jump.jump(e.target.hash, null, offset, options);
}

function isInPageLink(n) {
	if(!n.tagName){
		return false;
	}
	return n.tagName.toLowerCase() === 'a' && n.hash.length > 0 && stripHash(n.href) === pageUrl;
}

function stripHash(url) {
	return url.slice(0, url.lastIndexOf('#'));
}

// function setFocus(hash) {
// 	const element = document.getElementById(hash.substring(1));
//
// 	if(element){
// 		if(!/^(?:a|select|input|button|textarea)$/i.test(element.tagName)){
// 			element.tabIndex = -1;
// 		}
// 		element.focus();
// 	}
// }

export default {
	init: init,
	onClick: onClick
};
