
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
	function(Marionette, App, Entities, Loyouts, headerView, filtersViews, stockViews, footerViews, ordersViews, profileView){

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
			this.title_page = new Entities.model();
			this.filtersStock = new Entities.filtersStock();
			Entities.doorsStock.fetch();
			this.stockLayout = new Loyouts.stockLayout({
				model: this.title_page
			});
		},
		start: function() {
			this.showHeader();
		},
		mainRoute: function() {
			var homeLayout = new Loyouts.ordersLayout({
				page: 'homePage',
				model: this.title_page
			});
			homeLayout.render();
			Entities.orders.fetch();
			var orders = new ordersViews.orders({
				model: new Entities.model({'complete':false}),
				collection:  Entities.orders
			});
			var history = new ordersViews.orders({
				model: new Entities.model({'complete':true}),
				collection:  Entities.orders
			});
			var footer = new footerViews.footer();
			homeLayout.showChildView('ordersPreviewRegion',orders);
			homeLayout.showChildView('historyPreviewRegion',history);
			homeLayout.showChildView('footerRegion',footer);
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
		ordersRoute: function() {
			this.showOrders(Entities.orders,'Текущие заказы',false);
		},
		historyRoute: function() {
			this.showOrders(Entities.ordersHistory,'История заказов',true);
		},
		profileRoute: function() {
			var profile = new profileView();
			App.contentRegion.show(profile);
		},
		showStock: function(filtersV,doorsV,footer,title) {
			this.title_page.set('title',title);
			this.stockLayout.render();	
			this.stockLayout.showChildView('filtersRegion',filtersV);
			this.stockLayout.showChildView('tableRegion',doorsV);
			this.stockLayout.showChildView('footerRegion',footer);
		},
		showOrders: function(orders,title,complete) {
			this.title_page.set('title',title);
			var ordersLayout = new Loyouts.ordersLayout({
				page: '',
				model: this.title_page
			});
			ordersLayout.render();
			//orders.fetch();
			var ordersV = new ordersViews.orders({
				model: new Entities.model({'complete':complete}),
				collection: orders
			});
			var filtersV = new filtersViews.orderFilters({
				model: new Entities.model({'complete':complete})
			});
			var footer = new footerViews.footer();
			ordersLayout.showChildView('ordersRegion',ordersV);
			ordersLayout.showChildView('filtersRegion',filtersV);
			ordersLayout.showChildView('footerRegion',footer);
		},
		showHeader: function() {
			var header = new headerView();
			App.headerRegion.show(header);
		},
		
	});
	
	return {
		router: Router,
		controller: Controller
	}
})