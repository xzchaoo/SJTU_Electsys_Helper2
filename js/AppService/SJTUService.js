define(['angular', 'xkdata'], function (angular, xkdata) {
	angular.module('AppServices.SJTUService', [])
		.factory('SJTUService', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
			function init(){
				var initUrl = 'http://electsys.sjtu.edu.cn/edu/student/elect/electwarning.aspx?xklc=';
				var dlist=[];
				for(var i=1;i<=3;++i){
					var d = (function(url){
						var d=$q.defer();
						$http.get(url).then(function (result) {
							var $d = $(result.data);
							var params = getParams($d);
							$.post(url, $.extend(params, {
								CheckBox1: 'on',
								btnContinue: '继续'
							}), function (data) {
								$('#iframe').attr('src', $('#iframe').attr('src'));
								d.resolve();
								//document.write(data);
								//alert(data);
							});
						});
						return d.promise;
					})(initUrl+i);
					dlist.push(d);
				}
				return $q.all(dlist);
			}
			//根据bsid获得开课信息
			function getKaike(bsid) {
				var url = xzc.urls.kaikeinfo + bsid;
				var d = $q.defer();
				$http.get(url).success(function (data) {
					var $dom = $(data);
					var mainTeacher = null;
					var teacherList = [];
					$dom.find('#TeacherInfo1_dataListT table.alltab').each(function () {
						var $table = $(this);
						var teacher = {
							gh: $table.find('tr').eq(0).find('td').eq(1).text().trim(),
							name: $table.find('tr').eq(1).find('td').eq(1).text().trim(),
							sex: $table.find('tr').eq(2).find('td').eq(1).text().trim(),
							xw: $table.find('tr').eq(3).find('td').eq(1).text().trim(),
							mz: $table.find('tr').eq(4).find('td').eq(1).text().trim(),
							byxx: $table.find('tr').eq(5).find('td').eq(1).text().trim(),
							zc: $table.find('tr').eq(0).find('td').eq(1).text().trim()
						};
						if (!mainTeacher) mainTeacher = teacher;
						teacherList.push(teacher);
					});
					var $tds = $dom.find('#LessonArrangeDetail1_dataListKc table tr td');
					if ($tds.size() > 0) {
						var kaike = {
							cid: $tds.eq(0).text().split('：')[1].trim(), //课程代码
							name: $tds.eq(1).text().split('：')[1].trim(), //课程名称
							kh: $tds.eq(2).text().split('：')[1].trim(), //课号
							kcxs: $tds.eq(3).text().split('：')[1].trim(), //课程形式
							xn: $tds.eq(4).text().split('：')[1].trim(), //学年
							xq: $tds.eq(5).text().split('：')[1].trim(), //学期
							jsyt: $tds.eq(6).text().split('：')[1].trim(), //教室用途
							xf: $tds.eq(7).text().split('：')[1].trim(), //学分
							qsz: $tds.eq(8).text().split('：')[1].trim(), //起始周
							jsz: $tds.eq(9).text().split('：')[1].trim(), //结束周
							ksqk: $tds.eq(10).text().split('：')[1].trim(), //考试情况
							dszqk: $tds.eq(11).text().split('：')[1].trim(), //单双周情况
							zdrs: $tds.eq(12).text().split('：')[1].trim(), //最大人数
							yxkrs: $tds.eq(13).text().split('：')[1].trim(), //已选课人数
							zsrs: $tds.eq(14).text().split('：')[1].trim(), //最少人数
							bz: $tds.eq(15).text().split('：')[1].trim(), //备注
							mainTeacher: mainTeacher,
							teacherList: teacherList
						};
						d.resolve(kaike);
					} else {
						d.resolve(null);
					}

				});
				return d.promise;
			}

			function fetchNewKaike(kaike, noCache) {
				if (!noCache && kaike.zdrs) {
					return $q.when(kaike);
				}
				return $http.get(kaike.url).then(function (result) {
					var $dom = $(result.data);
					var mainTeacher = null;
					var teacherList = [];
					$dom.find('#TeacherInfo1_dataListT table.alltab').each(function () {
						var $table = $(this);
						var teacher = {
							gh: $table.find('tr').eq(0).find('td').eq(1).text().trim(),
							name: $table.find('tr').eq(1).find('td').eq(1).text().trim(),
							sex: $table.find('tr').eq(2).find('td').eq(1).text().trim(),
							xw: $table.find('tr').eq(3).find('td').eq(1).text().trim(),
							mz: $table.find('tr').eq(4).find('td').eq(1).text().trim(),
							byxx: $table.find('tr').eq(5).find('td').eq(1).text().trim(),
							zc: $table.find('tr').eq(0).find('td').eq(1).text().trim()
						};
						if (!mainTeacher) mainTeacher = teacher;
						teacherList.push(teacher);
					});
					var $tds = $dom.find('#LessonArrangeDetail1_dataListKc table tr td');
					if ($tds.size() > 0) {
						//该开课的最新信息
						var newKaike = {
							cid: $tds.eq(0).text().split('：')[1].trim(), //课程代码
							name: $tds.eq(1).text().split('：')[1].trim(), //课程名称
							kh: $tds.eq(2).text().split('：')[1].trim(), //课号
							kcxs: $tds.eq(3).text().split('：')[1].trim(), //课程形式
							xn: $tds.eq(4).text().split('：')[1].trim(), //学年
							xq: $tds.eq(5).text().split('：')[1].trim(), //学期
							jsyt: $tds.eq(6).text().split('：')[1].trim(), //教室用途
							xf: $tds.eq(7).text().split('：')[1].trim(), //学分
							qsz: $tds.eq(8).text().split('：')[1].trim(), //起始周
							jsz: $tds.eq(9).text().split('：')[1].trim(), //结束周
							ksqk: $tds.eq(10).text().split('：')[1].trim(), //考试情况
							dszqk: $tds.eq(11).text().split('：')[1].trim(), //单双周情况
							zdrs: $tds.eq(12).text().split('：')[1].trim(), //最大人数
							yxkrs: $tds.eq(13).text().split('：')[1].trim(), //已选课人数
							zsrs: $tds.eq(14).text().split('：')[1].trim(), //最少人数
							//bz: $tds.eq(15).text().split('：')[1].trim(), //备注
							bz: $tds.eq(15).text().trim(), //.split('：')[1].trim(), //备注
							mainTeacher: mainTeacher,
							teacherList: teacherList
						};
						newKaike.bz = newKaike.bz.substring(newKaike.bz.indexOf('：') + 1);
						kaike.zdrs = parseInt(newKaike.zdrs);
						kaike.yxkrs = parseInt(newKaike.yxkrs);
						kaike.bz = newKaike.bz;
						return kaike;
					}
				});
			}

			function getParams(d, xyid) {
				var params = {
					__EVENTARGUMENT: '', //d.find('#__EVENTARGUMENT').val(),
					__EVENTTARGET: 'gridGModule$ctl' + xyid + '$radioButton', //102是人文 103社会科学 104自然
					__EVENTVALIDATION: d.find('#__EVENTVALIDATION').val(),
					__LASTFOCUS: d.find('#__LASTFOCUS').val(),
					__VIEWSTATE: d.find('#__VIEWSTATE').val(),
					__VIEWSTATEGENERATOR: d.find('#__VIEWSTATEGENERATOR').val(),
				};
				params['gridGModule$ctl' + xyid + '$radioButton'] = 'radioButton';
				return params;
			}

			function paramsToQueryString(params) {
				var s = "";
				var first = true;
				for (var k in params) {
					if (!first)
						s += "&";
					first = false;
					//s += encodeURIComponent(k);
					s += k;
					s += "=";
					//s += encodeURIComponent(params[k]);
					s += params[k];
				}
				return s;
			}
			var flag = 0;
			//返回已选的课程的bsid的数组
			function getMySelection() {
				var url = "http://electsys.sjtu.edu.cn/edu/student/elect/removeLessonFast.aspx";
				return $http.get(url).then(function (result) {
					var $d = $(result.data);
					var list = [];
					$d.find("a").each(function () {
						var $a = $(this);
						var href = $a.attr('href');
						var index1 = href.indexOf('=');
						var index2 = href.indexOf('&');
						var bsid = href.substring(index1 + 1, index2);
						list.push(bsid);
					});
					return list;
				});
			}
			return {
				init:init,
				//提交选课结果
				submit: function () {
					var url = "http://electsys.sjtu.edu.cn/edu/student/elect/removeLessonFast.aspx";
					//以任意一个页面为起点 发送post请求带上某些参数就行了
					return $http.get(url).then(function (result) {
						var $d = $(result.data);
						var params = getParams($d);
						var d = $q.defer();
						$.post(url, $.extend(params, {
							btnSubmit: '选课提交'
						}), d.resolve);
						return d.promise;
					}).then(function (data) {
						var $d = $(data);
						var d = $q.defer();
						if (data.indexOf('请等待教务处的微调结果') > 0)
							d.resolve('请等待教务处的微调结果');
						else
							d.reject($d.find('.gridtxt').text());
						return d.promise;
					});
				},
				getMySelection: getMySelection,
				stop: function () {
					++flag;
				},
				tui: function (k) {
					var url = "http://electsys.sjtu.edu.cn/edu/student/elect/removeRecommandLesson.aspx?bsid=" + k.bsid + "&redirectForm=removeLessonFast.aspx";
					return $http.get(url); //似乎是一定成功的 这是一个get请求!
				},
				qiang: function (k) {
					//获取类型
					var xyid = k.course.xy.xyid;
					if (xyid == '1' || xyid == '2' || xyid == '3' || xyid == '4') { //人文
						var url = 'http://electsys.sjtu.edu.cn/edu/student/elect/speltyCommonCourse.aspx';
						return $http.get(url).then(function (result) { //第一步 进入通识课页面
							var d = $q.defer();
							if (result.data.indexOf('请勿频繁刷新本页面') >= 0) {
								d.reject('请勿频繁刷新本页面');
							} else {
								var $d = $(result.data);
								var params = getParams($d, '0' + (parseInt(xyid) + 1));
								$.post(url, params, d.resolve); //第二步 选择一个通识课类型 并提交
							}
							return d.promise;
							//return $http.post(url, paramsToQueryString(params));
						}).then(function (data) {
							var d = $q.defer();
							if (data.indexOf('请勿频繁刷新本页面') >= 0) {
								d.reject('请勿频繁刷新本页面');
							} else {
								var $d = $(data);
								var url = "http://electsys.sjtu.edu.cn/edu/student/elect/speltyCommonCourse.aspx";
								$.post(url, $.extend(getParams($d), { //第三步 选择一个课程 并查看信息
									myradiogroup: k.course.cid,
									lessonArrange: '课程安排'
								}), d.resolve);
							}
							return d.promise;
						}).then(function (data) {
							var d = $q.defer();
							if (data.indexOf('请勿频繁刷新本页面') >= 0) {
								d.reject('请勿频繁刷新本页面');
							} else {

								if (data.indexOf('通识课门数已达到上限') >= 0) {
									d.reject('通识课门数已达到上限');
								} else {
									var $d = $(data);
									var url = "http://electsys.sjtu.edu.cn/edu/lesson/viewLessonArrange.aspx?kcdm=" + k.course.cid + "&xklx=%u901a%u8bc6&redirectForm=speltyCommonCourse.aspx&yxdm=&tskmk=420&kcmk=-1&nj=%u65e0"
										//document.write(data);
									$.ajax(url, {
										type: 'post',
										data: $.extend(getParams($d), {
											myradiogroup: k.bsid,
											"LessonTime1$btnChoose": '选定此教师'
										}),
										error: d.reject,
										success: d.resolve
									});
									/*$.post(url, $.extend(getParams($d), {
										myradiogroup: k.bsid,
										"LessonTime1$btnChoose": '选定此教师'
									}), d.resolve);*/
								}
							}
							return d.promise;
						});
					} else {
						var url = "http://electsys.sjtu.edu.cn/edu/student/elect/outSpeltyEP.aspx";
						return $http.get(url).then(function (result) { //第一步 打开任选课
							var $d = $(result.data);
							var params = getParams($d);
							var d = $q.defer();
							$.post(url, $.extend(params, {
								'OutSpeltyEP1$dpYx': k.course.xy.xyid,
								'OutSpeltyEP1$dpNj': 2015,
								'OutSpeltyEP1$btnQuery': '查 询'
							}), d.resolve); //第二步选择学院和年级
							return d.promise;
						}).then(function (data) {
							var $d = $(data);
							var params = getParams($d);
							var d = $q.defer();
							$.post(url, $.extend(params, {
								'OutSpeltyEP1$dpYx': k.course.xy.xyid,
								'OutSpeltyEP1$dpNj': 2015,
								'myradiogroup': k.course.cid,
								'OutSpeltyEP1$lessonArrange': '课程安排'
							}), d.resolve);
							return d.promise;
						}).then(function (data) {
							var url = 'http://electsys.sjtu.edu.cn/edu/lesson/viewLessonArrange.aspx?kcdm=' + k.course.cid + '&xklx=%u9009%u4fee&redirectForm=outSpeltyEp.aspx&yxdm=' + k.course.xy.xyid + '&nj=2015&kcmk=-1&txkmk=-1';
							var $d = $(data);
							var params = getParams($d);
							var d = $q.defer();
							$.ajax(url, {
								data: $.extend(params, {
									myradiogroup: k.bsid,
									'LessonTime1$btnChoose': '选定此教师'
								}),
								type: 'post',
								error: d.reject,
								success: d.resolve
							});
							return d.promise;
						});
					}
				},
				getKaikeListByXY: function (xy, noCache) {
					var myflag = ++flag; //拯救了世界
					var kaikeList;
					var lastD = null;
					//复制一份防止修改
					var kaikeList = new Array(xy.kaikeList.length);
					for (var i = 0; i < xy.kaikeList.length; ++i)
						kaikeList[i] = xy.kaikeList[i];
					for (var i = 0; i < kaikeList.length; ++i) {
						var kaike = kaikeList[i];
						if (lastD) {
							(function (kaike, noCache) {
								lastD = lastD.then(function () {
									var d = $q.defer();
									if (myflag != flag) {
										d.reject('由于flag, 已经取消!');
									} else {
										fetchNewKaike(kaike, noCache).then(function () {
											d.resolve();
											//$timeout(d.resolve, 200); //做人好一点 200一次	
										});
									}
									return d.promise;
								});
							})(kaike, noCache);
						} else {
							lastD = fetchNewKaike(kaike, noCache);
						}
					}
					return kaikeList;
				},
				getKaike: function (k) {
					fetchNewKaike(k, true);
					//alert('todo...');
					//return KaikeCache.get(bsid);
					//铺天盖地地找
				},
				//获得院系列表
				getXYList: function () {
					return xkdata.xyList;
					//return xy_list;
				},
				getMy: function () {
					return xkdata.my;
				},

				//判断是否登陆
				isLogin: function () {
					var d = $q.defer();
					$http.get(xzc.urls.userinfo).success(function (data) {
						d.resolve(data.indexOf('您不能操作该功能') == -1);
					});
					return d.promise;
				},

				//获取用户信息
				getUserinfo: function () {
					var d = $q.defer();
					$http.get(xzc.urls.userinfo).success(function (data) {
						var $dom = $(data);
						if (data.indexOf('您不能操作该功能') != -1)
							d.reject('你还没有登陆'); //未登录
						else {
							var userinfo = {
								xy: $dom.find('#lblYxmc').text(),
								zy: $dom.find('#lblZymc').text(),
								bj: $dom.find('#lblBj').text(),
								xh: $dom.find('#lblXh').text(),
								name: $dom.find('#lblXm').text()
							};
							d.resolve(userinfo);
						}
					});
					return d.promise;
				}
			};
		}])
});