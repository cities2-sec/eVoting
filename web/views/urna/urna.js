angular.module('MainApp', ['ngStorage'])

.controller('urnaController',function ($scope, $http, $localStorage, $sessionStorage, $window) {
	var bitlength = 128;
	var userKeys;
	$scope.censoKeys = {};
	$scope.userinfo =  {};
	$scope.userKeys = {};
	$scope.id_request = null;

	$scope.election = {};
	$scope.parties = {};


	$(function () {
			$('.btn-radio').click(function(e) {
					$('.btn-radio').not(this).removeClass('active')
							.siblings('input').prop('checked',false)
							.siblings('.img-radio').css('opacity','0.5');
					$(this).addClass('active')
							.siblings('input').prop('checked',true)
							.siblings('.img-radio').css('opacity','1');
			});
	});


	// get parties
    $scope.elections = function () {
        $http.get('election/get_election')
            .then(function successCallback(response){
                if(response.status == 200){
                    $scope.election=response.data;
                    console.log($scope.election);
                    $scope.parties = $scope.election[0].parties;
                    console.log("ELECCIONES:" + $scope.parties);
                    console.log($scope.parties);

                }
            },function errorCallback(response){
                if(response.status == 500){
                    console.log(response.data.message);
                }

            })
    }
    $scope.elections();


	//GET keys from CENSO
	$scope.getCensoKeys = function(){
		$http.get('/censo/key')
		.then(function successCallback(response){
			if(response.status == 200){
				$scope.censoKeys=response.data;
				console.log($scope.censoKeys);
			}
		},function errorCallback(response){
			if(response.status == 500){
				console.log(response.data.message);
			}
			if(response.status == 404){
				console.log('Error: ' + response.data.message);
			}
		})
	}


	$scope.getCensoKeys();

});
