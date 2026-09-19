console.info("%c  GAODE MAP CARD  \n%c Version 1.2.9 ",
"color: orange; font-weight: bold; background: black", 
"color: white; font-weight: bold; background: dimgray");

// 注意:这里原先无条件执行 window._AMapSecurityConfig = { securityJsCode:'' }。
// 该赋值发生在资源加载时,会覆盖用户在其它资源里配置的安全密钥,
// 导致 2021-12 之后申请的 Key 地图直接加载失败。现改为由卡片配置注入(见 connectedCallback)。
import 'https://webapi.amap.com/loader.js';
/**
 * w3color.js ver.1.18 by w3schools.com (Do not remove this line)
 *
 * 原实现是 `import './w3color.js'`,但 hacs.json 的 plugin 类型只支持声明单个
 * filename,HACS 不会一并下载同目录的 w3color.js;浏览器对该 sibling import 请求
 * 会 404,进而导致整个 ES module 加载失败(卡片与编辑器完全不渲染)。
 * 这里直接把实现内联,使 cn-map-card.js 成为单文件自包含资源。
 * 卡片只用到 w3color(color).lightness(见 _isDarkTheme)。
 */
/* w3color.js ver.1.18 by w3schools.com (Do not remove this line)*/
(function () {
function w3color(color, elmnt) {
  if (!(this instanceof w3color)) { return new w3color(color, elmnt); }
  if (typeof color == "object") {return color; }
  this.attachValues(toColorObject(color));
  if (elmnt) {elmnt.style.backgroundColor = this.toRgbString();}
}
w3color.prototype = {
  toRgbString : function () {
    return "rgb(" + this.red + ", " + this.green + ", " + this.blue + ")";
  },
  toRgbaString : function () {
    return "rgba(" + this.red + ", " + this.green + ", " + this.blue + ", " + this.opacity + ")";
  },
  toHwbString : function () {
    return "hwb(" + this.hue + ", " + Math.round(this.whiteness * 100) + "%, " + Math.round(this.blackness * 100) + "%)";
  },
  toHwbStringDecimal : function () {
    return "hwb(" + this.hue + ", " + this.whiteness + ", " + this.blackness + ")";
  },
  toHwbaString : function () {
    return "hwba(" + this.hue + ", " + Math.round(this.whiteness * 100) + "%, " + Math.round(this.blackness * 100) + "%, " + this.opacity + ")";
  },
  toHslString : function () {
    return "hsl(" + this.hue + ", " + Math.round(this.sat * 100) + "%, " + Math.round(this.lightness * 100) + "%)";
  },
  toHslStringDecimal : function () {
    return "hsl(" + this.hue + ", " + this.sat + ", " + this.lightness + ")";
  },
  toHslaString : function () {
    return "hsla(" + this.hue + ", " + Math.round(this.sat * 100) + "%, " + Math.round(this.lightness * 100) + "%, " + this.opacity + ")";
  },
  toCmykString : function () {
    return "cmyk(" + Math.round(this.cyan * 100) + "%, " + Math.round(this.magenta * 100) + "%, " + Math.round(this.yellow * 100) + "%, " + Math.round(this.black * 100) + "%)";
  },
  toCmykStringDecimal : function () {
    return "cmyk(" + this.cyan + ", " + this.magenta + ", " + this.yellow + ", " + this.black + ")";
  },
  toNcolString : function () {
    return this.ncol + ", " + Math.round(this.whiteness * 100) + "%, " + Math.round(this.blackness * 100) + "%";
  },
  toNcolStringDecimal : function () {
    return this.ncol + ", " + this.whiteness + ", " + this.blackness;
  },
  toNcolaString : function () {
    return this.ncol + ", " + Math.round(this.whiteness * 100) + "%, " + Math.round(this.blackness * 100) + "%, " + this.opacity;
  },
  toName : function () {
    var r, g, b, colorhexs = getColorArr('hexs');
    for (i = 0; i < colorhexs.length; i++) {
      r = parseInt(colorhexs[i].substr(0,2), 16);
      g = parseInt(colorhexs[i].substr(2,2), 16);
      b = parseInt(colorhexs[i].substr(4,2), 16);
      if (this.red == r && this.green == g && this.blue == b) {
        return getColorArr('names')[i];
      }
    }
    return "";
  },
  toHexString : function () {
    var r = toHex(this.red);
    var g = toHex(this.green);
    var b = toHex(this.blue);
    return "#" +  r + g + b;
  },
  toRgb : function () {
    return {r : this.red, g : this.green, b : this.blue, a : this.opacity};
  },
  toHsl : function () {
    return {h : this.hue, s : this.sat, l : this.lightness, a : this.opacity};
  },
  toHwb : function () {
    return {h : this.hue, w : this.whiteness, b : this.blackness, a : this.opacity};
  },
  toCmyk : function () {
    return {c : this.cyan, m : this.magenta, y : this.yellow, k : this.black, a : this.opacity};
  },
  toNcol : function () {
    return {ncol : this.ncol, w : this.whiteness, b : this.blackness, a : this.opacity};
  },
  isDark : function (n) {
    var m = (n || 128);
    return (((this.red * 299 + this.green * 587 + this.blue * 114) / 1000) < m);
  },
  saturate : function (n) {
    var x, rgb, color;
    x = (n / 100 || 0.1);
    this.sat += x;
    if (this.sat > 1) {this.sat = 1;}
    rgb = hslToRgb(this.hue, this.sat, this.lightness);
    color = colorObject(rgb, this.opacity, this.hue, this.sat);
    this.attachValues(color);
  },
  desaturate : function (n) {
    var x, rgb, color;
    x = (n / 100 || 0.1);
    this.sat -= x;
    if (this.sat < 0) {this.sat = 0;}
    rgb = hslToRgb(this.hue, this.sat, this.lightness);
    color = colorObject(rgb, this.opacity, this.hue, this.sat);
    this.attachValues(color);
  },
  lighter : function (n) {
    var x, rgb, color;
    x = (n / 100 || 0.1);
    this.lightness += x;
    if (this.lightness > 1) {this.lightness = 1;}
    rgb = hslToRgb(this.hue, this.sat, this.lightness);
    color = colorObject(rgb, this.opacity, this.hue, this.sat);
    this.attachValues(color);
  },
  darker : function (n) {
    var x, rgb, color;
    x = (n / 100 || 0.1);
    this.lightness -= x;
    if (this.lightness < 0) {this.lightness = 0;}
    rgb = hslToRgb(this.hue, this.sat, this.lightness);
    color = colorObject(rgb, this.opacity, this.hue, this.sat);
    this.attachValues(color);
  },
  attachValues : function(color) {
    this.red = color.red;
    this.green = color.green;
    this.blue = color.blue;
    this.hue = color.hue;
    this.sat = color.sat;
    this.lightness = color.lightness;
    this.whiteness = color.whiteness;
    this.blackness = color.blackness;
    this.cyan = color.cyan;
    this.magenta = color.magenta;
    this.yellow = color.yellow;
    this.black = color.black;
    this.ncol = color.ncol;
    this.opacity = color.opacity;
    this.valid = color.valid;
  }
};
function toColorObject(c) {
  var x, y, typ, arr = [], arrlength, i, opacity, match, a, hue, sat, rgb, colornames = [], colorhexs = [];
  c = w3trim(c.toLowerCase());
  x = c.substr(0,1).toUpperCase();
  y = c.substr(1);
  a = 1;
  if ((x == "R" || x == "Y" || x == "G" || x == "C" || x == "B" || x == "M" || x == "W") && !isNaN(y)) {
    if (c.length == 6 && c.indexOf(",") == -1) {
    } else {
      c = "ncol(" + c + ")";
    }
  }
  if (c.length != 3 && c.length != 6 && !isNaN(c)) {c = "ncol(" + c + ")";}
  if (c.indexOf(",") > 0 && c.indexOf("(") == -1) {c = "ncol(" + c + ")";}  
  if (c.substr(0, 3) == "rgb" || c.substr(0, 3) == "hsl" || c.substr(0, 3) == "hwb" || c.substr(0, 4) == "ncol" || c.substr(0, 4) == "cmyk") {
    if (c.substr(0, 4) == "ncol") {
      if (c.split(",").length == 4 && c.indexOf("ncola") == -1) {
        c = c.replace("ncol", "ncola");
      }
      typ = "ncol";
      c = c.substr(4);
    } else if (c.substr(0, 4) == "cmyk") {
      typ = "cmyk";
      c = c.substr(4);
    } else {
      typ = c.substr(0, 3);
      c = c.substr(3);
    }
    arrlength = 3;
    opacity = false;
    if (c.substr(0, 1).toLowerCase() == "a") {
      arrlength = 4;
      opacity = true;
      c = c.substr(1);
    } else if (typ == "cmyk") {
      arrlength = 4;
      if (c.split(",").length == 5) {
        arrlength = 5;
        opacity = true;
      }
    }
    c = c.replace("(", "");
    c = c.replace(")", "");
    arr = c.split(",");
    if (typ == "rgb") {
      if (arr.length != arrlength) {
        return emptyObject();
      }
      for (i = 0; i < arrlength; i++) {
        if (arr[i] == "" || arr[i] == " ") {arr[i] = "0"; }
        if (arr[i].indexOf("%") > -1) {
          arr[i] = arr[i].replace("%", "");
          arr[i] = Number(arr[i] / 100);
          if (i < 3 ) {arr[i] = Math.round(arr[i] * 255);}
        }
        if (isNaN(arr[i])) {return emptyObject(); }
        if (parseInt(arr[i]) > 255) {arr[i] = 255; }
        if (i < 3) {arr[i] = parseInt(arr[i]);}
        if (i == 3 && Number(arr[i]) > 1) {arr[i] = 1;}
      }
      rgb = {r : arr[0], g : arr[1], b : arr[2]};
      if (opacity == true) {a = Number(arr[3]);}
    }
    if (typ == "hsl" || typ == "hwb" || typ == "ncol") {
      while (arr.length < arrlength) {arr.push("0"); }
      if (typ == "hsl" || typ == "hwb") {
        if (parseInt(arr[0]) >= 360) {arr[0] = 0; }
      }
      for (i = 1; i < arrlength; i++) {
        if (arr[i].indexOf("%") > -1) {
          arr[i] = arr[i].replace("%", "");
          arr[i] = Number(arr[i]);
          if (isNaN(arr[i])) {return emptyObject(); }
          arr[i] = arr[i] / 100;
        } else {
          arr[i] = Number(arr[i]);
        }
        if (Number(arr[i]) > 1) {arr[i] = 1;}
        if (Number(arr[i]) < 0) {arr[i] = 0;}
      }
      if (typ == "hsl") {rgb = hslToRgb(arr[0], arr[1], arr[2]); hue = Number(arr[0]); sat = Number(arr[1]);}
      if (typ == "hwb") {rgb = hwbToRgb(arr[0], arr[1], arr[2]);}
      if (typ == "ncol") {rgb = ncolToRgb(arr[0], arr[1], arr[2]);}
      if (opacity == true) {a = Number(arr[3]);}
    }
    if (typ == "cmyk") {
      while (arr.length < arrlength) {arr.push("0"); }
      for (i = 0; i < arrlength; i++) {
        if (arr[i].indexOf("%") > -1) {
          arr[i] = arr[i].replace("%", "");
          arr[i] = Number(arr[i]);
          if (isNaN(arr[i])) {return emptyObject(); }
          arr[i] = arr[i] / 100;
        } else {
          arr[i] = Number(arr[i]);
        }
        if (Number(arr[i]) > 1) {arr[i] = 1;}
        if (Number(arr[i]) < 0) {arr[i] = 0;}
      }
      rgb = cmykToRgb(arr[0], arr[1], arr[2], arr[3]);
      if (opacity == true) {a = Number(arr[4]);}
    }
  } else if (c.substr(0, 3) == "ncs") {
    rgb = ncsToRgb(c);
  } else {
    match = false;
    colornames = getColorArr('names');
    for (i = 0; i < colornames.length; i++) {
      if (c.toLowerCase() == colornames[i].toLowerCase()) {
        colorhexs = getColorArr('hexs');
        match = true;
        rgb = {
          r : parseInt(colorhexs[i].substr(0,2), 16),
          g : parseInt(colorhexs[i].substr(2,2), 16),
          b : parseInt(colorhexs[i].substr(4,2), 16)
        };
        break;
      }
    }
    if (match == false) {
      c = c.replace("#", "");
      if (c.length == 3) {c = c.substr(0,1) + c.substr(0,1) + c.substr(1,1) + c.substr(1,1) + c.substr(2,1) + c.substr(2,1);}
      for (i = 0; i < c.length; i++) {
        if (!isHex(c.substr(i, 1))) {return emptyObject(); }
      }
      arr[0] = parseInt(c.substr(0,2), 16);
      arr[1] = parseInt(c.substr(2,2), 16);
      arr[2] = parseInt(c.substr(4,2), 16);
      for (i = 0; i < 3; i++) {
        if (isNaN(arr[i])) {return emptyObject(); }
      }
      rgb = {
        r : arr[0],
        g : arr[1],
        b : arr[2]
      };
    }
  }
  return colorObject(rgb, a, hue, sat);
}
function colorObject(rgb, a, h, s) {
  var hsl, hwb, cmyk, ncol, color, hue, sat;
  if (!rgb) {return emptyObject();}
  if (a === null) {a = 1;}
  hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  // hwb = rgbToHwb(rgb.r, rgb.g, rgb.b);
  // cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  hue = (h || hsl.h);
  sat = (s || hsl.s);   
  ncol = hueToNcol(hue);
  color = {
    red : rgb.r,
    green : rgb.g,
    blue : rgb.b,
    hue : hue,
    sat : sat,
    lightness : hsl.l,
    // whiteness : hwb.w,
    // blackness : hwb.b,
    // cyan : cmyk.c,
    // magenta : cmyk.m,
    // yellow : cmyk.y,
    // black : cmyk.k,
    ncol : ncol,
    opacity : a,
    valid : true
  };
  color = roundDecimals(color);
  return color;
}
function emptyObject() {
  return {
    red : 0,
    green : 0,
    blue : 0,
    hue : 0,
    sat : 0,
    lightness : 0,
    whiteness : 0,
    blackness : 0,
    cyan : 0,
    magenta : 0,
    yellow : 0,
    black : 0,
    ncol : "R",
    opacity : 1,
    valid : false
  };
}
function getColorArr(x) {
  if (x == "names") {return ['AliceBlue','AntiqueWhite','Aqua','Aquamarine','Azure','Beige','Bisque','Black','BlanchedAlmond','Blue','BlueViolet','Brown','BurlyWood','CadetBlue','Chartreuse','Chocolate','Coral','CornflowerBlue','Cornsilk','Crimson','Cyan','DarkBlue','DarkCyan','DarkGoldenRod','DarkGray','DarkGrey','DarkGreen','DarkKhaki','DarkMagenta','DarkOliveGreen','DarkOrange','DarkOrchid','DarkRed','DarkSalmon','DarkSeaGreen','DarkSlateBlue','DarkSlateGray','DarkSlateGrey','DarkTurquoise','DarkViolet','DeepPink','DeepSkyBlue','DimGray','DimGrey','DodgerBlue','FireBrick','FloralWhite','ForestGreen','Fuchsia','Gainsboro','GhostWhite','Gold','GoldenRod','Gray','Grey','Green','GreenYellow','HoneyDew','HotPink','IndianRed','Indigo','Ivory','Khaki','Lavender','LavenderBlush','LawnGreen','LemonChiffon','LightBlue','LightCoral','LightCyan','LightGoldenRodYellow','LightGray','LightGrey','LightGreen','LightPink','LightSalmon','LightSeaGreen','LightSkyBlue','LightSlateGray','LightSlateGrey','LightSteelBlue','LightYellow','Lime','LimeGreen','Linen','Magenta','Maroon','MediumAquaMarine','MediumBlue','MediumOrchid','MediumPurple','MediumSeaGreen','MediumSlateBlue','MediumSpringGreen','MediumTurquoise','MediumVioletRed','MidnightBlue','MintCream','MistyRose','Moccasin','NavajoWhite','Navy','OldLace','Olive','OliveDrab','Orange','OrangeRed','Orchid','PaleGoldenRod','PaleGreen','PaleTurquoise','PaleVioletRed','PapayaWhip','PeachPuff','Peru','Pink','Plum','PowderBlue','Purple','RebeccaPurple','Red','RosyBrown','RoyalBlue','SaddleBrown','Salmon','SandyBrown','SeaGreen','SeaShell','Sienna','Silver','SkyBlue','SlateBlue','SlateGray','SlateGrey','Snow','SpringGreen','SteelBlue','Tan','Teal','Thistle','Tomato','Turquoise','Violet','Wheat','White','WhiteSmoke','Yellow','YellowGreen']; }
  if (x == "hexs") {return ['f0f8ff','faebd7','00ffff','7fffd4','f0ffff','f5f5dc','ffe4c4','000000','ffebcd','0000ff','8a2be2','a52a2a','deb887','5f9ea0','7fff00','d2691e','ff7f50','6495ed','fff8dc','dc143c','00ffff','00008b','008b8b','b8860b','a9a9a9','a9a9a9','006400','bdb76b','8b008b','556b2f','ff8c00','9932cc','8b0000','e9967a','8fbc8f','483d8b','2f4f4f','2f4f4f','00ced1','9400d3','ff1493','00bfff','696969','696969','1e90ff','b22222','fffaf0','228b22','ff00ff','dcdcdc','f8f8ff','ffd700','daa520','808080','808080','008000','adff2f','f0fff0','ff69b4','cd5c5c','4b0082','fffff0','f0e68c','e6e6fa','fff0f5','7cfc00','fffacd','add8e6','f08080','e0ffff','fafad2','d3d3d3','d3d3d3','90ee90','ffb6c1','ffa07a','20b2aa','87cefa','778899','778899','b0c4de','ffffe0','00ff00','32cd32','faf0e6','ff00ff','800000','66cdaa','0000cd','ba55d3','9370db','3cb371','7b68ee','00fa9a','48d1cc','c71585','191970','f5fffa','ffe4e1','ffe4b5','ffdead','000080','fdf5e6','808000','6b8e23','ffa500','ff4500','da70d6','eee8aa','98fb98','afeeee','db7093','ffefd5','ffdab9','cd853f','ffc0cb','dda0dd','b0e0e6','800080','663399','ff0000','bc8f8f','4169e1','8b4513','fa8072','f4a460','2e8b57','fff5ee','a0522d','c0c0c0','87ceeb','6a5acd','708090','708090','fffafa','00ff7f','4682b4','d2b48c','008080','d8bfd8','ff6347','40e0d0','ee82ee','f5deb3','ffffff','f5f5f5','ffff00','9acd32']; }
}
function roundDecimals(c) {
  c.red = Number(c.red.toFixed(0));
  c.green = Number(c.green.toFixed(0));
  c.blue = Number(c.blue.toFixed(0));
  c.hue = Number(c.hue.toFixed(0));
  c.sat = Number(c.sat.toFixed(2));
  c.lightness = Number(c.lightness.toFixed(2));
  // c.whiteness = Number(c.whiteness.toFixed(2));
  // c.blackness = Number(c.blackness.toFixed(2));
  // c.cyan = Number(c.cyan.toFixed(2));  
  // c.magenta = Number(c.magenta.toFixed(2));
  // c.yellow = Number(c.yellow.toFixed(2));
  // c.black = Number(c.black.toFixed(2));
  c.ncol = c.ncol.substr(0, 1) + Math.round(Number(c.ncol.substr(1)));
  c.opacity = Number(c.opacity.toFixed(2));
  return c;
}
function hslToRgb(hue, sat, light) {
  var t1, t2, r, g, b;
  hue = hue / 60;
  if ( light <= 0.5 ) {
    t2 = light * (sat + 1);
  } else {
    t2 = light + sat - (light * sat);
  }
  t1 = light * 2 - t2;
  r = hueToRgb(t1, t2, hue + 2) * 255;
  g = hueToRgb(t1, t2, hue) * 255;
  b = hueToRgb(t1, t2, hue - 2) * 255;
  return {r : r, g : g, b : b};
}
function hueToRgb(t1, t2, hue) {
  if (hue < 0) hue += 6;
  if (hue >= 6) hue -= 6;
  if (hue < 1) return (t2 - t1) * hue + t1;
  else if(hue < 3) return t2;
  else if(hue < 4) return (t2 - t1) * (4 - hue) + t1;
  else return t1;
}
function hwbToRgb(hue, white, black) {
  var i, rgb, rgbArr = [], tot;
  rgb = hslToRgb(hue, 1, 0.50);
  rgbArr[0] = rgb.r / 255;
  rgbArr[1] = rgb.g / 255;
  rgbArr[2] = rgb.b / 255;
  tot = white + black;
  if (tot > 1) {
    white = Number((white / tot).toFixed(2));
    black = Number((black / tot).toFixed(2));
  }
  for (i = 0; i < 3; i++) {
    rgbArr[i] *= (1 - (white) - (black));
    rgbArr[i] += (white);
    rgbArr[i] = Number(rgbArr[i] * 255);
  }
  return {r : rgbArr[0], g : rgbArr[1], b : rgbArr[2] };
}
function cmykToRgb(c, m, y, k) {
  var r, g, b;
  r = 255 - ((Math.min(1, c * (1 - k) + k)) * 255);
  g = 255 - ((Math.min(1, m * (1 - k) + k)) * 255);
  b = 255 - ((Math.min(1, y * (1 - k) + k)) * 255);
  return {r : r, g : g, b : b};
}
function ncolToRgb(ncol, white, black) {
  var letter, percent, h, w, b;
  h = ncol;
  if (isNaN(ncol.substr(0,1))) {
    letter = ncol.substr(0,1).toUpperCase();
    percent = ncol.substr(1);
    if (percent == "") {percent = 0;}
    percent = Number(percent);
    if (isNaN(percent)) {return false;}
    if (letter == "R") {h = 0 + (percent * 0.6);}
    if (letter == "Y") {h = 60 + (percent * 0.6);}
    if (letter == "G") {h = 120 + (percent * 0.6);}
    if (letter == "C") {h = 180 + (percent * 0.6);}
    if (letter == "B") {h = 240 + (percent * 0.6);}
    if (letter == "M") {h = 300 + (percent * 0.6);}
    if (letter == "W") {
      h = 0;
      white = 1 - (percent / 100);
      black = (percent / 100);
    }
  }
  return hwbToRgb(h, white, black);
}
function hueToNcol(hue) {
  while (hue >= 360) {
    hue = hue - 360;
  }
  if (hue < 60) {return "R" + (hue / 0.6); }
  if (hue < 120) {return "Y" + ((hue - 60) / 0.6); }
  if (hue < 180) {return "G" + ((hue - 120) / 0.6); }
  if (hue < 240) {return "C" + ((hue - 180) / 0.6); }
  if (hue < 300) {return "B" + ((hue - 240) / 0.6); }
  if (hue < 360) {return "M" + ((hue - 300) / 0.6); }
}
function ncsToRgb(ncs){
  var black, chroma, bc, percent, black1, chroma1, red1, factor1, blue1, red1, red2, green2, blue2, max, factor2, grey, r, g, b; 
  ncs = w3trim(ncs).toUpperCase();
  ncs = ncs.replace("(", "");
  ncs = ncs.replace(")", "");
  ncs = ncs.replace("NCS", "NCS ");
  ncs = ncs.replace(/  /g, " ");  
  if (ncs.indexOf("NCS") == -1) {ncs = "NCS " + ncs;}
  ncs = ncs.match(/^(?:NCS|NCS\sS)\s(\d{2})(\d{2})-(N|[A-Z])(\d{2})?([A-Z])?$/);
  if (ncs === null) return false;
  black = parseInt(ncs[1], 10);
  chroma = parseInt(ncs[2], 10);
  bc = ncs[3];
  if (bc != "N" && bc != "Y" && bc != "R" && bc != "B" && bc != "G") {return false;}
  percent = parseInt(ncs[4], 10) || 0;
  if (bc !== 'N') {
    black1 = (1.05 * black - 5.25);
    chroma1 = chroma;
    if (bc === 'Y' && percent <= 60) {
      red1 = 1;
    } else if (( bc === 'Y' && percent > 60) || ( bc === 'R' && percent <= 80)) {
      if (bc === 'Y') {
        factor1 = percent - 60;
      } else {
        factor1 = percent + 40;
      }
      red1 = ((Math.sqrt(14884 - Math.pow(factor1, 2))) - 22) / 100;
    } else if ((bc === 'R' && percent > 80) || (bc === 'B')) {
      red1 = 0;
    } else if (bc === 'G') {
      factor1 = (percent - 170);
      red1 = ((Math.sqrt(33800 - Math.pow(factor1, 2))) - 70) / 100;
    }
    if (bc === 'Y' && percent <= 80) {
      blue1 = 0;
    } else if (( bc === 'Y' && percent > 80) || ( bc === 'R' && percent <= 60)) {
      if (bc ==='Y') {
        factor1 = (percent - 80) + 20.5;
      } else {
        factor1 = (percent + 20) + 20.5;
      }
      blue1 = (104 - (Math.sqrt(11236 - Math.pow(factor1, 2)))) / 100;
    } else if ((bc === 'R' && percent > 60) || ( bc === 'B' && percent <= 80)) {
      if (bc ==='R') {
        factor1 = (percent - 60) - 60;
      } else {
        factor1 = (percent + 40) - 60;
      }
      blue1 = ((Math.sqrt(10000 - Math.pow(factor1, 2))) - 10) / 100;
    } else if (( bc === 'B' && percent > 80) || ( bc === 'G' && percent <= 40)) {
      if (bc === 'B') {
        factor1 = (percent - 80) - 131;
      } else {
        factor1 = (percent + 20) - 131;
      }
      blue1 = (122 - (Math.sqrt(19881 - Math.pow(factor1, 2)))) / 100;
    } else if (bc === 'G' && percent > 40) {
      blue1 = 0;
    }
    if (bc === 'Y') {
      green1 = (85 - 17/20 * percent) / 100;
    } else if (bc === 'R' && percent <= 60) {
      green1 = 0;
    } else if (bc === 'R' && percent > 60) {
      factor1 = (percent - 60) + 35;
      green1 = (67.5 - (Math.sqrt(5776 - Math.pow(factor1, 2)))) / 100;
    } else if (bc === 'B' && percent <= 60) {
      factor1 = (1*percent - 68.5);
      green1 = (6.5 + (Math.sqrt(7044.5 - Math.pow(factor1, 2)))) / 100;
    } else if ((bc === 'B' && percent > 60) || ( bc === 'G' && percent <= 60)) {
      green1 = 0.9;
    } else if (bc === 'G' && percent > 60) {
      factor1 = (percent - 60);
      green1 = (90 - (1/8 * factor1)) / 100;
    }
    factor1 = (red1 + green1 + blue1)/3;
    red2 = ((factor1 - red1) * (100 - chroma1) / 100) + red1;
    green2 = ((factor1 - green1) * (100 - chroma1) / 100) + green1;
    blue2 = ((factor1 - blue1) * (100 - chroma1) / 100) + blue1;
    if (red2 > green2 && red2 > blue2) {
      max = red2;
    } else if (green2 > red2 && green2 > blue2) {
      max = green2;
    } else if (blue2 > red2 && blue2 > green2) {
      max = blue2;
    } else {
      max = (red2 + green2 + blue2) / 3;
    }
    factor2 = 1 / max;
    r = parseInt((red2 * factor2 * (100 - black1) / 100) * 255, 10);
    g = parseInt((green2 * factor2 * (100 - black1) / 100) * 255, 10);
    b = parseInt((blue2 * factor2 * (100 - black1) / 100) * 255, 10);
    if (r > 255) {r = 255;}
    if (g > 255) {g = 255;}
    if (b > 255) {b = 255;}
    if (r < 0) {r = 0;}
    if (g < 0) {g = 0;}
    if (b < 0) {b = 0;}
  } else {
    grey = parseInt((1 - black / 100) * 255, 10);
    if (grey > 255) {grey = 255;}
    if (grey < 0) {grey = 0;}
    r = grey;
    g = grey;
    b = grey;
  }
  return {
    r : r,
    g : g,
    b : b
  };
}
function rgbToHsl(r, g, b) {
  var min, max, i, l, s, maxcolor, h, rgb = [];
  rgb[0] = r / 255;
  rgb[1] = g / 255;
  rgb[2] = b / 255;
  min = rgb[0];
  max = rgb[0];
  maxcolor = 0;
  for (i = 0; i < rgb.length - 1; i++) {
    if (rgb[i + 1] <= min) {min = rgb[i + 1];}
    if (rgb[i + 1] >= max) {max = rgb[i + 1];maxcolor = i + 1;}
  }
  if (maxcolor == 0) {
    h = (rgb[1] - rgb[2]) / (max - min);
  }
  if (maxcolor == 1) {
    h = 2 + (rgb[2] - rgb[0]) / (max - min);
  }
  if (maxcolor == 2) {
    h = 4 + (rgb[0] - rgb[1]) / (max - min);
  }
  if (isNaN(h)) {h = 0;}
  h = h * 60;
  if (h < 0) {h = h + 360; }
  l = (min + max) / 2;
  if (min == max) {
    s = 0;
  } else {
    if (l < 0.5) {
      s = (max - min) / (max + min);
    } else {
      s = (max - min) / (2 - max - min);
    }
  }
  s = s;
  return {h : h, s : s, l : l};
}
function rgbToHwb(r, g, b) {
  var h, w, bl;
  r = r / 255;
  g = g / 255;
  b = b / 255;
  max = Math.max(r, g, b);
  min = Math.min(r, g, b);
  chroma = max - min;
  if (chroma == 0) {
    h = 0;
  } else if (r == max) {
    h = (((g - b) / chroma) % 6) * 360;
  } else if (g == max) {
    h = ((((b - r) / chroma) + 2) % 6) * 360;
  } else {
    h = ((((r - g) / chroma) + 4) % 6) * 360;
  }
  w = min;
  bl = 1 - max;
  return {h : h, w : w, b : bl};
}
function rgbToCmyk(r, g, b) {
  var c, m, y, k;
  r = r / 255;
  g = g / 255;
  b = b / 255;
  max = Math.max(r, g, b);
  k = 1 - max;
  if (k == 1) {
    c = 0;
    m = 0;
    y = 0;
  } else {
    c = (1 - r - k) / (1 - k);
    m = (1 - g - k) / (1 - k);
    y = (1 - b - k) / (1 - k);
  }
  return {c : c, m : m, y : y, k : k};
}
function toHex(n) {
  var hex = n.toString(16);
  while (hex.length < 2) {hex = "0" + hex; }
  return hex;
}
function cl(x) {
  console.log(x);
}
function w3trim(x) {
  return x.replace(/^\s+|\s+$/g, '');
}
function isHex(x) {
  return ('0123456789ABCDEFabcdef'.indexOf(x) > -1);
}
window.w3color = w3color;

})();

