
require.config({
  urlArgs: "v0.0.1",
  paths : {
    underscore : 'lib/underscore',
    backbone   : 'lib/backbone',
    marionette : 'lib/backbone.marionette',
    jquery     : 'lib/jquery',
    backboneSearch  : 'lib/backbone.search',
    moment: 'lib/moment',
    dateRange: 'lib/daterangepicker',
  },
  config: {
    moment: {
      noGlobal: true
    }
  },
  shim : {
    'lib/backbone.localStorage' : ['backbone'],
    underscore : {
      exports : '_'
    },
    backbone : {
      exports : 'Backbone',
      deps : ['jquery','underscore']
    },
    marionette : {
      exports : 'Marionette',
      deps : ['backbone']
    },
    ui: {
    	deps: ['jquery']
    },
    backboneSearch: {
      deps: ['underscore', 'backbone'],
      exports: 'Backbone'
    }
  },
  deps : ['jquery','underscore','ui']
});

require(['backbone','app','controller','entities','ui'],function(Backbone,App,Controller,Entities){

  App.on("start", function() {
    var ctrl = new Controller.controller();
    ctrl.router = new Controller.router({
      controller: ctrl
    });
    ctrl.start();
    Backbone.history.start();
  });
  App.user = new Entities.profile();
  App.line = $('.load_line');

	var tplLoader = new App.Loader({
          tpl:[
            'stock/stock_tpl',                //0
            'header_tpl',                     //1
            'stock/filter_tpl',               //2
            'stock/filters_tpl',              //3
            'stock/stock_item_tpl',           //4
            'stock/stock_list_tpl',           //5
            'modal_tpl',                      //6
            'stock/stock_addmodal_tpl',       //7
            'stock/stock_footer_tpl',         //8
            'stock/order_list_tpl',           //9
            'stock/order_item_tpl',           //10
            'stock/order_footer_tpl',         //11
            'profile_tpl',                    //12
            'orders/order_item_tpl',          //13
            'orders/order_detail_tpl',        //14
            'orders/order_detail_item_tpl',   //15
            'orders/orders_tpl',              //16
            'orders/filters_tpl',             //17
            'footer_tpl',                     //18
            'stock/order_send_tpl',           //19
            'orders/tabs_tpl',                //20
            'stock/stock_pricemodal_tpl',     //21
            'orders/ship_item_tpl'            //22
            ],
          url:'templates/'
    });

    
    App.user.fetch().then(function() {
      var get = window.location.search;
      if (get) {
        App.user.set('role',get.substring(1));
      };
      if (Entities.doorsStorage.records.length) {
        Entities.doorsStock.localStorage = Entities.doorsStorage;
        Entities.doorsStock.fetch().then(function() {
          App.line.css('width','15%');
          Entities.orders.fetch().then(function() {

            Entities.ships.fetch().then(function() {

              App.line.css('width','45%');
              tplLoader.start();

            })

          })
        });
      } else {
        Entities.doorsStock.fetch().then(function() {
          Entities.doorsStock.localStorage = Entities.doorsStorage;
          Entities.doorsStock.each(function(door) {
            door.save();
          })
          App.line.css('width','15%');
          Entities.orders.fetch().then(function() {

            Entities.ships.fetch().then(function() {

              App.line.css('width','45%');
              tplLoader.start();

            })

          })
        });
      }
      
    })
  	
 
});