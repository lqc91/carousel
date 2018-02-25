// 封装闭包，防止其中变量被污染
;(function($){
	var Carousel = function(poster){
		var self=this;
		// 保存单个旋转木马对象
		this.poster = poster;
		this.posterItemMain = poster.find("ul.poster-list");
		this.prevBtn = poster.find("div.poster-prev-btn");
		this.nextBtn = poster.find("div.poster-next-btn");
		this.posterItems = poster.find("li.poster-item");
		if(this.posterItems.length%2 ===0){
			this.posterItemMain.append(this.posterItems.eq(0).clone());
			this.posterItems = this.posterItemMain.children();
		};
		this.posterFirstItem = this.posterItems.first();
		this.posterLastItem = this.posterItems.last();
		this.rotateFlag = true;
		// 默认配置参数
		// JSON中0.9不可省略为.9?
		this.setting = {
			"width":1000, // 幻灯片的宽度
			"height":270, // 幻灯片的高度
			"posterWidth":640, // 幻灯片第一帧的宽度
			"posterHeight":270, // 幻灯片第一帧的高度
			"scale":0.9, // 记录显示比例关系
			"speed":500,
			"autoPlay":false,
			"delay":500,
			"verticalAlign":"middle"
		};
		// jQuery.extend(target [, object1] [, objectN])
		// target: An obejct that will receive the properties if additional obejects are passed in
		//         or that will extend the jQuery namespace if it is the sole argument
		// object1: An object containing additional properties to merge in
		// objectN: Additiional objects containing properties to merge in
		$.extend(this.setting, this.getSetting());
		// 设置配置参数值
		this.setSettingValue();
		this.setPosterPos();
		// 左旋转按钮
		this.nextBtn.click(function(){
			// 若直接使用this，则this指向this.nextBtn
			if(self.rotateFlag){
				self.rotateFlag = false;
				self.carouselRotate("left");
			}
		});
		// 右旋转按钮
		this.prevBtn.click(function(){
			if(self.rotateFlag){
				self.rotateFlag = false;
				self.carouselRotate("right");
			}
		});
		// 是否开启自动播放
		if(this.setting.autoPlay){
			this.autoPlay();
			this.poster.hover(function(){
				window.clearInterval(self.timer);
			}, function(){
				self.autoPlay();
			});
		}
	};
	Carousel.prototype = {
		// 自动播放
		autoPlay: function(){
			var self = this;
			this.timer = window.setInterval(function(){
				self.nextBtn.click();
			}, this.setting.delay);
		},
		// 旋转
		carouselRotate: function(dir){
			var _this_ = this;
			var zIndexArr = [];
			// dir: direction
			if(dir==="left"){
				this.posterItems.each(function(){
					var self = $(this),
						// .get(index)
						prev = self.prev().get(0)?self.prev():_this_.posterLastItem,
						width = prev.width(),
						height = prev.height(),
						zIndex = prev.css("zIndex"),
						opacity = prev.css("opacity"),
						left = prev.css("left"),
						top = prev.css("top");
					zIndexArr.push(zIndex);
					self.animate({
						width: width,
						height: height,
						// zIndex: zIndex,
						opacity: opacity,
						left: left,
						top: top
					}, _this_.setting.speed, function(){
						_this_.rotateFlag = true;
					});
				});
				this.posterItems.each(function(i){
					$(this).css("zIndex", zIndexArr[i]);
				});
			}else if(dir==="right"){
				this.posterItems.each(function(){
					var self = $(this),
						// .get(index)
						next = self.next().get(0)?self.next():_this_.posterFirstItem,
						width = next.width(),
						height = next.height(),
						zIndex = next.css("zIndex"),
						opacity = next.css("opacity"),
						left = next.css("left"),
						top = next.css("top");
					zIndexArr.push(zIndex);
					self.animate({
						width: width,
						height: height,
						// zIndex: zIndex,
						opacity: opacity,
						left: left,
						top: top
					}, _this_.setting.speed, function(){
						_this_.rotateFlag = true;
					});
				});
				this.posterItems.each(function(i){
					$(this).css("zIndex", zIndexArr[i]);
				});
			};
		},
		// 设置剩余帧的位置关系
		setPosterPos: function(){
			var self = this;
			var sliceItems = this.posterItems.slice(1),
				sliceLen = sliceItems.length/2,
				rightSlice = sliceItems.slice(0, sliceLen),
				level = Math.floor(this.posterItems.length/2),
				leftSlice = sliceItems.slice(sliceLen);
			// 设置右边帧的位置关系及宽高...
			var rw = this.setting.posterWidth,
				rh = this.setting.posterHeight,
				gap = ((this.setting.width-this.setting.posterWidth)/2)/level,
				firstLeft = (this.setting.width-this.setting.posterWidth)/2,
				fixOffsetLeft = firstLeft+rw;
			// 设置右边位置关系
			rightSlice.each(function(i){
				level--;
				rw = rw*self.setting.scale;
				rh = rh*self.setting.scale;
				// ++i 与 i++
				$(this).css({
					zIndex:level,
					width:rw,
					height:rh,
					opacity:1/(++i),
					// i已自增
					left:fixOffsetLeft+i*gap-rw,
					top:self.setVerticalAlign(rh)
				});
			});
			// 设置左边位置关系
			var lw = rightSlice.last().width(),
				lh = rightSlice.last().height(),
				// oloop: opacity loop
				oloop = Math.floor(this.posterItems.length/2);
			leftSlice.each(function(i){
				$(this).css({
					zIndex:i,
					width:lw,
					height:lh,
					opacity:1/oloop,
					// i已自增
					left:i*gap,
					top:self.setVerticalAlign(lh)
				});
				lw = lw/self.setting.scale;
				lh = lh/self.setting.scale;
				oloop--;
			});
		},
		// 设置垂直排列对齐
		setVerticalAlign: function(height){
			var verticalType = this.setting.verticalAlign,
				top = 0;
			if(verticalType === "middle"){
				top = (this.setting.height-height)/2;
			}else if(verticalType === "top"){
				top = 0;
			}else if(verticalType === "bottom"){
				top = this.setting.height-height;
			}else{
				top = (this.setting.height-height)/2;
			};
			return top;
		},
		// 设置配置参数控制基本的宽高...
		setSettingValue: function(){
			this.poster.css({
				width:this.setting.width,
				height:this.setting.height
			});
			this.posterItemMain.css({
				width:this.setting.width,
				height:this.setting.height
			});
			// 计算上下切换按钮的宽度
			var w = (this.setting.width-this.setting.posterWidth)/2;
			// .size() version deprecated: 1.8, removed: 3.0
			// The .size() method is deprecated as of jQuery 1.8.
			// Use the .length property instead.
			// The .size() method is functionally equivalent to the .length property;
			// however, the .length property is preferred
			// because it does not have the overhead of a function call.
			this.prevBtn.css({
				width:w,
				height:this.setting.height,
				zIndex:Math.ceil(this.posterItems.length/2)
			});
			this.nextBtn.css({
				width:w,
				height:this.setting.height,
				zIndex:Math.ceil(this.posterItems.length/2)
			});
			this.posterFirstItem.css({
				width:this.setting.posterWidth,
				height:this.setting.posterHeight,
				left:w,
				zIndex:Math.floor(this.posterItems.length/2)
			});
		},
		// 获取人工配置参数
		getSetting: function(){
			var setting = this.poster.attr("data-setting");
			if(setting && setting != ""){
				return $.parseJSON(setting);
			} else {
				return {};
			}	
		}
	};
	Carousel.init = function(posters){
		var _this_ = this;
		posters.each(function(){
			new _this_($(this));
		});
	};
	window["Carousel"] = Carousel;
})(jQuery);