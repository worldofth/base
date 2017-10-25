let inputs;

function init(){
	inputs = document.querySelectorAll('.js-input-group-input');
	inputs = Array.prototype.slice.call(inputs);

	setupInitialState();
	addEventListeners();
}

function setupInitialState(){
	inputs.forEach(function(element){
		if(!element.value){
			element.classList.remove('input-focus');
		}else if(!element.classList.contains('input-focus')){
			element.classList.add('input-focus');
		}
	});
}

function addEventListeners(){
	inputs.forEach(function(element){
		element.addEventListener('focus', handleFocus);
		element.addEventListener('blur', handleBlur);
	});
}

function handleFocus(evt){
	if(!evt.target.classList.contains('js-input-group-input')) return;
	evt.target.classList.add('input-focus');
}

function handleBlur(evt){
	if(!evt.target.classList.contains('js-input-group-input')) return;
	if(!evt.target.value){
		evt.target.classList.remove('input-focus');
	}
}

export default init;
