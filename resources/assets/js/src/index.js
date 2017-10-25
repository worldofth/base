import fontloading from './util/font-loading';
import polyfill from './util/polyfills';

function init(){
	polyfill();
	setupFontLoading();
}

function setupFontLoading(){
	fontloading({
		subFonts: [
			{
				name: 'fira sans subset',
				option: {
					weight: 400
				}
			}
		],
		fullFonts: [
			{
				name: 'fira sans',
				option: {
					weight: 400
				}
			}
		]
	});
}

if(document.readyState != 'loading'){
	init();
}else{
	document.addEventListener('DOMContentLoaded', init);
}
