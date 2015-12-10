'use strict';
(function($, angular){
  
  var app = angular.module('app', []);
  
  /*
  * Cat Rancher Controller Setup
  * 
  */
  app.controller('Catrancher', ['CatService', Catrancher]);
  function Catrancher(CatService) {
    var self = this;
    
    // Add Cat to List
    self.addCat = function(i) {
      CatService.addCat(i);
    };
    // Remove Cat from List
    self.removeCat = function(i) {
      CatService.removeCat(i);
    };

    // Request Cats
    CatService.getCats();
    // Requested Cats Promise Event
    CatService.getCatsP.promise.then(function(data) {
      self.data = data.cats;
    });
    
    // If Clouder True Promise Event Fires and Sets View
    CatService.clouderTrue.promise.then(function(data) {
      self.clouderList = data; 
    });
  }
  
  /*
  * Cat Directive Handles View Cats Display
  * Selects or Deslects cats from the view
  */
  app.directive('cat', ['CatService', Cat]);
  function Cat(CatService) {
    return {
      restrict: 'EA',
      template: '<div ng-click="select()" ng-class="selected"><img src="https://quantcats.herokuapp.com/static/cats/{{id}}.png" alt=""/></div>',
      scope: {
        id: '@'
      },
      link: function(scope, elem, attrs, ctrl) {
       // var self = this;
  
        scope.select = function() {
          if (!scope.selected & CatService.selectedArray.length <= 2) {
            scope.selected = 'selected';
            console.log(CatService.selectedArray.length);
            ctrl.addCat(attrs.id);
          }
          else if (scope.selected) {
            scope.selected = '';
            ctrl.removeCat(attrs.id);
          }
  
        };
 
      },
      controller: Catrancher
    };
  
  }

  /*
  * Clouder Grid Directive
  * Put Selected Cats in a Grid if they get along
  */
  app.directive('clouderGrid', [ClouderGrid]);
  function ClouderGrid(){    
    return {
      restrict:'EA'
      ,template: '<table class="grid large-6 columns"><tr><td ng-repeat="cat in idArray | startFrom: 0 | limitTo: 3"><img src="https://quantcats.herokuapp.com/static/cats/{{cat}}.png"></img></td ng-repeat-end></tr></table>   '
      ,scope: {
        id: '@'
        
      },
      link: function(scope, elem, attrs, ctrl){
        var self = this;
        scope.idArray = attrs.id.split(',');
      }
      
    };
    
  }
  
 
  /*
  * Cat Service Handles Requesting Cats
  * Checks and Stores Clouders
  * Stores Slected Cats
  * 
  */
  app.service('CatService', ['$http', '$q', CatService]);
  function CatService($http, $q) {
    var self = this;
    var cNum = 1;
    
    self.selectedArray = [];
    self.clouderList = {cl:[]};
    self.getCatsP = $q.defer();
    self.clouderTrue = $q.defer();
    
    //Add Cat to Selected Array List
    self.addCat = function(i){
          if (self.selectedArray.length >= 3) {
  
      }
      else {
        self.selectedArray.push(i);
        console.log(self.selectedArray);
      }
  
      if (self.selectedArray.length >= 3) {
        self.checkClouder();
      }
    };
    
    //Remove selected cats from array
    self.removeCat = function(i) {
      var indexR = _.indexOf(self.selectedArray, i, true);
      self.selectedArray.splice(indexR);
    };
    
    //get cats from source
    self.getCats = function() {
      $http.get('https://quantcats.herokuapp.com/bag').
      success(function(data, status, headers, config) {
        self.getCatsP.resolve(data);
      }).
      error(function(data, status, headers, config) {});
    };
  
    //Check if a clouder exist and Fire Clouder Promise if Clouder is found
    self.checkClouder = function(params) {
      var c = self.selectedArray
      $http.get('https://quantcats.herokuapp.com/clowder?cat='+ c[0] + '&cat=' + c[1] + '&cat=' + c[2]).
      success(function(data, status, headers, config) {  
        if (cNum <= 4) {
            self.clouderList.cl.push(data.id) ;
            console.log(self.clouderList.cl);
            cNum++;
            self.clouderTrue.resolve(self.clouderList.cl);
			
			alert("Congratulations! Those Cats Get Along");
        }
        console.log(data);
      }).
      error(function(data, status, headers, config) {});
    };
  
    return self;
  }
  
  /*
  * Join Filter Handles removing commas from returned items
  */
  app.filter('join', [function() {
    return function(x, y) {
      return x.join('');
    };
  }]);
  
  app.filter('split', [function() {
    return function(x, y) {
      return x.split('');
    };
  }]);  
  app.filter('startFrom', function () {
    return function (input, start) {
      if (input) {
        start = +start; //parse to int
        return input.slice(start);
      }
    };
  })
  
  

})(jQuery, angular);