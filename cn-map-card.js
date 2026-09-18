console.info("%c  GAODE MAP CARD  \n%c Version 1.2.8 ",
"color: orange; font-weight: bold; background: black", 
"color: white; font-weight: bold; background: dimgray");

window._AMapSecurityConfig = { securityJsCode:'', }
import 'https://webapi.amap.com/loader.js';
import './w3color.js';

Date.prototype.format = function(fmt) { 
     var o = { 
        "M+" : this.getMonth()+1,                 //月份 
        "d+" : this.getDate(),                    //日 
        "h+" : this.getHours(),                   //小时 
        "m+" : this.getMinutes(),                 //分 
        "s+" : this.getSeconds(),                 //秒 
        "q+" : Math.floor((this.getMonth()+3)/3), //季度 
        "S"  : this.getMilliseconds()             //毫秒 
    }; 
    if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    }
     for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
             fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
         }
     }
    return fmt; 
}

function controlArrayLength(arr) {
  if (arr.length <= 1000) {
    // 如果数组长度小于等于 1000，则无需操作
    return arr;
  } else {
    // 计算需要移除的元素个数
    const removeCount = arr.length - 1000;

    // 计算平均每个元素需要移除的个数
    const averageRemoveCount = Math.ceil(removeCount / arr.length);
    const step = Math.ceil(arr.length / 1000);

    const controlledArray = [];
    // 循环添加均匀分布的元素到新数组
    for (let i = 0; i < arr.length; i += step) {
      controlledArray.push(arr[i]);
    }
    return controlledArray;
  }
}

function convertUTCTimeToLocalTime(UTCDateString) {
	if(!UTCDateString){
		return '-';
	}

	function formatFunc(str) { //格式化显示
		return str > 9 ? str : '0' + str
	}

	var date2 = new Date(UTCDateString); //这步是关
	var year = date2.getFullYear();
	var mon = formatFunc(date2.getMonth() + 1);
	var day = formatFunc(date2.getDate());
	var hour = date2.getHours();
	var seconds = date2.getSeconds();
	var noon = hour >= 12 ? '' : 'AM';
	hour = formatFunc(hour);
	var min = formatFunc(date2.getMinutes());
	var dateStr = year+'-'+mon+'-'+day+' '+hour+':'+min+':'+seconds;
	return dateStr;
}

function getRadius(idx, t1, t2) {
    if (t1 === undefined) {
	 var date1 = new Date();
    } else {
	 var date1 = new Date(t1);
    }
    if (t2 === undefined) {
	 var date2 = new Date();
    } else {
	 var date2 = new Date(t2);
    }

    var seconds = Math.floor((date2.getTime() - date1.getTime())/1000)
    var minute = Math.floor(seconds/60)
    var hour = Math.floor(seconds/60/60)

    var waitTime = '0' 
    if (hour > 0) {
        waitTime = hour.toString() + '小时 ' + (minute - hour * 60).toString() + '分钟 ' + (seconds % 60).toString() + '秒'
    } else if (minute > 0) {
        waitTime = minute.toString() + '分钟 ' + (seconds - minute * 60).toString() + '秒'
    } else {
        waitTime = seconds.toString() + '秒'
    }

    var radius = Math.floor(minute/5)
    if (radius < 5) {
       return [5, waitTime]
    } else {
       return [radius, waitTime]

    }
}

