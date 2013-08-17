(function(){
	function UiMain(config){
		$Ui.call(this, config);
		this.basicLayout();
	};
	UiMain.prototype = $O.f.xD($Ui.prototype, {
		constructor: UiMain,
		basicLayout: function(){
			var search = document.createElement('div'),
				body = document.createElement('div'),
				player = document.createElement('div');

			search.classList.add('UiMainSearch');
			body.classList.add('UiMainBody');
			player.classList.add('UiMainPlayer');

			this._d.appendChild(search);
			this._d.appendChild(body);
			this._d.appendChild(player);
		}
	});

	window.UiMain = UiMain;
})();
