angular.module('MainApp', ['ngRoute','ngStorage'])

.controller('mainController',function ($scope, $http, $localStorage, $sessionStorage, $window) {
	var bitlength = 128;
	var userKeys;
	$scope.censoKeys = {};
	$scope.userinfo =  {};
	$scope.userKeys = {};
	$scope.login = {};


	console.log($localStorage.token);

	//TOKEN
	$scope.token = function(){
		var options = {
        headers: {
            'Content-Type': 'application/json',
            //'Content-Length': body_sign.toString().length,
            'Authorization': "Bearer "+ $localStorage.token
        }
		}
		$http.get('censo/private',options)
		.then(function successCallback(response){
			if(response.status == 200){
				console.log(response.data.message);
			}
		},function errorCallback(response){
			if(response.status == 400){ // Bad Request
				console.log('Error: ' + response.data.message);
				//$http.get('censo/login');
				$window.location.href = "/censo/login";
			}
			if(response.status == 401){ // Unauthorized
				console.log('Error: ' + response.data.message);
				//$http.get('censo/login');
				$window.location.href = "/censo/login";
			}
			if(response.status == 500){ //USER DOESN'T EXIST
				console.log('Error: ' + response.data.message);
				//$http.get('censo/login');
				$window.location.href = "/censo/login";
			}
		})
	}

	$scope.token();
});
