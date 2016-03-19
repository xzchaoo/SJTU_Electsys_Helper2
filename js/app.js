define(['angular', 'AppConfig', 'AppServices', 'AppData', 'jquery'], function (angular, AppConfig, AppServices, AppData, $) {
	return angular.module('app', ['AppConfig', 'AppServices', 'AppData'])
		.config(function ($sceDelegateProvider) {
			//设置白名单
			$sceDelegateProvider.resourceUrlWhitelist([
				'self',
				xzc.baseUrl + '/**'
			]);
		}).run(['$rootScope', '$timeout', 'SJTUService', 'XYKaikeData', function ($rootScope, $timeout, sjtu, data) {
			//添加一个函数 方便子类调用	
			$rootScope.reloadIframe = function () {
				$('#iframe').attr('src', 'http://electsys.sjtu.edu.cn/edu/student/elect/removeLessonFast.aspx');
			};

			$timeout(function(){
				//初始化已选择的课程的数据
			},10000);

				}]).controller('AppController', ['$scope', 'SJTUService', 'XYKaikeData', function ($scope, sjtu, data) {
			/*$scope.isLogin = function () {
				sjtu.isLogin().then(function (result) {
					alert('result=' + result);
				});
			};*/
		}]).directive('xbody', function () { //主面板
			return {
				restrict: 'E',
				templateUrl: xzc.baseUrl + '/body.html',
				controller: function ($filter, $timeout) {
					//没办法 只好用这种办法处理min-height问题
					$timeout(function () {
						var bottom = $('#iframe').height() + $('#iframe').offset().top;
						var finalHeight = bottom + $(window).height();
						$('body').css('min-height', finalHeight + 'px');
					}, 500);
				}
			};
		}).directive('userpanel', function () { //用户面板
			return {
				restrict: 'E',
				templateUrl: xzc.baseUrl + '/userpanel.html',
				controller: ['$scope', 'SJTUService', function ($scope, sjtu) {
					$scope.isLogin = false;
					$scope.userinfo = {};
					sjtu.getUserinfo().then(function (userinfo) {
						$scope.isLogin = true;
						$scope.userinfo = userinfo;
					});
				}]
			};
		}).directive('xypanel', function () { //学院面板
			return {
				restrict: 'E',
				scope: true,
				templateUrl: xzc.baseUrl + "/xy-panel.html",
				controller: ['$scope', 'SJTUService', 'XYKaikeData', function ($scope, sjtu, data) {
					$scope.editMode = false;
					$scope.selectIndex = 0;
					$scope.xyList = sjtu.getXYList();
					var lastXY = null;
					$scope.onTypeSelect = function (index, xy) {
						lastXY = xy;
						$scope.selectIndex = index;
						data.setXY(xy);
						//滚动到顶层
						$('body').animate({
							scrollTop: $('#srow').offset().top
						}, 'fast');
					};
					//当退出edit模式的时候 如果当前已选中的学院被隐藏了 那么就默认选中第一个
					//第一个学院 "我的收藏" 是不会被隐藏的
					$scope.$watch('editMode', function (editMode) {
						if (!editMode && (!lastXY || !lastXY.visible)) {
							sjtu.stop();
							$scope.onTypeSelect(0, $scope.xyList[0]);
						}
					});

					$scope.clear = function () {
						window.clearCache = true;
						window.location.reload();
					};
					}]
			}
		}).directive('kaikelistpanel', function () {
			return {
				restrict: 'E',
				scope: true,
				templateUrl: xzc.baseUrl + '/kaike-list-panel.html',
				controller: ['$scope', 'SJTUService', 'XYKaikeData', 'AppConfigService', function ($scope, sjtu, data, config) {
					$scope.data = data;
					$scope.config = config;
					$scope.canShow = function (k) {
						return (!data.noFullKaike || !k.yxkrs || !k.zdrs || k.yxkrs < k.zdrs) &&
							(!data.keyword || k.course.name.indexOf(data.keyword) >= 0 || _.some(k.teacherList, function (t) {
								return t.indexOf(data.keyword) >= 0;

							}) || k.room.indexOf(data.keyword) >= 0 || (k.bz && k.bz.indexOf(data.keyword) >= 0)) && (!data.time || k.fmtTime.indexOf(data.time) >= 0);
					};

					function updateMySelection() {
						sjtu.getMySelection().then(function (list) {
							data.selectionList = list;
							data.updateKaikeSelectionState();
							$scope.reloadIframe();
						});
					}
					$scope.toggleCollect = function (k) {
						if (k.collected) {
							k.collected = false;
							var kaikeList = sjtu.getMy().kaikeList;
							kaikeList.splice(_.indexOf(kaikeList, k), 1);
						} else {
							k.collected = true;
							sjtu.getMy().kaikeList.push(k);
						}
					};
					$scope.qiang = function (k) {
						sjtu.qiang(k).then(function () {
							//alert('选课成功, 请自行提交!');
							updateMySelection();
						}, function (reason) {
							if (typeof (reason) == 'object')
								alert('选课失败');
							else
								alert('选课失败 ' + reason);
							updateMySelection();
						});
					};
					$scope.tui = function (k) {
						sjtu.tui(k).then(function () {
							//alert('退课成功');
							updateMySelection();
						}, function (reason) {
							if (typeof (reason) == 'object')
								alert('退课失败');
							else
								alert('退课失败 ' + reason);
							updateMySelection();
						});
					}
					$scope.refresh = function (k) {
						sjtu.getKaike(k);
					}
				}]
			};
		}).directive('settingpanel', function () {
			return {
				restrict: 'E',
				scope: true,
				templateUrl: xzc.baseUrl + '/setting-panel.html',
				controller: ['$scope', 'SJTUService', 'XYKaikeData', function ($scope, sjtu, data) {
					$scope.noFullKaike = true;
					$scope.keyword = '';
					$scope.$watch('keyword', function (value) {
						data.keyword = value;
					});
					$scope.$watch('time', function (value) {
						data.time = value;
					});
					$scope.$watch('noFullKaike', function (value) {
						data.noFullKaike = value;
					});
					$scope.submit = function () {
						sjtu.submit().then(function (msg) {
							alert('提交成功 ' + msg + ' 由于选课网的限制, 你将会被注销, 请重新登陆.');
							location.href = "http://electsys.sjtu.edu.cn/edu/index.aspx";
						}, function (reason) {
							alert('提交失败 ' + reason);
						});
					};

					//停止刷新
					$scope.stop = function () {
						sjtu.stop();
					};

					//刷新选课数据
					$scope.refresh = function () {
						data.updateKaikeSelectionState();
					};

				}]
			};
		});
});