const includeDomains = ["device_tracker","person","zone"];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
class GaodeMapCard extends HTMLElement {
  constructor() {
    super();
    this.markers = {};
    this.paths = {};
    this.circle = {}
    this.persons = []; 
    this.fit = 0; 
    this.trace = false;
    this.historyPath = {};
    this.loaded = false;
    this.loadst = false;
    
    this.oldentities = []
    this.old_mode;
    this.theme;
    this.positions = {};
    this._colors = [
      "#0288D1",
      "#00AA00",
      "#984ea3",
      "#00d2d5",
      "#ff7f00",
      "#af8d00",
      "#7f80cd",
      "#b3e900",
      "#c42e60",
      "#a65628",
      "#f781bf",
      "#8dd3c7",
    ];

    this.root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = this._cssData();
    this.root.appendChild(style);
    const hacard = document.createElement('ha-card');
    this.card = hacard;
    hacard.className = 'gaode-map-card';
    hacard.innerHTML = `
    <div id="root">
      <div id="map">
        <div id="container"></div>
        <div class="info" id="info">
          移动到圆点查看
        </div>
        <div class="info-choose">
          <div class="entity" id="entity"></div>
          <div class="time" id="time">
          <input type="datetime-local" id="start_time" style="width: 10rem">
          <label for="lname">-</label>
          <input type="datetime-local" id="end_time" style="width: 10rem">
	          <button type="button" id="refresh">确定</button>
          </div>
        </div>
        <button type="button" id="fitbutton" title="Reset focus" aria-label="Reset focus">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M5,15H3v4c0,1.1 0.9,2 2,2h4v-2H5v-4M5,5h4V3H5c-1.1,0 -2,0.9 -2,2v4h2V5m14,14h-4v2h4c1.1,0 2,-0.9 2,-2v-4h-2v4m0,-14v4h2V5c0,-1.1 -0.9,-2 -2,-2h-4v2h4M12,17a5,5 0 0,1 -5,-5a5,5 0 0,1 5,-5a5,5 0 0,1 5,5a5,5 0 0,1 -5,5m0,-1.5a3.5,3.5 0 0,0 3.5,-3.5a3.5,3.5 0 0,0 -3.5,-3.5a3.5,3.5 0 0,0 -3.5,3.5a3.5,3.5 0 0,0 3.5,3.5Z"/></svg>
        </button>
      </div>
    </div>
    `;
    this.root.appendChild(hacard);
    let fitButton = this.root.querySelector("#fitbutton")
    fitButton.addEventListener('click', () => {
      if(this.trace){
        this.trace=false
        this.root.querySelector("#fitbutton").classList.remove("active")
        this.map.setPitch(0)
      }else{
        this.trace=true
        this.root.querySelector("#fitbutton").classList.add("active")
        this.map.setPitch(80)
      }
    });
  }
  connectedCallback(){
    // console.log(this.config);
    this._loadMap({
      key: this.config.key||"",   // 申请好的Web端开发者Key，首次调用 load 时必填 f87e0c9c4f3e1e78f963075d142979f0
      version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ['AMap.MoveAnimation'] //插件列表
    });
  }
  static getConfigElement() {
    return document.createElement("gaode-map-card-editor");
  }
  static getStubConfig() {
    return {aspect_ratio: '1',
            dark_mode: "auto",
            traffic: false,
            entities: ["zone.home"] }
  }
  set isPanel(isPanel){ 	
    this._isPanel = isPanel;
  }
  
  set editMode(editMode){ 	
    this._editMode  = editMode ;
  }

