function shareOptionsController() {

  if (!angular.isObject(this.model) || !this.field || !angular.isArray(this.options)) { return; } 

  /**************/ 

  var ctrl = this;

  // Configure our scope.
  ctrl.currentSettings = undefined; // text overview of current sharing options. 
  ctrl.toggleOptions = undefined; // all share options that are boolean flags by nature.
  ctrl.customOptions = undefined; // all share options that are collections of entities by nature.
  ctrl.active_permissions_count = 0; // counter to keep track of how many permissions are set.
  ctrl.active_toggle_permissions = []; // array of string for currently active toggle permissions.
  ctrl.has_custom_permission = undefined; // flag to indicate that custom permissions are in use.

  function initialize() {
    var toggleOptions = [], customOptions = [];
    ctrl.model[ctrl.field] = angular.isObject(ctrl.model[ctrl.field]) ? ctrl.model[ctrl.field] : {};

    ctrl.currentSettings = "Loading...";
    angular.forEach(ctrl.options, function (shareOption) {
      if (!shareOption.key) { return; }

      ctrl.model[ctrl.field][shareOption.key] = ctrl.model[ctrl.field][shareOption.key] || shareOption.value;

      if (shareOption.type === 'boolean') {
        toggleOptions.push(shareOption);

	if (shareOption.value === true) {
	  ctrl.active_permissions_count++;
	  ctrl.active_toggle_permissions.push(shareOption.label);
	}

      } else if (shareOption.type === 'collection') {
        customOptions.push(angular.copy(shareOption));

	if (shareOption.value.length) {
          ctrl.active_permissions_count++;

	  if (!ctrl.has_custom_permission) {
	    ctrl.has_custom_permission = true;
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
    if (ctrl.has_custom_permission) {
      ctrl.currentSettings = "Custom";
      return;
    }
    
    if (ctrl.active_permissions_count === 0) {
      ctrl.currentSettings = "Only Me";
      return;
    }
    
    ctrl.currentSettings = ctrl.active_toggle_permissions.join(', ');
  };

  ctrl.toggleOption = function (shareOption) {
    ctrl.model[ctrl.field][shareOption.key] = !shareOption.value; // Update the model
    shareOption.value = !shareOption.value; // Update the view

    if (shareOption.value === true) {

      ctrl.active_permissions_count++;
      ctrl.active_toggle_permissions.push(shareOption.label);

    } else {

      ctrl.active_permissions_count--; 
      ctrl.active_toggle_permissions.splice(ctrl.active_toggle_permissions.indexOf(shareOption.label), 1);

    }

    ctrl.updateCurrentSettings();
  };
  
  // Initialize
  initialize();
}

angular.module('angular-share', ['ui.bootstrap'])
  .directive('sharingOptions', function () {
    return {
      scope: {},
      template: '\
        <div uib-dropdown auto-close="outsideClick">\
	  <button type="button" class="btn btn-default" uib-dropdown-toggle>\
	    {{ ctrl.currentSettings }}\
	    <span class="caret"></span>\
	  </button>\
	  <ul class="uib-dropdown-menu">\
	    <li ng-repeat="option in ::ctrl.toggleOptions" ng-click="ctrl.toggleOption(option)">\
              <a href="#">{{ option.label }}</a>\
	    </li>\
	    <li ng-if="ctrl.toggleOptions.length && ctrl.customOptions.length" class="divider"></li>\
	    <li ng-if="ctrl.customOptions.length">\
	      <a href="#">Custom</a>\
	    </li>\
	  </ul>\
	</div>\
      ',
      controller: shareOptionsController, 
      controllerAs: 'ctrl',
      bindToController: {
        model: '=',
	field: '@',
	options: '='
      }
    };
  });
