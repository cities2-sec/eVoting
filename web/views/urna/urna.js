angular.module('MainApp', ['ngStorage'])

.controller('urnaController',function ($scope, $http, $localStorage, $sessionStorage, $window) {
	var bitlength = 128;
	var userKeys;
	$scope.mesaKey = {};
	$scope.userinfo =  {};
	$scope.userKeys = {};
	$scope.id_request = null;

	$scope.election = {};
	$scope.parties = {};
    $scope.tuvoto = {};
    var Krsa = rsa.generateKeys(512);

    //encriptarPaillier
    function encryptPubkeyPaillier(m,r,n,g){
        var n2 = bigInt(n).pow(2);
        return (bigInt(g).modPow(m,n2).mod(n2)).multiply(r.modPow(n,n2)).mod(n2);
    }

    function blindMsg (message,random,e,n){
        return  (message.multiply(random.modPow(e,n))).mod(n);
    }
    function decryptPubKeyRemote (signed,e,n){
        return signed.modPow(e,n);
    }

    function convertToHex(str) {
        var hex = '';
        for (var i = 0; i < str.length; i++) {
            hex += '' + str.charCodeAt(i).toString(16);
        }
        return hex;
    }
    function hexToAscii(hexx) {
        var hex = hexx.toString();//force conversion
        var str = '';
        for (var i = 0; i < hex.length; i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    }
    function hexToBase64(str) {
        return btoa(String.fromCharCode.apply(null,
            str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
        );
    }
    function base64ToHex(str) {
        for (var i = 0, bin = atob(str.replace(/[\r\n]+$/, "")), hex = []; i < bin.length; ++i) {
            var tmp = bin.charCodeAt(i).toString(16);
            if (tmp.length === 1) tmp = "0" + tmp;
            hex[hex.length] = tmp;
        }
        return hex.join(" ");
    }


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
                if(response.status === 200){
                    $scope.election=response.data;
                    console.log($scope.election);
                    $scope.parties = $scope.election[0].parties;
                    console.log("ELECCIONES:" + $scope.parties);
                    console.log($scope.parties);

                }
            },function errorCallback(response){
                if(response.status === 500){
                    console.log(response.data.message);
                }

            })
    };
    $scope.elections();


	//GET keys from CENSO
	$scope.getMesaKeys = function(){
		$http.get('/mesa/keys')
		.then(function successCallback(response){
			if(response.status === 200){
                $scope.mesaKey=response.data;
                console.log($scope.mesaKey);
			}
		},function errorCallback(response){
			if(response.status === 500){
				console.log(response.data.message);
			}
			if(response.status === 404){
				console.log('Error: ' + response.data.message);
			}
		})
	};


	$scope.getMesaKeys();
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
                };
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
                };
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
        //peticion para clavePaillier

        $http.get('/urna/kpaillier').then(function (response) {

            //console.log(response);
            //console.log(response.data[0].publicKey.n);

            var msgHEX = convertToHex($scope.idvotedParty); //voto por el numero de id del candidato
            var msgToInt = bigInt(msgHEX, 16);
            var n = response.data[0].publicKey.n;
            var g = response.data[0].publicKey.g;
            var rand = bigInt.randBetween(0,n);


            if ($scope.idvotedParty.id == '01') {var voto = '001';}
            if ($scope.idvotedParty.id == '02') {var voto = '010'; }
            if ($scope.idvotedParty.id == '03') {var voto = '100'; }

            //encriptar el voto con la publica de la mesa usando paillier
            var Pencriptado = encryptPubkeyPaillier(msgToInt,rand,n,g);
            var VotoEncryptado = Pencriptado.toString(16); //voto que el votante mismo encripta

            //firmar voto encriptado con RSA con cLAVE PRIVADA
            var VotoEncriptadoFirmar = Krsa.VotoEncryptado.modPow(this.d, this.publicKey.n);; //m^d x r mod n
            console.log('Votoencriptado firmado: '+ VotoEncriptadoFirmar.toString(16));
            console.log("RSAKes: " + Krsa.publicKey.n.toString());
            tuvoto = VotoEncryptado;

            console.log("tuvoto " + tuvoto );

        }, function (err) {
            console.log("error al obtener las Claves de Paillier" + err.data);
        });




        //concat
        var voto = $scope.idvotedParty + '%' + $scope.file.id + '%' + $scope.file.pk;
        console.log("votoooo");
        console.log(voto);


		var voto = $scope.idvotedParty + '%' + $scope.file.id + '%' + $scope.file.pk;
		console.log("votoooo");
		console.log(voto);

		var voto2 = {"voto" : voto};
		console.log(voto2);
		//send to BD
        $http.post('/urna/vote',{voto: voto})
            .then(function successCallback(response){
                if(response.status === 200){
                    console.log(response.status+ " " +response.data.message);

                }
            },function errorCallback(response){
                if(response.status === 500){
                    console.log(response.data.message);
                }
                if(response.status === 400){
                    console.log('Error: ' + response.data.message);
                }
                if(response.status === 500){
                    console.log('Error: ' + response.data.message);
                }
                if(response.status === 403){

                    console.log('Error: ' + response.data.message);


                }


                if(response.status === 404){

                    console.log('Error: ' + response.data.message);
                }
            })

	};
});

/*
    $scope.EncriptarVoto = function () {
        //aqui conectarermos con la entidad de elecciones para conocer la Clave publica (paillier)
        $http.get('http://localhost:3000/Elecciones/KElecciones').success(function (response) {

            $scope.showMevotoencriptado = !$scope.showMevotoencriptado;

            // var msgHEX = convertToHex($scope.candidato.id); //voto por el numero de id del candidato



            var msgHEX = convertToHex(voto);
            var msgToInt = bigInt(msgHEX,16);
            var n = response.EpublicKEY.n;
            var g = response.EpublicKEY.g;
            var rand = bigInt.randBetween(0,n);
            var Cencriptado = encryptPubkeyPaillier(msgToInt,rand,n,g);
            var VotoEncryptado = Cencriptado.toString(16); //voto que el votante mismo encripta
            $scope.tuvoto = VotoEncryptado;
            //$scope.tuvoto = Cencriptado;
        });
    };

});
 */