
define(['backbone'],function(Backbone){

	var Model = Backbone.Model.extend({
		
	});

	var Collection = Backbone.Collection.extend({
		model: Model,
	});

	var CollectionDoors = Backbone.Collection.extend({
		model: Model,
		url: '/request/sklad/'
	});

	var FilterModel = Backbone.Model.extend({
		parse: function(response) {
		    response.list = new Collection(response.list);
		    return response;
		},
	});

	var FilterCollection = Backbone.Collection.extend({
		model: FilterModel,
		url: '/request/sklad/?component=sklad:filter'
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
		url: '/request/sklad/?component=sklad:orders'
	});


	
	return {
		model: Model,
		collection: Collection,
		filtersStock: FilterCollection,
		doorsStock: new CollectionDoors(),
		orderCollection: new Collection(),
		orders: new OrdersCollection(),
		ordersCollection: Orders
	}

})
