var app = angular.module('RepairManager',['ngRoute','ngCookies','ngMessages','ui.bootstrap']);


// URL mappings:

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'views/home.html',
            controller: 'HomeController'
        }).
        when('/incidence/:incidenceId/detail', {
            templateUrl: 'views/detail-incidence.html',
            controller: 'DetailIncidenceController'
        }).
        when('/incidence/:incidenceId/edit', {
            templateUrl: 'views/edit-incidence.html',
            controller: 'EditIncidenceController'
        }).
        when('/incidencesList', {
            templateUrl: 'views/incidences-list.html',
            controller: 'IncidencesListController'
        }).
        when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginController'
        }).
        when('/error', {
            templateUrl: 'views/error.html'
        }).
        when('/notFound', {
            templateUrl: 'views/not-found.html'
        }).
        otherwise({
            redirectTo: '/notFound'
        });
}]);