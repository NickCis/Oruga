(function(){
	function UiSearch(config, layout){
		$Ui.call(this, config, true);
		(layout) || (this.basicLayout());
	};
	UiSearch.prototype = $O.f.xD($Ui.prototype, {
		constructor: UiSearch,
		basicLayout: function(){
			var form = document.createElement('form'),
				table = document.createElement('table');

			$Ui.f.addClass(table, ['table', 'table-condensed', 'table-striped', 'search-table']);
			$Ui.f.addClass(form, ['form-horizontal', 'search-form']);

			form.innerHTML = window.render.orugaSearchForm();
			form.addEventListener('submit', this.onSubmitSearch.bind(this), false);
			table.addEventListener('click', this.onClickTable.bind(this), false);

			this._d.appendChild(form);
			this._d.appendChild(table);
		},
		onSubmitSearch: function(event){
			event.preventDefault();
			this.search();
			return false;
		},
		search: function(data){
			data = data || this.getElesByClass('search-form', function(ele) { return $Ui.f.formSerialize(ele);}) || {};
			var type = data.type || 'getSongs';
			this.c.oruga[type](data, $O.f.addArgs(this.searchResponse.bind(this), [type]));
		},
		searchResponse: function(error, Json, type){
			Json.type = type;
			this.getElesByClass('search-table', function(ele){
				ele.innerHTML = window.render.orugaSearch(Json);
			});
		},
		onClickTable: function(event){
			var ele = event.target,
				ev = ele.getAttribute('data-event');

			switch(ev){
				case "add":
					var type = ele.getAttribute('data-type'),
						value = ele.getAttribute('data-value');
					value = JSON.parse(value);

					this.emit('add', {
						type: type, 
						value: value
					});
			};

		}
	});

	window.UiSearch = UiSearch;
})();
