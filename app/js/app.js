'use strict';

/* App Module */

var scrumvoteApp = angular.module('scrumvoteApp', ['ngRoute','ngResource','ui.bootstrap','firebase']);
 
scrumvoteApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/sprint-list', {
        templateUrl: 'partials/sprint-list.html',
        controller: 'SprintListCtrl'
      }).
      when('/sprint-detail/:sprintId', {
        templateUrl: 'partials/sprint-detail.html',
        controller: 'SprintDetailCtrl'
      }).
      when('/team-vote/:sprintId/:user', {
        templateUrl: 'partials/team-vote.html',
        controller: 'TeamVoteCtrl'
      }).
      otherwise({
        redirectTo: '/sprint-list'
      });
  }]);


scrumvoteApp.controller('SprintListCtrl', ['$scope', '$firebase',
  function ($scope, $firebase) {
    var ref = new Firebase("https://scrumvote.firebaseio.com/sprints");
    var service = $firebase(ref);
    service.$bind($scope, "sprints");

    $scope.addSprint = function(desc) {
      console.log("in addSprint");
      $scope.sprints.$add({"Description":desc,"Status":"New","Team":[],"Stories":[]});
      };

  }]);

scrumvoteApp.controller('SprintDetailCtrl', ['$scope', '$routeParams','$firebase',
  function($scope, $rootParams , $firebase) {
    console.log($rootParams.sprintId);
    $scope.sprintId=$rootParams.sprintId;
    var ref = new Firebase("https://scrumvote.firebaseio.com/sprints/"+$rootParams.sprintId);
    var service = $firebase(ref);
    service.$bind($scope, "sprint");
  
    $scope.addStory = function(desc) {
      console.log("in addStories");
      if (typeof($scope.sprint.Stories)=="undefined")
        $scope.sprint.Stories=[];
      var votes=[];
      for (var m in $scope.sprint.Team)
        votes.push({"member":$scope.sprint.Team[m],"vote":"?"});
      $scope.sprint.Stories.push({"Name":desc,"Votes":votes});
      };

    $scope.submitToVotes = function(storyindex) {
      $scope.sprint.currentStory= storyindex;
    };

  }]);

scrumvoteApp.controller('TeamVoteCtrl', ['$scope',  '$routeParams','$firebase',
  function($scope, $rootParams , $firebase) {
    console.log("in TeamVoteCtrl");
    $scope.user=$rootParams.user;
    var ref = new Firebase("https://scrumvote.firebaseio.com/sprints/"+$rootParams.sprintId);
    $scope.refsprint = $firebase(ref);
    $scope.refsprint.$bind($scope, "sprint");
    $scope.refsprint.$on("loaded",function() {
      $scope.story=$scope.sprint.Stories[$scope.sprint.currentStory];
     } );
    $scope.refsprint.$on("change",function() {
      $scope.story=$scope.sprint.Stories[$scope.sprint.currentStory];
     } );
    var lv=[1,3,5,8,13,20,40];
    $scope.fibosuite=[{"text":"1/2","value":0.5,"current":false}];
    for (var i in lv)
        $scope.fibosuite.push({"text":String(lv[i]),"value":lv[i],"current":false});
  
    $scope.submitVote = function(vote) {
      console.log("voting");
      for (var v in $scope.fibosuite)
          $scope.fibosuite[v].current=($scope.fibosuite[v].value==vote);
      var votes=[];
      for (var m in $scope.story.Votes)
        if ($scope.story.Votes[m].member==$scope.user)
            $scope.story.Votes[m].vote = vote;
      };

  }]);


var ModalImputNameCtrl = function ($scope, $modal, $log) {

  $scope.open = function (objDesc,callback) {
    var modalInstance = $modal.open({
      templateUrl: 'partials/new-name.html',
      controller: ModalInstanceCtrl,
      resolve: {
        objDesc: function () {return objDesc;} 
      }
      });
    modalInstance.result.then(function (newName) {
          $log.info("new name:"+newName);     
          callback(newName);
        });

  };
};

var ModalInstanceCtrl = function ($scope, $modalInstance , objDesc) {
  $scope.objDesc = objDesc;
  $scope.ok = function () {
    $modalInstance.close(this.newName);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

