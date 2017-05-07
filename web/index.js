angular.module('MainApp', ['ngRoute','MainApp.login', 'ngMaterial'])

.config(['$routeProvider', '$locationProvider', function ( $routeProvider, $locationProvider){
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
		$scope.newKey = {};
		$scope.username = {};
		$scope.keys = {};
		$scope.selected = false;
		$scope.users = [];
		var n,e;
		var username;


    	var keys = rsa.generateKeys(512);
    	console.log(keys);
    	console.log(keys.publicKey.n.toString());


		var a = [];
		var s = keys.privateKey.d.toString();
		do { a.push(s.substring(0,47))}
		while((s = s.substring(47,s.length)) != "");
		var text = a.toString().split(",").join("\n");

		/*var blob = new Blob([
			"------------------PRIVATE KEY------------------\n\n"
			+text+
			"\n\n-----------------------------------------------"
		],
		{type: "text/plain;charset=utf-8"});
		saveAs(blob, "testfile.txt");*/


		$scope.setUsername = function() {
			username = $scope.username.text;
		   //$scope.username = {};
				console.log("My username is " + username);
		    // If the username is valid
		    if (username) {
		      // Tell the server your username
		      socket.emit('add user', username);
		    }
			};


		// Obtenemos publicKey de la base de datos
		/*$http.get('/api/keys').success(function(data) {
			$scope.keys = data;
			console.log(data);

			n = bigInt(data[0].n);
		  e = bigInt(data[0].e);

			$(function(){
				$('[data-toggle="popover"]').popover({
					container:'body'
				})
			});
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});
*/
});