  set hass(hass) {
    this._hass = hass;
    this.entities = this.config.entities || [];
    this.card.header=this.config.title;
    if(!this.loaded || this.entities.length<1)return;
    if(this._isPanel){
      this.root.querySelector("#root").style.paddingBottom = 0;
      this.setAttribute("is-panel","");
    }
    var oc = JSON.stringify(this.oldentities);
    var nc = JSON.stringify(this.entities);
    if(oc!=nc){
      //更新标记点
      this.map.clearMap();
      this.markers = {};
      this.paths = {};
      this.historyPath = {};
      this.entities.forEach(function(entity,index) {
        let entityt = typeof entity === "string"?entity:entity.entity;

        let type = entity.type?entity.type:"gps";
        this._addMarker(entityt,index,type);
      },this);
      this.oldentities = deepClone(this.entities);
    }else{
      //仅更新位置
      for(var i in this.entities) {
        let entityt = typeof this.entities[i] === "string"?this.entities[i]:this.entities[i].entity;
        let type = this.entities[i].type?this.entities[i].type:"gps";
        this._updateMarker(entityt,type);
      }
      //实时追踪
      if(this.trace){
        let angle = this.config.angle?hass.states[this.config.angle].state:0;
        if(angle)this.map.setRotation(360-angle);
        this.map.setFitView(this.persons, false, [40, 40, 40, 40]);
      }

    }

    //更新式样
    let dark_mode = this.config.dark_mode || "auto";
    let style = dark_mode;
    let newTheme = (hass.themes && (hass.themes.theme || hass.themes.default_theme)) || "default";

    if(dark_mode!="auto"){
      if(this.old_mode!=dark_mode){
        this.map.setMapStyle("amap://styles/"+style);
        this.root.querySelector("#map").className = style;
        this.old_mode = dark_mode;
      }
    }else if(this.old_mode!=dark_mode || this.theme!=newTheme){
      style = this._isDarkTheme(hass)?'dark':'normal';
      this.map.setMapStyle("amap://styles/"+style);
      this.root.querySelector("#map").className = style;
      this.old_mode = dark_mode;
      this.theme = newTheme;
    }
    //实时路况图层
    if(this.config.traffic){
      this.trafficLayer.show();
    }else{
      this.trafficLayer.hide();
    }
    //更新视界
    // console.info(this.fit)
    if(this.fit >= this.entities.length){
      this.map.setFitView(this.persons, false, [40, 40, 40, 40]);
      this.fit = 0;
    }
  }
  setConfig(config) {
    this.config = deepClone(config);
    let d = this.root.querySelector("#root")
    d.style.paddingBottom = 100*(this.config.aspect_ratio||1)+"%";
  }
  _themeVars(hass){
    const themes = hass.themes;
    if(!themes || !themes.themes) return {};
    const name = themes.theme || themes.default_theme || "default";
    const theme = themes.themes[name] || themes.themes.default || {};
    // HA 2024.4 起主题变量嵌套在 variables 下，旧版是平铺的
    return theme.variables || theme;
  }
  _isDarkTheme(hass){
    const vars = this._themeVars(hass);
    const bg = vars["primary-background-color"] || vars["--primary-background-color"] || "#ffffff";
    try {
      return w3color(bg).lightness < 0.5;
    } catch (e) {
      return false;
    }
  }
  _loadMap(config){
    
    AMapLoader.load(config).then(()=>{
      let mapContainer = this.root.querySelector("#container");
      this.map = new AMap.Map(mapContainer,{
        viewMode: '3D',
        zoom: this.config.default_zoom || 9
      });
      let mode = this.config.dark_mode;
      let style = (mode==="auto")?"normal":mode;
      this.old_mode = mode;
      this.map.setMapStyle("amap://styles/"+style);
      this.root.querySelector("#map").className = style;
      
      //实时路况图层
      this.trafficLayer = new AMap.TileLayer.Traffic({
        zIndex: 10
      });
      this.trafficLayer.setMap(this.map);
      this.loaded = true;
    }).catch(e => {
        console.log(e);
    })

    const endTime = new Date();
    const startTime = new Date();
    let hours_to_show =this.config.hours_to_show||0;
    //startTime.setHours(endTime.getHours() - hours_to_show);
    startTime.setHours(0, 0, 0, 0);

    this.root.querySelector('#start_time').value = startTime.format("yyyy-MM-dd hh:mm")
    this.root.querySelector('#end_time').value = endTime.format("yyyy-MM-dd hh:mm")

    var entityhtml = '<button type="button" id="entity_all">全部</button>'
    this.entities = this.entities || [];
    this.entities.forEach(function(entity,index) {
      let entityt = typeof entity === "string"?entity:entity.entity;
      if (entityt != 'zone.home') {
        let objstates = this._hass && this._hass.states[entityt];
        //let entityName =objstates.attributes.friendly_name?objstates.attributes.friendly_name.split(' ').map(function (part) { return part.substr(0, 1); }).join('') : '';
        if(objstates && objstates.attributes.friendly_name){
          entityhtml += '<button type="button" id="' + entityt.replace('.', '_') + '">'+escapeHtml(objstates.attributes.friendly_name)+'</button>'
        }
      
      }
    },this);
    this.root.querySelector("#entity").innerHTML = entityhtml;
    this.entities.forEach(function(entity,index) {
      let entityt = typeof entity === "string"?entity:entity.entity;
      if (entityt != 'zone.home') {
        let btn = this.root.querySelector('#'+entityt.replace('.', '_'));
        if (!btn) return;
        btn.addEventListener('click', function(entityt) {
                                                                       this._entity(entityt);
                                                                    }.bind(this, entityt));
      }
    },this);
    var entityt = 'entity_all'
    this.root.querySelector('#' + entityt).addEventListener('click', function(entityt) {
                                                                         this._entity(undefined);
                                                                      }.bind(this, entityt));
    var args = undefined
    this.root.querySelector('#refresh').addEventListener('click', function(args) {
                                                                         this.oldentities = []
                                                                      }.bind(this, args));


  }
  _updateMarker(entity,type){
    let objstates = this._hass.states[entity];
    if(!objstates || !objstates.attributes.longitude){
      return
    } 
    let gps = [objstates.attributes.longitude, objstates.attributes.latitude];
    let hours_to_show =this.config.hours_to_show||0;
    let newLngLat = new AMap.LngLat(gps[0],gps[1])
    let oldLngLat = new AMap.LngLat(gps[0],gps[1])
    if(this.positions[entity]){
      let oldGPS = this.positions[entity]
      oldLngLat = new AMap.LngLat(oldGPS[0],oldGPS[1])
    }
    let distance = newLngLat.distance(oldLngLat)

    // 过滤太小的距离
    // console.log(distance);
    if(distance>5){
      const that  = this;
      AMap.convertFrom(gps, type, function (status, result) {
        if (result.info === 'ok' && that.markers[entity]) {
          that.markers[entity].moveTo(result.locations[0], {
              autoRotation: false
          })
          if(hours_to_show>0 && that.trace){
            that._gethistory(hours_to_show, entity, "")
          }
        }
      });
    }
    this.positions[entity] = gps;
  }
  _addMarker(entity,index,type){
    
    let color = this._colors[index%this._colors.length];
    let objstates = this._hass.states[entity];
    if(!objstates || !objstates.attributes.longitude){
      this.fit++;
      return
    } 
    let gps = new AMap.LngLat(objstates.attributes.longitude, objstates.attributes.latitude);
    let that = this;
    if(type=='gaode'){
      that._showMarker(gps,entity,color,type);
    }else{
      AMap.convertFrom(gps, type, function (status, result) {
        // console.info(result.locations[0])
        if (result.info === 'ok') {
          that._showMarker(result.locations[0],entity,color,type);
        }
      });
    }
  }

