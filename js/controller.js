
define([
		'marionette',
		'app',
		'entities',
		'views/layouts',
		'views/headerView',
		'views/filtersViews',
		'views/stockViews',
		'views/footerViews',
		'views/ordersViews',
		'views/profileView'
	],
	function(Marionette, App, Entities, Layouts, headerView, filtersViews, stockViews, footerViews, ordersViews, profileView){

	var Router = Marionette.AppRouter.extend({
		appRoutes: {
			"":"mainRoute",
			"stock" : "stockRoute",
			"orders" : "ordersRoute",
			"history" : "historyRoute",
			"stock/order": "orderRoute",
			"profile": "profileRoute"
		}
	});

	var Controller = Marionette.Object.extend({
		initialize: function () {
			this.user = new Entities.profile();
			this.title_page = new Entities.model();
			this.filtersStock = new Entities.filtersStock();
			Entities.doorsStock.fetch();
			this.stockLayout = new Layouts.stockLayout({
				model: this.title_page
			});
			this.ordersLayout = new Layouts.ordersLayout({
				page: '',
				model: this.title_page
			});
		},
		start: function() {
			this.showHeader();
		},
		mainRoute: function() {
			this.ordersLayout.page = 'homePage';
			this.ordersLayout.render();
			
			var filtersV = new filtersViews.tabView();
			var footer = new footerViews.footer();
			
			this.ordersLayout.showChildView('filtersRegion',filtersV);
			this.ordersLayout.showChildView('footerRegion',footer);
		},
		stockRoute: function() {			
			var filtersV = new filtersViews.filters({
				collection: this.filtersStock
			});
			var doorsV = new stockViews.stockList({
				collection: Entities.doorsStock
			});
			var footer = new footerViews.stockFooter({
				collection: Entities.orderCollection
			});
			this.showStock(filtersV,doorsV,footer,'Двери на складе');
			if (!this.filtersStock.length) {
				this.filtersStock.fetch().then(function() {
					ui_dropdown();
				});
			} else {
				ui_dropdown();
			};
		},
		orderRoute: function() {
			var back = new filtersViews.backStock();
			var doorsV = new stockViews.orderList({
				collection: Entities.orderCollection
			});
			var footer = new footerViews.orderFooter({
				collection: Entities.orderCollection
			});
			this.showStock(back,doorsV,footer,'Бланк заказа');
		},
		showStock: function(filtersV,doorsV,footer,title) {
			this.title_page.set('title',title);
			this.stockLayout.render();	
			this.stockLayout.showChildView('filtersRegion',filtersV);
			this.stockLayout.showChildView('tableRegion',doorsV);
			this.stockLayout.showChildView('footerRegion',footer);
		},
		ordersRoute: function() {
			this.showOrders(Entities.orders,'Текущие заказы',false);
		},
		historyRoute: function() {
			this.showOrders(Entities.ordersHistory,'История заказов',true);
		},
		showOrders: function(orders,title,complete) {
			this.title_page.set('title',title);
			this.ordersLayout.page = '';
			this.ordersLayout.render();
			var filtersV = new filtersViews.orderFilters({
				model: new Entities.model({'complete':complete})
			});
			var footer = new footerViews.footer();
			this.ordersLayout.showChildView('filtersRegion',filtersV);
			this.ordersLayout.showChildView('footerRegion',footer);
		},
		profileRoute: function() {
			var model = this.user;
			model.fetch().then(function() {
				var profile = new profileView({
					model: model
				});
				App.contentRegion.show(profile);
			});
		},
		showHeader: function() {
			var model = this.user;
			model.fetch().then(function() {
				var header = new headerView({
					model: model
				});
				App.headerRegion.show(header);
			})
		},
		
	});
	
	return {
		router: Router,
		controller: Controller
	}
})