let navElement,
	navButton,
	isOpen;

function init(){
	navElement = document.querySelector('.js-nav');
	if(!navElement){
		return;
	}
	navElement.classList.remove('loading');
	navButton = navElement.querySelector('.js-nav-button');
}

function onClick(event){
	if(!event.target || !event.target.classList.contains('js-nav-button')){
		return;
	}

	toggleNav();
}

function checkIsOpen(){
	return navElement.classList.contains('active');
}

function openNav(){
	navElement.classList.remove('active');
	navButton.classList.remove('active');
}

function closeNav(){
	navElement.classList.add('active');
	navButton.classList.add('active');
}

function toggleNav(){
	isOpen = checkIsOpen();

	if(isOpen){
		openNav();
	}else{
		closeNav();
	}
}

export default {
	init,
	onClick,
	toggleNav
};
