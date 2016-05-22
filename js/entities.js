	
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

	var Managers = Backbone.Collection.extend({
		model: FilterModel,
		url: '/request/sklad/?component=sklad:filter&for=orders'
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
		url: '/request/sklad/?component=sklad:orders',
		comparator: function(model) {
			return -model.get('id');
		}
	});

	var ShipsCollection = Backbone.Collection.extend({
		model: OrdersModel,
		url: '/request/sklad/?component=sklad:ships',
		comparator: function(model) {
			return -model.get('id');
		}
	});

	var profileModel = Backbone.Model.extend({
		url: '/request/sklad/?component=sklad:user',
	});

	var quantityModel = Backbone.Model.extend({
		defaults: {
			orders: 0,
			ships: 0
		},
		initialize: function() {
			this.fetch();
		},
		url: '/request/sklad/?component=sklad:ships&count=true',
	})
	
	return {
		model: Model,
		collection: Collection,
		filtersStock: FilterCollection,
		doorsStock: new CollectionDoors(),
		orderCollection: new Collection(),
		orders: new OrdersCollection(),
		ships: new ShipsCollection(),
		ordersCollection: Orders,
		profile: profileModel,
		managers: Managers,
		quant: quantityModel
	}

})
