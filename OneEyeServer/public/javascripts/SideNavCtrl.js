angular.module('oneEye').controller('SideNavCtrl',['$scope', '$location', '$mdSidenav', '$mdUtil', function($scope, $location, $mdSidenav, $mdUtil) {
    //$scope.books = bookService.getValues();
    $scope.toggleLeft = buildToggler('left');

/**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildToggler(navID) {
      var debounceFn =  $mdUtil.debounce(function(){
            $mdSidenav(navID)
              .toggle()
          },300);
      return debounceFn;
    }


    $scope.getMessages = function(){
      $location.url('/messages');
      $scope.closeSideNav();
    };

   $scope.closeSideNav = function () {
      $mdSidenav('left').close();
   };

   $scope.getBookDetails = function(id, $event){
    console.log(id);
   };


}])
