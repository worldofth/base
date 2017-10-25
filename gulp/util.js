import fancyLog from 'fancy-log';
import browserSync from 'browser-sync';

export function onError(err){
	fancyLog.error(err);
}

export function setupBrowserSync(){
	const browserSyncInstance = browserSync.create();

	const reload = function(done){
		fancyLog('-> Reloading Browser');
		fancyLog(' ');

		browserSyncInstance.reload();
		done && done();
	};

	const reloadCss = function(done){
		fancyLog('-> Reloading Css');
		fancyLog(' ');

		browserSyncInstance.reload('*.css');
		done && done();
	};

	return {
		browserSyncInstance,
		reload,
		reloadCss
	};
}
