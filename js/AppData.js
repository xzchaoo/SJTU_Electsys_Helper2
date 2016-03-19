define(['angular', 'AppService/SJTUService'], function (angular) {
	return angular.module('AppData', ['AppServices.SJTUService'])
		.factory('XYKaikeData', ['SJTUService', function (sjtu) {
			var obj = {
				noFullKaike: true,
				kaikeList: [],
				keyword: '',
				time: '',
				selectionList: [],
				xy: {},
				setXY: function (xy) {
						obj.xy = xy;
						obj.kaikeList = sjtu.getKaikeListByXY(xy, true); //暂时不用cache
				}
			};
			sjtu.init().then(function(){
//				sjtu.getMySelection().then(function (list) {
//					alert(JSON.stringify(list));
//					obj.selectionList = list;
					obj.updateKaikeSelectionState();
//				});
			});
			function updateKaikeSelectionState() {
				sjtu.getMySelection().then(function (list) {
					obj.selectionList = list;
					for (var i = 0; i < obj.kaikeList.length; ++i) {
						var k = obj.kaikeList[i];
						var selected = false;
						for (var j = 0; j < obj.selectionList.length; ++j)
							if (k.bsid == obj.selectionList[j]) {
								selected = true;
								break;
							}
						k.selected = selected;
					}
				});
			}

			obj.updateKaikeSelectionState = updateKaikeSelectionState;

			return obj;
		}]);
});