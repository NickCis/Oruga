(function(){
	function UiMain(config){
		$Ui.call(this, config);
		this.basicLayout();
	};
	UiMain.prototype = $O.f.xD($Ui.prototype, {
		constructor: UiMain,
		basicLayout: function(){
			this._d.style.height = "100%";
			this._d.innerHTML = window.render.orugaMain();
		}
	});

	window.UiMain = UiMain;
})();
