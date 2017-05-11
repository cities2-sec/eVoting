angular.module('MainApp', ['ngRoute'])

.config(['$routeProvider', '$locationProvider', function ( $routeProvider, $locationProvider){
	$locationProvider.html5Mode({
		enabled:true, requireBase: false
	});

	$routeProvider
	.when('/', {
		templateUrl: '',
		controller: 'mainController'
	})
	.when('/censo', {
		templateUrl: '',
		controller: 'censoController'
	})
	.when('/urna', {
		templateUrl: '',
		controller: 'urnaController'
	})

	.when('/melectoral', {
		templateUrl: '',
		controller: 'melectoralController'
	})
}])



.controller('mainController',function ($scope, $http) {

		var bitlength = 1024;
		$scope.keys = {};

		$scope.createOurKey  = function() {
			var keys = rsa.generateKeys(bitlength);
			var sKey = keys.privateKey.d.toString();
			var pKey = keys.privateKey.publicKey.n.toString();

			var a = [];
			do { a.push(sKey.substring(0,47))}
			while((sKey = sKey.substring(47,sKey.length)) != "");
			var privateKey = a.toString().split(",").join("\n");
			var a = [];
			do { a.push(pKey.substring(0,47))}
			while((pKey = pKey.substring(47,pKey.length)) != "");
			var publicKey = a.toString().split(",").join("\n");

			var blob = new Blob([
				"--------------BEGIN RSA PRIVATE KEY--------------\n\n"
				+privateKey+
				"\n\n---------------END RSA PRIVATE KEY---------------\n"+
				"--------------BEGIN RSA PUBLICK KEY--------------\n\n"
				+publicKey+
				"\n\n---------------END RSA PUBLICK KEY----------------\n"
			],
			{type: "text/plain;charset=utf-8"});
			saveAs(blob, "MyKeys.txt");

		}
		$scope.permiso = function(){
			console.log("hola")
			Notification.requestPermision();
		}

		//GET keys from Censo
		$scope.getCensoKeys = function(){
			$http.get('/censo/key')
			.then(function successCallback(response){
				if(response.status == 200){
					$scope.keys=response.data;
					console.log($scope.keys);

					var notify = {
					    type: 'success',
					    title: 'Create Item Successful!',
					    content: $scope.keys,
					    timeout: 5000 //time in ms
					};
					$scope.$emit('notify', notify);
				}
			},function errorCallback(response){
				console.log(response.status+ " " +response.data);
			})

			/*.success(function(data) {
				$scope.keys = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});*/

			$scope.permiso = function(){
				console.log("hola")
				//Notification.requestPermision();
			}


		}
});
