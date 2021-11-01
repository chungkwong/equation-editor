var createDrawingPad=function(container,colorList){
    canvas=document.createElement('canvas');
    var lineWidth=3.0;
    var context=canvas.getContext('2d');
    context.lineWidth=lineWidth;
    context.fillStyle="black";
    var drawing=false;
    var traces=[];
    var currentTrace=[];
    var updateColor=function(i){
        var currentColor=colorList[i%colorList.length];
        context.fillStyle=currentColor;
        context.strokeStyle=currentColor;
        context.lineWidth=lineWidth;
    };
    var drawstart=function(event){
        updateColor(traces.length);
        context.beginPath();
        var x=event.pageX-canvas.offsetLeft;
        var y=event.pageY-canvas.offsetTop;
        context.moveTo(x,y);
        currentTrace.push([Math.round(x),Math.round(y)]);
        context.fillRect(x-lineWidth,y-lineWidth,2*lineWidth,2*lineWidth);
        drawing=true;
    };
    var drawmove=function(event){
        if(drawing){
            var x=event.pageX-canvas.offsetLeft;
            var y=event.pageY-canvas.offsetTop;
            context.lineTo(x,y);
            currentTrace.push([Math.round(x),Math.round(y)]);
            context.stroke();
        }
    };
    var drawend=function(event){
        if(drawing){
            //drawmove(event);
            traces.push(currentTrace);
            currentTrace=[];
            drawing=false;
        }
    };
    if('ontouchstart' in document.documentElement){
        canvas.addEventListener('touchstart',function(event){drawstart(event.touches[0]);});
        canvas.addEventListener('touchmove',function(event){drawmove(event.touches[0]);event.preventDefault();});
        canvas.addEventListener('touchend',function(event){drawend(event.changedTouches[0])});
    }else{
        canvas.addEventListener('mousedown',drawstart);
        canvas.addEventListener('mousemove',drawmove);
        canvas.addEventListener('mouseup',drawend);    
    }    
    container.appendChild(canvas);
    canvas.getTraceList=function(){
        return traces;
    };
    canvas.setTraceList=function(traceList){
        traces=traceList;
        context.fillStyle = "rgba(255,255,255,255)";
        context.fillRect(0,0,canvas.width,canvas.height);
        context.fillStyle="rgba(0,0,0,255)";
        for(var i in traceList){
            var trace=traceList[i];
            updateColor(i);
            if(trace.length>1){
                context.beginPath();
                context.moveTo(trace[0][0],trace[0][1]);
                for(var j=1;j<trace.length;j++){
                    context.lineTo(trace[j][0],trace[j][1]);
                }
                context.stroke();
            }else if(trace.length==1){
                context.fillRect(trace[0][0]-lineWidth,trace[0][1]-lineWidth,2*lineWidth,2*lineWidth);
            }
        }
    };
    canvas.clearTraceList=function(){
        canvas.setTraceList([]);
    };
    canvas.removeLastTrace=function(){
        if(traces.length>0){
            traces.pop();
            canvas.setTraceList(traces);
        }
    };
    canvas.setColorList=function(cList){
        colorList=cList;
    };
    return canvas;
}