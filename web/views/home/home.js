angular.module('MainApp', ['ngStorage'])

.controller('homeController',function ($scope, $http, $localStorage, $sessionStorage, $window) {

	//ERROR MESSAGE
	$scope.alertText ={};
	$scope.showAlert = false;

	$scope.choices = [{id: '0'}];
	$scope.shared_files = [];

  $scope.addNewChoice = function() {
    var newItemNo = $scope.choices.length;
    $scope.choices.push({'id':newItemNo});
  };

  $scope.removeChoice = function(id) {
    var lastItem = $scope.choices.length-1;
    $scope.choices.splice(lastItem);
		$scope.shared_files.splice(id,1);
  };

	$scope.fileread = function(id){
			var fileInput = document.getElementById(id);

			fileInput.addEventListener('change', function(e) {
				var file = fileInput.files[0];
				var textType = /text.*/;
				if (file.type.match(textType)) {
					var reader = new FileReader();
					reader.onload = function(e) {
						$scope.shared_files[id]= reader.result;
						//$scope.shared_files.push(reader.result);
						console.log($scope.shared_files);;
					}
					reader.readAsText(file);
				} else {
				}
			});
		}

 	$scope.sharedbutton = function(){
	 $http.post('mesa/sharedkeys', $scope.shared_files)
	 .then(function successCallback(response){
		 if(response.status == 200){
			$scope.alertText =response.data.message;
			$scope.showAlert = true;
		 }
	 },function errorCallback(response){
		 if(response.status == 400){
			 console.log('Error: ' + response.data.message);
			 $scope.alertText =response.data.message;
			 $scope.showAlert = true;
		 }
		 if(response.status == 500){
			 console.log(response.data.message);
			 $scope.alertText =response.data.message;
			 $scope.showAlert = true;
		 }

	 })
 }

 $scope.fileKey = function(sharedkeys){
	 for(i=0; i<sharedkeys.length;i++){
			 var eVoting = new Blob([sharedkeys[i]],
			 {type: "text/plain;charset=utf-8"});
			 saveAs(eVoting, "Sharedkey_Number_"+i+".txt");
	 }
 }
 $scope.get_shared_keys = function(){

	 $http.get('election/shared_keys')
	 .then(function successCallback(response){
		 if(response.status == 200){
			 console.log(response.data);
			 $scope.fileKey(response.data);
		 }
	 },function errorCallback(response){
		 if(response.status == 500){
			 console.log(response.data.message);
			 $scope.alertText =response.data.message;
			 $scope.showAlert = true;
		 }
		 if(response.status == 404){
			 console.log(response.data.message);
			 $scope.alertText =response.data.message;
			 $scope.showAlert = true;
		 }
	 })
 }
 $scope.get_shared_keys();
});
