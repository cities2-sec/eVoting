angular.module('MainApp', ['ngRoute','ngStorage'])

.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider){
	$locationProvider.html5Mode({
		enabled:true, requireBase: false
	});
	$routeProvider
	.when('/', {
		templateUrl: '',
		controller: 'mainController'
	})
	.when('/censo', {
		templateUrl: 'views/censo/index.html',
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

.controller('mainController',function ($scope, $http, $localStorage, $sessionStorage, $window) {

	$scope.censoKeys = {};
	$scope.userinfo =  {};
	$scope.login = {};

	//ERROR MESSAGE
	$scope.alertText ={};
	$scope.showAlert = false;

$scope.login.username = "47915398G";
$scope.login.password = "pass";



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
			$window.location.href = "/censo";
		}
	},function errorCallback(response){
		if(response.status == 400){ // Bad Request
			console.log('Error: ' + response.data.message);
			//$http.get('censo/login');
			$localStorage.token = {};
			$localStorage._id  = {};
		}
		if(response.status == 401){ // Unauthorized
			console.log('Error: ' + response.data.message);
			//$http.get('censo/login');
			$localStorage.token = {};
			$localStorage._id  = {};
		}
		if(response.status == 500){ //USER DOESN'T EXIST
			console.log('Error: ' + response.data.message);
			//$http.get('censo/login');
			$localStorage.token = {};
			$localStorage._id  = {};
		}
	})
}

$scope.token();
	// Login NIF+pass
	$scope.logIn = function (){
		$scope.login.username = $scope.login.username.toUpperCase();
		var nif = $scope.nif($scope.login.username);
		if (nif == 0){
			$http.post('censo/login', $scope.login)
			.then(function successCallback(response){
				if(response.status == 200){
					$localStorage.token = response.data.token;
					$localStorage._id = response.data.user._id;
					$scope.userinfo = response.data.user;
					$scope.login = {}; // Borramos los datos del formulario
					console.log("My token is "+ $localStorage.token);
					console.log("My _id"+ $localStorage._id);
					console.log($scope.userinfo);
					$window.location.href = "/censo";

				}
			},function errorCallback(response){
				if(response.status == 400){ // Falta el USuario o Contraseña
					console.log('Error: ' + response.data.message);
					$scope.alertText =response.data.message;
					$scope.showAlert = true;
				}
				if(response.status == 401){ // Usuario o Contraseña incorrecto
					console.log('Error: ' + response.data.message);
					$scope.alertText =response.data.message;
					$scope.showAlert = true;
				}
				if(response.status == 404){ //USER DOESN'T EXIST
					console.log('Error: ' + response.data.message);
					$scope.alertText =response.data.message;
					$scope.showAlert = true;
				}
				if(response.status == 500){ //SERVER ERROR
					console.log(response.data.message);
					$scope.alertText =response.data.message;
					$scope.showAlert = true;
				}

			})
		}
	}
	// Check NIF
	$scope.nif = function(dni){
		var number, word, words, regular_expression_nif

		regular_expression_nif = /^\d{8}[A-Z]$/;

		if(regular_expression_nif.test (dni) == true){
			 number = dni.substr(0,dni.length-1);
			 word = dni.substr(dni.length-1,1);
			 number = number % 23;
			 words='TRWAGMYFPDXBNJZSQVHLCKET';
			 words=words.substring(number,number+1);
			if (words!=word.toUpperCase()) {
				$scope.alertText = "DNI Incorrecto";
				$scope.showAlert = true;
				 return "NIF incorrect";
			 }else{
				 return "0";
			 }
		}else{
			$scope.alertText = "Formato Invalido";
			$scope.showAlert = true;
			 return "Invalid Format";
		 }
	}
	// Create File from Keys

});
