webix.protoUI({
	name:"winmenu",
	defaults:{
		scroll:false
	},
	$init:function(){
		this.$view.className += " webix_winmenu";
	},
	$getSize:function(dx, dy){
		return webix.ui.view.prototype.$getSize.call(this, dx, dy);
	},
	type:{
		css:"",
		width: 105,

		template:function(obj){
			var style = "";
			var className = "webix_winmenu_item_inner";
			var image = "";
			if(obj.img_full){
				image = "<div class='bg_img' style='background-image:url("+obj.img_full+");'></div>";
			}
			else if(obj.img){
				image = "<img src='"+obj.img+"' align='center'>";
			}
			else if(obj.icon){
				image = "<span class='webix_icon fa-"+obj.icon+"'></span>";
			}

			return "<div class='"+className+"'>"+image+"<div class='title'>"+obj.value+"</div></div>";
		},
		heightSize:function(obj, common){
			return common.height + "px";
		},
		widthSize:function(obj, common){
			return (obj.$gravity || 1) * common.width + "px";
		}
	},
	$skin:function(){
		this.type.height = 105;
	}
}, webix.ui.list);
