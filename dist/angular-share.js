angular.module("angular-share.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("templates/dropdown/dropdown.html","<div uib-dropdown auto-close=\"outsideClick\" is-open=\"ctrl.uibDropdownOpen\">\n  <button type=\"button\" class=\"btn btn-default\" uib-dropdown-toggle>\n    <span>{{ ctrl.currentSettings }}</span>\n    <span class=\"caret\"></span>\n  </button>\n  <ul class=\"uib-dropdown-menu\">\n    <li ng-click=\"ctrl.clearSetOptions()\">\n      <a href=\"#\">\n        <span class=\"fa\" ng-class=\"{\'fa-check-square-o\': ctrl.active_options_count === 0, \'fa-square-o\': ctrl.active_options_count > 0}\"></span>\n        <span>Only Me</span>\n      </a>\n    </li>\n    <li ng-if=\"ctrl.toggleOptions.length\" class=\"divider\"></li>\n    <li ng-repeat=\"option in ::ctrl.toggleOptions track by option.key\" ng-click=\"ctrl.toggleOption(option)\">\n      <a href=\"#\">\n        <span class=\"fa\" ng-class=\"{\'fa-check-square-o\': option.value, \'fa-square-o\': !option.value}\"></span>\n        <span>{{ option.label }}</span>\n      </a>\n    </li>\n    <li ng-if=\"ctrl.customOptions.length\" class=\"divider\"></li>\n    <li ng-if=\"ctrl.customOptions.length\" ng-click=\"ctrl.openCustomOptionsModal()\">\n      <a href=\"#\">\n        <span class=\"fa fa-cog\"></span>\n        <span>Custom</span>\n      </a>\n    </li>\n  </ul>\n</div>");
$templateCache.put("templates/modal/modal.html","<div style=\"margin-bottom: 0;\" class=\"panel panel-primary\">\n    <div class=\"panel-heading\">\n        <h2>Who Can See This?</h2>\n    </div>\n    <div class=\"panel-body\">\n        <div style=\"margin: 1em;\" ng-repeat=\"option in ::ctrl.customOptions track by option.key\">\n            <label>{{ option.label }}</label>\n            <button class=\"btn btn-primary btn-xs\" ng-click=\"ctrl.clearList(option)\">Remove All</button>\n            <md-contact-chips\n                ng-model=\"option.value\"\n                md-contacts=\"ctrl.getResource(option.resource, $query)\"\n                md-contact-name=\"display_name\"\n                md-require-match=\"true\"\n                filter-selected=\"true\"\n                placeholder=\"Share with {{ option.label }}...\"\n                secondary-placeholder=\"Add {{ option.label }}...\">\n            </md-contact-chips>\n        </div>\n        <div class=\"text-right\">\n            <button type=\"button\" class=\"btn btn-primary\" ng-click=\"ctrl.close()\">Cancel</button>\n            <button type=\"button\" class=\"btn btn-success\" ng-click=\"ctrl.propagateChanges()\">OK</button>\n        </div>\n    </div>\n</div>");}]);
angular.module('angular-share', [
    'angular-share.dropdown',
    'angular-share.modal',
    'angular-share.templates'
]);
function ShareOptionsController(CustomShareOptionsModal) {

    if (!angular.isObject(this.model) || !this.field || !angular.isArray(this.options)) { return; }

    /**************/

    var ctrl = this;

    // Configure our scope.

    ctrl.uibDropdownOpen = undefined; // When set to false, programmatically closes the dropdown control.

    ctrl.currentSettings = undefined; // text overview of current sharing options.

    ctrl.toggleOptions = undefined; // all share options that are boolean flags by nature.
    ctrl.customOptions = undefined; // all share options that are collections of entities by nature.

    ctrl.active_options_count = 0; // counter to keep track of how many options are set.
    ctrl.active_toggle_options = []; // array of string for currently active toggle options.

    ctrl.active_custom_option = undefined; // flag to indicate that custom options are in use.

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
    // with the new value.
    ctrl.toggleOption = function (shareOption) {
        ctrl.model[ctrl.field][shareOption.key] = !shareOption.value; // Update the model
        shareOption.value = !shareOption.value; // Update the view

        if (shareOption.value === true) {

            ctrl.active_options_count++;
            ctrl.active_toggle_options.push(shareOption.label);

        } else {

            ctrl.active_options_count--;
            ctrl.active_toggle_options.splice(ctrl.active_toggle_options.indexOf(shareOption.label), 1);

        }

        ctrl.updateCurrentSettings();
    };

    // Sets all toggleable sharing options to false. Updates the bound
    // model with the new values.
    ctrl.clearToggleOptions = function () {
        angular.forEach(ctrl.toggleOptions, function (shareOption) {
            ctrl.model[ctrl.field][shareOption.key] = false; // Update the model
            if (shareOption.value === true) {
                shareOption.value = false; // Update the view
                ctrl.active_options_count--;
            }
        });

        ctrl.active_toggle_options = [];
        ctrl.updateCurrentSettings();
    };

    // Sets all custom sharing options to empty lists. Updates the bound
    // model with thee new values.
    ctrl.clearCustomOptions = function () {
        angular.forEach(ctrl.customOptions, function (shareOption) {
            ctrl.model[ctrl.field][shareOption.key] = []; // Update the model
            if (shareOption.value.length) {
                shareOption.value = []; // Update the view
                ctrl.active_options_count--;
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

    // Opens the custom sharing options modal, passing it
    // the sharing options. The modal will make a copy of our sharing
    // options and later return that copy with the new values.
    ctrl.openCustomOptionsModal = function () {
        ctrl.uibDropdownOpen = false; // Close the dropdown control.
        var modal = CustomShareOptionsModal.open(ctrl.customOptions);

        modal.result.then(function (customOptions) {
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

                // Update the original model.
                ctrl.model[ctrl.field][shareOption.key] = shareOption.value;

                // Set the new custom options on the controller
                correspondingShareOption.value = shareOption.value;
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
            options: '='
        }
    };
}

angular.module('angular-share.dropdown', [
    'ui.bootstrap',
    'angular-share.modal'
])
    .directive('sharingOptions', ShareOptionsDropdown);
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