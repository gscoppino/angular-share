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

    ctrl.has_custom_option = undefined; // flag to indicate that custom options are in use.

    // Initialize.
    function initialize() {
        var toggleOptions = [], customOptions = [];
        ctrl.model[ctrl.field] = angular.isObject(ctrl.model[ctrl.field]) ? ctrl.model[ctrl.field] : {};

        ctrl.currentSettings = "Loading...";
        angular.forEach(ctrl.options, function (shareOption) {
            if (!shareOption.key) { return; }

            ctrl.model[ctrl.field][shareOption.key] = ctrl.model[ctrl.field][shareOption.key] || shareOption.value;

            if (shareOption.type === 'boolean') {
                toggleOptions.push(angular.copy(shareOption));

                if (shareOption.value === true) {
                    ctrl.active_options_count++;
                    ctrl.active_toggle_options.push(shareOption.label);
                }

            } else if (shareOption.type === 'collection') {
                customOptions.push(angular.copy(shareOption));

                if (shareOption.value.length) {
                    ctrl.active_options_count++;

                    if (!ctrl.has_custom_option) {
                        ctrl.has_custom_option = true;
                    }
                }
            }
        });

        ctrl.toggleOptions = toggleOptions;
        ctrl.customOptions = customOptions;
        ctrl.updateCurrentSettings();
    }

    // Controller API
    ctrl.updateCurrentSettings = function () {
        if (ctrl.has_custom_option) {
            ctrl.currentSettings = "Custom";
            return;
        }

        if (ctrl.active_options_count === 0) {
            ctrl.currentSettings = "Only Me";
            return;
        }

        ctrl.currentSettings = ctrl.active_toggle_options.join(', ');
    };

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

    ctrl.clearCustomOptions = function () {
        angular.forEach(ctrl.customOptions, function (shareOption) {
            ctrl.model[ctrl.field][shareOption.key] = []; // Update the model
            if (shareOption.value.length) {
                shareOption.value = []; // Update the view
                ctrl.active_options_count--;
            }
        });

        ctrl.has_custom_option = false;
        ctrl.updateCurrentSettings();
    };

    ctrl.clearSetOptions = function () {
        ctrl.clearToggleOptions();
        ctrl.clearCustomOptions();
    };

    ctrl.openCustomOptionsModal = function () {
        ctrl.uibDropdownOpen = false; // Close the dropdown control.
        var modal = CustomShareOptionsModal.open(ctrl.customOptions);

        modal.result.then(function (customOptions) {
            var checkCustom = false;
            angular.forEach(customOptions, function (shareOption) {

                // Diff the old custom options with the new ones
                // to update active options counter.
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
                ctrl.has_custom_option = true;
            } else {
                ctrl.has_custom_option = false;
            }

            ctrl.updateCurrentSettings();
        });
    };

    // Initialize
    initialize();
}

function ShareOptionsDirective() {
    return {
        scope: {},
        template: '\
            <div uib-dropdown auto-close="outsideClick" is-open="ctrl.uibDropdownOpen">\
              <button type="button" class="btn btn-default" uib-dropdown-toggle>\
                <span>{{ ctrl.currentSettings }}</span>\
                <span class="caret"></span>\
              </button>\
              <ul class="uib-dropdown-menu">\
                <li ng-click="ctrl.clearSetOptions()">\
                  <a href="#">\
                    <span class="fa" ng-class="{\'fa-check-square-o\': ctrl.active_options_count === 0, \'fa-square-o\': ctrl.active_options_count > 0}"></span>\
                    <span>Only Me</span>\
                  </a>\
                </li>\
                <li ng-if="ctrl.toggleOptions.length" class="divider"></li>\
                <li ng-repeat="option in ::ctrl.toggleOptions track by option.key" ng-click="ctrl.toggleOption(option)">\
                  <a href="#">\
                    <span class="fa" ng-class="{\'fa-check-square-o\': option.value, \'fa-square-o\': !option.value}"></span>\
                    <span>{{ option.label }}</span>\
                  </a>\
                </li>\
                <li ng-if="ctrl.customOptions.length" class="divider"></li>\
                <li ng-if="ctrl.customOptions.length" ng-click="ctrl.openCustomOptionsModal()">\
                  <a href="#">\
                    <span class="fa fa-cog"></span>\
                    <span>Custom</span>\
                  </a>\
                </li>\
              </ul>\
            </div>\
        ',
        controller: ShareOptionsController,
        controllerAs: 'ctrl',
        bindToController: {
            model: '=',
            field: '@',
            options: '='
        }
    };
}


angular.module('angular-share', ['ui.bootstrap', 'angular-share.modal'])
    .directive('sharingOptions', ShareOptionsDirective);

//=============================================================================//

function CustomShareOptionsController($http, $uibModalInstance, customOptions) {
    var ctrl = this;

    ctrl.customOptions = customOptions;

    ctrl.getEntities = function (query, option) {
        return $http.get(option.query_url, { query: query});
    };

    ctrl.propagateChanges = function () {
        $uibModalInstance.close(ctrl.customOptions); // pass the custom permissions back.
    };

    ctrl.close = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

function CustomShareOptionsFactory($uibModal) {
    var CustomShareOptionsModal = function () {
        this.modalInstance = null;

        this.open = function (customOptions) {
            this.modalInstance = $uibModal.open({
                template: '\
                    <div class="panel panel-primary">\
                        <div class="panel-heading">\
                            <h2>Who Can See This?</h2>\
                        </div>\
                        <div class="panel-body">\
                            <div ng-repeat="option in ::ctrl.customOptions track by option.key">\
                                <label>{{ option.label }}</label>\
                                <button class="btn btn-primary btn-xs">Remove All</button>\
                                <md-contact-chips\
                                    ng-model="option.value"\
                                    md-contacts="ctrl.getEntities($query, option)"\
                                    md-contact-name="display_name"\
                                    md-require-match="true"\
                                    filter-selected="true"\
                                    placeholder="Share..."\
                                    secondary-placeholder="Add {{ option.label }}...">\
                                </md-contact-chips>\
                                <hr>\
                            </div>\
                            <div class="text-right">\
                                <button type="button" class="btn btn-primary" ng-click="ctrl.close()">Cancel</button>\
                                <button type="button" class="btn btn-success" ng-click="ctrl.propagateChanges()">OK</button>\
                            </div>\
                        </div>\
                    </div>\
                ',
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

        this.close = function () {
            modalInstance.dismiss('terminated');
        };
    };

    return new CustomShareOptionsModal();
}

angular.module('angular-share.modal', ['ui.bootstrap', 'material.components.chips'])
    .factory('CustomShareOptionsModal', CustomShareOptionsFactory);