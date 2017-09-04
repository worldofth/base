import FontFaceObserver from 'fontfaceobserver';

let html,
	subFonts,
	fullFonts,
	subFontClass,
	fullFontClass;

function init(options){
	if(!options){
		options = {};
	}

	subFonts = options.subFonts || [];
	fullFonts = options.fullFonts || [];

	html = document.documentElement;
	subFontClass = options.subFontClass || 'subfont-loaded';
	fullFontClass = options.subFontClass || 'font-loaded';

	if(subFonts.length || fullFontClass.length){
		runFontLoading();
	}
}

function runFontLoading(){
	if (sessionStorage.fullFontLoaded) {
		html.classList.add(fullFontClass);
	}else if(sessionStorage.subFontLoaded){
		html.classList.add(subFontClass);
		loadFullSets();
	}else{
		loadSubsets();
	}
}

function loadSubsets(){
	if(!subFonts.length){
		loadFullSets();
		return;
	}

	const fonts = [];
	for (let i = 0; i < subFonts.length; i++) {
		let options = subFonts[i].option || {};
		let font = new FontFaceObserver(subFonts[i].name, options);
		fonts.push(font.load());
	}

	Promise.all(fonts)
	.then(
		function(){
			sessionStorage.subFontLoaded = true;
			html.classList.add(subFontClass);
			loadFullSets();
		}
	)
	.catch(failedToLoadSub);
}

function loadFullSets(){
	// for large fonts push a timer (look at timer function below) to let these large font more time to load
	if(!fullFonts.length){
		return;
	}

	const fonts = [];
	for (let i = 0; i < fullFonts.length; i++) {
		let options = fullFonts[i].option || {};
		let font = new FontFaceObserver(fullFonts[i].name, options);
		fonts.push(font.load());
	}

	Promise.all(fonts)
	.then(
		function(){
			sessionStorage.fullFontLoaded = true;
			html.classList.remove(subFontClass);
			html.classList.add(fullFontClass);
		}
	)
	.catch(failedToLoadFull);
}

function failedToLoadSub(){
	html.classList.remove(subFontClass);
	sessionStorage.subFontLoaded = false;
	console.error('sub-setted font failed to load!');
}

function failedToLoadFull(){
	html.classList.remove(fullFontClass);
	sessionStorage.fullFontLoaded = false;
	console.error('full-setted font failed to load!');
}

export default init;