function w3SetColorsByAttribute() {
  var z, i, att;
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    att = z[i].getAttribute("data-w3-color");
    if (att) {
      z[i].style.backgroundColor = w3color(att).toRgbString();      
    }
  }
}

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
    // 高德安全密钥(2021-12 之后新申请的 Key 强制要求),由卡片配置注入,
    // 仅在用户显式配置时覆盖全局配置,避免把用户自己的设置清空。
    if(this.config.securityJsCode){
      window._AMapSecurityConfig = { securityJsCode: this.config.securityJsCode };
    }
    this._loadMap({
      key: this.config.key||"",   // 申请好的Web端开发者Key，首次调用 load 时必填 f87e0c9c4f3e1e78f963075d142979f0
      version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ['AMap.MoveAnimation'], //插件列表
      securityJsCode: this.config.securityJsCode || undefined
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
      this.circle = {};
      this.historyPath = {};
      this.persons = [];   // clearMap() 已销毁旧 marker,这里必须同步丢弃引用,否则 setFitView 会拿到已销毁的 marker
      this.fit = 0;        // 重置计数,否则实体变更后 _checkFit 永远达不到 entities.length
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
    // 更新视界:
    // 不再在这里同步判断 this.fit —— 标记点是异步(坐标转换 / 图片加载)才加入 this.persons 的,
    // 同步判断时 this.persons 往往是空的,setFitView 等效于没执行,地图会一直停在默认中心。
    // 现在由每个标记点 resolve 后的 _settle() -> _checkFit() 触发。
  }
  // 每个实体无论成功标记、坐标缺失还是转换失败都只调用一次,保证计数不会卡住
  _settle(){
    this.fit++;
    this._checkFit();
  }
  _checkFit(){
    if(!this.entities || this.fit < this.entities.length)return;
    this.fit = 0;
    if(!this.map || !this.persons.length)return;
    this.map.setFitView(this.persons, false, [40, 40, 40, 40]);
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
      // 地图就绪后立即刷新一次标记点。
      // 否则只能等下一次 hass 推送才会执行 set hass 的加标记分支,安静环境下地图会长时间空白。
      if(this._hass && this._hass.states)this.hass = this._hass;
    }).catch(e => {
        console.error("GaodeMapCard: 高德地图加载失败,请检查 key / securityJsCode / 网络", e);
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
  // 坐标转换。
  //
  // 高德 JS API 的 AMap.convertFrom 内部走的是"坐标转换"REST 接口,要求 key 具备
  // "Web服务(REST API)"平台权限;而初始化地图用的 key 只能是"Web端(JS API)"平台,
  // 同一个 key 不能同时具备两个平台。因此对绝大多数用户,_addMarker / _updateMarker /
  // _gethistory 里的 AMap.convertFrom 是必然失败的:
  //   REST 直连     -> USERKEY_PLAT_NOMATCH (infocode 10009)
  //   JSAPI 内 JSONP -> INVALID_USER_SCODE   (infocode 10008)
  // 表现就是"实体坐标无法定位 / 标记点不显示"。
  //
  // 配置 rest_key(单独申请、平台选"Web服务(REST API)"的 key)后,这里改为直接 fetch
  // REST 接口;未配置 rest_key 时行为与原实现完全一致,仍走 AMap.convertFrom。
  //
  // callback(err, result);result 为 AMap.LngLat 或 AMap.LngLat[],与入参形态一致。
  _convertFrom(locations, type, callback){
    const isArray = Array.isArray(locations);
    const list = isArray?locations.slice():[locations];
    const coordsys = type==='gaode'?'autonavi':type;
    const done = function(err,result){ callback(err,isArray?result:(result&&result[0])); };

    if(!list.length)return done(null,[]);

    // type: gaode 表示源数据本身已是高德(GCJ-02)坐标,不需要转换
    if(coordsys==='autonavi')return done(null,list);

    const key = this.config.rest_key;
    if(!key){
      AMap.convertFrom(locations, type, function(status,result){
        if(result && result.info==='ok')return done(null,result.locations);
        done(new Error('AMap.convertFrom 失败: '+((result&&result.info)||status)));
      });
      return;
    }

    const toPair = function(p){
      return (p && typeof p.getLng==='function')?[p.getLng(),p.getLat()]:[p[0],p[1]];
    };
    // REST 坐标转换接口单次最多 40 个坐标点,历史轨迹可能有上千个点,必须分批
    const chunks = [];
    for(let i=0;i<list.length;i+=40)chunks.push(list.slice(i,i+40));

    Promise.all(chunks.map(function(chunk){
      const locstr = chunk.map(function(p){ const c = toPair(p); return c[0]+','+c[1]; }).join(';');
      const url = "https://restapi.amap.com/v3/assistant/coordinate/convert"
                + "?locations=" + locstr
                + "&coordsys=" + coordsys
                + "&key=" + encodeURIComponent(key);
      return fetch(url).then(function(r){ return r.json(); }).then(function(res){
        if(res.status!=='1' || !res.locations){
          throw new Error((res.info||'unknown')+'/'+(res.infocode||'')+' (coordsys='+coordsys+')');
        }
        return res.locations.split(';').map(function(s){
          const a = s.split(',');
          return new AMap.LngLat(parseFloat(a[0]),parseFloat(a[1]));
        });
      });
    })).then(function(results){
      let out = [];
      results.forEach(function(r){ out = out.concat(r); });
      done(null,out);
    }).catch(function(err){
      console.warn("GaodeMapCard: REST 坐标转换失败,请检查 rest_key 是否为\"Web服务(REST API)\"类型的 Key:", err);
      done(err);
    });
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
      this._convertFrom(gps, type, function (err, result) {
        if (err || !that.markers[entity]) return;
        that.markers[entity].moveTo(result, {
            autoRotation: false
        })
        if(hours_to_show>0 && that.trace){
          that._gethistory(hours_to_show, entity, "", type)
        }
      });
    }
    this.positions[entity] = gps;
  }
  _addMarker(entity,index,type){
    
    let color = this._colors[index%this._colors.length];
    let objstates = this._hass.states[entity];
    if(!objstates || !objstates.attributes.longitude){
      this._settle();
      return
    } 
    let gps = new AMap.LngLat(objstates.attributes.longitude, objstates.attributes.latitude);
    let that = this;
    this._convertFrom(gps, type, function (err, result) {
      if (!err) {
        that._showMarker(result, entity, color, type);
      }
      // 坐标缺失、转换失败都要结算,否则 _checkFit 永远达不到 entities.length
      that._settle();
    });
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
          that._convertFrom(lineArr, type, function (err, locations) {
            if (!err) {
              var path2 = locations;
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
      .hint { font-size: 12px; line-height: 1.6; color: var(--secondary-text-color, #727272); }
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
    this.form.appendChild(this._field("高德地图 Key(Web端 JS API)", "key"));
    this.form.appendChild(this._field("安全密钥 securityJsCode", "securityJsCode"));
    this.form.appendChild(this._field("坐标转换 Key rest_key(Web服务 REST API)", "rest_key"));
    this.form.appendChild(this._hint(
      "实体的坐标转换原实现走 AMap.convertFrom,该接口要求 Key 具备\"Web服务(REST API)\"平台权限," +
      "而地图渲染用的 Key 只能是\"Web端(JS API)\"平台 —— 同一个 Key 不能同时具备两个平台," +
      "因此 gps / baidu / mapbar 类型的实体通常会转换失败,表现为标记点不显示。" +
      "请另外申请一个平台为\"Web服务(REST API)\"的 Key 填入 rest_key;" +
      "type 为 gaode 的实体本身已是高德坐标,不需要转换。"
    ));
  }

  _hint(text) {
    const el = document.createElement("div");
    el.className = "hint";
    el.textContent = text;
    return el;
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
