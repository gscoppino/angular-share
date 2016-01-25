angular.module("angular-share.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("templates/dropdown/dropdown.html","<div class=\"btn-group\">\r\n  <div class=\"btn-group\">\r\n    <div uib-dropdown auto-close=\"outsideClick\" is-open=\"ctrl.uibDropdownOpen\">\r\n      <button type=\"button\" class=\"btn btn-default\" uib-dropdown-toggle>\r\n        <span>{{ ctrl.currentSettings }}</span>\r\n        <span class=\"caret\"></span>\r\n      </button>\r\n      <ul class=\"uib-dropdown-menu\">\r\n        <li ng-click=\"ctrl.clearSetOptions()\">\r\n          <a href=\"#\">\r\n            <span class=\"fa\" ng-class=\"{\'fa-check-square-o\': ctrl.active_options_count === 0, \'fa-square-o\': ctrl.active_options_count > 0}\"></span>\r\n            <span>Only Me</span>\r\n          </a>\r\n        </li>\r\n        <li ng-if=\"ctrl.toggleOptions.length\" class=\"divider\"></li>\r\n        <li ng-repeat=\"option in ::ctrl.toggleOptions track by option.key\" ng-click=\"ctrl.toggleOption(option)\">\r\n          <a href=\"#\">\r\n            <span class=\"fa\" ng-class=\"{\'fa-check-square-o\': option.value, \'fa-square-o\': !option.value}\"></span>\r\n            <span>{{ option.label }}</span>\r\n          </a>\r\n        </li>\r\n        <li ng-if=\"ctrl.customOptions.length\" class=\"divider\"></li>\r\n        <li ng-if=\"ctrl.customOptions.length\" ng-click=\"ctrl.openCustomOptionsModal()\">\r\n          <a href=\"#\">\r\n            <span class=\"fa fa-cog\"></span>\r\n            <span>Custom</span>\r\n          </a>\r\n        </li>\r\n      </ul>\r\n    </div>\r\n  </div>\r\n  <button type=\"button\" ng-if=\"::ctrl.confirmSave\" ng-disabled=\"!ctrl.dirty_options\" ng-click=\"ctrl.saveChanges()\" class=\"btn btn-primary\">Save Changes</button>\r\n</div>");
$templateCache.put("templates/modal/modal.html","<md-dialog style=\"margin-bottom: 0;\" class=\"panel panel-primary\">\r\n    <div class=\"panel-heading\">\r\n        <h2>Who Can See This?</h2>\r\n    </div>\r\n    <div class=\"panel-body\">\r\n        <div style=\"margin: 1em;\" ng-repeat=\"option in ::ctrl.customOptions track by option.key\">\r\n            <label>{{ option.label }}</label>\r\n            <button class=\"btn btn-primary btn-xs\" ng-click=\"ctrl.clearList(option)\">Remove All</button>\r\n            <md-contact-chips\r\n                ng-model=\"option.value\"\r\n                md-contacts=\"ctrl.getSearchResults(option, $query)\"\r\n                md-contact-name=\"{{ ::ctrl.collectionMap[option.key][\'display_field\'] }}\"\r\n                md-require-match=\"true\"\r\n                filter-selected=\"true\"\r\n                placeholder=\"Share with {{ option.label }}...\"\r\n                secondary-placeholder=\"Add {{ option.label }}...\">\r\n            </md-contact-chips>\r\n        </div>\r\n        <div class=\"text-right\">\r\n            <button type=\"button\" class=\"btn btn-primary\" ng-click=\"ctrl.close()\">Cancel</button>\r\n            <button type=\"button\" class=\"btn btn-success\" ng-click=\"ctrl.propagateChanges()\">OK</button>\r\n        </div>\r\n    </div>\r\n</md-dialog>");}]);
angular.module('angular-share', [
    'angular-share.dropdown',
    'angular-share.modal',
    'angular-share.templates'
]);
function ShareOptionsController(CustomShareOptionsModal) {

    if (!angular.isObject(this.model) || !this.field || !angular.isArray(this.options)) { return; }
    this.confirmSave = this.confirmSave || false;

    /**************/

    var ctrl = this;

    // Configure our scope.

    ctrl.uibDropdownOpen = undefined; // When set to false, programmatically closes the dropdown control.

    ctrl.currentSettings = undefined; // text overview of current sharing options.

    ctrl.toggleOptions = undefined; // all share options that are boolean flags by nature.
    ctrl.customOptions = undefined; // all share options that are collections of entities by nature.

    ctrl.active_options_count = 0; // counter to keep track of how many options are set.
    ctrl.active_toggle_options = []; // array of strings for currently active toggle options.

    ctrl.active_custom_option = undefined; // flag to indicate that custom options are in use.

    ctrl.dirty_options = undefined; // if need to confirm save, keep track of dirty status.

    // Initialize.
    function initialize() {
        var toggleOptions = [], customOptions = []; // temp variables to write to before applying the data to the controller.

        // Make sure that the specified field for the provided model is defined as an object store.
        ctrl.model[ctrl.field] = angular.isObject(ctrl.model[ctrl.field]) ? ctrl.model[ctrl.field] : {};

        ctrl.currentSettings = "Loading...";
        // Examine all the provided sharing options.
        // angular.copy is used to avoid modifying the parent scope options.
        angular.forEach(angular.copy(ctrl.options), function (shareOption) {
            if (!shareOption.key) { return; }

            // Set sharing options on the model to default values if not existing,
            // otherwise use existing values.
            if (ctrl.model[ctrl.field][shareOption.key]) {
                shareOption.value = ctrl.model[ctrl.field][shareOption.key];
            } else {
                ctrl.model[ctrl.field][shareOption.key] = shareOption.value;
            }

            // Push the sharing option to the appropriate store on the controller,
            // based on its type.
            // 'boolean' -> toggleable in the dropdown control.
            // 'collection' -> editable in the modal control.

            if (shareOption.type === 'boolean') {
                toggleOptions.push(shareOption);

                if (shareOption.value === true) {
                    ctrl.active_options_count++;
                    ctrl.active_toggle_options.push(shareOption.label);
                }

            } else if (shareOption.type === 'collection') {
                if (!ctrl.collectionMap || !ctrl.collectionMap[shareOption.key]) {
                    return;
                }

                customOptions.push(shareOption);

                if (shareOption.value.length) {
                    ctrl.active_options_count++;

                    if (!ctrl.active_custom_option) {
                        ctrl.active_custom_option = true;
                    }
                }
            }
        });

        // Bind the sharing options to the controller.
        ctrl.toggleOptions = toggleOptions;
        ctrl.customOptions = customOptions;

        // Update the overview text displayed in the dropdown button.
        ctrl.updateCurrentSettings();
    }

    // Controller API

    // Updates the overview text displayed in the dropdown button.
    ctrl.updateCurrentSettings = function () {
        if (ctrl.active_custom_option) {
            ctrl.currentSettings = "Custom";
            return;
        }

        if (ctrl.active_options_count === 0) {
            ctrl.currentSettings = "Only Me";
            return;
        }

        ctrl.currentSettings = ctrl.active_toggle_options.join(', ');
    };

    // Toggles a toggleable sharing option. Updates the bound model
    // and our view model with the new value.
    ctrl.toggleOption = function (shareOption) {
        shareOption.value = !shareOption.value; // Update the view model.

        if (shareOption.value === true) {

            ctrl.active_options_count++;
            ctrl.active_toggle_options.push(shareOption.label);

        } else {

            ctrl.active_options_count--;
            ctrl.active_toggle_options.splice(ctrl.active_toggle_options.indexOf(shareOption.label), 1);

        }

        if (!ctrl.confirmSave) {
            ctrl.model[ctrl.field][shareOption.key] = shareOption.value; // Update the model
        } else {
            ctrl.dirty_options = true;
        }

        ctrl.updateCurrentSettings();
    };

    // Sets all toggleable sharing options to false. Updates the bound
    // model and our view model with the new values.
    ctrl.clearToggleOptions = function () {
        angular.forEach(ctrl.toggleOptions, function (shareOption) {
            if (shareOption.value === true) {
                shareOption.value = false; // Update the view model.
                ctrl.active_options_count--;

                if (!ctrl.confirmSave) {
                    ctrl.model[ctrl.field][shareOption.key] = false; // Update the model
                } else {
                    ctrl.dirty_options = true;
                }
            }
        });

        ctrl.active_toggle_options = [];
        ctrl.updateCurrentSettings();
    };

    // Sets all custom sharing options to empty lists. Updates the bound
    // model with thee new values.
    ctrl.clearCustomOptions = function () {
        angular.forEach(ctrl.customOptions, function (shareOption) {
            if (shareOption.value.length) {
                shareOption.value = []; // Update the view
                ctrl.active_options_count--;

                if (!ctrl.confirmSave) {
                    ctrl.model[ctrl.field][shareOption.key] = []; // Update the model
                } else {
                    ctrl.dirty_options = true;
                }
            }
        });

        ctrl.active_custom_option = false;
        ctrl.updateCurrentSettings();
    };

    // Clears all sharing options to an empty state.
    // No permissions shall be active.
    ctrl.clearSetOptions = function () {
        ctrl.clearToggleOptions();
        ctrl.clearCustomOptions();
    };

    // Write changes to the origin model field.
    ctrl.saveChanges = function () {
        angular.forEach(ctrl.toggleOptions, function (shareOption) {
            ctrl.model[ctrl.field][shareOption.key] = shareOption.value;
        });

        angular.forEach(ctrl.customOptions, function (shareOption) {
            ctrl.model[ctrl.field][shareOption.key] = shareOption.value;
        });

        ctrl.dirty_options = false;
    };

    // Opens the custom sharing options modal, passing it
    // the sharing options. The modal will make a copy of our sharing
    // options and later return that copy with the new values.
    ctrl.openCustomOptionsModal = function () {
        ctrl.uibDropdownOpen = false; // Close the dropdown control.
        var modal = CustomShareOptionsModal.open(ctrl.customOptions, ctrl.collectionMap);

        modal.then(function (customOptions) {
            var checkCustom = false;
            angular.forEach(customOptions, function (shareOption) {

                // Diff the old custom options with the new ones
                // to update active options counter, and whether
                // custom permissions are set.
                var correspondingShareOption = ctrl.customOptions.filter(function (opt) {
                    return opt.key === shareOption.key;
                })[0];

                if (shareOption.value.length) {
                    checkCustom = true;
                }

                if (shareOption.value.length && !correspondingShareOption.value.length) {
                    ctrl.active_options_count++;
                } else if (!shareOption.value.length && correspondingShareOption.value.length) {
                    ctrl.active_options_count--;
                }

                // Set the new custom options on the controller
                correspondingShareOption.value = shareOption.value;

                // Update the original model.
                if (!ctrl.confirmSave) {
                    ctrl.model[ctrl.field][shareOption.key] = shareOption.value;
                } else {
                    ctrl.dirty_options = true;
                }
            });

            if (checkCustom) {
                ctrl.active_custom_option = true;
            } else {
                ctrl.active_custom_option = false;
            }

            ctrl.updateCurrentSettings();
        });
    };

    // Initialize
    initialize();
}

