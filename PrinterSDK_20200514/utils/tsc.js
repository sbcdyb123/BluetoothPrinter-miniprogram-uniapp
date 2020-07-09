var app = getApp();
var encode = require("./encoding.js");
var jpPrinter = {　　　　
  createNew: function() {　　　　　　
    var jpPrinter = {};
    var data = "";
    var command = []

    jpPrinter.name = "蓝牙打印机";

    jpPrinter.init = function() {};

    jpPrinter.addCommand = function(content) { //将指令转成数组装起
      var code = new encode.TextEncoder(
        'gb18030', {
          NONSTANDARD_allowLegacyEncoding: true
        }).encode(content)
      for (var i = 0; i < code.length; ++i) {
        command.push(code[i])
      }
    };
    /**
     * 该指令用于设定卷标纸的宽度和长度
     * 传入参数说明
     * pageWidght：标签宽度 单位mm
     * pageHeight：标签高度 单位mm
     */
    jpPrinter.setSize = function(pageWidght, pageHeight) { 
      data = "SIZE " + pageWidght.toString() + " mm" + "," + pageHeight.toString() + " mm" + "\r\n";
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用于定义两张卷标纸间的垂直间距距离
     * 传入参数说明
     * 标签间隙 单位mm
     */
    jpPrinter.setGap = function (printGap) {
      data = "GAP " + printGap.toString() + " mm,0 mm\r\n";
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用于设定黑标高度及定义标签印完后标签额外送出的长度
     * 传入参数说明
     * 黑标高度 单位mm
     */
    jpPrinter.setBline = function (printBline) { 
      data = "BLINE " + printBline.toString() + " mm,0 mm\r\n";
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用于控制在剥离模式时（peel-off mode）每张卷标停止的位置，在打印
     * 下一张时打印机会将原先多推出或少推出的部分以回拉方式补偿回来。该指令仅
     * 适用于剥离模式。
     * 传入参数说明
     * 纸张停止的距离 单位mm 
     */
    jpPrinter.setOffset = function (offset) { 
      data = "OFFSET " + offset.toString() + " mm,0 mm\r\n";
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用于控制打印速度
     *  传入参数说明
     * 1<=printSpeed<=6
     * 实际支持速度以自检页为准
     */
    jpPrinter.setSpeed = function(printSpeed) {
      data = "SPEED " + printSpeed.toString() + "\r\n";
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用于控制打印时的浓度
      传入参数说明
     * 1<=printDensity<=15
     */
    jpPrinter.setDensity = function(printDensity) {
      data = "DENSITY " + printDensity.toString() + "\r\n";
      jpPrinter.addCommand(data)
    }

    /**
     * 该指令用于定义打印时出纸和打印字体的方向
     * 传入参数说明
     * direction=0或direction=1
     */
    jpPrinter.setDirection = function (direction) {
      data = "DIRECTION " + direction + "\r\n";
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用于定义卷标的参考坐标原点。坐标原点位置和打印方向有关
     * 传入参数说明
     * x 水平方向的坐标位置,单位dots
     * y 垂直方向的坐标位置,单位dots
     * 打印机分辨率200 DPI:  1 mm = 8  dots
     * 打印机分辨率300 DPI:  1 mm = 12 dots
     */
    jpPrinter.setReference = function (x, y) {
      data = "REFERENCE " + x + "," + y + "\r\n";
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令表示标签打印偏移量多少设置
     * 传入参数说明  点数dot
     * n 偏移量 ，单位dot 1mm=8 dots
     * 打印机分辨率200 DPI:  1 mm = 8  dots
     * 打印机分辨率300 DPI:  1 mm = 12 dots
     */
    jpPrinter.setShift = function (n) {
      data = "SHIFT " + n +"\r\n";
      jpPrinter.addCommand(data)
    };
   /**
    * 该指令用于选择对应的国际字符集
    * 传入参数说明
    *  001:USA
    *  002:French
    *  003:Latin America
    *  034:Spanish
    *  039:Italian
    *  044:United Kingdom
    *  046:Swedish
    *  047:Norwegian
    *  049:German
    */
    jpPrinter.setCountry = function(country) {
      data = "COUNTRY " + country + "\r\n";
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用于选择对应的国际代码页
     * 传入参数说明
     * 8-bit codepage 字符集代表
     * 437:United States
     * 850:Multilingual
     * 852:Slavic
     * 860:Portuguese
     * 863:Canadian/French
     * 865:Nordic
     * 
     * Windows code page
     * 1250:Central Europe
     * 1252:Latin I
     * 1253:Greek
     * 1254:Turkish
     * 
     * 以下代码页仅限于12×24 dot 英数字体
     * WestEurope:WestEurope
     * Greek:Greek
     * Hebrew:Hebrew
     * EastEurope:EastEurope
     * Iran:Iran
     * IranII:IranII
     * Latvian:Latvian
     * Arabic:Arabic
     * Vietnam:Vietnam
     * Uygur:Uygur
     * Thai:Thai
     * 1252:Latin I
     * 1257:WPC1257
     * 1251:WPC1251
     * 866:Cyrillic
     * 858:PC858
     * 747:PC747
     * 864:PC864
     * 1001:PC1001
     */
    jpPrinter.setCodepage = function(codepage) {
      data = "CODEPAGE " + codepage + "\r\n";
      jpPrinter.addCommand(data)
    }
    /**
     * 该指令用于清除图像缓冲区（image buffer)的数据
     */
    jpPrinter.setCls = function() {
      data = "CLS\r\n";
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用于将标签纸向前推送指定的长度
     * 传入参数说明  点数dots
     * 打印机分辨率200 DPI:1 mm = 8  dots
     * 打印机分辨率300 DPI:1 mm = 12 dots
     */
    jpPrinter.setFeed = function(feed) {
      data = "FEED " + feed + "\r\n";
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用于将标签纸向后回拉指定的长度
     * 传入参数说明  点数dots
     * 打印机分辨率200 DPI:1 mm = 8  dots 
     * 打印机分辨率300 DPI:1 mm = 12 dots
     */
    jpPrinter.setBackFeed = function(backup) {
      data = "BACKFEED " + backup + "\r\n";
      jpPrinter.addCommand(data)
    }
    /**
     * 该指令用于控制打印机进一张标签纸
     */
    jpPrinter.setFromfeed = function() {
      data = "FORMFEED\r\n";
      jpPrinter.addCommand(data)
    };
    /**
     * 在使用含有间隙或黑标的标签纸时，若不能确定第一张标签纸是否在正确打印位
     * 置时，此指令可将标签纸向前推送至下一张标签纸的起点开始打印。标签尺寸和
     * 间隙需要在本条指令前设置
     * 注：使用该指令时，纸张高度大于或等于30 mm
     */
    jpPrinter.setHome = function() { //根据Size找到下一张标签纸的位置
      data = "HOME\r\n";
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用于打印出存储于影像缓冲区内的数据
     */
    jpPrinter.setPagePrint = function() { 
      data = "PRINT 1,1\r\n"
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用于打印出存储于影像缓冲区内的数据
     * 传入参数说明  打印份数
     * 1≤n≤65535
     */
    jpPrinter.setPrint = function (n) {
      data = "PRINT "+n+",1\r\n"
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用于控制蜂鸣器的频率，可设定10 阶的声音，每阶声音的长短由第二个参数控制
     * 传入参数说明
     * level        音阶:0-9
     * interval 间隔时间:1-4095
     */
    jpPrinter.setSound = function(level, interval) { //控制蜂鸣器
      data = "SOUND " + level + "," + interval + "\r\n";
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用于设定打印机进纸时，若经过所设定的长度仍无法侦测到垂直间距，则打印机在连续纸模式工作
     * 传入参数说明  点数dots
     */
    jpPrinter.setLimitfeed = function(limit) { // 检测垂直间距
      data = "LIMITFEED " + limit + "mm\r\n";
      jpPrinter.addCommand(data)
    };
    /**
     * 打印自检页
     */
    jpPrinter.setSelfTest=function(){
      data = "SELFTEST\r\n";
      jpPrinter.addCommand(data)
    }
    /**
     * 该指令用于在标签上画线
     * 传入参数说明
     * x 线条左上角X 坐标，单位dots
     * y 线条左上角Y 坐标，单位dots
     * width  线宽，单位dots
     * height 线高，单位dots
     */
    jpPrinter.setBar = function(x, y, width, height) { //绘制线条
      data = "BAR " + x + "," + y + "," + width + "," + height + "\r\n"
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用于在卷标上绘制矩形方框
     * x_start 方框左上角X 坐标，单位dots
     * y_start 方框左上角Y 坐标，单位dots
     * x_end 方框右下角X 坐标，单位dots
     * y_end 方框右下角Y 坐标，单位dots
     * thickness 方框线宽，单位dots
     */
    jpPrinter.setBox = function (x_start, y_start, x_end, y_end, thickness) {
      data = "BOX " + x_start + "," + y_start + "," + x_end + "," + y_end + "," + thickness + "\r\n";
      jpPrinter.addCommand(data)
    };
    /**
    * 该指令用来画一维条码
    * 传入参数说明
    * x 左上角水平坐标起点，以点（dot）表示
    * y 左上角垂直坐标起点，以点（dot）表示
    * height 条形码高度，以点（dot）表示
    *readable 0 表示人眼不可识，1 表示人眼可识
    *rotation 条形码旋转角度，顺时针方向 0,90,180,270
    * narrow 窄bar 宽度，以点（dots）表示
    * wide 宽bar 宽度，以点（dot）表示
    * content 打印内容
    */
    jpPrinter.setBarCode = function (x, y, codetype, height, readable, rotation, narrow, wide, content) {
      data = "BARCODE " + x + "," + y + ",\"" + codetype + "\"," + height + "," + readable + "," + rotation + "," + narrow + "," + wide + ",\"" + content + "\"\r\n"
      jpPrinter.addCommand(data)
    };

    /**
     * 打印图片（单色图片）
     * res为画布参数
     */
    jpPrinter.setBitmap = function (x, y, mode, res) {
      console.log(res)
      var w = res.width;
      var h = res.height;
      var bitw = parseInt((w + 7) / 8) * 8;
      // var bitw = (parseInt(w) % 8) == 0 ? (parseInt(w) / 8) :( parseInt(w) / 8+1);
      var pitch = parseInt(bitw / 8);
      var bits = new Uint8Array(h * pitch);
      console.log("w=" + w + ", h=" + h + ", bitw=" + bitw + ", pitch=" + pitch + ", bits=" + bits.length);
      var cmd = "BITMAP " + x + "," + y + "," + pitch + "," + h + "," + mode + ",";
      console.log("add cmd: " + cmd);
      jpPrinter.addCommand(cmd);
      // for (var i=0; i<bits.length; i++) {
      //   bits[i] = 0;
      // }
      for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
          var color = res.data[(y * w + x) * 4 + 1];
          if (color <= 128) {
            bits[parseInt(y * pitch + x / 8)] |= (0x80 >> (x % 8));
          }
        }
      }
      for (var i = 0; i < bits.length; i++) {
        command.push((~bits[i]) & 0xFF);
      }
      console.log(command);
    };
  
    /**
     * 将指定的区域反相打印
     * 传入参数说明
     * x_start 反相区域左上角X 坐标，单位dot
     * y_start 反相区域左上角Y 坐标，单位dot
     * x_width 反相区域宽度，单位dot
     * y_height 反相区域高度，单位dot
     */
    jpPrinter.setErase = function(x_start, y_start, x_width, y_height) {
      data = "ERASE " + x_start + "," + y_start + "," + x_width + "," + y_height + "\r\n";
      jpPrinter.addCommand(data)
    };
    /**
     * 将指定的区域反相打印
     * 传入参数说明
     * x_start 反相区域左上角X 坐标，单位dot
     * y_start 反相区域左上角Y 坐标，单位dot
     * x_width 反相区域宽度，单位dot
     * y_height 反相区域高度，单位dot
     */
    jpPrinter.setReverse = function(x_start, y_start, x_width, y_height) {
      data = "REVERSE " + x_start + "," + y_start + "," + x_width + "," + y_height + "\r\n";
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用于打印字符串
     * 传入参数说明
     * x 文字X 方向起始点坐标
     *  y 文字Y 方向起始点坐标
     *  font 字体名称
     *  1 8×12 dot 英数字体
     *  2 12×20 dot 英数字体
     *  3 16×24 dot 英数字体
     *  4 24×32 dot 英数字体
     *  5 32×48 dot 英数字体
     *  6 14×19 dot 英数字体OCR-B
     *  7 21×27 dot 英数字体OCR-B
     *  8 14×25 dot 英数字体OCR-A
     *  9 9×17 dot 英数字体
     *  10 12×24 dot 英数字体
     *  TSS16.BF2 简体中文16×16（GB 码）
     *  TSS20.BF2 简体中文20×20（GB 码）
     *  TST24.BF2 繁体中文24×24（大五码）
     *  TSS24.BF2 简体中文24×24（GB 码）
     *  K 韩文24×24Font（KS 码）
     * TSS32.BF2 简体中文32×32（GB 码）
     * rotation 文字旋转角度（顺时针方向） 0， 90， 180， 270
     */
    jpPrinter.setText = function(x, y, font, rotation,x_, y_, str) { 
      data = "TEXT " + x + "," + y + ",\"" + font + "\"," + rotation + "," + x_ + "," + y_ + "," + "\"" + str + "\"\r\n"
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用来打印二维码
     * ｘ 二维码水平方向起始点坐标
     * ｙ 二维码垂直方向起始点坐标
     * ECC level 选择QRCODE 纠错等级
     *   L 7%
     *   M 15%
     *   Q 25%
     *   H 30%
     * cell width 二维码宽度1-10
     * mode 手动/自动编码
     *   A Auto
     *   M Manual
     * rotation 旋转角度（顺时针方向） 0，90，180，270
     * content  内容
     */
    jpPrinter.setQrcode = function(x, y, level, width, mode, content) {
      data = "QRCODE " + x + "," + y + "," + level + "," + width + "," + mode + "," + 0 + ",\"" + content +"\"\r\n"
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用来起动Key1 的预设功能
     * 传入参数说明
     * ON 开启按键
     * OFF 关闭按键
     */
    jpPrinter.setKey1=function(n){
      data = "SET KYE1 "+n.toString+"\r\n"
      jpPrinter.addCommand(data)
    };
    /**
   * 该指令用来起动Key2 的预设功能
   * 传入参数说明
   * ON 开启按键
   * OFF 关闭按键
   */
    jpPrinter.setKey2 = function (n) {
      data = "SET KYE2 " + n.toString + "\r\n"
      jpPrinter.addCommand(data)
    };
    /**
     * 该指令用来启动/关闭剥离模式，默认值为关闭
     * 传入参数说明
     * ON  起动剥离模式
     * OFF 关闭剥离模式
     */
    jpPrinter.setPeel = function (n) {
      data = "SET PEEL " + n.toString + "\r\n"
      jpPrinter.addCommand(data)
    };
    /**
     * 此命令是用来启用/禁用撕纸位置走到撕纸处，此设置关掉电源后将保存在打印机内
     * 传入参数说明
     * ON 启用撕纸位置走到撕纸处
     * OFF 禁用撕纸位置走到撕纸处，命令在起始位置有效
     */
    jpPrinter.setTear = function (n) {
      data = "SET TEAR " + n.toString + "\r\n"
      jpPrinter.addCommand(data)
    };
    /**
   * 此命令是用来启用/禁用撕纸位置走到撕纸处，此设置关掉电源后将保存在打印机内
     * 传入参数说明
   * ON 启用撕纸位置走到撕纸处
   * OFF 禁用撕纸位置走到撕纸处，命令在起始位置有效
   */
    jpPrinter.setStripper = function (n) {
      data = "SET STRIPPER " + n.toString + "\r\n"
      jpPrinter.addCommand(data)
    };
    /**
     * 此设置用于启用/禁用打印头合盖传感器。如果禁用合盖传感器，打印机头被打开时，将不会传回错误信息。
     * 此设置将保存在打印机内存。
     * 传入参数说明
     * ON  启用打印头合盖传感器
     * OFF 禁用打印头合盖传感器
     */
    jpPrinter.setHead = function (n) {
      data = "SET HEAD " + n.toString + "\r\n"
      jpPrinter.addCommand(data)
    };
    /**
     * 此命令将禁用/启用标签机在无纸或开盖错误发生后，上纸或合盖后重新打印一次标签内容
     * 传入参数说明
     * OFF 禁止此功能
     * ON 启用此功能
     */
    jpPrinter.setReprint = function (n) {
      data = "SET REPRINT " + n.toString + "\r\n"
      jpPrinter.addCommand(data)
    };

    /**
     * 设定开启/关闭碳带感应器，即切换热转式/热感印式打印。通常打印机于开启电
     *源时，碳带感应器即会自动检测打印机是否已装上碳带，并藉此决定使用热感式
     *或热转式打印。此项设定并不会存于打印机中。此方法仅适用于热转式机器。
     * 传入参数说明
     * OFF 禁止此功能
     * ON 启用此功能
     */
    jpPrinter.setRibbon = function (n) {
      data = "SET RIBBON " + n.toString + "\r\n"
      jpPrinter.addCommand(data)
    };
    /**
     * 此命令用于设置切刀状态，关闭打印机电源后，该设置将会被存储在打印机内存中。
     * 传入参数说明
     * OFF 关闭切刀功能
     * BATCH 在PRINT 命令结束后切纸
     * pieces 0-65535，用于设置每几个标签进行切纸
     */
    jpPrinter.setCut = function (n) {
      data = "SET CUTTER " + n.toString + "\r\n"
      jpPrinter.addCommand(data)
    };
    //获取打印数据
    jpPrinter.getData = function() {
      return command;
    };　　
    return jpPrinter;　
  }
};

module.exports.jpPrinter = jpPrinter;