// 获取应用程序
angular.module('myApp', ['ui.router'])
// 第四步，在配置中定义路由
.config(function ($stateProvider, $urlRouterProvider) {
	// 通过state方法定义状态
	$stateProvider
	// 定义首页路由
	.state('home', {
		url: '/home', 	//定义路径
		templateUrl: 'view/home.html',
		controller: 'homeCtrl'	// 定义控制器
	})
	// 定义登录页路由
	.state('login', {
		url: '/login',
		templateUrl: 'view/login.html',
		controller: 'loginCtrl'
	})
	// 用户模块路由 列表页 详情页 创建页
	.state('userlist', {
		url: '/userlist/:pageNum', 		// 进入列表页，我们要知道是第几页
		templateUrl: 'view/user/list.html',
		controller: 'userListCtrl'
	})
	.state('userdetail', {
		url: '/userdetail/:userId', 	// 进入详情页，我们要知道查看的是哪个用户
		templateUrl: 'view/user/detail.html',
		controller: 'userDetailCtrl'
	})
	.state('usercreate', {
		url: '/usercreate',
		templateUrl: 'view/user/create.html',
		controller: 'userCreateCtrl'
	})
	// 新闻模块路由 列表页 详情页 创建页
	.state('newslist', {
		url: '/newslist/:pageNum',
		templateUrl: 'view/news/list.html',
		controller: 'newsListCtrl'
	})
	.state('newsDetail', {
		url: '/newsdetail/:newsId',
		templateUrl: 'view/news/detail.html',
		controller: 'newsDetailCtrl'
	})
	.state('newsCreate', {
		url: '/newscreate',
		templateUrl: 'view/news/create.html',
		controller: 'newsCreateCtrl'
	})
	// 定义默认路由 => 首页
	$urlRouterProvider
		.otherwise('/home')
})
// 定义头部控制器
.controller('headerCtrl', function ($scope, $http, $location, $rootScope) {
	// 查看用户是否登录过
	$http.get('action/checkLogin.php')
	// 监听回调函数
	.success(function (res) {
		// 判断正确返回，并且没有data信息，此时要跳转到登录页面登录
		if (res && res.errno === 0 && !res.data) {
			// 进入登录页面
			$location.path('/login')
		// 如果有返回的数据，我们更新用户名内容
		} else if (res && res.errno == 0 && res.data) {
			// 更新根作用域,
			// $scope.userName = res.data.username;
			$rootScope.userName = res.data.username
		}
		// 显示页面
		$rootScope.isShowAll = 'block';
	})
})
// 创建导航控制器
.controller('navCtrl', function ($scope) {
	// 定义导航数据
	$scope.list = [
		// 用户模块
		{
			// 定义模块名称
			title: '用户模块',
			// 定义子模块
			childList: [
				{
					subTitle: '用户列表',		// 表示子模块title
					link: '#/userlist/1'		// 子模块链接
				},
				{
					subTitle: '创建用户',
					link: '#/usercreate'
				}
			]
		},
		// 新闻模块
		{
			title: '新闻模块',
			childList: [
				{
					subTitle: '新闻列表',
					link: '#/newslist/1'
				},
				{
					subTitle: '创建新闻',
					link: '#/newscreate'
				}
			]
		}
	]
})
// 封装一个服务检测登录
.service('checkLogin', function ($rootScope, $location) {
	this.check = function () {
		// 判断用户是否登录过，只需要判断根作用域下是否有userName信息
		if (!$rootScope.userName) {
			// 进入登录页面
			$location.path('/login')
		}
	}
})
// 定义首页控制器
.controller('homeCtrl', function ($scope, $interval) {
	$scope.date = new Date()
	// 用interval服务，动态循环时间
	 $interval(function () {
	 	$scope.date = new Date();
	 })
})
// 定义登录页面控制器
.controller('loginCtrl', function ($scope, $http, $rootScope, $location) {
	// 添加点击事件
	$scope.goToLogin = function () {
		// 向login接口提交数据
		$http
			.post('action/login.php', $scope.user)
			// 监听返回数据
			.success(function (res) {
				// 如果返回成功，我们为更作用域添加userName数据
				if (res && res.errno === 0 && res.data) {
					$rootScope.userName = res.data.username;
					// 进入首页
					$location.path('/home')
				}
			})
	}
})
// 用户列表
.controller('userListCtrl', function ($scope, $http, $stateParams, checkLogin) {
	checkLogin.check();
	// 获取页面
	// 将num保存在作用域
	$scope.num = $stateParams.pageNum;
	// 为$socpe添加列表数据，数据需要有请求
	$http
		.get('action/userlist.php?pageNum=' + $scope.num)
		// 监听回调函数
		.success(function (res) {
			// 如果返回成功，将数据保存在list变量中
			if (res && res.errno === 0) {
				$scope.list = res.data;
			}
		})
})
// 用户详情
.controller('userDetailCtrl', function ($scope, $http, $stateParams, checkLogin) {
	checkLogin.check()
	// 请求数据
	$http
		.get('action/userdetail.json?userId=' + $stateParams.userId)
		// 监听回调函数
		.success(function (res) {
			// 如果数据请求成功，将数据保存下来
			if (res && res.errno === 0) {
				// 将数据保存在作用域的user变量中
				$scope.user = res.data
			}
		})
})
// 创建用户
.controller('userCreateCtrl', function ($scope, $http, $location, checkLogin) {
	checkLogin.check();
	// 定义提交事件
	$scope.submitUser = function () {
		// console.log($scope.user)
		// 提交数据
		$http
			.post('action/createuser.php', $scope.user)
			// 监听成功时候的回调方法
			.success(function (res) {
				// 如果成功, 进入列表页
				if (res && res.errno === 0) {
					$location.path('/userlist/1')
				} else {
					alert('提交失败了，请重新提交')
				}
			})
	}
})
// 新闻列表
.controller('newsListCtrl', function ($scope, $http, $stateParams, checkLogin) {
	checkLogin.check();
	// 请求数据渲染页面
	$scope.num = $stateParams.pageNum;
	// 根据页码请求数据
	$http
		.get('action/newslist.php?pageNum=' + $scope.num)
		// 监听回调
		.success(function (res) {
			// 如果请求成功
			if (res && res.errno === 0) {
				// 将数据存储
				$scope.list = res.data;
			}
		})

})
// 新闻详情
.controller('newsDetailCtrl', function ($scope, $http, $stateParams, checkLogin) {
	checkLogin.check();
	// 获取新闻id
	var id = $stateParams.newsId;
	// 请求数据
	$http
		.get('action/newsdetail.php?id=' + id)
		// 监听回调
		.success(function (res) {
			// 如果数据返回成功，我们存储数据
			if (res && res.errno === 0) {
				// 将data保存news变量中
				$scope.news = res.data;
			}
		})
})
// 创建新闻
.controller('newsCreateCtrl', function ($scope, $http, $location, checkLogin) {
	// 检测登录
	checkLogin.check();
	// 定义提交事件
	$scope.submitNews = function () {
		// 适配时间
		$scope.newsData.date = new Date().getTime();
		// 发送数据
		$http
			.post('action/createnews.php', $scope.newsData)
			// 监听回调函数
			.success(function (res) {
				// 如果返回成功，我们进入新闻列表页，
				if (res && res.errno === 0) {
					$location.path('/newslist/1')
				}
			})
	}
})