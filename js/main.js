
require.config({
  paths : {
    underscore : 'lib/underscore',
    backbone   : 'lib/backbone',
    marionette : 'lib/backbone.marionette',
    jquery     : 'lib/jquery',
    backboneSearch  : 'lib/backbone.search',
    moment: 'lib/moment'
  },
  config: {
    moment: {
      noGlobal: true
    }
  },
  shim : {
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
    },
  },
  deps : ['jquery','underscore','ui']
});

require(['backbone','app','controller','ui'],function(Backbone,App,Controller){

  App.on("start", function() {
    var ctrl = new Controller.controller();
    ctrl.router = new Controller.router({
      controller: ctrl
    });
    ctrl.start();
    Backbone.history.start();
  });

	var tplLoader = new App.Loader({
          tpl:[
            'stock/stock_tpl',                       //0
            'header_tpl',                            //1
            'stock/filter_tpl',                      //2
            'stock/filters_tpl',                     //3
            'stock/stock_item_tpl',                  //4
            'stock/stock_list_tpl',                  //5
            'modal_tpl',                             //6
            'stock/stock_addmodal_tpl',              //7
            'stock/stock_footer_tpl',                //8
            'stock/order_list_tpl',                  //9
            'stock/order_item_tpl',                  //10
            'stock/order_footer_tpl',                //11
            'profile_tpl',                           //12
            'orders/order_item_tpl',                 //13
            'orders/order_detail_tpl',               //14
            'orders/order_detail_item_tpl',          //15
            'orders/orders_tpl',                     //16
            'orders/filters_tpl',                    //17
            'footer_tpl',                            //18
            'stock/order_send_tpl'                   //19
          ],
          url:'/stock/templates/'
    });
  	tplLoader.start();
 
});