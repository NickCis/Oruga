(function(){
	function UiMain(config, layout){
		$Ui.call(this, config, true);
		(this.c.defaultDiv === undefined) && (this.c.defaultDiv = 'main-body-div-home');
		(layout) || (this.basicLayout());
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
				ele.addEventListener('submit', this.onNavbarFormSubmit.bind(this), false);
			});

			this.getElesByClass('main-nav-ul', function(ele){
				ele.addEventListener('click', this.onToggleDivBody.bind(this), false);
			});
			this.getElesByClass('main-body-div-search', function(ele){
				this.search = new UiSearch({
					container: ele,
					oruga: this.c.oruga
				});
				this.search.addEventListener('add', (function(data){
					this.sideBar.open();
					this.createPlaylist.add(data);
				}).bind(this), false);
			});
			this.getElesByClass('main-body-div', function(ele){
				if(ele.classList.contains(this.c.defaultDiv))
					ele.classList.remove("no-show");
				else
					ele.classList.add("no-show");
			});
			this.sideBar = new UiSideBar();
			document.body.appendChild(this.sideBar._d);
			this.sideBar.close();

			this.createPlaylist = new UiPlaylistCreator();
			this.sideBar._d.appendChild(this.createPlaylist._d);
			this.sideBar.addEventListener('open', this.onEventSideBar.bind(this));
			this.sideBar.addEventListener('close', this.onEventSideBar.bind(this));
			this.sideBar.closeBind = this.sideBar.close.bind(this.sideBar);
		},
		onEventSideBar: function(event){
			switch(event.event){
				case 'open':
					this.getElesByClass('main-content', function(ele){
						setTimeout((function(){ele.addEventListener('click', this.sideBar.closeBind);}).bind(this), 100);
					});
					break;
				case 'close':
					this.getElesByClass('main-content', function(ele){
						ele.removeEventListener('click', this.sideBar.closeBind);
					});
					break;
			}
		},
		toggleView: function(){
			this.getElesByClass('nav-collapse', function(ele){
				ele.style.height = (!ele.style.height || parseInt(ele.style.height, 10) == 0) ? "auto" : "0px";
			});
		},
		onToggleDivBody: function(event){
			event.preventDefault();
			var ele = event.target,
				dataTarget = ele.getAttribute('data-target');
			this.toggleDivBody(dataTarget);
		},

		toggleDivBody: function(dataTarget){
			this.getElesByClass('main-nav-ul-li', function(ele){
				if(ele.classList.contains(dataTarget+'-li'))
					ele.classList.add("active");
				else
					ele.classList.remove("active");
			});

			this.getElesByClass('main-body-div', function(ele){
				if(ele.classList.contains(dataTarget))
					ele.classList.remove("no-show");
				else
					ele.classList.add("no-show");
			});


			return true;
		},
		onNavbarFormSubmit: function(event){
			event.preventDefault();
			var form = event.target,
				data = $Ui.f.formSerialize(form);

			this.search.search(data);
			this.toggleDivBody('main-body-div-search');

			return false;
		}
	});

	window.UiMain = UiMain;
})();
