angular.module('test', ['angular-share', 'ngMaterial'])
    .directive('test', function () {
        return {
            scope: {},
            template: '<sharing-options model="testCtrl.resourceModel" field="permissions" options="::testCtrl.shareOptions" resource-map="::testCtrl.resourceMap" confirm-save="false"></sharing-options>',
            controller: function ($scope, $q) {
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
                        value: [1]
                    },
                    {
                        key: 'groups',
                        label: 'Groups',
                        type: 'collection',
                        value: [1, 2]
                    }
                ];

                var usersList = [
                    { id: 1, first_name: 'John', last_name: 'Doe' },
                    { id: 2, first_name: 'Jack', last_name: 'Smith' },
                    { id: 3, first_name: 'Jane', last_name: 'Johnson' }
                ];

                var groupsListPromise = $q.resolve([
                    { id: 1, name: 'Group 1' },
                    { id: 2, name: 'Group 2' },
                    { id: 3, name: 'Group 3' }
                ]);

                ctrl.resourceMap = {
                    users: {
                        display_field: 'display_name',
                        getByIdentifier: function (id) {
                            return usersList.find(function (user) {
                                user.display_name = user.first_name + ' ' + user.last_name;
                                return user.id === id;
                            });
                        },
                        search_results: function (queryExp) {
                            return usersList.filter(function (user) {
                                user.display_name = user.first_name + ' ' + user.last_name;
                                return queryExp.test(user.display_name);
                            });
                        }
                    },
                    groups: {
                        display_field: 'name',
                        getByIdentifier: function (id) {
                            return groupsListPromise.then(function (groupsList) {
                                return groupsList.find(function (group) {
                                    return group.id === id;
                                });
                            });
                        },
                        search_results: function (queryExp) {
                            return groupsListPromise.then(function (groupsList) {
                                return groupsList.filter(function (group) {
                                    return queryExp.test(group.name);
                                });
                            });
                        }
                    }
                };
            },
            controllerAs: 'testCtrl',
        };
    });
