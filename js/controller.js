
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
			"ships" : "shipsRoute",
			"neworders" : "newordersRoute",
			"orders/history" : "historyOrdersRoute",
			"ships/history" : "historyShipsRoute",
			"stock/order": "orderRoute",
			"profile": "profileRoute"
		}
	});

	var Controller = Marionette.Object.extend({
		initialize: function () {
			this.title_page = new Entities.model();
			this.role = App.user.get('role');
			this.filtersStock = this.createFilters({
				'Фильтр по названию':'name',
				'Сторона открытия':'open_side',
				'Ширина':'width'
			});
			this.markets = Entities.markets;
			this.stockLayout = new stockLayout({
				model: this.title_page,
			});
			this.ordersLayout = new ordersLayout({
				page: '',
				status: [],
				model: this.title_page,
				mode: ''
			});
		},
		start: function() {
			this.showHeader();
		},

		mainRoute: function() {
			App.line.show().css('width','20%');
			var role = this.role;
			var status = role==='admin' ? ['new'] : ['approved'];

			this.ordersLayout.page = 'homePage';
			this.ordersLayout.status = status;
			this.ordersLayout.mode = role==='mogilev'?'ships':'orders';
			this.ordersLayout.render();
			
			var tabsV = new filtersViews.tabView({
				model: new Entities.model({
					'role': role,
					'orders': Entities.orders.where({'status':'approved'}).length,
					'ships': Entities.ships.where({'status':'approved'}).length
				})
			});
			var footer = new footerViews.footer();
			
			this.ordersLayout.showChildView('filtersRegion',tabsV);
			this.ordersLayout.showChildView('footerRegion',footer);
		},

		stockRoute: function() {	
			App.line.show().css('width','20%');

			var filtersV = new filtersViews.filters({
				collection: this.filtersStock
			});
			var doorsV = new stockViews.stockList({
				collection: Entities.doorsStock
			});
			var footer = new footerViews.stockFooter({
				collection: Entities.orderCollection
			});
			var title = this.role!=="mogilev"?
				'Двери на складе':'Двери на складе в Минске';

			this.showStock(filtersV,doorsV,footer,title);
			ui_dropdown();
		},

		orderRoute: function() {
			var markets = this.role==="admin" ?
				this.markets.at(0).get('list').toJSON() : '' ;
				
			var back = new filtersViews.backStock();
			var doorsV = new stockViews.orderList({
				collection: Entities.orderCollection
			});
			var footer = new footerViews.orderFooter({
				collection: Entities.orderCollection,
				managers: markets
			});
			var title = this.role!=="mogilev"?'Бланк заказа':'Бланк отгрузки';
			this.showStock(back,doorsV,footer,title);
		},

		showStock: function(filtersV,doorsV,footer,title) {
			this.title_page.set('title',title);
			this.stockLayout.render();	
			this.stockLayout.showChildView('filtersRegion',filtersV);
			this.stockLayout.showChildView('tableRegion',doorsV);
			if (this.role!=='sklad') {
				this.stockLayout.showChildView('footerRegion',footer);
			};
		},

		newordersRoute: function() {
			this.showOrders('orders','Новые заказы',['new']);
		},

		ordersRoute: function() {
			var title = this.role!=="sklad"?'Текущие заказы':'Текущие отгрузки';
			var status = this.role !== 'manager' ? ['approved']:['new','approved'];
			this.showOrders('orders',title,status);
		},

		historyOrdersRoute: function() {
			var title = this.role!=="sklad"?'История заказов':'История отгрузок';
			this.showOrders('orders',title,['history','canceled']);
		},

		shipsRoute: function() {
			var title = this.role!=="sklad"?'Текущие отгрузки':'Текущий прием';
			if (this.role==="sklad"||this.role==="mogilev") {
				this.showOrders('ships',title,['approved']);
			}
		},

		historyShipsRoute: function() {
			var title = this.role!=="sklad"?'История отгрузок':'История приема';
			if (this.role==="sklad"||this.role==="mogilev") {
				this.showOrders('ships',title,['history','canceled']);
			}
		},

		showOrders: function(mode,title,status) {
			App.line.show().css('width','20%');
			var role = this.role;
			this.title_page.set('title',title);
			this.ordersLayout.page = '';
			this.ordersLayout.mode = mode;
			this.ordersLayout.status = status;
			this.ordersLayout.render();

			var filters = role==="admin"||
				role==="mogilev"&&mode==='orders'||
				role==="sklad"&&mode==='orders' ? this.markets : '';

			var filtersV = new filtersViews.orderFilters({
				model: new Entities.model({
					'status':status,
					'role': role,
					'mode': mode
				}),
				collection: filters
			});
			this.ordersLayout.showChildView('filtersRegion',filtersV);
			if (filters) {
				if (!filters.length) {
					filters.fetch().then(function() {
						ui_dropdown();
					});
				} else {
					ui_dropdown();
				};
			};

			var footer = new footerViews.footer();
			this.ordersLayout.showChildView('footerRegion',footer);
		},

		profileRoute: function() {
			var profile = new profileView({
				model: App.user
			});
			App.contentRegion.show(profile);
		},

		showHeader: function() {
			var header = new headerView({
				model: App.user
			});
			App.headerRegion.show(header);
		},

		createFilters: function(obj) {
			var filters = new Entities.collection();
			for (key in obj) {
				var model = new Entities.model({
					'name': key,
					'code': obj[key],
					'list': this.createFilter(obj[key])
				})
				filters.add(model);
			};
			return filters;
		},

		createFilter: function(code) {
			var arr_vals = [];
			Entities.doorsStock.each(function(door) {
				var prop = door.get(code);
				if ( !_.find(arr_vals,function(val) {
						return val === prop}) ) {
					arr_vals.push(prop);
				};
			});
			arr_vals.sort();
			var filter = new Entities.collection();
			for (var i = 0; i < arr_vals.length; i++) {
				var model = new Entities.model({
					'name': arr_vals[i]
				});
				filter.add(model);
			};
			return filter;
		}
		
	});
	
	return {
		router: Router,
		controller: Controller
	}
})