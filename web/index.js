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
	var bitlength = 128;
	var userKeys,censoKeys;
	$scope.censoKeys = {};
	$scope.userKeys = {};

	//Create our Keys
	$scope.createOurKey  = function() {
		userKeys = rsa.generateKeys(bitlength);
		$scope.userKeys = userKeys;
		var sKey = userKeys.privateKey.d.toString();
		var pKey = userKeys.privateKey.publicKey.e.toString();
		console.log(pKey);

		/*var a = [];
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
		*/
	}

	//GET keys from Censo
	$scope.getCensoKeys = function(){
		$http.get('/censo/key')
		.then(function successCallback(response){
			if(response.status == 200){
				censoKeys = response.data;
				//console.log(censoKeys);
				$scope.censoKeys=response.data;
				console.log($scope.censoKeys);
			}
		},function errorCallback(response){
			console.log(response.status+ " " +response.data);
		})
	}


	$scope.getAnonimID = function(){
		var r,bm,pk,nc,ec, eu, nu;
		r = bigInt.randBetween("0", "1e100");

		nc = bigInt($scope.censoKeys.publicKey.n);
		ec = bigInt($scope.censoKeys.publicKey.e);
		eu = bigInt($scope.userKeys.publicKey.e);
		nu = bigInt($scope.userKeys.publicKey.n);

		pk = nu;
		console.log(pk);

		bm = pk.multiply(r.modPow(ec, nc)).mod(nc);

		var identity = bm.toString(16);

		console.log(bm);
		var sign = ({
			id : identity
		});

		console.log(sign);

		//var result =  m.modPow(e, n);

		$http.post('/censo/identity/request2',sign)
		.then(function successCallback(response){
			if(response.status == 200){
				console.log(response.data.toString());
			}
		},function errorCallback(response){
			console.log(response.status+ " " +response.data);
		})

		//Blind the message
		//  var bm =   m.mul(r.powm(keys.publicKey.e, keys.publicKey.n)).mod(keys.publicKey.n);
		/*
		$http.get('/censo/key')
		.then(function successCallback(response){
			if(response.status == 200){
				$scope.keys=response.data;
				console.log($scope.keys);
			}
		},function errorCallback(response){
			console.log(response.status+ " " +response.data);
		})
		*/
	}
});
