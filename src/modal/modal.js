function CustomShareOptionsController($http, $uibModalInstance, customOptions) {
    var ctrl = this;

    // Store resolve value on controller for easy access.
    ctrl.customOptions = customOptions;

    // Clears the list for a custom sharing option.
    ctrl.clearList = function (option) {
        option.value = [];
    };

    // Access the HTTP resource for a sharing option and
    // returns a promise for the values.
    ctrl.getResource = function (resource, query) {
        if (!resource) { return []; }
        return $http.get(resource, { query: query});
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

        this.open = function (customOptions) {
            this.modalInstance = $uibModal.open({
                templateUrl: 'templates/modal/modal.html',
                backdrop: true,
                controller: CustomShareOptionsController,
                controllerAs: 'ctrl',
                bindToController: true,
                resolve: {
                    customOptions: function () {
                        return angular.copy(customOptions);
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