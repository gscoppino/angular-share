angular.module('test', ['angular-share', 'ngMaterial'])
    .directive('test', function () {
        return {
            scope: {},
            template: '<sharing-options model="testCtrl.resourceModel" field="permissions" options="::testCtrl.shareOptions" render-results="::testCtrl.resourceMap" confirm-save="false"></sharing-options>',
            controller: function ($scope) {
                var ctrl = this;

                ctrl.resourceModel = {
                    id: 1,
                    name: 'Test Resource Model',
                    permissions: {
                        family: true,
                        staff: false,
                        users: [1, 3],
                        groups: [1, 2]
                    }
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
                        value: [1],
                        search_results: [
                            { id: 1, first_name: 'John', last_name: 'Doe' },
                            { id: 2, first_name: 'Jack', last_name: 'Smith' },
                            { id: 3, first_name: 'Jane', last_name: 'Johnson' }
                        ]
                    },
                    {
                        key: 'groups',
                        label: 'Groups',
                        type: 'collection',
                        value: [1, 2],
                        search_results: [
                            { id: 1, name: 'Group 1' },
                            { id: 2, name: 'Group 2' },
                            { id: 3, name: 'Group 3' }
                        ]
                    }
                ];

                ctrl.resourceMap = {
                    users: function (user) {
                        if (user) {
                            user.display_name = user.first_name + ' ' + user.last_name;
                        }

                        return 'display_name';
                    },
                    groups: function () {
                        return 'name';
                    }
                };
            },
            controllerAs: 'testCtrl',
        };
    });