  _showMarker(result,entity,color,type){
    
    let domain = entity.split('.')[0];
    let hours_to_show =this.config.hours_to_show||0;
    let objstates = this._hass.states[entity];
    let entityPicture = objstates.attributes.entity_picture || '';
    let entityName = objstates.attributes.friendly_name || entity;
    let initial = escapeHtml(entityName.trim().charAt(0).toUpperCase() || "?");
    let markerContent = entityPicture
      ? `<div class="entity-marker" style="border-color:${color}"><img src="${escapeHtml(entityPicture)}" alt=""></div>`
      : `<div class="entity-marker initial" style="background-color:${color}">${initial}</div>`;
    let zoneContent = `<div class="zone-marker"><svg viewBox="0 0 24 24" width="24" height="24" fill="rgb(255, 152, 0)"><path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/></svg></div>`;

    //区域
    var circle = new AMap.Circle({
      center: result,  // 圆心位置
      radius: objstates.attributes.radius || objstates.attributes.gps_accuracy, // 圆半径
      fillColor: domain==='zone'?'rgb(255, 152, 0)':color,   // 圆形填充颜色
      fillOpacity: 0.2,
      zIndex: 101,
      strokeColor: domain==='zone'?'rgb(255, 152, 0)':color, // 描边颜色
      strokeWeight: 3, // 描边宽度
    });
    this.map.add(circle);
    
    //标记点
    let marker = new AMap.Marker({
      map: this.map,
      position: result,
      content: domain==='zone'?zoneContent:markerContent,
      zIndex: domain==='zone'?102:103,
      anchor: 'center'
    });
    if(domain==='person'||domain==='device_tracker'){
      this.persons.push(marker);
      //历史路径
      if(hours_to_show>0){
        this._gethistory(hours_to_show, entity, color, type)
      }
    }
    this.markers[entity] = marker;
    this.fit++;
    if(this.fit === this.entities.length)this.loaded = true;
  }
  _entity(entity) {
    const that  = this;
    for (var i=0; i < that.entities.length ; ++i){
         var ientity = typeof that.entities[i] === "string"?that.entities[i]:that.entities[i].entity;
         if (entity === undefined) {
            if( that.paths[ientity]){
              that.paths[ientity].show();
            }
            if( that.circle[ientity]){
              for (var j=0; j < that.circle[ientity].length ; ++j){
                that.circle[ientity][j].show();
              }
            }
            continue
         }
         if (entity == ientity) {
            if( that.paths[entity]){
              that.paths[entity].show();
            }
            if( that.circle[entity]){
              for (var j=0; j < that.circle[entity].length ; ++j){
                that.circle[entity][j].show();
              }
            }
         } else {
            if( that.paths[ientity]){
              that.paths[ientity].hide();
            }
            if( that.circle[ientity]){
              for (var j=0; j < that.circle[ientity].length ; ++j){
                that.circle[ientity][j].hide();
              }
            }
         }
    }
  }
  _gethistory(hours, entity, color, type){
    //const endTime = new Date();
    //const startTime = new Date();
    //startTime.setHours(endTime.getHours() - hours);

    const that  = this;
    //alert(that.root.querySelector('#start_time').value)
    const startTime = new Date(that.root.querySelector('#start_time').value)
    const endTime = new Date(that.root.querySelector('#end_time').value)
    this._hass.callApi("GET", "history/period/"+startTime.toISOString()+"?filter_entity_id="+entity+"&significant_changes_only=0&end_time="+endTime.toISOString())
    .then(function(res) {
      let arr = controlArrayLength(res[0])
      
      if (arr.length > 1 && that.historyPath[entity] != arr.length) {
        that.historyPath[entity] = arr.length;
        var lineArr = []
        var infoArr = []
	var waitArr = []
        for(var i in arr) {
          let p = arr[i].attributes;
          if(p.longitude)lineArr.push(new AMap.LngLat(p.longitude,p.latitude));

          let radius = [0, 0]
          if (parseInt(i) + 1 < arr.length) {
              radius = getRadius(i, arr[i].last_updated, arr[(parseInt(i)+1).toString()].last_updated);
              if(p.longitude)waitArr.push(radius[0]);
	  } else {
              radius = getRadius(i, arr[i].last_updated, undefined);
              if(p.longitude)waitArr.push(radius[0]);
	  }

          let lu = arr[i].last_updated;
          if(p.longitude) {
             if (p.speed) {
               infoArr.push(p.friendly_name + '> 速度：' + p.speed.toString() +  'km/h 到达时间：' + convertUTCTimeToLocalTime(lu) + ' 停留时间:' + radius[1]);
             } else {
               infoArr.push(p.friendly_name + '> 到达时间：' + convertUTCTimeToLocalTime(lu) + ' 停留时间:' + radius[1]);
             }
          }

        }

        if(type=='gaode'){
          var path2 = lineArr;
          var info2 = infoArr;
          var wait2 = waitArr;
          if( that.paths[entity]){
            that.paths[entity].setPath(path2);
          }else{
            that.paths[entity] = new AMap.Polyline({
              map: that.map,
              path: path2,  
              zIndex: 200,
              strokeWeight: 6, 
              strokeColor: color, 
              strokeOpacity: 0.5,
	      showDir: true,
              lineJoin: 'round' 
            });

            var circleArr = []
            for(var i=0;i<path2.length;i+=1){
              var center = path2[i];
              var circle = new AMap.CircleMarker({
                map: that.map,
                center:center,
                strokeWeight:0,
                radius: wait2[i],
                fillColor:color,
                fillOpacity:0.5,
                zIndex:200,
                bubble:true
              });
              circleArr.push(circle)
              const t = info2[i]
              circle.on('mouseover', function (e) {
                   this.setOptions({strokeWeight:3})
                   var text = '' + t
                   that.root.querySelector("#info").innerText = text;
                   that.root.querySelector("#info").style.display = "block"
      	      });
              circle.on('mouseout', function (e) {
                   this.setOptions({strokeWeight:0})
                   var text = '移动到圆点查看'
                   that.root.querySelector("#info").innerText = text;
                   that.root.querySelector("#info").style.display = "none"
      	      });

            }
            that.circle[entity] = circleArr
          }
        }else{
          var info2 = infoArr;
          var wait2 = waitArr;
          AMap.convertFrom(lineArr, type, function (status, result) {
            if (result.info === 'ok') {
              var path2 = result.locations;
              if( that.paths[entity]){
                that.paths[entity].setPath(path2);
              }else{
                that.paths[entity] = new AMap.Polyline({
                  map: that.map,
                  path: path2,  
                  zIndex: 200,
                  strokeWeight: 6, 
                  strokeColor: color, 
                  strokeOpacity: 0.5,
	          showDir: true,
                  lineJoin: 'round' 
                });
    
                var circleArr = []
                for(var i=0;i<path2.length;i+=1){
                  var center = path2[i];
                  var circle = new AMap.CircleMarker({
                    map: that.map,
                    center:center,
                    strokeWeight:0,
                    radius: wait2[i],
                    fillColor:color,
                    fillOpacity:0.5,
                    zIndex:200,
                    bubble:true
                  });

                  circleArr.push(circle)
                  const t = info2[i]
                  circle.on('mouseover', function (e) {
                    var text = '' + t
                    this.setOptions({strokeWeight:3})
                    that.root.querySelector("#info").innerText = text;
                    that.root.querySelector("#info").style.display = "block"
      	          });
                  circle.on('mouseout', function (e) {
                    var text = '移动到圆点查看'
                    this.setOptions({strokeWeight:0})
                    that.root.querySelector("#info").innerText = text;
                    that.root.querySelector("#info").style.display = "none"
      	          });

                }
                that.circle[entity] = circleArr

              }
  
            }
          });
        }


      }
    })
  }
  _cssData(){
    var css = `
            :host([is-panel]) ha-card {
                left: 0;
                top: 0;
                width: 100%;
                /**
                 * In panel mode we want a full height map. Since parent #view
                 * only sets min-height, we need absolute positioning here
                 */
                height: 100%;
                position: absolute;
              }
      
              ha-card {
                overflow: hidden;
                
              }
              #map {
                z-index: 0;
                border: none;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: inherit;
              }

              .amap-container {
                z-index: 0;
                border: none;
                position: relative;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
              }
      
              .amap-logo{
                position: absolute;
                bottom: 0;
                left: 10px;
              }
              .amap-marker .zone-marker{
                display: flex;
                align-items: center;
                justify-content: center;
              }

              #fitbutton {
                position: absolute;
                top: 7px;
                left: 7px;
                z-index: 10;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                padding: 0;
                border: none;
                border-radius: 50%;
                background: transparent;
                cursor: pointer;
              }
              .entity-marker {
                box-sizing: border-box;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 2px solid;
                background-color: #fff;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-size: 13px;
                font-weight: 500;
              }
              .entity-marker img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
              }
              
              #root {
                position: relative;
              }
              #container > iframe{
                visibility: hidden;
              }
              :host([is-panel]) #root {
                height: 100%;
              }
              .normal #fitbutton {
                color:#000;
              }
              .dark #fitbutton {
                color:#fff;
              }
              #fitbutton.active {
                color:var(--paper-item-icon-active-color, var(--accent-color, #03a9f4));
              }
              .info {
                padding: 0.3rem 0.5rem;
                border-radius: 0.25rem;
                position: absolute;
                top: 0rem;
                background-color: white;
                width: auto;
                min-width: 22rem;
                border-width: 0;
                right: 0rem;
                display: none;
                box-shadow: 0 2px 6px 0 rgb(114 124 245 / 50%);
              }
              .info-choose {
                position: absolute;
                bottom: 0rem;
              }
              .entity {
                padding: 0.3rem 0.3rem;
                border-radius: 0.25rem;
                background-color: white;
                width: auto;
                display: inline;
              }
              .time {
                padding: 0.3rem 0.5rem;
                border-radius: 0.25rem;
                background-color: white;
                width: auto;
                border-width: 0;
                box-shadow: 0 1px 4px 0 rgb(114 124 245 / 50%);
              }
              .marker {
                position: absolute;
                top: -20px;
                right: -118px;
                color: #fff;
                padding: 4px 10px;
                box-shadow: 1px 1px 1px rgba(10, 10, 10, .2);
                white-space: nowrap;
                font-size: 12px;
                font-family: "";
                background-color: #25A5F7;
                border-radius: 3px;
            }

    `
    return css;
  }
}

