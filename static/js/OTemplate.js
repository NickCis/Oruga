(function(){
	/** $Ui -> Objetos de template
	 * @param config -> Object, defaultea a un Hash vacio
	*/
	function $Ui(config){
		$O.call(this, config);
		this._d = document.createElement('div');
	};

	$Ui.prototype = $O.f.xD($O.prototype, {
		constructor: $Ui,
		basicLayout: function(){ 
			$O.f.notImplemented.call(this, "basicLayout");
		}
	});

	window.$Ui = $Ui;
})();
