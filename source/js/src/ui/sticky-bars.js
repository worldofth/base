import { Observable } from 'rxjs/Observable';

export default function init(selectors = [], requireAllToExist = false){

	const stickyElements = selectors.map(selector => {
		const element = document.querySelector(selector);
		if(!element){
			return;
		}

		const rect = element.getBoundingClientRect();
		const top = rect.top + window.scrollY;

		return {
			element,
			top
		};
	}).filter(el => !!el);

	if(requireAllToExist && stickyElements.length != selectors.length){
		return;
	}

	stickyElements.map(obj => {
		obj.element.classList.add('toBeSticky');
	});

	const triggerFixed = (element, top) => (scrollPos) => {
		if(top <=  scrollPos){
			element.classList.add('sticky');
		}else{
			element.classList.remove('sticky');
		}
	};

	const stickyTriggerFunctions = stickyElements.map(stickyObj => triggerFixed(stickyObj.element, stickyObj.top));

	Observable.fromEvent(window, 'scroll')
		.map(() => window.scrollY)
		.subscribe(scroll => stickyTriggerFunctions.map(fnc => fnc(scroll)));

	stickyTriggerFunctions.map(fnc => fnc(window.scrollY));
}
