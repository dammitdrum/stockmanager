define(['marionette','app'],function(Marionette,App){

	return Marionette.ItemView.extend({
		
		initialize: function() {
			this.template = _.template(App.Templates[12]);
			
		},
		onDomRefresh: function() {
			ui_scrollTop();
		}
		
	});

})