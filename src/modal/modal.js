function CustomShareOptionsController($http, $mdDialog) {
    var ctrl = this;

    if (!ctrl.customOptions || !ctrl.resultsMap) { return; }


    // Resolve indentifiers into objects.
    angular.forEach(ctrl.customOptions, function (customOption) {
        if (!angular.isFunction(ctrl.resultsMap[customOption.key]['getByIdentifier'])) {
            return;
        }

        angular.forEach(customOption.value, function (shareEntity, index, array) {
            var value = ctrl.resultsMap[customOption.key]['getByIdentifier'](shareEntity);

            if (angular.isFunction(value.then)) {
                value.then(function (realValue) {
                    array[index] = realValue;
                });
            }

            array[index] = value;

        });
    });

    // Clears the list for a custom sharing option.
    ctrl.clearList = function (option) {
        option.value = [];
    };

    // Access the HTTP resource for a sharing option and
    // returns a promise for the values.
    ctrl.getSearchResults = function (option, query) {
        var queryExp = new RegExp(query, "gi");

        if (angular.isFunction(ctrl.resultsMap[option.key]['search_results'])) {
            return ctrl.resultsMap[option.key]['search_results'](queryExp);
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