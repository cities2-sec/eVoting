angular.module('MainApp', ['ngStorage'])

.controller('censoController',function ($scope, $http, $localStorage, $sessionStorage, $window) {
	var bitlength = 128;
	var userKeys;
	$scope.censoKeys = {};
	$scope.userinfo =  {};
	$scope.userKeys = {};
	$scope.id_request = null;

	console.log($localStorage.token);
	console.log($localStorage._id);

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
				$localStorage.token = {};
				$localStorage._id  = {};
			}
			if(response.status == 401){ // Unauthorized
				console.log('Error: ' + response.data.message);
				//$http.get('censo/login');
				$window.location.href = "/censo/login";
				$localStorage.token = {};
				$localStorage._id  = {};
			}
			if(response.status == 500){ //USER DOESN'T EXIST
				console.log('Error: ' + response.data.message);
				//$http.get('censo/login');
				$window.location.href = "/censo/login";
				$localStorage.token = {};
				$localStorage._id  = {};
			}
		})
	}
	// Create File from Keys
	$scope.fileKeys = function(sKey,pKey,nKey){

		/*var hex_skey = sKey.toString(16);	//Hexadecimal
		var hex_pkey = pKey.toString(16);	//Hexadecimal
		var hex_nkey = nKey.toString(16);	//Hexadecimal*/

		var eVoting = new Blob([
			pKey+"."+nKey
		],{type: "text/plain;charset=utf-8"});
		saveAs(eVoting, "MyPublicKey.txt");
		var eVoting = new Blob([
			sKey+"."+nKey
		],{type: "text/plain;charset=utf-8"});
		saveAs(eVoting, "MyPrivateKey.txt");

		/*var a = [];
		do { a.push(sKey.substring(0,47))}
		while((sKey = sKey.substring(47,sKey.length)) != "");
		var privateKey = a.toString().split(",").join("\n");
		var a = [];
		do { a.push(pKey.substring(0,47))}
		while((pKey = pKey.substring(47,pKey.length)) != "");
		var publicKey = a.toString().split(",").join("\n");
		var a = [];
		do { a.push(nKey.substring(0,47))}
		while((pKey = nKey.substring(47,nKey.length)) != "");
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
		*/
	}
	$scope.fileID = function(aid){
		console.log(aid);
		var hex_aid = aid.toString(16);

		var eVoting = new Blob([
			hex_aid
		],{type: "text/plain;charset=utf-8"});
		saveAs(eVoting, "MyAnonimID.txt");

		/*var a = [];
		do { a.push(aid.substring(0,47))}
		while((aid = aid.substring(47,aid.length)) != "");
		var idanonim = a.toString().split(",").join("\n");

		var blob = new Blob([
			"--------------ID ANONIM--------------\n\n"
			+idanonim+
			"\n\n---------------END IDANIM---------------\n"
		],
		{type: "text/plain;charset=utf-8"});
		saveAs(blob, "ID.txt");
		*/
	}
	//Create our Keys [skey = privateKey, pkey = publicKey]
	$scope.createOurKey  = function() {
		userKeys = rsa.generateKeys(bitlength);
		$scope.userKeys = userKeys;
		console.log(userKeys);
		var sKey = userKeys.privateKey.d.toString(16);
		var pKey = userKeys.privateKey.publicKey.e.toString(16);
		var nKey = userKeys.privateKey.publicKey.n.toString(16);
		console.log(pKey);
		$scope.fileKeys(sKey, pKey, nKey);
		$scope.id_request = true;
	}
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
	// GET AnonimID from CENSO
	$scope.getAnonimID = function(){

		if ($scope.userinfo.user.identityGivenDate === undefined){
			console.log("Unblinding ID...");
			var r,bm,pk,nc,ec,eu,nu;
			var body_sign = null;
			r = bigInt.randBetween("0", "1e100");
			nc = bigInt($scope.censoKeys.publicKey.n);
			ec = bigInt($scope.censoKeys.publicKey.e);
			eu = bigInt($scope.userKeys.publicKey.e);
			nu = bigInt($scope.userKeys.publicKey.n);
			pk = nu;
			bm = pk.multiply(r.modPow(ec, nc)).mod(nc);
			console.log(bm)
			var identity = bm.toString(16);	//Hexadecimal
			console.log(identity);
			var body_sign = ({
				signid : identity,
				_id : $localStorage._id
			});
			console.log(body_sign);
		}
		else{
			console.log("No Created ID");
			var body_sign = ({
				signid : "no_id",
				_id : $localStorage._id
			});
		}
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
				console.log("Message: "+response.data.message+ " | Anonim_id: " +response.data.anonim_id);
				//$scope.userinfo.user.identityGivenDate = response.data.identityGivenDate;
				var split = response.data.identityGivenDate.split("T");
				var split2 = split[1].split("Z");
				var split3 = split2[0].split(".");
				$scope.userinfo.user.identityGivenDate = split[0]+" "+split3[0];

				var dec_aid = bigInt(response.data.anonim_id,16);
				console.log("decimal id   "+dec_aid.toString());
				var identity_anonim =  dec_aid.multiply(r.modInv(nc)).mod(nc);
				console.log("Unblind ID: "+identity_anonim.toString());

				$scope.fileID(identity_anonim.toString());
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
				console.log('ID: ' + response.data.anonim_id);
				//RECUPERAR ID???

			}
			if(response.status == 404){
				console.log('Error: ' + response.data.message);
			}
		})
	}

	$scope.getUser = function(){

		var options = {
				headers: {
						'Content-Type': 'application/json',
						//'Content-Length': body_sign.toString().length,
						'Authorization': "Bearer "+ $localStorage.token
				}
		}

		$http.get('/censo/user/' + $localStorage._id, options)
		.then(function successCallback(response){
			if(response.status == 200){
				$scope.userinfo=response.data;
				var split = $scope.userinfo.user.identityGivenDate.split("T");
				var split2 = split[1].split("Z");
				var split3 = split2[0].split(".");
				$scope.userinfo.user.identityGivenDate = split[0]+" "+split3[0];

				console.log("IdentityGivenDate: "+$scope.userinfo.user.identityGivenDate);
				if($scope.userinfo.user.identityGivenDate){
					$scope.id_request = true;
				}
				//$scope.userinfo.push(response.data);
				console.log($scope.userinfo);
			}
		},function errorCallback(response){
			if(response.status == 500){
				console.log(response.data.message);
			}
			if(response.status == 404){
				console.log('Error: ' + response.data.message);
				$window.location.href = "/censo/login";
				$localStorage.token = {};
				$localStorage._id  = {};

			}
		})

	}


	$scope.token();
	$scope.getCensoKeys();
	$scope.getUser();
});
