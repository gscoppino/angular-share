function CustomShareOptionsController($mdDialog, $q, _CustomShareOptions, _OptionsConfig) {
    if (!_CustomShareOptions || !_OptionsConfig) { return; }

    var ctrl = this;

    ctrl.optionsConfig = _OptionsConfig;
    ctrl.customOptions = _CustomShareOptions
        .filter(function (customOption) {
            // The configuration must be fully and correctly defined
            // for all custom options.
            var valid_option = (
                angular.isString(ctrl.optionsConfig[customOption.key]['id_field']) &&
                angular.isString(ctrl.optionsConfig[customOption.key]['display_field']) &&
                angular.isFunction(ctrl.optionsConfig[customOption.key]['getByIdentifier']) &&
                angular.isFunction(ctrl.optionsConfig[customOption.key]['getSearchResults'])
            );

            if (valid_option) { return true; }
        })
        .map(function (customOption) {
            // Create a shallow copy of the custom option
            var mapped_option = {
                key: customOption.key,
                label: customOption.label,
                type: customOption.type,
                value: []
            };

            // Map custom option identifiers to their resolved forms
            $q.all(customOption.value.map(function (identifier) {
                return $q.resolve(ctrl.optionsConfig[customOption.key].getByIdentifier(identifier));
            })).then(function (resolvedValues) {
                Array.prototype.push.apply(mapped_option.value, resolvedValues);
            });

            return mapped_option;
        });

    // Clears the list for a custom sharing option.
    ctrl.clearList = function (option) {
        option.value = [];
    };

    // Request search results for the custom sharing option
    // using the config.
    ctrl.getSearchResults = function (option, query) {
        var queryExp = new RegExp(query, "gi");
        return ctrl.optionsConfig[option.key].getSearchResults(queryExp);
    };

    // Sends the new custom sharing options configuration
    // to the callee.
    ctrl.propagateChanges = function () {
        var remapped_options = ctrl.customOptions
            .map(function (customOption) {
                var id_field = ctrl.optionsConfig[customOption.key].id_field;
                return {
                    key: customOption.key,
                    label: customOption.label,
                    type: customOption.type,
                    value: customOption.value.map(function (resolvedIdentifier) {
                        return resolvedIdentifier[id_field];
                    })
                };
            });

        $mdDialog.hide(remapped_options); // Return the new custom share option values.
    };

    // Dismisses the modal.
    ctrl.close = function () {
        $mdDialog.cancel('cancel');
    };
}

function CustomShareOptionsFactory($mdDialog) {
    var CustomShareOptionsModal = function () {
        this.modalInstance = null;

        this.open = function (customOptions, collectionMap) {
            this.modalInstance = $mdDialog.show({
                templateUrl: 'templates/modal/modal.html',
                hasBackdrop: true,
                controller: CustomShareOptionsController,
                controllerAs: 'ctrl',
                locals: {
                    _CustomShareOptions: customOptions,
                    _OptionsConfig: collectionMap
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