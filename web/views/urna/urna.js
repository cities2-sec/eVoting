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
    $scope.idvotedParty={};
    $scope.file={};

    window.onload = function() {
        var fileInput = document.getElementById('fileInput');

        fileInput.addEventListener('change', function(e) {
            var file = fileInput.files[0];
            var textType = /text.*/;
            if (file.type.match(textType)) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    console.log(reader.result);
                    $scope.file.id = reader.result;
                    console.log( $scope.file);
                }
                reader.readAsText(file);
            } else {
            }
        });

        var fileInput2 = document.getElementById('fileInput2');

        fileInput2.addEventListener('change', function(e) {
            var file2 = fileInput2.files[0];
            var textType = /text.*/;
            if (file2.type.match(textType)) {
                var reader2 = new FileReader();
                reader2.onload = function(e) {
                    console.log(reader2.result);
                    $scope.file.pk = reader2.result;
                    console.log($scope.file);
                }
                reader2.readAsText(file2);
            } else {
            }
        });
    }


    $scope.vote = function(id) {
        console.log(id);
        $scope.idvotedParty = id;
        console.log($scope.idvotedParty);
    };

    $scope.voteConfirm = function() {

		//encriptar con la publica de la mesa antes de enviarlo a la BD


        //firmar el voto encriptado con la Privada del usuario


        //concat
		var voto = $scope.idvotedParty + '%' + $scope.file.id + '%' + $scope.file.pk;
		console.log("votoooo");
		console.log(voto);

		var voto2 = {"voto" : voto};
		console.log(voto2);
		//send to BD
        $http.post('/urna/vote',{voto: voto})
            .then(function successCallback(response){
                if(response.status == 200){
                    console.log(response.status+ " " +response.data.message);

                }
            },function errorCallback(response){
                if(response.status == 500){
                    console.log(response.data.message);
                }
                if(response.status == 400){
                    console.log('Error: ' + response.data.message);
                }
                if(response.status == 500){
                    console.log('Error: ' + response.data.message);
                }
                if(response.status == 403){
                    console.log('Error: ' + response.data.message);


                }
                if(response.status == 404){
                    console.log('Error: ' + response.data.message);
                }
            })
	};

});
