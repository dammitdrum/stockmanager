
define([
		'marionette',
		'app',
		'entyties',
		'views/layouts',
		'views/headerView',
		'views/filtersViews',
		'views/stockViews',
		'views/footerViews',
		'views/ordersViews',
		'views/profileView'
	],
	function(Marionette, App, Entyties, Loyouts, headerView, filtersViews, stockViews, footerViews, ordersViews, profileView){

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
			this.title_page = new Entyties.model();
			this.filtersStock = new Entyties.filterCollection();
			Entyties.doorsStock.fetch();
			this.stockLayout = new Loyouts.stockLayout({
				model: this.title_page
			});
			this.homeLayout = new Loyouts.homeLayout();
			this.ordersLayout = new Loyouts.ordersLayout({
				model: this.title_page
			});
		},
		start: function() {
			this.showHeader();
		},
		mainRoute: function() {
			this.homeLayout.render();
			Entyties.orders.fetch();
			Entyties.ordersHistory.fetch();
			var orders = new ordersViews.orders({
				model: new Entyties.model({'complite':false}),
				collection:  Entyties.orders
			});
			var history = new ordersViews.orders({
				model: new Entyties.model({'complite':true}),
				collection:  Entyties.ordersHistory
			});
			var footer = new footerViews.footer();
			this.homeLayout.showChildView('ordersRegion',orders);
			this.homeLayout.showChildView('historyRegion',history);
			this.homeLayout.showChildView('footerRegion',footer);
		},
		stockRoute: function() {			
			var filtersV = new filtersViews.filters({
				collection: this.filtersStock
			});
			var doorsV = new stockViews.stockList({
				collection: Entyties.doorsStock
			});
			var footer = new footerViews.stockFooter({
				collection: Entyties.orderCollection
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
				collection: Entyties.orderCollection
			});
			var footer = new footerViews.orderFooter({
				collection: Entyties.orderCollection
			});
			this.showStock(back,doorsV,footer,'Бланк заказа');
		},
		ordersRoute: function() {
			this.showOrders(Entyties.orders,'Текущие заказы',false);
		},
		historyRoute: function() {
			this.showOrders(Entyties.ordersHistory,'История заказов',true);
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
		showOrders: function(orders,title,complite) {
			this.title_page.set('title',title);
			this.ordersLayout.render();
			orders.fetch();
			var ordersV = new ordersViews.orders({
				model: new Entyties.model({'complite':complite}),
				collection: orders
			});
			var filtersV = new filtersViews.orderFilters({
				model: new Entyties.model({'complite':complite})
			});
			var footer = new footerViews.footer();
			this.ordersLayout.showChildView('ordersRegion',ordersV);
			this.ordersLayout.showChildView('filtersRegion',filtersV);
			this.ordersLayout.showChildView('footerRegion',footer);
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