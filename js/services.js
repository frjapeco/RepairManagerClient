app.service('Token',Token);
app.service('Login',Login);
app.service('Model',Model);
app.service('Status',Status);
app.service('Incidence',Incidence);

function Token($cookies) {
    this.getHeader = function() {
        return JSON.parse($cookies.get("token_header"));
    };
    
    this.getPayload = function() {
        return JSON.parse($cookies.get("token_payload"));
    };
    
    this.get = function() {
        return $cookies.get("access_token");
    };
    
    this.save = function(token,type) {
        var header = "";
        var payload = "";
        var i = 0;
        
        while (token[i] != "." && i < token.length)
            header += token[i++];
        i++;
        while (token[i] != "." && i < token.length)
            payload += token[i++];
        $cookies.put("token_header",window.atob(header));
        $cookies.put("token_payload",window.atob(payload));
        $cookies.put("access_token",type + " " + token);
    };
}

function Login($http,URL_SERVER) {
    this.authenticate = function(user,pass) {
        return $http({
            method: "POST",
            url: URL_SERVER + "/api/login",
            data: {
                "username" : user,
                "password" : pass
            }
        });
    };
}

function Model($http,Token,URL_SERVER) {
    this.listAll = function() {
        return $http({
            method: "GET",
            url: URL_SERVER + "/api/models",
            headers: {
                'Authorization' : Token.get()
            }
        });
    };
    
    this.get = function(id) {
        return $http({
            method: "GET",
            url: URL_SERVER + "/api/models/" + id,
            headers: {
                'Authorization' : Token.get()
            }
        });
    };
}

function Status($http,Token,URL_SERVER) {
    this.listAll = function() {
        return $http({
            method: "GET",
            url: URL_SERVER + "/api/statuses",
            headers: {
                'Authorization' : Token.get()
            }
        });
    };
    
    this.get = function(id) {
        return $http({
            method: "GET",
            url: URL_SERVER + "/api/statuses/" + id,
            headers: {
                'Authorization' : Token.get()
            }
        });
    };
}

function Incidence($http,Token,URL_SERVER) {
    this.find = function(params) {
        return $http({
            method: "GET",
            url: URL_SERVER + "/api/incidences",
            headers: {
                'Authorization' : Token.get()
            },
            params: params
        });
    };
    
    this.count = function(params) {
        return $http({
            method: "GET",
            url: URL_SERVER + "/api/incidences/count",
            headers: {
                'Authorization' : Token.get()
            },
            params: params
        });
    };
    
    this.get = function(id) {
        return $http({
            method: "GET",
            url: URL_SERVER + "/api/incidences/" + id,
            headers: {
                'Authorization' : Token.get()
            }
        });
    };
    
    this.save = function(incidence) {
        return $http({
            method: "POST",
            url: URL_SERVER + "/api/incidences",
            headers: {
                'Authorization' : Token.get()
            },
            data: incidence
        });
    };
    
    this.update = function(id,data) {
        return $http({
            method: "PUT",
            url: URL_SERVER + "/api/incidences/" + id,
            headers: {
                'Authorization' : Token.get()
            },
            data: data
        });
    };
    
    this.assignToMe = function(id) {
        return $http({
            method: "POST",
            url: URL_SERVER + "/api/incidences/" + id + "/assignee",
            headers: {
                'Authorization' : Token.get()
            }
        });
    };
    
    this.free = function(id) {
        return $http({
            method: "DELETE",
            url: URL_SERVER + "/api/incidences/" + id + "/assignee",
            headers: {
                'Authorization' : Token.get()
            }
        });
    };
}