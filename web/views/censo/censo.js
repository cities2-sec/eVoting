angular.module('MainApp', ['ngStorage'])

.controller('censoController',function ($scope, $http, $localStorage, $sessionStorage, $window) {
	var bitlength = 1024;
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
		console.log("NNNNNN:"+userKeys.publicKey.n.toString());
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
	/* Sin no repudio
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
	*/

    $scope.signout= function(){
        $window.location.href = "/censo/login";
        $localStorage.token = {};
        $localStorage._id  = {};

	};

	$scope.getAnonimID_nonRepudiation = function() {
		var r = bigInt.randBetween("0", "1e100");
		$scope.r = r;

		var nc = bigInt($scope.censoKeys.publicKey.n);
		var ec = bigInt($scope.censoKeys.publicKey.e);
		var nu = bigInt($scope.userKeys.publicKey.n);
		var du = bigInt($scope.userKeys.privateKey.d);

		// la identidad es la clave publica del usuario
		pk = nu;
		var pk_hex = pk.toString(16);
		console.log("Identidad sin cegarhex: "+pk.toString(16));
		console.log("Identidad sin cegarhex--dec:"+bigInt(pk_hex,base=16));

		// cegamso la identidad con r
		var bm = pk.multiply(r.modPow(ec, nc)).mod(nc);
		var identity = bm.toString(16);//Hexadecimal

		// preparo el primer mensaje enviando la identidad cegada para que la firme el censo
		var body = JSON.stringify({
			"msgid": 1,
			"msg": identity
		});

		var options = {
			headers: {
				'Content-Type': 'application/json',
				//'Content-Length': body_sign.toString().length,
				'Authorization': "Bearer "+ $localStorage.token
			}
		}

		$http.post('/censo/identity/requestnr',body, options)
			.then(function successCallback(response){
				var body = response.data;
				//console.log(JSON.stringify(body));

				$scope.cipheredID = body.C;

				// comprobacion de Po
				var unsignedPo = bigInt(body.Po, 16).modPow($scope.censoKeys.publicKey.e, $scope.censoKeys.publicKey.n);
				var myPoString = body.src+"%"+body.dst+"%"+body.C;
				var myPoHash = CryptoJS.SHA256(myPoString);
				var PoHash = unsignedPo.toString(16);

				if(PoHash == myPoHash) {
					console.log("Po verificado");
				}
				else{
					console.log("Po erroneo");
					return;
				}

				// genero Pr para enviarlo en la response
				var PrString = "B%A%"+body.C;
				//console.log("PrString: "+PrString);
				var PrHash = CryptoJS.SHA256(PrString).toString(CryptoJS.enc.Hex);
				//console.log("Pr hash: "+PrHash);
				var unsignedPr = bigInt(PrHash, 16);
				//console.log("unsignedPr: "+unsignedPr.toString());
				var signedPr = unsignedPr.modPow($scope.userKeys.privateKey.d.toString(), $scope.userKeys.publicKey.n.toString());
				//console.log("signedPr: "+signedPr.toString());
				var signedPrHash = signedPr.toString(16);
				//console.log("signedPrHash: "+signedPrHash);

				// envio la respuesta con la proof of reception
				var msg2 = {
					"msgid": 2,
					"msg": {
						"src": "B",
						"dst": "A",
						"Pr": signedPrHash,
						"publicKey": {
							"bits": $scope.userKeys.publicKey.bits,
							"n": $scope.userKeys.publicKey.n.toString(16),
							"e": $scope.userKeys.publicKey.e.toString(16)
						}
					}
				}

				$scope.sendMsg2_nonRepudiation(msg2);

			},function errorCallback(response){
				console.log("Error: "+response.status);
				return;

			})
	}

	$scope.sendMsg2_nonRepudiation = function (msg) {
		var body = JSON.stringify(msg);

		var options = {
			headers: {
				'Content-Type': 'application/json',
				//'Content-Length': body_sign.toString().length,
				'Authorization': "Bearer "+ $localStorage.token
			}
		}

		//var result =  m.modPow(e, n);
		$http.post('/censo/identity/requestnr',body, options)
			.then(function successCallback(response){
				var body = response.data;
				// si usamos ctr solo hace falta la key
				var keyHex = body.key;

				var encryptedBytes = aesjs.utils.hex.toBytes($scope.cipheredID);
				var aesCtr = new aesjs.ModeOfOperation.ctr(aesjs.utils.hex.toBytes(keyHex));
				var decryptedBytes = aesCtr.decrypt(encryptedBytes);
				var decryptedHex = aesjs.utils.hex.fromBytes(decryptedBytes);

				// decryptedHex es la identidad cegada firmada por el censo
				// lo descegamos
				var nc = bigInt($scope.censoKeys.publicKey.n);
				var r = bigInt($scope.r);
				var dec_aid = bigInt(decryptedHex,16);
				var identity_anonim =  dec_aid.multiply(r.modInv(nc)).mod(nc); // identity_anonim es la identidad firmada


				// Comprobacion de que el proceso es correcto
				var ec = bigInt($scope.censoKeys.publicKey.e);
				var sinFirma = identity_anonim.modPow(ec, nc);
				console.log("***************** Comprobacion de la firma ******************");

				console.log("Clava publica usuario: "+$scope.userKeys.publicKey.n.toString(16));
				console.log("Identidad recibida sin firmar: "+sinFirma.toString(16));

				if(sinFirma.toString(16) == $scope.userKeys.publicKey.n.toString(16)) {
					console.log("Identidad obtenida correctamente");
					var now = new Date();
					$scope.userinfo.user.identityGivenDate = now.getFullYear()+"/"+now.getMonth()+"/"+now.getDate();
					$scope.fileID(identity_anonim.toString());
				} else {
					console.log("La identidad obtenida no es válida");
				}
			},function errorCallback(response){
				console.log("Error: "+response.status);
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
				if($scope.userinfo.user.identityGivenDate){
					var split = $scope.userinfo.user.identityGivenDate.split("T");
					var split2 = split[1].split("Z");
					var split3 = split2[0].split(".");
					$scope.userinfo.user.identityGivenDate = split[0]+" "+split3[0];
				}
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
