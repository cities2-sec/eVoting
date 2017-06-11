angular.module('MainApp', ['ngStorage'])

.controller('homeController',function ($scope, $http, $localStorage, $sessionStorage, $window) {

	$scope.fileKey = function(sharedkeys){
		for(i=0; i<sharedkeys.length;i++){
			var sharedkey = sharedkeys[i];
			var a = [];
				do { a.push(sharedkey.substring(0,47))}
				while((sharedkey = sharedkey.substring(47,sharedkey.length)) != "");
				var key = a.toString().split(",").join("\n");

				var blob = new Blob([key],
				{type: "text/plain;charset=utf-8"});
				saveAs(blob, "sharedkey"+i+".txt");
		}
	}

	$scope.get_shared_keys = function(){

		$http.get('election/shared_keys')
		.then(function successCallback(response){
			if(response.status == 200){
				console.log(response.data);
				$scope.fileKey(response.data);
			}
		},function errorCallback(response){
			if(response.status == 500){
				console.log(response.data.message);
			}
			if(response.status == 404){
				console.log(response.data.message);
			}
		})
	}

	$scope.get_shared_keys();
});
