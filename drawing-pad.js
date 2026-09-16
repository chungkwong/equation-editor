var createDrawingPad=function(container,colorList){
    canvas=document.createElement('canvas');
    canvas.style.touchAction = 'none';
    var lineWidth=3.0,halfLineWidth=lineWidth*0.5;
    var context=canvas.getContext('2d');
    context.lineWidth=lineWidth;
    context.fillStyle="black";
    var drawing=false,stylusOnly=false;
    var traces=[];
    var currentTrace=[];
    var updateColor=function(i){
        var currentColor=colorList[i%colorList.length];
        context.fillStyle=currentColor;
        context.strokeStyle=currentColor;
        context.lineWidth=lineWidth;
    };
    var drawstart=function(event){
        event.preventDefault();
        if(stylusOnly&&event.pointerType!='pen'){
            return;
        }
        updateColor(traces.length);
        context.beginPath();
        var x=event.pageX-canvas.offsetLeft;
        var y=event.pageY-canvas.offsetTop;
        context.moveTo(x,y);
        currentTrace.push([Math.round(x),Math.round(y)]);
        context.fillRect(x-halfLineWidth,y-halfLineWidth,lineWidth,lineWidth);
        drawing=true;
    };
    var drawmove=function(event){
        if(drawing){
            event.preventDefault();
            if(event.getCoalescedEvents){
                var pastEvents=event.getCoalescedEvents();
                for(var i in pastEvents){
                    var e=pastEvents[i];
                    var x=e.pageX-canvas.offsetLeft;
                    var y=e.pageY-canvas.offsetTop;
                    context.lineTo(x,y);
                    currentTrace.push([Math.round(x),Math.round(y)]);
                }
            }
            var x=event.pageX-canvas.offsetLeft;
            var y=event.pageY-canvas.offsetTop;
            context.lineTo(x,y);
            currentTrace.push([Math.round(x),Math.round(y)]);
            context.stroke();
        }
    };
    var drawend=function(event){
        if(drawing){
            event.preventDefault();
            //drawmove(event);
            traces.push(currentTrace);
            currentTrace=[];
            drawing=false;
        }
    };
    var drawcancel=function(event){
        if(drawing){
            event.preventDefault();
            currentTrace=[];
            drawing=false;
            canvas.setTraceList(canvas.getTraceList());
        }
    };
    canvas.addEventListener('pointerdown',drawstart, { passive: false });
    canvas.addEventListener('pointermove',drawmove, { passive: false });
    canvas.addEventListener('pointerup',drawend, { passive: false });
    canvas.addEventListener('pointercancel',drawcancel, { passive: false });
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
                context.fillRect(trace[0][0]-halfLineWidth,trace[0][1]-halfLineWidth,lineWidth,lineWidth);
            }
        }
    };
    canvas.clearTraceList=function(){
        canvas.setTraceList([]);
        canvas.focus();
    };
    canvas.removeLastTrace=function(){
        if(traces.length>0){
            traces.pop();
            canvas.setTraceList(traces);
            canvas.focus();
        }
    };
    canvas.setColorList=function(cList){
        colorList=cList;
    };
    canvas.setStylusOnly=function(value){
        stylusOnly=value;
    };
    return canvas;
}