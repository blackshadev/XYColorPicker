 function XYPicker(canvas, oPar) {
    this.canvas = document.getElementById(canvas);
    this.ctx = this.canvas.getContext("2d");

    var self = this;
    this.canvas.onclick = function(ev) { self.doClick(ev); };

    for(var key in oPar)
       this[key] = oPar[key];
    

    this.createImage();
}
XYPicker.prototype.createImage = function() {
    this.setRGBSpace();

    var width = this.canvas.width;
    var height = this.canvas.height;
    var img = this.ctx.createImageData(width, height);

    for(var i = 0; i < img.data.length; i += 4) {
        var j = i / 4;
        
        var x = (j % width);
        var y = Math.ceil(j / width);
        y = width - y;


        var XY = [ 
            x / width,
            y / height
            ];
        var rgb = this.xyToRgb(XY[0], XY[1]);

        img.data[i + 0] = rgb[0];   // r
        img.data[i + 1] = rgb[1];   // g
        img.data[i + 2] = rgb[2];   // b
        img.data[i + 3] = 255;      // a
    }

    this.ctx.putImageData(img, 0, 0);
};
XYPicker.prototype.xyToRgb = function(x, y) {
    var z = 1.0 - x - y;
    
    var Y = 1.0;
    var X = y > 0 ? ( Y / y ) * x : 1.0;
    var Z = y > 0 ? ( Y / y ) * z : 1.0;

    var RGB = this.XYZtoRGB(X, Y, Z);
    var r = RGB[0];
    var g = RGB[1];
    var b = RGB[2];

    // Normalize
    var maxValue = Math.max(r, g, b);
    if (maxValue > 1) {
        r /= maxValue;
        g /= maxValue;
        b /= maxValue;
    }

    // No negatives allowed
    r = Math.max(r, 0);
    g = Math.max(g, 0);
    b = Math.max(b, 0);

    return [r * 255, g * 255, b * 255];
};
XYPicker.prototype.setRGBSpace = function(name) {
    // some other RGB matrices
    // var r =  X * 1.612 - Y * 0.203 - Z * 0.302;
    // var g = -X * 0.509 + Y * 1.412 + Z * 0.066;
    // var b =  X * 0.026 - Y * 0.072 + Z * 0.962;

    
    // var r =  0.8951    * X + 0.2664   * Y - 0.1614 * Z;
    // var g = -0.7502   * X + 1.7135   * Y + 0.0367 * Z;
    // var b =  0.0389 * X - 0.0685 * Y + 1.0296  * Z;

    switch(name) {
        
        case "PAL": case "SECAM": case "sRGB":
            this.XYZtoRGB = function(X, Y, Z) {
                var r =  3.0629 * X - 1.3932 * Y - 0.4758 * Z;
                var g = -0.9693 * X + 1.8760 * Y + 0.0416 * Z;
                var b =  0.0679 * X - 0.2289 * Y + 1.0694 * Z;

                r = r <= 0.018 ? 4.5 * r : (1.0 + 0.099) * Math.pow(r, (0.45)) - 0.099;
                g = g <= 0.018 ? 4.5 * g : (1.0 + 0.099) * Math.pow(g, (0.45)) - 0.099;
                b = b <= 0.018 ? 4.5 * b : (1.0 + 0.099) * Math.pow(b, (0.45)) - 0.099;
                return [r, g, b];
            }
        break;
        default:
        case "wide gamut": 
            this.XYZtoRGB = function(X, Y, Z) {
                var r =  1.4625 * X - 0.1845 * Y - 0.2734 * Z;
                var g = -0.5228 * X + 1.4479 * Y + 0.0681 * Z;
                var b =  0.0346 * X - 0.0958 * Y + 1.2875 * Z;

                r = r <= 0.0031308 ? 12.92 * r :  (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
                g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
                b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;
                return [r, g, b];
            }
            break;
    }
};
XYPicker.prototype.doClick = function(ev) {
    var x = (ev.pageX - this.canvas.offsetLeft);
    var y = this.canvas.height - (ev.pageY - this.canvas.offsetTop);
    x /= this.canvas.width;
    y /= this.canvas.height;

    if(this.onClick)
        this.onClick([x, y], ev);
};