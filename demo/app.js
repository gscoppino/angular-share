angular.module('test', ['angular-share', 'ngMaterial'])
  .directive('test', function () {
    return {
      scope: {},
      template: '<sharing-options model="testCtrl.resourceModel" field="permissions" options="::testCtrl.shareOptions"></sharing-options>',
      controller: function ($scope) {
        var ctrl = this;

        ctrl.resourceModel = {
	  id: 1,
	  name: 'Test Resource Model'
	};

	$scope.$watch(function () {
	  return ctrl.resourceModel;
	}, function (newVal, oldVal) {
	  console.log("New Model Value: ", newVal);
	}, true);

	ctrl.shareOptions = [
	  {
	    key: 'family',
	    label: 'Family',
	    type: 'boolean',
	    value: false
	  },
	  {
	    key: 'staff',
	    label: 'Staff',
	    type: 'boolean',
	    value: false
	  },
	  {
	    key: 'users',
	    label: 'Users',
	    type: 'collection',
	    value: [1]
	  },
	  {
	    key: 'groups',
	    label: 'Groups',
	    type: 'collection',
	    value: [1, 2]
	  }
	];
      },
      controllerAs: 'testCtrl',
    };
  });
