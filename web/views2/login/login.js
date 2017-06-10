/**
 * Created by juan on 07/05/17.
 */

angular.module('MainApp.login', ['ngMaterial'])

    .controller('LoginCtrl', function ($scope, $mdDialog, $http, $window, $rootScope) {
        $scope.status = '  ';
        $scope.customFullscreen = false;
        $scope.showAdvanced = function (ev) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'views/login/login.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            })
                .then(function (answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    $scope.status = 'You cancelled the dialog.';
                });
        };
        function DialogController($scope, $mdDialog) {
            $scope.hide = function () {
                $mdDialog.hide();
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.answer = function (answer) {
                $mdDialog.hide(answer);
            };
        }

        $scope.actualUser={};
        $scope.login = function () {
            $http({
                url: API + '/users/login',
                method: "POST",
                data: $scope.actualUser

            })
                .then(function (response) {
                        if (response.data.success == true) {
                            localStorage.setItem("fs_web_token", response.data.token);
                            localStorage.setItem("fs_web_userdata", JSON.stringify(response.data.user));
                            $mdDialog.hide();
                      //      $state.go("portal")
                            $rootScope.logged = true;
                            $rootScope.userdata = JSON.parse(localStorage.getItem("fs_web_userdata"));
                        } else {
                            console.log("Ha fallat l'inici de sessió");
                        }
                    },
                    function (error) {
                        console.log(error);
                    });
        };

        $scope.logout = function(){
            localStorage.removeItem("fs_web_token");
            localStorage.removeItem("fs_web_userdata");
        //    $state.go("starter");
            $rootScope.userdata={};
            $rootScope.logged=false;
        };
    });