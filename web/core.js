var app = angular.module('MainApp', []);


function mainController($scope, $http) {
		$scope.newKey = {};
		$scope.username = {};
		$scope.keys = {};
		$scope.selected = false;
		$scope.users = [];
		var n,e;
		var username;


    var keys = rsa.generateKeys(512);
    console.log(keys);
    console.log(keys.publicKey.n.toString());



		$scope.setUsername = function() {
			username = $scope.username.text;
		   //$scope.username = {};
				console.log("My username is " + username);
		    // If the username is valid
		    if (username) {
		      // Tell the server your username
		      socket.emit('add user', username);
		    }
			};


		// Obtenemos publicKey de la base de datos
		$http.get('/api/keys').success(function(data) {
			$scope.keys = data;
			console.log(data);

			n = bigInt(data[0].n);
		  e = bigInt(data[0].e);

			$(function(){
				$('[data-toggle="popover"]').popover({
					container:'body'
				})
			});
		})
		.error(function(data) {
			console.log('Error: ' + data);
		});


		// Encryptar texto
		$scope.enviartexto = function() {
		var message = $scope.newKey.text;
		console.log($scope.newKey.text);
		console.log('Este es el mensage:'+message);
		m = new bigInt(message);
		console.log(m);
		console.log(n);
		var result =  m.modPow(e, n);
		console.log(result.toString());
		$http.post('/message', {"cmessage": result.toString()})
		.success(function(data) {
				$scope.newKey = {}; // Borramos los datos del formulario
				$scope.keys = data;
			})
		.error(function(data) {
			console.log('Error: ' + data);
		});
	};
}
