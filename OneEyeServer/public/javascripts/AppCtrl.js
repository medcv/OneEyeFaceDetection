angular.module('oneEye').controller('AppCtrl', ['$scope', 'socket', function ($scope, socket) {

  // Socket listeners
    // ================
    $scope.users = [];
    $scope.usersId = [];
    socket.on('init', function (data) {
      $scope.name = data.name;
      $scope.users = data.users;
    });

    socket.on('send:message', function (data) {
      console.log(data.users.accountId);
      if ($scope.users.length==0){
        $scope.users.push(data.users);
        $scope.usersId.push(data.users.accountId)
      }else{
        if ($scope.usersId.indexOf(data.users.accountId) == -1){
          $scope.users.push(data.users);
          $scope.usersId.push(data.users.accountId)
        }
    }
    });

}])
