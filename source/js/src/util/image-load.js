import isArray from 'lodash.isArray';

function imageLoad(el, activeClass){
	let imgEl,
		img,
		src,
		loopCount,
		maxLoops,
		loaded;

	imgEl = el.querySelector('img');
	if(!imgEl){
		return;
	}
	img = new Image();
	src = imgEl.getAttribute('data-src');
	loaded = false;
	maxLoops = 200;
	loopCount = 0;

	const loop = function(){
		if(loaded){
			return;
		}

		if(loopCount >= maxLoops){
			loaded = true;
		}

		loopCount++;
		requestAnimationFrame(loop);
	};

	img.onload = function(){
		if(loaded){
			return;
		}

		if(!imgEl.parent){
			imgEl.src = src;
		}else{
			imgEl.parent.replaceChild(img, imgEl);
		}

		loaded = true;
		if(isArray(activeClass)){
			for (var i = 0; i < activeClass.length; i++) {
				el.classList.add(activeClass[i]);
			}
		}else{
			el.classList.add(activeClass);
		}
	};
	img.src = src;
	requestAnimationFrame(loop);
}

export default imageLoad;
