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

.controller('mainController',function ($scope, $http, $localStorage, $sessionStorage) {
	var bitlength = 128;
	var userKeys;
	$scope.censoKeys = {};
	$scope.userinfo =  {};
	$scope.userKeys = {};
	$scope.login = {};
	$scope.election = {};
	$scope.parties = {};

	//ERROR MESSAGE
	$scope.alertText ={};
	$scope.showAlert = false;

$scope.login.username = "47915398G";
$scope.login.password = "pass";


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


//llamar function elections


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

	// Login NIF+pass
	$scope.logIn = function (){
		$scope.login.username = $scope.login.username.toUpperCase();
		var nif = $scope.nif($scope.login.username);
		if (nif === 0){
			$http.post('censo/login', $scope.login)
			.then(function successCallback(response){
				if(response.status === 200){
					$localStorage.token = response.data.token;
					$localStorage._id = response.data.user._id;
					$scope.userinfo = response.data.user;
					$scope.login = {}; // Borramos los datos del formulario
					console.log("My token is "+ $localStorage.token);
					console.log("My _id"+ $localStorage._id);
					console.log($scope.userinfo);

				}
			},function errorCallback(response){
				if(response.status === 400){ // Falta el USuario o Contraseña
					console.log('Error: ' + response.data.message);
					$scope.alertText =response.data.message;
					$scope.showAlert = true;
				}
				if(response.status === 401){ // Usuario o Contraseña incorrecto
					console.log('Error: ' + response.data.message);
					$scope.alertText =response.data.message;
					$scope.showAlert = true;
				}
				if(response.status === 404){ //USER DOESN'T EXIST
					console.log('Error: ' + response.data.message);
					$scope.alertText =response.data.message;
					$scope.showAlert = true;
				}
				if(response.status === 500){ //SERVER ERROR
					console.log(response.data.message);
					$scope.alertText =response.data.message;
					$scope.showAlert = true;
				}

			})
		}
	};
	// Check NIF
	$scope.nif = function(dni){
		var number, word, words, regular_expression_nif;

		regular_expression_nif = /^\d{8}[A-Z]$/;

		if(regular_expression_nif.test (dni) === true){
			 number = dni.substr(0,dni.length-1);
			 word = dni.substr(dni.length-1,1);
			 number = number % 23;
			 words='TRWAGMYFPDXBNJZSQVHLCKET';
			 words=words.substring(number,number+1);
			if (words!==word.toUpperCase()) {
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
	$scope.fileKeys = function(sKey,pKey,nKey){
		console.log(sKey);
		console.log(pKey);
		var a = [];
		do { a.push(sKey.substring(0,47))}
		while((sKey = sKey.substring(47,sKey.length)) !== "");
		var privateKey = a.toString().split(",").join("\n");
		var a = [];
		do { a.push(pKey.substring(0,47))}
		while((pKey = pKey.substring(47,pKey.length)) !== "");
		var publicKey = a.toString().split(",").join("\n");
		var a = [];
		do { a.push(nKey.substring(0,47))}
		while((pKey = nKey.substring(47,nKey.length)) !== "");
		var publicKey_n = a.toString().split(",").join("\n");

		var blob = new Blob([
			"--------------BEGIN RSA PRIVATE KEY--------------\n\n"
			+privateKey+
			"\n\n---------------END RSA PRIVATE KEY---------------\n"+
			"--------------BEGIN RSA PUBLICK KEY--------------\n\n"
			+publicKey+"."+publicKey_n+
			"\n\n---------------END RSA PUBLICK KEY--------------\n"
		],
		{type: "text/plain;charset=utf-8"});
		saveAs(blob, "MyKeys.txt");
	}

	//Create our Keys [skey = privateKey, pkey = publicKey]
	$scope.createOurKey  = function() {
		userKeys = rsa.generateKeys(bitlength);
		$scope.userKeys = userKeys;
		var sKey = userKeys.privateKey.d.toString();
		var pKey = userKeys.privateKey.publicKey.e.toString();
		var nKey = userKeys.privateKey.publicKey.n.toString();
		$scope.fileKeys(sKey, pKey, nKey);
	};
	//GET keys from CENSO
	$scope.getCensoKeys = function(){
		$http.get('/censo/key')
		.then(function successCallback(response){
			if(response.status === 200){
				$scope.censoKeys=response.data;
				console.log($scope.censoKeys);
			}
		},function errorCallback(response){
			if(response.status === 500){
				console.log(response.data.message);
			}
			if(response.status === 404){
				console.log('Error: ' + response.data.message);
			}
		})
	}
	// GET AnonimID from CENSO
	$scope.getAnonimID = function(){
		var r,bm,pk,nc,ec,eu,nu;

		r = bigInt.randBetween("0", "1e100");

		nc = bigInt($scope.censoKeys.publicKey.n);
		ec = bigInt($scope.censoKeys.publicKey.e);
		eu = bigInt($scope.userKeys.publicKey.e);
		nu = bigInt($scope.userKeys.publicKey.n);

		pk = nu;
		//console.log(pk);
		bm = pk.multiply(r.modPow(ec, nc)).mod(nc);
		var identity = bm.toString(16);//Hexadecimal
		//console.log(bm);

		/*var body_sign = ({
			signid : identity,
			_id : $localStorage._id
		});*/

		var body_sign = ({
			signid : identity,
			_id : $localStorage._id
		});
		console.log(body_sign);


		var options = {
        headers: {
            'Content-Type': 'application/json',
            //'Content-Length': body_sign.toString().length,
            'Authorization': "Bearer "+ $localStorage.token
        }
		}

		//var result =  m.modPow(e, n);
		$http.post('/censo/identity/request',body_sign, options)
		.then(function successCallback(response){
			if(response.status == 200){
				console.log("anonim id   "+response.data.anonim_id);
				//var id = bigInt(parseInt(response.data.anonim_id,16));
				var id_2 = bigInt(response.data.anonim_id,16);
				//console.log("decimal id   "+id.toString());
				console.log("decimal id   "+id_2.toString());
				var identity_anonim =  id_2.multiply(r.modInv(nc)).mod(nc);
				console.log("invtid   "+identity_anonim.toString());

				var prueba = userKeys.publicKey.verify(identity_anonim);
				console.log(prueba.toString());
				console.log($scope.userKeys.publicKey.n.toString());
			}
		},function errorCallback(response){
			console.log(response.status+ " " +response.data.message+ " " +response.data.anonim_id);
			console.log("anonim id   "+response.data.anonim_id);
			var id = bigInt(parseInt(response.data.anonim_id,16));
			var id_2 = bigInt(response.data.anonim_id,16);
			console.log("decimal id   "+id.toString());
			console.log("decimal id   "+id_2.toString());
			var identity_anonim =  id_2.multiply(r.modInv(nc)).mod(nc);
			console.log("invtid   "+identity_anonim.toString());


			console.log($scope.censoKeys.privateKey.d);
			dc = bigInt($scope.censoKeys.privateKey.d);

			var prueba =  pk.modPow(dc, nc);

			console.log(prueba.toString());


		})
	};

	$scope.getCensoKeys();
});
