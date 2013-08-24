(function(){
	/** $Ui -> Objetos de template
	 * @param config -> Object, defaultea a un Hash vacio
	*/
	function $Ui(config){
		$O.call(this, config);
		if(this.c.container)
			this._d = (typeof(this.c.container) == "string") ? document.getElementById(this.c.container) : this.c.container;
		this._d = this._d || document.createElement('div');
	};

	$Ui.prototype = $O.f.xD($O.prototype, {
		constructor: $Ui,
		getElesByClass: function(clss, cb){
			var eles = this._d.getElementsByClassName(clss);
			if(eles.length){
				for(var i=0, ele; ele = eles[i]; i++)
					cb.call(this, ele);
			}
		},
		basicLayout: function(){ 
			$O.f.notImplemented.call(this, "basicLayout");
		}
	});

	window.$Ui = $Ui;
})();
