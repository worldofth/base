export function onError($){
	return function(err){
		$.fancyLog.error(err);
	};
}
