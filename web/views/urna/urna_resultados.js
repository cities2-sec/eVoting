angular.module('MainApp', ['ngStorage','chart.js'])

.controller('urnaController',function ($scope, $http, $localStorage, $sessionStorage, $window) {

    $scope.election = {};
    $scope.parties = {};
    $scope.file_id = {};
    $scope.votos = {};


    $scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
    //$scope.labels = [];
    $scope.data = [333, 500, 100];
    $scope.colors = ["#800080",
        "#0000ff",
        "#ff0000"];


    $scope.fileread = function () {
        var fileInput = document.getElementById('fileInput');

        fileInput.addEventListener('change', function (e) {
            var file = fileInput.files[0];
            var textType = /text.*/;
            if (file.type.match(textType)) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $scope.file_id.id = reader.result;
                    console.log($scope.file_id.id);
                };
                reader.readAsText(file);
            } else {
            }
        });
    };

    $scope.get_results = function () {
        $http.get('urna/election/get_election')
            .then(function successCallback(response) {
                if (response.status === 200) {
                    $scope.election = response.data;
                    console.log($scope.election);
                    $scope.parties = $scope.election[0].parties;
                    console.log("ELECCIONES:" + $scope.parties);
                    console.log($scope.parties);
                    for(i=0;i<$scope.parties.length;i++){
                        $scope.labels[i] = $scope.parties[i].name;
                        $scope.colors[i] = $scope.parties[i].color;
					}
                }
            }, function errorCallback(response) {
                if (response.status === 500) {
                    console.log(response.data.message);
                }

            });

		var election_name = $scope.election.electionName;

        $http.get('urna/results/' + election_name)
            .then(function (response) {
                    $scope.results = response.data.results;
                    for(i=0;i<$scope.parties.length;i++){
                            $scope.data[i] = $scope.results[i][1]
                    }
                    $scope.votos.id = response.data.votos2.id_anonim;
                    $scope.votos.voto = response.data.votos2.voto;
                },
                function (error) {
                    console.log(error);
                });
    }
});





