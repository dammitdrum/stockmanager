
define([
		'marionette',
		'app',
		'entities',
		'views/stockLayout',
		'views/ordersLayout',
		'views/headerView',
		'views/filtersViews',
		'views/stockViews',
		'views/footerViews',
		'views/ordersViews',
		'views/profileView'
	],
	function(Marionette, App, Entities, stockLayout, ordersLayout, headerView, filtersViews, stockViews, footerViews, ordersViews, profileView){

	var Router = Marionette.AppRouter.extend({
		appRoutes: {
			"":"mainRoute",
			"stock" : "stockRoute",
			"orders" : "ordersRoute",
			"neworders" : "newordersRoute",
			"history" : "historyRoute",
			"stock/order": "orderRoute",
			"profile": "profileRoute"
		}
	});

	var Controller = Marionette.Object.extend({
		initialize: function () {
			this.title_page = new Entities.model();
			this.filtersStock = new Entities.filtersStock();
			this.managers = new Entities.managers();
			this.managers.fetch();
			Entities.doorsStock.fetch();
			this.stockLayout = new stockLayout({
				model: this.title_page
			});
			this.ordersLayout = new ordersLayout({
				page: '',
				status: [],
				model: this.title_page
			});
		},
		start: function() {
			this.showHeader();
		},

		mainRoute: function() {
			var role = App.user.get('role');
			var status = role==='admin' ? ['new'] : ['new','approved'];

			this.ordersLayout.page = 'homePage';
			this.ordersLayout.status = status;
			this.ordersLayout.render();
			
			var tabsV = new filtersViews.tabView({
				model: new Entities.model({
					'role': role
				})
			});
			var footer = new footerViews.footer();
			
			this.ordersLayout.showChildView('filtersRegion',tabsV);
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
				collection: Entities.orderCollection,
				managers: this.managers.at(0).get('list').toJSON()
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

		newordersRoute: function() {
			this.showOrders(Entities.orders,'Новые заказы',['new']);
		},

		ordersRoute: function() {
			var status = App.user.get('role') === 'admin' ? ['approved']:['new','approved'];
			this.showOrders(Entities.orders,'Текущие заказы',status);
		},

		historyRoute: function() {
			this.showOrders(Entities.ordersHistory,'История заказов',['history']);
		},

		showOrders: function(orders,title,status) {
			var role = App.user.get('role');

			this.title_page.set('title',title);
			this.ordersLayout.page = '';
			this.ordersLayout.status = status;
			this.ordersLayout.render();

			var filtersV = new filtersViews.orderFilters({
				model: new Entities.model({
					'status':status,
					'role': role,
					'managers': this.managers
				})
			});

			if(role === 'admin') {
				var self = this;
				this.managers.fetch().then(function() {
					self.ordersLayout.showChildView('filtersRegion',filtersV);
					ui_dropdown();
				});
			} else if(role === 'manager') {
				this.ordersLayout.showChildView('filtersRegion',filtersV);
			};

			var footer = new footerViews.footer();
			this.ordersLayout.showChildView('footerRegion',footer);
		},

		profileRoute: function() {
			App.user.fetch().then(function() {
				var profile = new profileView({
					model: App.user
				});
				App.contentRegion.show(profile);
			});
		},

		showHeader: function() {
			var header = new headerView({
				model: App.user
			});
			App.headerRegion.show(header);
		},
		
	});
	
	return {
		router: Router,
		controller: Controller
	}
})