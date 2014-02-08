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
    var X = ( Y / y ) * x;
    var Z = ( Y / y ) * z;

    var r =  X * 1.612 - Y * 0.203 - Z * 0.302;
    var g = -X * 0.509 + Y * 1.412 + Z * 0.066;
    var b =  X * 0.026 - Y * 0.072 + Z * 0.962;

    r = r <= 0.0031308 ? 12.92 * r :  (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
    g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
    b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;

    // Correct values if one is greater than 1
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
XYPicker.prototype.doClick = function(ev) {
    var x = (ev.pageX - this.canvas.offsetLeft);
    var y = this.canvas.height - (ev.pageY - this.canvas.offsetTop);
    x /= this.canvas.width;
    y /= this.canvas.height;

    if(this.onClick)
        this.onClick([x, y], ev);
};