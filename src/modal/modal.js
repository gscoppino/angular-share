function CustomShareOptionsController($http, $uibModalInstance, customOptions, resultsMap) {
    var ctrl = this;

    // Store resolve value on controller for easy access.
    ctrl.customOptions = customOptions;
    ctrl.resultsMap = resultsMap;

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
                var related_key = resultsMap[option.key](result);
                return queryExp.test(result[related_key]);
            });
        }

        if (angular.isString(option.search_results)) {
            return $http.get(option.search_results, { query: query })
                .then(function (results) {
                    return results.filter(function (result) {
                        var related_key = resultsMap[option.key](result);
                        return queryExp.test(result[related_key]);
                    });
                });
        }

        return [];
    };

    // Sends the new custom sharing options configuration
    // to the callee.
    ctrl.propagateChanges = function () {
        $uibModalInstance.close(ctrl.customOptions); // pass the custom permissions back.
    };

    // Dismisses the modal.
    ctrl.close = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

function CustomShareOptionsFactory($uibModal) {
    var CustomShareOptionsModal = function () {
        this.modalInstance = null;

        this.open = function (customOptions, resultsMap) {
            this.modalInstance = $uibModal.open({
                templateUrl: 'templates/modal/modal.html',
                backdrop: true,
                controller: CustomShareOptionsController,
                controllerAs: 'ctrl',
                bindToController: true,
                resolve: {
                    customOptions: function () {
                        return angular.copy(customOptions);
                    },
                    resultsMap: function () {
                        return resultsMap;
                    }
                }
            });

            return this.modalInstance;
        };

        // Easily accessible helper function for the instantiater of
        // a modal to conveniently close it.
        this.close = function () {
            this.modalInstance.dismiss('terminated');
        };
    };

    return new CustomShareOptionsModal();
}

angular.module('angular-share.modal', [
    'ui.bootstrap',
    'material.components.chips'
])
    .factory('CustomShareOptionsModal', CustomShareOptionsFactory);