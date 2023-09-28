let PMS = window.PMS || {};

(function () {

    this.handleOnLoad = function(executionContext){
        console.log("On load - Permit form");
    },

    this.handleOnChange = function(executionContext){
        console.log("On change - Permit type"); 
    }

}).call(PMS);