function deepClone(value) {
  if (!(!!value && typeof value == 'object')) {
    return value;
  }
  if (Object.prototype.toString.call(value) == '[object Date]') {
    return new Date(value.getTime());
  }
  if (Array.isArray(value)) {
    return value.map(deepClone);
  }
  var result = {};
  Object.keys(value).forEach(
    function(key) { result[key] = deepClone(value[key]); });
  return result;
}
customElements.define("gaode-map-card", GaodeMapCard);

class GaodeMapCardEditor extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      :host { display: block; }
      .card-config { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
      .field { display: flex; flex-direction: column; gap: 4px; }
      .field > span { font-size: 12px; color: var(--secondary-text-color, #727272); }
      .row { display: flex; gap: 8px; flex-wrap: wrap; }
      .row > .field { flex: 1; min-width: 8rem; }
      input[type="text"], input[type="number"], select {
        padding: 8px;
        border-radius: 6px;
        border: 1px solid var(--divider-color, #e0e0e0);
        background: var(--card-background-color, #ffffff);
        color: var(--primary-text-color, #000000);
        box-sizing: border-box;
      }
      label.inline { display: flex; align-items: center; gap: 6px; font-size: 14px; }
      .entity-row { display: flex; gap: 8px; align-items: center; }
      .entity-row select { flex: 1; }
      button {
        padding: 6px 12px;
        border-radius: 6px;
        border: none;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #ffffff);
        cursor: pointer;
      }
      button.remove { background: transparent; color: var(--error-color, #db4437); border: 1px solid var(--error-color, #db4437); }
      h3 { margin: 8px 0 0; font-size: 14px; font-weight: 500; }
      a { color: var(--accent-color, #03a9f4); }
    `;
    this.root.appendChild(style);
    this.form = document.createElement("div");
    this.form.className = "card-config";
    this.root.appendChild(this.form);
    this._hass = undefined;
    this.config = undefined;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  setConfig(config) {
    this.config = deepClone(config);
    this._render();
  }
  static getStubConfig() {
    return {
      aspect_ratio: "1",
      dark_mode: "auto",
      traffic: false,
      entities: ["zone.home"],
    };
  }

  _entityId(item) {
    return typeof item === "string" ? item : item.entity;
  }

  _candidateEntities() {
    if (!this._hass) return [];
    return Object.keys(this._hass.states)
      .filter(id => includeDomains.includes(id.split(".")[0]))
      .sort();
  }

  _friendlyName(entityId) {
    const state = this._hass && this._hass.states[entityId];
    const name = state && state.attributes && state.attributes.friendly_name;
    return name ? name + " (" + entityId + ")" : entityId;
  }

  _field(labelText, key, type, inputAttrs) {
    const wrap = document.createElement("div");
    wrap.className = "field";
    const span = document.createElement("span");
    span.textContent = labelText + "（可选）";
    const input = document.createElement("input");
    input.type = type || "text";
    if (inputAttrs) Object.assign(input, inputAttrs);
    input.value = this.config && this.config[key] !== undefined && this.config[key] !== null ? this.config[key] : "";
    input.addEventListener("change", () => {
      const value = input.type === "number" && input.value !== "" ? Number(input.value) : input.value;
      this._valueChanged(key, value);
    });
    wrap.appendChild(span);
    wrap.appendChild(input);
    return wrap;
  }

  _valueChanged(key, value) {
    if (!this.config) return;
    const current = this.config[key];
    if (current === value) return;
    if (value === "" || value === undefined || value === null) {
      const config = { ...this.config };
      delete config[key];
      this.configChanged(config);
    } else {
      this.configChanged({ ...this.config, [key]: value });
    }
  }

  _entitiesValueChanged(entities) {
    this.configChanged({ ...this.config, entities });
  }

  configChanged(newConfig) {
    const event = new Event("config-changed", { bubbles: true, composed: true });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }

  _render() {
    if (!this._hass || !this.config) return;
    if (this._rendered && this._renderedConfig === this.config) return;
    this._rendered = true;
    this._renderedConfig = this.config;
    this.form.innerHTML = "";

    // 标题
    this.form.appendChild(this._field("标题", "title"));

    const row1 = document.createElement("div");
    row1.className = "row";
    row1.appendChild(this._field("纵横比", "aspect_ratio", "number"));
    row1.appendChild(this._field("默认缩放", "default_zoom", "number"));
    this.form.appendChild(row1);

    const row2 = document.createElement("div");
    row2.className = "row";
    // 实时路况
    const trafficWrap = document.createElement("label");
    trafficWrap.className = "inline";
    const traffic = document.createElement("input");
    traffic.type = "checkbox";
    traffic.checked = this.config.traffic !== false;
    traffic.addEventListener("change", () => this._valueChanged("traffic", traffic.checked));
    trafficWrap.appendChild(traffic);
    trafficWrap.appendChild(document.createTextNode("实时路况"));
    row2.appendChild(trafficWrap);
    // 历史时长
    const hours = this._field("历史时长(小时)", "hours_to_show", "number");
    row2.appendChild(hours);
    this.form.appendChild(row2);

    // 地图模式
    const modeWrap = document.createElement("div");
    modeWrap.className = "row";
    const darkMode = this.config.dark_mode || "auto";
    [["normal", "白天模式"], ["dark", "夜间模式"], ["auto", "跟随主题"]].forEach(([value, text]) => {
      const label = document.createElement("label");
      label.className = "inline";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "dark_mode";
      radio.value = value;
      radio.checked = darkMode === value;
      radio.addEventListener("change", () => this._valueChanged("dark_mode", value));
      label.appendChild(radio);
      label.appendChild(document.createTextNode(text));
      modeWrap.appendChild(label);
    });
    this.form.appendChild(modeWrap);

    // 实体列表
    const entities = Array.isArray(this.config.entities) ? this.config.entities : [];
    const candidates = this._candidateEntities();
    entities.forEach((item, index) => {
      const entityId = this._entityId(item);
      if (!candidates.includes(entityId)) candidates.push(entityId);
    });
    entities.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "entity-row";
      const select = document.createElement("select");
      candidates.forEach(id => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = this._friendlyName(id);
        if (id === this._entityId(item)) option.selected = true;
        select.appendChild(option);
      });
      select.addEventListener("change", () => {
        const next = [...entities];
        next[index] = typeof item === "string" ? select.value : { ...item, entity: select.value };
        this._entitiesValueChanged(next);
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove";
      remove.textContent = "删除";
      remove.addEventListener("click", () => {
        const next = entities.filter((_, i) => i !== index);
        this._entitiesValueChanged(next);
      });
      row.appendChild(select);
      row.appendChild(remove);
      this.form.appendChild(row);
    });
    const addWrap = document.createElement("div");
    addWrap.className = "entity-row";
    const addSelect = document.createElement("select");
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "-- 添加实体 --";
    addSelect.appendChild(placeholder);
    const used = entities.map(item => this._entityId(item));
    candidates.filter(id => !used.includes(id)).forEach(id => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = this._friendlyName(id);
      addSelect.appendChild(option);
    });
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.textContent = "添加";
    addBtn.addEventListener("click", () => {
      if (!addSelect.value) return;
      this._entitiesValueChanged([...entities, addSelect.value]);
    });
    addWrap.appendChild(addSelect);
    addWrap.appendChild(addBtn);
    this.form.appendChild(addWrap);

    // API KEY
    const heading = document.createElement("h3");
    heading.textContent = "API KEY ";
    const link = document.createElement("a");
    link.href = "https://lbs.amap.com/dev/id/newuser";
    link.target = "_blank";
    link.textContent = "获取KEY";
    heading.appendChild(link);
    this.form.appendChild(heading);
    this.form.appendChild(this._field("高德地图 Key", "key"));
  }
}

customElements.define("gaode-map-card-editor", GaodeMapCardEditor);

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card && card.type === "gaode-map-card")) {
  window.customCards.push({
    type: "gaode-map-card",
    name: "地图(中国)",
    preview: true, // Optional - defaults to false
    description: "高德地图", // Optional
    documentation_url: "https://github.com/fineemb/lovelace-cn-map-card",
  });
}