function ShareOptionsDropdown() {
    return {
        scope: {},
        templateUrl: 'templates/dropdown/dropdown.html',
        controller: ShareOptionsController,
        controllerAs: 'ctrl',
        bindToController: {
            model: '=',
            field: '@',
            options: '=',
            collectionMap: '=',
            confirmSave: '='
        }
    };
}

angular.module('angular-share.dropdown', [
    'ui.bootstrap',
    'angular-share.modal'
])
    .directive('sharingOptions', ShareOptionsDropdown);
function CustomShareOptionsController($http, $mdDialog) {
    var ctrl = this;

    if (!ctrl.customOptions || !ctrl.collectionMap) { return; }


    // Resolve indentifiers into objects.
    angular.forEach(ctrl.customOptions, function (customOption) {
        if (!angular.isFunction(ctrl.collectionMap[customOption.key]['getByIdentifier'])) {
            return;
        }

        angular.forEach(customOption.value, function (shareEntity, index, array) {
            var value = ctrl.collectionMap[customOption.key]['getByIdentifier'](shareEntity);

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

        if (angular.isFunction(ctrl.collectionMap[option.key]['search_results'])) {
            return ctrl.collectionMap[option.key]['search_results'](queryExp);
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

        this.open = function (customOptions, collectionMap) {
            this.modalInstance = $mdDialog.show({
                templateUrl: 'templates/modal/modal.html',
                hasBackdrop: true,
                controller: CustomShareOptionsController,
                controllerAs: 'ctrl',
                bindToController: true,
                locals: {
                    customOptions: angular.copy(customOptions),
                    collectionMap: collectionMap
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