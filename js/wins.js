if(window.desktopApp)
	desktopApp.wins = {
		active: null,
		setActiveStyle: function(winId){
			if(desktopApp.wins.active)
				webix.html.removeCss($$(desktopApp.wins.active).$view,"active_win");
			webix.html.addCss($$(winId).$view,"active_win",true);
			desktopApp.wins.active = winId;
		},
		forEachWindow: function(func){
			var views = $$("toolbar").getChildViews();
			for(var i =1; i< views.length; i++){
				if(views[i].config.id.indexOf("_button") != -1){
					var id = views[i].config.id.replace("button","win");
					if($$(id))
						func.call(this,id);
				}
			}
		},
		hideAllWindows: function(){
			this.forEachWindow(function(id){
				if($$(id).isVisible()){
					$$(id).hide();
					webix.html.removeCss($$(id.replace("_win","_button")).$view, "active");
				}
			});
		},
		getVisibleWinCount: function(){
			var count = 0;
			this.forEachWindow(function(id){
				if($$(id).isVisible())
					count++;
			});
			return count;
		},
		getPosition: function(state){
			state.left = this.config.left;
			state.top = this.config.top;
			if(state.height + 40 >= state.maxHeight){
				state.height = state.maxHeight - 40;
			}
			if(this.config.fullscreen){
				if (!this.config.lastWindowPos)
					this.config.lastWindowPos = { top: state.top, left: state.left };
				state.top = state.left = 0;
			}
			else{
				if (this.config.lastWindowPos){
					var last = this.config.lastWindowPos;
					delete this.config.lastWindowPos;
					state.top = last.top;
					state.left = last.left;
				}
				if(state.left+state.width > state.maxWidth){
					state.left -= state.left+state.width - state.maxWidth;
				}
				if(state.top+state.height +40 > state.maxHeight){
					state.top -= state.top+state.height +40 - state.maxHeight;
				}
			}

		},
		showEmptyApp: function(obj){
			var winId = obj.id+"_win";

			if(!$$(winId)){
				var c = desktopApp.wins.getVisibleWinCount();

				webix.ui({
					view:"window",
					id: winId,
					css:"popup-window-custom "+obj.$css||"",
					position: desktopApp.wins.getPosition,
					left: document.documentElement.clientWidth/2 - 400 + 15*c,
					top: document.documentElement.clientHeight/2 - 225 - 40 + 25*c,
					move:true,
					resize: true,
					toFront: true,
					height:450,
					width:800,
					head: this.ui.toolbar(
						obj.value+ " (Not implemented) ",
						function () {
							$$(winId).hide();
							webix.html.removeCss($$(obj.id+"_button").$view, "active");
						},function () {
							$$(winId).config.fullscreen = !$$(winId).config.fullscreen;
							$$(winId).resize();
							$$(winId).config.left = 0;
							$$(winId).config.top = 0;
						},function () {
							$$("toolbar").removeView(obj.id+"_button");
							$$(winId).hide();
							desktopApp.buttonCount--;
						}
					),
					body:{
						css: "empty-app",
						template: function(obj){
							var icon = "";
							if(obj.img){
								icon = "<img src='" + obj.img + "' align='center'>";
							}
							else if(obj.icon){
								icon = "<span class='webix_icon mdi mdi-" + obj.icon + "'></span>";
							}
							return "<div class='empty-app-inner' style='background-color:" + obj.color + ";'>" + icon + "</div>"
						},
						data: obj
					},
					on:{
						onBeforeShow: function(){
							desktopApp.beforeWinShow(obj);
						}
					}
				})
			}
			$$(winId).show();
			$$("winmenu").hide();
			desktopApp.wins.setActiveStyle(winId);
		},
		showApp: function(name){
			var winId = name+"_win";
			var c = desktopApp.wins.getVisibleWinCount();
			if(!$$(winId)){
				var config = desktopApp.wins.ui[name];
				webix.ui({
					view:"window",
					id: winId,
					css:"popup-window-custom app "+config.css||"",
					position: desktopApp.wins.getPosition,
					resize: true,
					left: document.documentElement.clientWidth/2 - 400 + 15*c,
					top: document.documentElement.clientHeight/2 - 225 - 40 + 25*c,
					move:true,
					toFront: true,
					height:450,
					width:800,
					head:  desktopApp.wins.ui.toolbar.apply(this,config.toolbar()),
					body: config.body(),
					on: config.events
				});

			}
			$$(winId).show();
			if(name == "scheduler" && $$("scheduler").getScheduler())
				$$("scheduler").getScheduler().updateView();
			else if(name == "gantt" && window.gantt)
				gantt.render();
			desktopApp.wins.setActiveStyle(winId);
		},
		ui:{
			toolbar: function(title, onHide, onMinMax, onClose ){
				return {
					view:"toolbar",
					height:28,
					css:"window-toolbar",
					margin:0,
					padding:0,
					cols:[
						{
							view:"label",
							label: "<img src='img/window-icon.png' class='header-window-icon'/> "+title
						},
						{
							view: "button",
							type: "image",
							image: "img/hide_button.png",
							width:36,
							height:20,
							css:"hide-button webix_transparent",
							on:{
								onItemClick: onHide
							}
						},
						{
							view: "button",
							type: "image",
							image: "img/resize_button.png",
							width:36,
							height:20,
							css:"resize-button webix_transparent",
							on: {
								onItemClick: onMinMax
							}
						},
						{
							view: "button",
							type: "image",
							image: "img/close_button.png",
							width:36,
							height:20,
							css:"close-button webix_transparent",
							on: {
								onItemClick: onClose
							}
						}
					]
				};
			},
			scheduler:{
				css: "no_border",
				toolbar: function(){
					return [
						"DHTMlX Scheduler",
						function () {
							$$('scheduler_win').hide();
							webix.html.removeCss($$("scheduler_button").$view, "active");
						},function () {
							$$("scheduler_win").config.fullscreen = !$$("scheduler_win").config.fullscreen;
							$$("scheduler_win").resize();

							$$("scheduler").config.fullscreen = !$$("scheduler").config.fullscreen;
							$$("scheduler").resize();
							$$("scheduler").getScheduler().updateView();
						},function () {
							$$("toolbar").removeView("scheduler_button");
							$$('scheduler_win').hide();
							desktopApp.buttonCount--;
						}
					]
				},
				body: function(){
					return {
						view:"dhx-scheduler",
						id:"scheduler",
						date:new Date(2015,7,5),
						mode:"month",
						init:function(){
							this.getScheduler().config.xml_date="%Y-%m-%d %H:%i";
							this.getScheduler().config.first_hour = 6;
							this.getScheduler().config.multi_day = false;
						},
						ready:function(){
							this.getScheduler().parse(test_data_set_2015);
						}
					}
				},
				events:{
					onBeforeShow: function(){
						desktopApp.beforeWinShow("scheduler");
					}
				}
			},
			gantt:{
				toolbar: function(){
					return [
						"DHTMlX Gantt",
						function () {
							$$('gantt_win').hide();
							webix.html.removeCss($$("gantt_button").$view, "active");
						},
						function () {
							$$("gantt_win").config.fullscreen = !$$("gantt_win").config.fullscreen;
							$$("gantt_win").resize();

							$$("gantt").config.fullscreen = !$$("scheduler").config.fullscreen;
							$$("gantt").resize();
							gantt.render();
						},function () {
							$$("toolbar").removeView("gantt_button");
							$$('gantt_win').hide();
							desktopApp.buttonCount--;
						}
					]
				},
				body: function(){
					return {
						view:"dhx-gantt",
						id:"gantt",
						init:function(){
							//do nothing
						},
						ready:function(){
							gantt.parse(tasks);
						}
					}
				},
				events:{
					onBeforeShow: function(){
						desktopApp.beforeWinShow("gantt");
					}
				}
			},
			filemanager:{
				css: "no_border ",
				toolbar: function(){
					return [
						"Filemanager",
						function () {
							$$('filemanager_win').hide();
							webix.html.removeCss($$("filemanager_button").$view, "active");
						},
						function () {
							$$("filemanager_win").config.fullscreen = !$$("filemanager_win").config.fullscreen;
							$$("filemanager_win").resize();

						},function () {
							$$("toolbar").removeView("filemanager_button");
							$$('filemanager_win').hide();
							desktopApp.buttonCount--;
						}
					]
				},
				body: function(){
					return {
						view:"filemanager",
						id:"filemanager",
						disabledHistory: true,
						data: filemanagerData
					}
				},
				events:{
					onBeforeShow: function() {
						desktopApp.beforeWinShow("filemanager");
					},
					onShow: function(){

						if(!$$("filemanager").$$("tree").getSelectedId())
							$$("filemanager").$$("tree").select($$("filemanager").getFirstChildId(0));
					}
				}
			}
		}
	};


