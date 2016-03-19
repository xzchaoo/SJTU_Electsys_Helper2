define(['angular'], function (angular) {
	return angular.module('AppConfig', [])
		.factory('AppConfigService', function () {
			return angular.extend(window.xzc, {
					notShowFullKaike: false, //不要显示已经满的开课
				});
		});
});