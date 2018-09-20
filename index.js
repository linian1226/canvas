//初始化数据
let canvas = document.getElementById("canvas"),
    pen = document.getElementById("pen"),
    eraser = document.getElementById("eraser"),
    color = document.getElementById("color"),
    thickness = document.getElementById("thickness"),
    actions = document.getElementById("actions"),
    eraserEnabled = false,
    ctx = canvas.getContext('2d')//获得渲染上下文和它的绘画功能
//设置画布自动布满视口,窗口大小改变，画布也改变
autoSetCanvasSize(canvas)
function autoSetCanvasSize(canvas){
    setCanvasSize(canvas)
    window.onresize = () =>{
        setCanvasSize(canvas)
    }
    function setCanvasSize(canvas){//设置画布宽高
        let pageWidth = document.documentElement.clientWidth
        let pageHeight = document.documentElement.clientHeight
        canvas.width = pageWidth
        canvas.height = pageHeight
    }
}
//执行动作
painting(canvas)
function painting(canvas){
    ctx.strokeStyle = "blank"
    ctx.fillStyle = "blank"
    ctx.lineWidth = 2
    ctx.radius = 1
    let isUsing = false        //是否正在使用
    let previousPoint = {}
    if(document.body.ontouchstart !== undefined){
        //触屏设备
        canvas.addEventListener('touchstart', touchStart.bind(null, previousPoint))
        canvas.addEventListener('touchmove', touchMove.bind(null, previousPoint))
        canvas.addEventListener('touchcancel', touchCancel)
    }else{
        //pc
        canvas.onmousedown = (e) =>{
            isUsing = true;
            let x = e.clientX
            let y = e.clientY
            if(!eraserEnabled){
                previousPoint ={x:x,y:y}
                drawPoint(x,y,ctx.radius)
            }else{
                ctx.clearRect(x-5,y-5,10,10)//设置橡皮擦的宽高
            }
        }
        canvas.onmousemove = (e) =>{
            if(isUsing){
                let x = e.clientX
                let y = e.clientY
                let newPoint = { x: x, y: y }
                if (!eraserEnabled) {
                  drawPoint(x, y, ctx.radius)
                  drawLine(previousPoint.x, previousPoint.y, newPoint.x, newPoint.y)
                  previousPoint = newPoint
                }else{
                    ctx.clearRect(x-5,y-5,10,10)//移动的时候一直清除
                }
            }
        }
        canvas.onmouseup = () => {
            isUsing = false
        }
    }
}
function touchStart(point,e){
    e.preventDefault()
    let x,y
    for(let touch of e.changedTouches){//多个触发点
        x = Math.floor(touch.clientX)
        y = Math.floor(touch.clientY)
        if (!eraserEnabled) {
            point[touch.identifier] = {x:x,y:y}
            drawPoint(x, y, ctx.radius)
        } else {
            ctx.clearRect(x - 5, y - 5, 10, 10)
        }
    }
}
function touchMove(point,e){
    e.preventDefault()
    let x,y,newPoint ={}
    for(let touch of e.changedTouches){
        x = Math.floor(touch.clientX)
        y = Math.floor(touch.clientY)
        if (!eraserEnabled) {
            newPoint[touch.identifier] = { x: x, y: y }
            drawPoint(x, y, ctx.radius)           //需要添加此函数才不会使得画出来的线在lineWidth变大时不完整
            drawLine(point[touch.identifier].x, point[touch.identifier].y, newPoint[touch.identifier].x, newPoint[touch.identifier].y)
            point[touch.identifier] = newPoint[touch.identifier]
        }
        else {
            ctx.clearRect(x - 8, y - 8, 16, 16)
        }
    }
}
function touchCancel(){
   alert('使用第六根手指') 
}
//画圆点,让画线条时比较流畅
function drawPoint(x,y,radius){
    ctx.beginPath()
    ctx.arc(x,y,radius,0,Math.PI*2)
    ctx.fill()
}
//画线条
function drawLine(x1,y1,x2,y2){
    //解决ios兼容
    if(ctx.lineWidth === 1){
        ctx.lineWidth = 2
        ctx.radius = 1
    }
    ctx.beginPath()
    ctx.moveTo(x1,y1)
    ctx.lineTo(x2,y2)
    ctx.stroke()
}

color.addEventListener('click', changeColor)
thickness.addEventListener('click', changeThickness)
actions.addEventListener('click',(e)=>{
    if(e.target.tagName === 'svg'){//获取被点击元素的id
        takeAction(e.target.id)
    }else if(e.target.tagName === 'use'){
        takeAction(e.target.parentElement.id)
    }else if(e.target.tagName === 'LI'){
        takeAction(e.target.children[0].id)
    }
})
//选择哪个操作
function takeAction(element){
    if(element === 'pen'){
        eraserEnabled = false
        pen.classList.add("active")
        eraser.classList.remove("active")
        color.className = "active"
        thickness.className = "active"
    }else if(element === 'eraser'){
        eraserEnabled = true
        color.className = "remove"
        thickness.className = "remove"
        eraser.classList.add("active")
        pen.classList.remove("active")
    }else if(element === 'clearAll'){
        ctx.clearRect(0,0,canvas.width,canvas.height)//清屏
        eraserEnabled = false
        pen.classList.add("active")
        eraser.classList.remove("active")
        color.className = "active"
        thickness.className = "active"
    }else if(element === 'save'){
        let a = document.createElement("a")
        a.href = canvas.toDataURL() //返回图片的url
        a.target = '_blank'
        a.download = 'image.png' //图片下载
        a.click()
    }
}
//选笔的颜色
function changeColor(e){
    let selectedColor = e.target.id
    ctx.strokeStyle = selectedColor //图形轮廓的颜色
    ctx.fillStyle = selectedColor //图形填充颜色
    whichActived(selectedColor, 'color')
}
//选笔的粗细
function changeThickness(e){
    let selectedThickness = e.target.id
    if(selectedThickness === 'thin'){
        ctx.lineWidth = 2
        ctx.radius = 1 //设置这个，画直线转弯比较圆润
    }else if (selectedThickness === 'middle') {
        ctx.lineWidth = 6
        ctx.radius = 3
    } else if (selectedThickness === 'thick') {
        ctx.lineWidth = 10
        ctx.radius = 5
    }
    whichActived(selectedThickness,'thickness')

}
function whichActived(target,parentID){//给选中的加active
    let parentNode
    if(parentID === 'color'){
        parentNode = color
    } else if (parentID === 'thickness') {
        parentNode = thickness
    }
    for(let i=0; i< parentNode.children.length;i++){
        if(target === parentNode.children[i].id){
            parentNode.children[i].className = 'active'
        }else{
            parentNode.children[i].className = ""
        }
    }
}


