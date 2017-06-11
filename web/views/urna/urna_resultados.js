angular.module('MainApp', ['ngStorage','chart.js'])

.controller('urnaController',function ($scope, $http, $localStorage, $sessionStorage, $window) {

	$scope.election = {};
  $scope.file_id={};

  $scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
  $scope.data = [300, 500, 100];




  window.onload = function() {
		var fileInput = document.getElementById('fileInput');

		fileInput.addEventListener('change', function(e) {
			var file = fileInput.files[0];
			var textType = /text.*/;
			if (file.type.match(textType)) {
				var reader = new FileReader();
				reader.onload = function(e) {
          console.log(reader.result);
          $scope.file_id.id = reader.result;
          console.log(  $scope.file_id.id );;
				}
				reader.readAsText(file);
			} else {
			}
		});
}

});
