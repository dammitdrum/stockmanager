
define(['backbone'],function(Backbone){

	var Model = Backbone.Model.extend({
		
	});

	var Collection = Backbone.Collection.extend({
		model: Model,
	});

	var CollectionDoors = Backbone.Collection.extend({
		model: Model,
		url: '/serg/stock/js/json/doors.json'
	});

	var FilterModel = Backbone.Model.extend({
		parse: function(response) {
		    response.list = new Collection(response.list);
		    return response;
		},
	});

	var FilterCollection = Backbone.Collection.extend({
		model: FilterModel,
		url: '/serg/stock/js/json/filters.json'
	});

	var OrdersModel = Backbone.Model.extend({
		parse: function(response) {
		    response.doors = new Collection(response.doors);
		    return response;
		},
	});

	var Orders = Backbone.Collection.extend({
		model: OrdersModel
	});

	var OrdersCollection = Backbone.Collection.extend({
		model: OrdersModel,
		url: '/serg/stock/js/json/orders.json'
	});

	var HistoryCollection = Backbone.Collection.extend({
		model: OrdersModel,
		url: '/serg/stock/js/json/history.json'
	});


	
	return {
		model: Model,
		collection: Collection,
		filterCollection: FilterCollection,
		doorsStock: new CollectionDoors(),
		orderCollection: new Collection(),
		orders: new OrdersCollection(),
		ordersHistory: new HistoryCollection(),
		ordersCollection: Orders
	}

})
