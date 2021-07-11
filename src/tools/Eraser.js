import Tool from "./Tool";

export default class Eraser extends Tool {
    constructor(canvas) {
        super(canvas);
        this.listen();
    }
    listen() {
        this.canvas.onmousemove = this.mouseMoveHandler.bind(this);
        this.canvas.onmousedown = this.mouseDownHandler.bind(this);
        this.canvas.onmouseup = this.mouseUpHandler.bind(this);
        this.canvas.addEventListener("touchstart", this.mouseDownHandler.bind(this), false);
        this.canvas.addEventListener("touchend", this.mouseUpHandler.bind(this), false);
        this.canvas.addEventListener("touchmove", this.mouseMoveHandler.bind(this), false);
    }
    mouseUpHandler(e) {
        this.mouseDown = false;
    }
    mouseMoveHandler(e) {
        if (this.mouseDown) {
            e.preventDefault();
            this.draw(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop);
        }
    }
    mouseDownHandler(e) {
        this.mouseDown = true;
        this.ctx.beginPath();
        this.ctx.moveTo(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop);
    }
    draw(x, y) {
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        console.log('draw');
    }

}