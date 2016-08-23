app.filter('getByName',getByName);


function getByName() {
    return function(array, name) {
        var i;

        for (i = 0; i < array.length; i++)
            if (array[i].name == name)
                return array[i];
        return null;
    }
}