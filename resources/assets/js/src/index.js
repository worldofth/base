function init(){
	console.log('test');
}

if(document.readyState != 'loading'){
	init();
}else{
	document.addEventListener('DOMContentLoaded', init);
}
