(function(){
	function UiSideBar(config, layout){
		$Ui.call(this, config, true);
		(layout) || (this.basicLayout());
	};
	UiSideBar.prototype = $O.f.xD($Ui.prototype, {
		constructor: UiSideBar,
		basicLayout: function(){
			this._d.classList.add('side-bar');
		},
		close: function(){
			this._d.style.left = "-"+this._d.offsetWidth+"px";
			this.emit('close');
		},
		open: function(){
			this._d.style.left = 0;
			this.emit('open');
		}
	});

	window.UiSideBar = UiSideBar;
})();
