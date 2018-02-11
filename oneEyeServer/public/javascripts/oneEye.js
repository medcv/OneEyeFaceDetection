angular.module('oneEye', ['ngMaterial', 'ngRoute', 'ngResource'])
.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('orange')
        .warnPalette('red');
})
.config(function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl : 'partials/messages.html'
	});
})
