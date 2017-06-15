angular.module('MainApp', ['ngStorage'])

    .controller('urnaController', function ($scope, $http, $localStorage, $sessionStorage, $window) {

        $scope.alertText ={};
        $scope.showAlert = false;


        $scope.mesaKey = {};
        $scope.userinfo = {};
        $scope.userKeys = {};
        $scope.id_request = null;

        $scope.election = {};
        $scope.parties = {};
        //encriptarPaillier
        function encryptPubkeyPaillier(m, r, n, g) {
            console.log("m: " +m);
            var n2 = bigInt(n).pow(2);

           // return    (bigInt(g).modPow(m, n2)).multiply(r.modPow(n, n2)).mod(n2);
            return    (bigInt(g).mod(bigInt(m))).multiply(bigInt(r).modPow(bigInt(n), bigInt(n2)));
        }

        function blindMsg(message, random, e, n) {
            return (message.multiply(random.modPow(e, n))).mod(n);
        }

        function decryptPubKeyRemote(signed, e, n) {
            return signed.modPow(e, n);
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
            $('.btn-radio').click(function (e) {
                $('.btn-radio').not(this).removeClass('active')
                    .siblings('input').prop('checked', false)
                    .siblings('.img-radio').css('opacity', '0.5');
                $(this).addClass('active')
                    .siblings('input').prop('checked', true)
                    .siblings('.img-radio').css('opacity', '1');
            });
        });


        // get parties
        $scope.elections = function () {
            $http.get('election/get_election')
                .then(function successCallback(response) {
                    if (response.status === 200) {
                        $scope.election = response.data;
                        console.log($scope.election);
                        $scope.parties = $scope.election[0].parties;
                        console.log("ELECCIONES:" + $scope.parties);
                        console.log($scope.parties);

                    }
                }, function errorCallback(response) {
                    if (response.status === 500) {
                        console.log(response.data.message);
                    }

                })
        };
        $scope.elections();


        //GET keys from CENSO
        $scope.getMesaKeys = function () {
            $http.get('/mesa/keys')
                .then(function successCallback(response) {
                    if (response.status === 200) {
                        $scope.mesaKey = response.data;
                        console.log($scope.mesaKey);
                    }
                }, function errorCallback(response) {
                    if (response.status === 500) {
                        console.log(response.data.message);
                    }
                    if (response.status === 404) {
                        console.log('Error: ' + response.data.message);
                    }
                })
        };


        $scope.getMesaKeys();
        $scope.idvotedParty = {};
        $scope.file = {};

        $scope.filereadid = function () {
            var fileInput = document.getElementById("fileInput1");

            fileInput.addEventListener('change', function (e) {
                var file = fileInput.files[0];
                var textType = /text.*/;
                if (file.type.match(textType)) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        console.log(reader.result);
                        $scope.file.id = reader.result;
                        console.log($scope.file);
                    };
                    reader.readAsText(file);
                } else {
                }
            });
        }
        $scope.filereadpk = function () {
            var fileInput2 = document.getElementById("fileInput2");


            fileInput2.addEventListener('change', function (e) {
                var file2 = fileInput2.files[0];
                var textType = /text.*/;
                if (file2.type.match(textType)) {
                    var reader2 = new FileReader();
                    reader2.onload = function (e) {
                        console.log(reader2.result);
                        $scope.file.pk = reader2.result;
                        console.log($scope.file);
                    };
                    reader2.readAsText(file2);
                } else {
                }
            });
        }
        $scope.filereadprivk = function () {
            var fileInput3 = document.getElementById("fileInput3");

            fileInput3.addEventListener('change', function (e) {
                var file3 = fileInput3.files[0];
                var textType = /text.*/;
                if (file3.type.match(textType)) {
                    var reader3 = new FileReader();
                    reader3.onload = function (e) {
                        console.log(reader3.result);
                        $scope.file.privk = reader3.result;
                        console.log($scope.file);
                    };
                    reader3.readAsText(file3);
                } else {
                }
            });
        }


         $scope.vote = function(id) {
         console.log(id);
         $scope.idvotedParty = id;
         console.log($scope.idvotedParty);
         };


        $scope.voteConfirm = function () {
            //peticion para clavePaillier

            $http.get('/urna/kpaillier').then(function (response) {

                //console.log(response);
                //console.log(response.data[0].publicKey.n);
                console.log("HE VOTADO A :"+$scope.idvotedParty.toString())
                //var msgHEX = convertToHex($scope.idvotedParty); //voto por el numero de id del candidato
                var msgToInt = bigInt($scope.idvotedParty.toString());
                console.log("MSGTOINT: "+ msgToInt);
                var n = response.data[0].publicKey.n;
                var g = response.data[0].publicKey.g;

                var alpha = bigInt.randBetween(0, n);
                var beta = bigInt.randBetween(0, n);

                //var rand = (bigInt(alpha).multiply(n).add(1)).multiply(beta.modPow(n,n));

                var rand = generateR();


                function generateR() {
                    do
                    {
                        r = bigInt.randBetween(0, n);
                    }
                    while (bigInt(r).compare(n) >= 0 || bigInt.gcd(r, bigInt(n).pow(2)) != 1);

                    return r;
                }


                //var rand = bigInt.randBetween(0, n);

                console.log("Random " + rand.toString());
                console.log(rand.toString());
                console.log("n:" +n +" g: "+g);

                /*
                 if ($scope.idvotedParty.id == '01') {var voto = '001';}
                 if ($scope.idvotedParty.id == '02') {var voto = '010'; }
                 if ($scope.idvotedParty.id == '03') {var voto = '100'; }*/

                //encriptar el voto con la publica de la mesa usando paillier
                var Pencriptado = encryptPubkeyPaillier(msgToInt, rand, n, g);
                console.log("VOTO ENCRIPTADO: "+ Pencriptado.toString());
                console.log(Pencriptado.toString());
                var VotoEncryptado = Pencriptado.toString(); //voto que el votante mismo encripta
                var id_anonim = $scope.file.id;

                console.log("ID ANONIMA"+ id_anonim);

                var pKey = $scope.file.pk;
                var spl1 = pKey.split(".");
                var pKey_e = bigInt(spl1[0], base = 16);
                console.log("pKey_e  " + spl1[0]);
                var pKey_n = bigInt(spl1[1], base = 16);
                console.log("pKey_n " + spl1[1]);
                console.log(pKey_n);



                var priKey = $scope.file.privk;
                var spl2 = priKey.split(".");
                //base = 16----> lo pasamos a decimal
                var priKey_d = bigInt(spl2[0], base = 16);
                console.log("priKey_d  " + spl2[0]);
                var priKey_n = bigInt(spl2 [1], base = 16);
                console.log("priKey_n " + spl2[1]);
                var m = bigInt(VotoEncryptado);
                //firmar voto encriptado con RSA con cLAVE PRIVADA
                var VotoEncriptadoFirmar = bigInt(m).modPow(bigInt(priKey_d), bigInt(pKey_n)); //m^d x r mod n
                console.log('Votoencriptado firmado 16: ' + VotoEncriptadoFirmar.toString());

                console.log('Votoencriptado firmado: ' + VotoEncriptadoFirmar.toString(16));
                //console.log(Krsa.publicKey);

                var VotoEncriptadoFirmarHash = CryptoJS.SHA256($scope.VotoEncriptadoFirmar);
                console.log("Hash " + VotoEncriptadoFirmarHash);

                console.log(VotoEncriptadoFirmar);

                //envio el hash, votoencriptadofirmado y la publica
                var tuvoto = {
                    "votoencrip_firmado": VotoEncriptadoFirmar.toString(),
                    "Hash": VotoEncriptadoFirmarHash.toString(),
                    "CpubKey": pKey,
                    "id_anonim": id_anonim
                }
                //concat

                console.log(tuvoto);

                //send to BD
                $http.post('/urna/vote', tuvoto)
                    .then(function successCallback(response) {
                        if (response.status === 200) {
                            console.log(response.status + " " + response.data.message);
                            $scope.alertText =response.data.message;
                            $scope.showAlert = true;
                        }
                    }, function errorCallback(response) {
                        if (response.status === 500) {
                            console.log(response.data.message); // ERROR SERVER
                            $scope.alertText =response.data.message;
                            $scope.showAlert = true;
                        }
                        if (response.status === 400) {
                            console.log('Error: ' + response.data.message);
                            $scope.alertText =response.data.message;
                            $scope.showAlert = true;
                        }
                    })
                //console.log("tuvoto " + tuvoto );

            }, function (err) {
                console.log("error al obtener las Claves de Paillier" + err.data);
            });
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