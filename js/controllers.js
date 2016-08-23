app.controller('InfoPopupController',InfoPopupController);
app.controller('LoginController',LoginController);
app.controller('HomeController',HomeController);
app.controller('DetailIncidenceController',DetailIncidenceController);
app.controller('IncidencesListController',IncidencesListController);
app.controller('EditIncidenceController',EditIncidenceController);


function InfoPopupController($scope,$uibModalInstance,content) {
    $scope.content = content;

    $scope.close = function() {
        $uibModalInstance.close();
    };
}

function LoginController($location,$scope,Login,Token) {
    $scope.alert = {
        visible: false,
        type: '',
        msg: ''
    };

    $scope.login = function() {
        if (!$scope.loginForm.$valid)
            return;
        Login.authenticate($scope.user,$scope.password).then(
            function(response) {
                Token.save(response.data.access_token,response.data.token_type);
                $location.path('/incidencesList');
            },
            function(error) {
                $scope.alert.type = 'danger';
                $scope.alert.msg = 'Error: Failed to login';
                $scope.alert.visible = true;
            }
        ); 
    };
}

function HomeController($location,$scope,$uibModal,Login,Incidence,Model,Token) {
    $scope.alert = {
        visible: false,
        type: '',
        msg: ''
    };

    $scope.init = function() {
        Login.authenticate('guest','123456').then(
            function(response) {
                Token.save(response.data.access_token,response.data.token_type);
                Model.listAll().then (
                    function(response) {
                        $scope.models = response.data;
                    }
                );
            },
            function(error) {
                $location.path('/error');
            }
        );
    };
    
    $scope.saveIncidence = function() {
        if (!$scope.newIncidenceForm.$valid)
            return;
        Incidence.save($scope.incidence).then(
            function(response) {
                $uibModal.open({
                    animation: true,
                    templateUrl: 'views/templates/infoPopup.html',
                    controller: 'InfoPopupController',
                    resolve: {
                        content: {
                            title: 'Server says',
                            message: 'Incidence was saved successfully!'
                        }
                    }
                });
                $scope.incidence = {};
                $scope.newIncidenceForm.$setPristine();
                $scope.newIncidenceForm.$setUntouched();
            },
            function(error) {
                $uibModal.open({
                    animation: true,
                    templateUrl: 'views/templates/infoPopup.html',
                    controller: 'InfoPopupController',
                    resolve: {
                        content: {
                            title: 'Server says',
                            message: 'It was not possible to save the incidence'
                        }
                    }
                });
            }
        );
    };
    
    $scope.findIncidence = function() {
        if (!$scope.searchIncidenceForm.$valid)
            return;
        Incidence.get($scope.incidenceId).then(
            function(response) {
                $location.path('/incidence/' + $scope.incidenceId + '/detail');
            },
            function(error) {
                switch (error.data.code) {
                    case 1003:
                        $scope.alert.type = 'warning'; 
                        $scope.alert.msg = 'Please introduce a numeral as id';
                        break;
                    case 1012:
                        $scope.alert.type = 'warning';
                        $scope.alert.msg = 'Incidence not found';
                        break;
                    default:
                        $scope.alert.type = 'danger';
                        $scope.alert.msg = 'Sorry, but an error was occurred while loading incidence info :(';
                }
                $scope.alert.visible = true;
            }
        );
    };
}

function DetailIncidenceController($location,$routeParams,$scope,Incidence) {
    $scope.init = function() {
        Incidence.get($routeParams.incidenceId).then(
            function(response) {
                $scope.incidence = response.data;
            },
            function(error) {
                $location.path('/error');
            }
        );
    };
}

function IncidencesListController($filter,$location,$scope,Incidence,Status,Token) {
    var offset = 0;
    var max = 10;
    $scope.searchPattern = "";
    $scope.currentPage = -1;
    $scope.totalItems = -1;
    
    $scope.searchIncidences = function() {
        var params = {};

        if ($scope.status)
            params.status = $scope.status.name;
        if ($scope.assignedToMe)
            params.technician = Token.getPayload().sub;
        params.searchPattern = $scope.searchPattern;
        Incidence.count(params).then(
            function(response) {
                $scope.totalItems = response.data;
            },
            function(error) {
                $location.path('/error');
            }
        );
        params.offset = offset;
        params.max = max;
        Incidence.find(params).then(
            function(response) {
                $scope.incidences = response.data;
            },
            function(error) {
                if (error.status == 401 || error.status == 403)
                    $location.path('/login');
                else
                    $location.path('/error');
            }
        );
    };

    $scope.loadIncidences = function() {
        $scope.currentPage = 1;
        offset = 0;
        $scope.searchIncidences();
    };
    
    $scope.init = function() {
        Status.listAll().then(
            function(response) {
                $scope.statuses = response.data;
            }
        );
        $scope.username = Token.getPayload().sub;
        $scope.loadIncidences();
    };

    $scope.pageChanged = function() {
        offset = ($scope.currentPage * max) - max;
        $scope.searchIncidences();
    };
}

function EditIncidenceController($filter,$location,$routeParams,$scope,$uibModal,Incidence,Model,Token,Status) {
    $scope.init = function() {
        var currentTechnician = Token.getPayload().sub;
        var i;
        
        $scope.username = currentTechnician;
        Incidence.get($routeParams.incidenceId).then(
            function(response) {                
                $scope.incidence = response.data;
                $scope.assignedToMe = ($scope.incidence.technician && $scope.incidence.technician.username == currentTechnician);
                $scope.lockedIncidence = ($scope.incidence.technician && $scope.incidence.technician.username != currentTechnician);
                Model.listAll().then(
                    function(response) {
                        $scope.models = response.data;
                        $scope.incidence.model = $filter('getByName')($scope.models,$scope.incidence.model.name);
                    }
                );
                Status.listAll().then(
                    function(response) {
                        $scope.statuses = response.data;
                        $scope.incidence.status = $filter('getByName')($scope.statuses,$scope.incidence.status.name);
                    }
                );
            },
            function(error) {
                if (error.status == 401 || error.status == 403)
                    $location.path('/login');
                else
                    $location.path('/error');
            }
         );
    };
       
    $scope.updateIncidence = function() {
        if (!$scope.editIncidenceForm.$valid)
            return;
        Incidence.update($scope.incidence.id,$scope.incidence).then(
            function(response) {
                $uibModal.open({
                    animation: true,
                    templateUrl: 'views/templates/infoPopup.html',
                    controller: 'InfoPopupController',
                    resolve: {
                        content: {
                            title: 'Server says',
                            message: 'Incidences was saved successfully!'
                        }
                    }
                });
            },
            function(error) {
                if (error.status == 401 || error.status == 403)
                    $location.path('/login');
                else {
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'views/templates/infoPopup.html',
                        controller: 'InfoPopupController',
                        resolve: {
                            content: {
                                title: 'Server says',
                                message: 'It was not possible to save the incidence'
                            }
                        }
                    });
                }
            }
        );
    };
    
    $scope.setAssignee = function() {
        if ($scope.assignedToMe) {
            Incidence.assignToMe($scope.incidence.id).then(
                function(response) {
                    $scope.init();
                },
                function(error) {
                    if (error.status == 401 || error.status == 403)
                        $location.path('/login');
                    else
                        $location.path('/error');
                }
            );
        } else {
            Incidence.free($scope.incidence.id).then(
                function(response) {
                    $scope.init();
                },
                function(error) {
                    if (error.status == 401 || error.status == 403)
                        $location.path('/login');
                    else
                        $location.path('/error');
                }
            );
        }
    };
}