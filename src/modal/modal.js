function CustomShareOptionsController($http, $mdDialog) {
    var ctrl = this;

    if (!ctrl.customOptions || !ctrl.resultsMap) { return; }

    // Clears the list for a custom sharing option.
    ctrl.clearList = function (option) {
        option.value = [];
    };

    angular.forEach(ctrl.customOptions, function (customOption) {
        if (angular.isArray(customOption.search_results)) {
            customOption.value = customOption.value.map(function (shareEntity) {
                return customOption.search_results.find(function (result) {
                    if (result.id === shareEntity) {
                        ctrl.resultsMap[customOption.key](result);
                    }

                    return result.id === shareEntity;
                });
            });
        } else if (angular.isString(customOption.search_results)) {
            customOption.value.map(function (shareEntity) {
                return $http.get(customOption.search_results, { id: shareEntity })
                    .then(function (val) {
                        return val;
                    });
            });
        }
    });
    console.log(ctrl.customOptions);

    // Access the HTTP resource for a sharing option and
    // returns a promise for the values.
    ctrl.getSearchResults = function (option, query) {
        var queryExp = new RegExp(query, "gi");

        if (angular.isArray(option.search_results)) {
            return option.search_results.filter(function (result) {
                var related_key = ctrl.resultsMap[option.key](result);
                return queryExp.test(result[related_key]);
            });
        }

        if (angular.isString(option.search_results)) {
            return $http.get(option.search_results, { query: query })
                .then(function (results) {
                    return results.filter(function (result) {
                        var related_key = ctrl.resultsMap[option.key](result);
                        return queryExp.test(result[related_key]);
                    });
                });
        }

        return [];
    };

    // Sends the new custom sharing options configuration
    // to the callee.
    ctrl.propagateChanges = function () {
        $mdDialog.confirm(ctrl.customOptions); // pass the custom permissions back.
    };

    // Dismisses the modal.
    ctrl.close = function () {
        $mdDialog.cancel('cancel');
    };
}

function CustomShareOptionsFactory($mdDialog) {
    var CustomShareOptionsModal = function () {
        this.modalInstance = null;

        this.open = function (customOptions, resultsMap) {
            this.modalInstance = $mdDialog.show({
                templateUrl: 'templates/modal/modal.html',
                hasBackdrop: true,
                controller: CustomShareOptionsController,
                controllerAs: 'ctrl',
                bindToController: true,
                locals: {
                    customOptions: angular.copy(customOptions),
                    resultsMap: resultsMap
                }
            });

            return this.modalInstance;
        };
    };

    return new CustomShareOptionsModal();
}

angular.module('angular-share.modal', [
    'ui.bootstrap',
    'material.components.chips',
    'material.components.dialog'
])
    .factory('CustomShareOptionsModal', CustomShareOptionsFactory);