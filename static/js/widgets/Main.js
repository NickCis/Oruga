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

			this.getElesByClass('btn-navbar', function(ele){
				ele.addEventListener('click', this.toggleView.bind(this), false);
			});

			this.getElesByClass('main-search-form', function(ele){
				ele.addEventListener('submit', this.search.bind(this), false);
			});

			this.getElesByClass('main-nav-ul', function(ele){
				ele.addEventListener('click', this.toggleDivBody.bind(this), false);
			});
		},
		toggleView: function(){
			this.getElesByClass('nav-collapse', function(ele){
				ele.style.height = (!ele.style.height || parseInt(ele.style.height, 10) == 0) ? "auto" : "0px";
			});
		},
		search: function(event){
			event.preventDefault();


			return true;
		},
		toggleDivBody: function(event){
			event.preventDefault();
			var ele = event.target;
			this.getElesByClass('main-nav-ul', function(ele){
				for(var i=0, child, children = ele.children; child = children[i]; i++)
					child.classList.remove('active');
			});
			ele.parentNode.classList.add('active');

			var dataTarget = ele.getAttribute('data-target');

			this.getElesByClass('main-body-div', function(ele){
				if(ele.classList.contains(dataTarget))
					ele.classList.remove("no-show");
				else
					ele.classList.add("no-show");
			});


			return true;
		}
	});

	window.UiMain = UiMain;
})();
