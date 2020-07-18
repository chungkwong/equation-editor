var createEquationEditor=function(container){
  container.tabIndex=0;
  container.classList.add('equation-editor');
  var stacked=document.createElement('div');
  stacked.classList.add('equation-editor-stacked');
  var preview=document.createElement('div');
  preview.classList.add('equation-editor-preview');
  stacked.appendChild(preview);
  var treeSelection=document.createElement('span');
  treeSelection.classList.add('equation-editor-selection');
  stacked.appendChild(treeSelection);
  var anchorCursor=document.createElement('span');
  anchorCursor.classList.add('equation-editor-anchor');
  stacked.appendChild(anchorCursor);
  var caretCursor=document.createElement('span');
  caretCursor.classList.add('equation-editor-caret');
  stacked.appendChild(caretCursor);
  var hoverCaret=document.createElement('span');
  hoverCaret.classList.add('equation-editor-hover');
  stacked.appendChild(hoverCaret);
  container.appendChild(stacked);
  var commandPrompt=document.createElement('div');
  commandPrompt.classList.add('equation-editor-command');
  container.appendChild(commandPrompt)
  var toolbar=document.createElement('div');
  toolbar.classList.add('equation-editor-toolbar');
  container.appendChild(toolbar)
  var exchange=document.createElement('div');
  exchange.tabIndex=1000;
  exchange.classList.add('equation-editor-exchange');
  container.appendChild(exchange)
  var buffer=document.createElement('math');
  buffer.appendChild(document.createElement('mrow'));
  var changeListeners=[];
  var command='';
  var locations;
  var caretPositions
  var pieceCursor;
  var hover=null;
  var hoverCursor=-1;
  var dragAnchorStart=-1, dragAnchorEnd=-1;
  var caret=0,anchor=0;
  var pesudoClipboard='<mrow></mrow>';
  var historyRecoving=false;
  var historyList=[];
  var historyIndex=-1;
  var addAllBefore=function(tree,after){
    while(tree.firstElementChild){
      after.parentElement.insertBefore(tree.firstElementChild,after);
    }
  };
  var updateCaretPositions=function(root,ignoreStart,x,y){
    var type=root.tagName.toLowerCase();
    var rectangle=document.getElementById('i'+root.id).getBoundingClientRect();
    if(type=='mrow'){
      var upper=rectangle.top;
      var height=rectangle.height;
      var left=rectangle.left;
      var right;
      var j=0;
      var lastPosition=null;
      if(!ignoreStart){
        lastPosition={};
        if(root.childElementCount==0){
          right=rectangle.right;
          lastPosition.x=(left+right)*0.5-x;
        }else{
          var firstChildRectangle=document.getElementById('i'+root.firstChild.id).getBoundingClientRect();
          right=firstChildRectangle.left+0.25*firstChildRectangle.width;
          lastPosition.x=left-x;
        }
        lastPosition.rectangle=[left-x,right-x,upper-y,upper+height-y];
        lastPosition.parent=root;
        lastPosition.index=0;
        caretPositions.push(lastPosition);
      }
      var rootStart=caretPositions.length-1;
      for(;j<root.childElementCount;j++){
        let child=root.children[j];
        let childRectangle=document.getElementById('i'+child.id).getBoundingClientRect()
        let start=caretPositions.length-1;
        if(lastPosition!=null){
          lastPosition.deleteForward=()=>{
            root.removeChild(child);
            return start;
          };
        }
        lastPosition={};
        left=childRectangle.left+0.75*childRectangle.width;
        if(j+1<root.childElementCount){
          let nextChildRectangle=document.getElementById('i'+root.children[j+1].id).getBoundingClientRect();
          right=nextChildRectangle.left+nextChildRectangle.width*0.25;
          lastPosition.rectangle=[left-x,right-x,upper-y,upper+height-y];
          lastPosition.x=(nextChildRectangle.left+childRectangle.right)*0.5-x;
        }else{
          right=rectangle.right;
          lastPosition.rectangle=[left-x,right-x,upper-y,upper+height-y];
          lastPosition.x=right-x;
        }
        lastPosition.parent=root;
        lastPosition.index=j+1;
        lastPosition.deleteBackward=()=>{
          root.removeChild(child);
          return start;
        };
        updateCaretPositions(child,false,x,y);
        caretPositions.push(lastPosition);
        let end=caretPositions.length-1;
        pieceCursor.set(child,[start,end]);
      }
      pieceCursor.set(root,[rootStart,caretPositions.length-1]);
    }else if(type=='msub'||type=='msup'){
      var bStart=caretPositions.length-1;
      updateCaretPositions(root.children[0],true,x,y);
      var sStart=caretPositions.length, bEnd=sStart-1;
      updateCaretPositions(root.children[1],false,x,y);
      var sEnd=caretPositions.length-1;
      var flatStructure=function(){
        var b=root.children[0];
        var s=root.children[1];
        addAllBefore(b,root);
        addAllBefore(s,root);
        root.remove();
      };
      caretPositions[bStart].deleteForward=function(){
        root.children[0].children[0].remove();
        return bStart;
      };
      caretPositions[bEnd].deleteForward=function(){
        flatStructure();
        return bEnd;
      };
      caretPositions[sStart].deleteBackward=function(){
        flatStructure();
        return bEnd;
      };
      caretPositions[sEnd].deleteForward=function(){
        flatStructure();
        return sEnd-1;
      };
    }else if(type=='msubsup'){
      var bStart=caretPositions.length-1;
      updateCaretPositions(root.children[0],true,x,y);
      var subStart=caretPositions.length, bEnd=subStart-1;
      updateCaretPositions(root.children[1],false,x,y);
      var supStart=caretPositions.length, subEnd=supStart-1;
      updateCaretPositions(root.children[2],false,x,y);
      var supEnd=caretPositions.length-1;
      var flatStructure=function(){
        var b=root.children[0];
        var sub=root.children[1];
        var sup=root.children[2];
        addAllBefore(b,root);
        addAllBefore(sub,root);
        addAllBefore(sup,root);
        root.remove();
      };
      caretPositions[bStart].deleteForward=function(){
        root.children[0].children[0].remove();
        return bStart;
      };
      caretPositions[bEnd].deleteForward=function(){
        flatStructure();
        return bEnd;
      };
      caretPositions[subStart].deleteBackward=function(){
        flatStructure();
        return bEnd;
      };
      caretPositions[subEnd].deleteForward=function(){
        flatStructure();
        return subEnd-1;
      };
      caretPositions[supStart].deleteBackward=function(){
        flatStructure();
        return subEnd-1;
      };
      caretPositions[supEnd].deleteForward=function(){
        flatStructure();
        return supEnd-2;
      };
    }else if(type=='mfrac'){
      var nStart=caretPositions.length;
      updateCaretPositions(root.children[0],false,x,y);
      var dStart=caretPositions.length, nEnd=dStart-1;
      updateCaretPositions(root.children[1],false,x,y);
      var dEnd=caretPositions.length-1;
      var flatStructure=function(){
        var n=root.children[0];
        var d=root.children[1];
        addAllBefore(n,root);
        addAllBefore(d,root);
        root.remove();
      };
      caretPositions[nStart].deleteBackward=function(){
        flatStructure();
        return nStart-1;
      };
      caretPositions[nEnd].deleteForward=function(){
        flatStructure();
        return nEnd-1;
      };
      caretPositions[dStart].deleteBackward=function(){
        flatStructure();
        return nEnd-1;
      };
      caretPositions[dEnd].deleteForward=function(){
        flatStructure();
        return dEnd-2;
      };
    }else if(type=='msqrt'){
      var start=caretPositions.length;
      updateCaretPositions(root.children[0],false,x,y);
      var end=caretPositions.length-1;
      var flatStructure=function(){
        var r=root.children[0];
        addAllBefore(r,root);
        root.remove();
      };
      caretPositions[start].deleteBackward=function(){
        flatStructure();
        return start-1;
      };
      caretPositions[end].deleteForward=function(){
        flatStructure();
        return end-1;
      };
    }else if(type=='mroot'){
      var pStart=caretPositions.length;
      updateCaretPositions(root.children[1],false,x,y);
      var rStart=caretPositions.length, pEnd=rStart-1;
      updateCaretPositions(root.children[0],false,x,y);
      var rEnd=caretPositions.length-1;
      var flatStructure=function(){
        var r=root.children[0];
        var p=root.children[1];
        while(r.firstElementChild){
          p.appendChild(r.firstElementChild);
        }
        var sqrt=document.createElement('msqrt');
        sqrt.appendChild(p);
        root.parentElement.replaceChild(sqrt,root);
      };
      caretPositions[pStart].deleteBackward=function(){
        flatStructure();
        return pStart;
      };
      caretPositions[pEnd].deleteForward=function(){
        flatStructure();
        return pEnd;
      };
      caretPositions[rStart].deleteBackward=function(){
        flatStructure();
        return pEnd;
      };
      caretPositions[rEnd].deleteForward=function(){
        flatStructure();
        return rEnd-1;
      };
    }else if(type=='mi'||type=='mo'||type=='mn'){

    }else{
      for(var k=0;k<root.childElementCount;k++){
        updateCaretPositions(root.children[k],false,x,y);
      }
      return;
    }
    locations.push({
      piece:root,
      rectangle:[rectangle.left-x,rectangle.right-x,rectangle.top-y,rectangle.bottom-y]
    });
  }
  var uniqueId=0;
  var deepCopy=function(old){
    old.id='math'+uniqueId;
    var result=document.createElement(old.tagName);
    result.id='imath'+uniqueId;
    if(old.childElementCount==0){
      if(old.tagName.toLowerCase()=='mrow'){
        var placeholder=document.createElement('mo');
        placeholder.classList.add('equation-editor-placeholder')
        placeholder.textContent='□';
        result.appendChild(placeholder);
      }else{
        result.textContent=old.textContent;
      }
    }
    ++uniqueId;
    for(var i=0;i<old.childElementCount;i++){
      result.appendChild(deepCopy(old.children[i]));
    }
    return result;
  };
  var displayEquation=function(){
    for(let [piece,interval] of pieceCursor){
      if(interval[0]>=Math.min(anchor,caret)&&Math.max(anchor,caret)>=interval[1]){
          document.getElementById('i'+piece.id).classList.add('equation-editor-highlighted');
        }else{
          document.getElementById('i'+piece.id).classList.remove('equation-editor-highlighted');
        }
    }
    var anchorPosition=caretPositions[anchor];
    anchorCursor.style.left=anchorPosition.x+'px';
    anchorCursor.style.top=anchorPosition.rectangle[2]+'px';
    anchorCursor.style.height=anchorPosition.rectangle[3]-anchorPosition.rectangle[2]+'px';
    var caretPosition=caretPositions[caret];
    caretCursor.style.left=caretPosition.x+'px';
    caretCursor.style.top=caretPosition.rectangle[2]+'px';
    caretCursor.style.height=caretPosition.rectangle[3]-caretPosition.rectangle[2]+'px';
    if(anchor!=caret){
      var pair=getTreeSelection();
      var start=caretPositions[pair[0]];
      var end=caretPositions[pair[1]];
      treeSelection.style.left=start.x-1+'px';
      treeSelection.style.top=start.rectangle[2]-1+'px';
      treeSelection.style.width=end.x+2-start.x+'px';
      treeSelection.style.height=start.rectangle[3]+2-start.rectangle[2]+'px';
      treeSelection.style.visibility='visible';
    }else{
      treeSelection.style.visibility='hidden';
    }
  }
  var updateEquation=function(){
    caretPositions=[];
    locations=[];
    pieceCursor=new Map();
    hover=null;
    hoverCursor=-1;
    dragAnchorStart=dragAnchorEnd=-1;
    hoverCaret.style.visibility='hidden';
    preview.textContent='';
    var math=document.createElement('math');
    math.appendChild(deepCopy(buffer.firstElementChild));
    preview.appendChild(math);
    window.MathJax.typeset([preview]);
    var rect=stacked.getBoundingClientRect();
    updateCaretPositions(buffer.firstElementChild,false,rect.x,rect.y);
    if(!historyRecoving){
      var historyRecord={'caret':caret,'anchor':anchor,'mathml':buffer.innerHTML};
      ++historyIndex;
      historyList.splice(historyIndex);
      historyList.push(historyRecord);
    }
    displayEquation();
    for(let listener of changeListeners){
      listener();
    }
  }
  var getCaretPositionCount=function(equation){
    var count=0;
    for(var i=0;i<equation.childElementCount;i++){
      count+=getCaretPositionCount(equation.children[i]);
    }
    var type=equation.tagName.toLowerCase();
    if(type=='mrow'){
      count+=equation.childElementCount+1;
    }else if(type=='msub'||type=='msup'||type=='msubsup'){
      --count;
    }
    return count;
  }
  var removeSelection=function(){
    if(caret==anchor){
      return document.createElement('mrow');
    }else{
      var tree=getTreeSelection();
      var start=tree[0];
      var end=tree[1];
      var mrow=document.createElement('mrow');
      for(var i=caretPositions[start].index,j=i;i<caretPositions[end].index;i++){
        mrow.appendChild(caretPositions[start].parent.children[j]);
      }
      caret=anchor=start;
      return mrow;
    }
  }
  var getSelection=function(){
    if(caret==anchor){
      return document.createElement('mrow');
    }else{
      var tree=getTreeSelection();
      var start=tree[0];
      var end=tree[1];
      var mrow=document.createElement('mrow');
      for(var i=caretPositions[start].index;i<caretPositions[end].index;i++){
        mrow.appendChild(caretPositions[start].parent.children[i].cloneNode(true));
      }
      return mrow;
    }
  }
  var getTreeSelection=function(){
    var from=Math.min(caret,anchor);
    var to=Math.max(caret,anchor);
    var start=from;
    var end=to;
    for(var i=from;i<=to;i++){
      var position=caretPositions[i];
      var index=position.index;
      var children=position.parent.children;
      if(i<to&&index<children.length){
        var tmp=pieceCursor.get(children[index])[1];
        if(tmp>end){
          end=tmp;
        }
      }
      if(i>from&&index>0){
        var tmp=pieceCursor.get(children[index-1])[0];
        if(tmp<start){
          start=tmp;
        }
      }
    }
    if(caretPositions[start].parent!=caretPositions[end].parent){
      for(var i=from-1;i>=0;i--){
        var position=caretPositions[i];
        var index=position.index;
        var children=position.parent.children;
        if(index<children.length){
          var tmp=pieceCursor.get(children[index])[1];
          if(tmp>=end){
            start=i;
            end=tmp;
            break;
          }
        }
      }
    }
    return [start,end];
  }
  var insert=function(element,offset){
    var position=caretPositions[caret];
    if(position.index<position.parent.childElementCount){
      position.parent.insertBefore(element,position.parent.children[position.index]);
    }else{
      position.parent.appendChild(element);
    }
    caret+=offset;
    anchor=caret;
  }
  var moveAnchorAndCaretForward=function(){
    if(caret!=anchor){
      caret=anchor=Math.max(caret,anchor);
    }else if(caret+1<caretPositions.length){
      ++caret;
      ++anchor;
    }
    displayEquation();
  }
  var moveAnchorAndCaretBackward=function(){
    if(caret!=anchor){
      caret=anchor=Math.min(caret,anchor);
    }else if(caret>0){
      --caret;
      --anchor;
    }
    displayEquation();
  }
  var moveCaretForward=function(){
    if(caret+1<caretPositions.length){
      ++caret;
    }
    displayEquation();
  }
  var moveCaretBackward=function(){
    if(caret>0){
      --caret;
    }
    displayEquation();
  }
  var moveCaretNext=function(){
    var position=caretPositions[caret];
    if(position.index<position.parent.childElementCount){
      caret=pieceCursor.get(position.parent.children[position.index])[1];
      displayEquation();
    }else{
      moveCaretForward();
    }
  }
  var moveCaretPrevious=function(){
    var position=caretPositions[caret];
    if(position.index>0){
      caret=pieceCursor.get(position.parent.children[position.index-1])[0];
      displayEquation();
    }else{
      moveCaretBackward();
    }
  }
  var moveAnchorAndCaretNext=function(){
    var position=caretPositions[caret];
    if(caret==anchor&&position.index<position.parent.childElementCount){
      anchor=caret=pieceCursor.get(position.parent.children[position.index])[1];
      displayEquation();
    }else{
      moveAnchorAndCaretForward();
    }
  }
  var moveAnchorAndCaretPrevious=function(){
    var position=caretPositions[caret];
    if(caret==anchor&&position.index>0){
      anchor=caret=pieceCursor.get(position.parent.children[position.index-1])[0];
      displayEquation();
    }else{
      moveAnchorAndCaretBackward();
    }
  }
  var moveAnchorAndCaretEquationStart=function(){
    caret=anchor=0;
    displayEquation();
  }
  var moveAnchorAndCaretEquationEnd=function(){
    caret=anchor=caretPositions.length-1;
    displayEquation();
  }
  var moveCaretEquationStart=function(){
    caret=0;
    displayEquation();
  }
  var moveCaretEquationEnd=function(){
    caret=caretPositions.length-1;
    displayEquation();
  }
  var moveAnchorAndCaretRowStart=function(){
    caret=anchor=pieceCursor.get(caretPositions[caret].parent)[0];
    displayEquation();
  }
  var moveAnchorAndCaretRowEnd=function(){
    caret=anchor=pieceCursor.get(caretPositions[caret].parent)[1];
    displayEquation();
  }
  var moveCaretRowStart=function(){
    caret=pieceCursor.get(caretPositions[caret].parent)[0];
    displayEquation();
  }
  var moveCaretRowEnd=function(){
    caret=pieceCursor.get(caretPositions[caret].parent)[1];
    displayEquation();
  }
  var deleteSelection=function(){
    var from=Math.max(caret,anchor);
    var to=Math.min(caret,anchor);
    var stack=new Map();
    for(var i=from;i>=to;i--){
      var pair=caretPositions[i];
      if(stack.has(pair.pair)){
        pair.parent.removeChild(pair.parent.children[pair.index]);
      }
      stack.set(pair.parent,pair.index);
    }
    caret=anchor=to;
  }
  var deleteForward=function(){
    if(caret!=anchor){
      deleteSelection();
    }else if(caretPositions[caret].deleteForward){
      caret=anchor=caretPositions[caret].deleteForward();
    }
    updateEquation();
  }
  var deleteBackward=function(){
    if(caret!=anchor){
      deleteSelection();
    }else if(caretPositions[caret].deleteBackward){
      anchor=caret=caretPositions[caret].deleteBackward();
    }
    updateEquation();
  }
  var insertFraction=function(){
    var a=removeSelection();
    var b=document.createElement('mrow');
    var fraction=document.createElement('mfrac');
    fraction.appendChild(a);
    fraction.appendChild(b);
    insert(fraction,a.childElementCount==0?1:getCaretPositionCount(a)+1);
    updateEquation();
  }
  var insertSquareRoot=function(){
    var a=removeSelection();
    var sqrt=document.createElement('msqrt');
    sqrt.appendChild(a);
    insert(sqrt,a.childElementCount==0?1:getCaretPositionCount(a)+1);
    updateEquation();
  }
  var insertNthRoot=function(){
    var a=removeSelection();
    var b=document.createElement('mrow');
    var sqrt=document.createElement('mroot');
    sqrt.appendChild(a);
    sqrt.appendChild(b);
    insert(sqrt,1);
    updateEquation();
  }
  var startPower=function(){
    var pos=Math.min(caret,anchor);
    if(pos>0&&caretPositions[pos].index==0){
      var parent=caretPositions[pos-1];
      if(parent.index<parent.parent.childElementCount){
        var sqrt=parent.parent.children[parent.index];
        if(sqrt.tagName.toLowerCase()=='msqrt'){
          var a=removeSelection();
          var mroot=document.createElement('mroot');
          mroot.appendChild(sqrt.firstElementChild);
          mroot.appendChild(a);
          parent.parent.replaceChild(mroot,sqrt);
          anchor+=a.childElementCount==0?0:getCaretPositionCount(a);
          caret=anchor;
          updateEquation();
          return true;
        }
      }
    }
    return false;
  }
  var endPower=function(){
    if(caret==anchor){
      var parent=caretPositions[caret];
      if(parent.index==parent.parent.children.length){
        var lv=0;
        for(var i=0;i<parent.parent.childElementCount;i++){
          var piece=parent.parent.children[i];
          if(piece.tagName.toLowerCase()=='mo'){
            var symbol=piece.textContent;
            if("["==symbol){
              ++lv;
            }else if("]"==symbol){
              --lv;
            }
          }
        }
        if(lv==0){
          moveAnchorAndCaretForward();
          return true;
        }
      }
    }
    return false;
  }
  var insertSub=function(){
    var a=removeSelection();
    var position=caretPositions[caret];
    if(position.index>0){
      var last=position.parent.children[position.index-1].cloneNode(true);
      if(last.tagName.toLowerCase()=='msup'){
        let subsup=document.createElement('msubsup');
        subsup.appendChild(last.firstChild);
        subsup.appendChild(a);
        subsup.appendChild(last.firstChild);
        position.parent.replaceChild(subsup,position.parent.children[position.index-1]);
        caret-=getCaretPositionCount(subsup.children[2]);
      }else{
        var base=document.createElement('mrow');
        base.appendChild(last);
        var sub=document.createElement('msub');
        sub.appendChild(base);
        sub.appendChild(a);
        position.parent.replaceChild(sub,position.parent.children[position.index-1]);
        caret+=getCaretPositionCount(a);
      }
      anchor=caret;
    }else{
      var sub=document.createElement('msub');
      sub.appendChild(document.createElement('mrow'));
      sub.appendChild(a);
      insert(sub,getCaretPositionCount(a));
    }
    updateEquation();
  }
  var insertSup=function(){
    var a=removeSelection();
    var position=caretPositions[caret];
    if(position.index>0){
      var last=position.parent.children[position.index-1].cloneNode(true);
      if(last.tagName.toLowerCase()=='msub'){
        var subsup=document.createElement('msubsup');
        subsup.appendChild(last.firstChild);
        subsup.appendChild(last.firstChild);
        subsup.appendChild(a);
        position.parent.replaceChild(subsup,position.parent.children[position.index-1]);
        caret+=getCaretPositionCount(a)-1;
      }else{
        var base=document.createElement('mrow');
        base.appendChild(last);
        var sub=document.createElement('msup');
        sub.appendChild(base);
        sub.appendChild(a);
        position.parent.replaceChild(sub,position.parent.children[position.index-1]);
        caret+=getCaretPositionCount(a);
      }
      anchor=caret;
    }else{
      var sub=document.createElement('msup');
      sub.appendChild(document.createElement('mrow'));
      sub.appendChild(a);
      insert(sub,getCaretPositionCount(a));
    }
    updateEquation();
  }
  var selectAll=function(){
    anchor=0;
    caret=caretPositions.length-1;
    displayEquation();
  }
  var writeToClipboard=function(text){
    pesudoClipboard=text;
    exchange.textContent=text;
    exchange.focus();
    document.getSelection().removeAllRanges();
    var range=new Range();
    range.selectNodeContents(exchange);
    document.getSelection().addRange(range);
    document.execCommand('copy');
    exchange.textContent='';
    container.focus();
  }
  var readFromClipboard=function(){
    exchange.focus();
    document.execCommand('paste');
    var text=exchange.textContent;
    exchange.textContent='';
    container.focus();
    return text;
  };
  var cut=function(){
    // navigator.clipboard.writeText(removeSelection().outerHTML.replace(/ id=[^>]*/g,''));
    writeToClipboard(removeSelection().outerHTML.replace(/ id=[^>]*/g,''));
    updateEquation();
  }
  var copy=function(){
    // navigator.clipboard.writeText(getSelection().outerHTML.replace(/ id=[^>]*/g,''));
    writeToClipboard(getSelection().outerHTML.replace(/ id=[^>]*/g,''));
  }
  var pasteText=function(text){
    removeSelection();
    var math=document.createElement('math');
    math.innerHTML=text;
    var child;
    anchor=caret;
    for(var i=0;i<math.childElementCount;i++){
      child=math.children[i];
      insert(child,getCaretPositionCount(child)-1);
    }
    updateEquation();
  };
  var paste=function(){
    // var text=readFromClipboard();
    if(navigator.clipboard){
      navigator.clipboard.readText().then(pasteText);
    }else{
      pasteText(pesudoClipboard);
    }
  }
  var undo=function(){
    historyRecoving=true;
    if(historyIndex>0){
      --historyIndex;
      var historyRecord=historyList[historyIndex];
      caret=historyRecord.caret;
      anchor=historyRecord.anchor;
      buffer.innerHTML=historyRecord.mathml;
      updateEquation();
    }
    historyRecoving=false;
  };
  var redo=function(){
    historyRecoving=true;
    if(historyIndex+1<historyList.length){
      ++historyIndex;
      var historyRecord=historyList[historyIndex];
      caret=historyRecord.caret;
      anchor=historyRecord.anchor;
      buffer.innerHTML=historyRecord.mathml;
      updateEquation();
    }
    historyRecoving=false;
  };
  var insertSymbol=function(name){
    removeSelection();
    var type;
    if(/\d/.test(name)){
      type='mn';
    }else if(name.toUpperCase()!=name||name.toLowerCase()!=name){
      type='mi'
    }else{
      type='mo';
    }
    var symbol=document.createElement(type);
    symbol.textContent=name;
    insert(symbol,1);
    updateEquation();

  }
  var addStructureIcon=function(icon,action,tooltip){
    var button=document.createElement('button');
    button.onclick=action;
    button.innerHTML=icon;
    button.title=tooltip;
    toolbar.appendChild(button);
  };
  addStructureIcon('<math><msub><mi>■</mi><mi>□</mi></msub></math>',insertSub,'Suscript');
  addStructureIcon('<math><msup><mi>■</mi><mi>□</mi></msup></math>',insertSup,'Superscript');
  addStructureIcon('<math><mfrac><mi>□</mi><mi>■</mi></mfrac></math>',insertFraction,'Fraction');
  addStructureIcon('<math><msqrt><mi>□</mi></msqrt></math>',insertSquareRoot,'Square root');
  addStructureIcon('<math><mroot><mi>□</mi><mi>■</mi></mroot></math>',insertNthRoot,'Nth root');
  addStructureIcon('↶',undo,'Undo');
  addStructureIcon('↷',redo,'Redo');
  addStructureIcon('◁',moveAnchorAndCaretBackward,'Move caret backward');
  addStructureIcon('▷',moveAnchorAndCaretForward,'Move caret forward');
  addStructureIcon('⌫',deleteBackward,'Delete backward');
  addStructureIcon('⌦',deleteForward,'Delete forward');
  addStructureIcon('✂',cut,'Cut')
  addStructureIcon('⎘',paste,'Paste')
  var addSymbolIcon=function(element){
    var button=document.createElement('button');
    button.onclick=function(){
      removeSelection();
      insert(element.cloneNode(true),1);
      updateEquation();
    };
    var math=document.createElement('math');
    math.append(element);
    button.appendChild(math);
    toolbar.appendChild(button);
  }
  var addNumberIcon=function(name){
    var symbol=document.createElement('mn');
    symbol.textContent=name;
    addSymbolIcon(symbol);
  }
  var addOperatorIcon=function(name){
    var symbol=document.createElement('mo');
    symbol.textContent=name;
    addSymbolIcon(symbol);
  }
  var addVariableIcon=function(name){
    var symbol=document.createElement('mi');
    symbol.textContent=name;
    addSymbolIcon(symbol);
  }
  var numbers=['0','1','2','3','4','5','6','7','8','9'];
  for(i in numbers){
    addNumberIcon(numbers[i])
  }
  var variables=['a','b','c','d','e','f','g','h','i','j','k',
  'l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
  'A','B','C','E','F','G','H','I','L','M','N','P','R','S','T','V','X','Y',
  '∞','Δ','α','β','γ','θ','λ','µ','π','σ','ϕ'];
  for(i in variables){
    addVariableIcon(variables[i])
  }
  var operators=['∑','∫','lim','log','sin','cos','tan',
  '=','≠','≥','≤','∈','→','∀','∃','±','+','-','×',
  '÷','/','!','.',',','…','(',')','[',']','{','}','|'];
  for(i in operators){
    addOperatorIcon(operators[i])
  }
  var COMMANDS=new Map();
  COMMANDS.set("\\{","{");
  COMMANDS.set("\\}","}");
  COMMANDS.set("\\alpha","α");
  COMMANDS.set("\\beta","β");
  COMMANDS.set("\\cos","cos");
  COMMANDS.set("\\Delta","Δ");
  COMMANDS.set("\\div","÷");
  COMMANDS.set("\\exists","∃");
  COMMANDS.set("\\forall","∀");
  COMMANDS.set("\\frac",insertFraction);
  COMMANDS.set("\\gamma","γ");
  COMMANDS.set("\\geq","≥");
  COMMANDS.set("\\in","∈");
  COMMANDS.set("\\int","∫");
  COMMANDS.set("\\lambda","λ");
  COMMANDS.set("\\ldots","…");
  COMMANDS.set("\\leq","≤");
  COMMANDS.set("\\lim","lim");
  COMMANDS.set("\\log","log");
  COMMANDS.set("\\mu","µ");
  COMMANDS.set("\\neq","≠");
  COMMANDS.set("\\phi","ϕ");
  COMMANDS.set("\\pi","π");
  COMMANDS.set("\\pm","±");
  COMMANDS.set("\\rightarrow","→");
  COMMANDS.set("\\sigma","σ");
  COMMANDS.set("\\sin","sin");
  COMMANDS.set("\\sqrt",insertSquareRoot);
  COMMANDS.set("\\sum","∑");
  COMMANDS.set("\\tan","tan");
  COMMANDS.set("\\theta","θ");
  COMMANDS.set("\\times","×");
  COMMANDS.set("\\infty","∞");
  var fireCommand=function(name){
    var action=COMMANDS.get(name);
    if(typeof(action)=='string'){
      insertSymbol(action);
    }else{
      action();
    }
  }
  var updateCommand=function(newCommand){
    command=newCommand;
    commandPrompt.textContent='';
    if(command.length==0)
      return;
    var span=document.createElement('span');
    span.textContent=command;
    commandPrompt.appendChild(span);
    for(let [key,value] of COMMANDS){
      if(key.startsWith(command)){
        let button=document.createElement('button');
        button.textContent=commandPrompt.childElementCount+'. '+key;
        button.onclick=function(){
          fireCommand(key);
          updateCommand('');
        };
        commandPrompt.appendChild(button);
        if(commandPrompt.childElementCount>5){
          break;
        }
      }
    }
  }
  container.onkeydown=function(e){
    switch(e.key){
      case 'ArrowLeft':
        if(e.shiftKey){
          if(e.ctrlKey){
            moveCaretPrevious();
          }else{
            moveCaretBackward();
          }
        }else{
          if(e.ctrlKey){
            moveAnchorAndCaretPrevious();
          }else{
            moveAnchorAndCaretBackward();
          }
        }
        break;
      case 'ArrowRight':
        if(e.shiftKey){
          if(e.ctrlKey){
            moveCaretNext();
          }else{
            moveCaretForward();
          }
        }else{
          if(e.ctrlKey){
            moveAnchorAndCaretNext();
          }else{
            moveAnchorAndCaretForward();
          }
        }
        break;
      case 'Home':
        if(e.shiftKey){
          if(e.ctrlKey){
            moveCaretEquationStart();
          }else{
            moveCaretRowStart();
          }
        }else{
          if(e.ctrlKey){
            moveAnchorAndCaretEquationStart();
          }else{
            moveAnchorAndCaretRowStart();
          }
        }
        break;
      case 'End':
        if(e.shiftKey){
          if(e.ctrlKey){
            moveCaretEquationEnd();
          }else{
            moveCaretRowEnd();
          }
        }else{
          if(e.ctrlKey){
            moveAnchorAndCaretEquationEnd();
          }else{
            moveAnchorAndCaretRowEnd();
          }
        }
        break;
      case 'Delete':
        deleteForward();
        break;
      case 'Backspace':
        if(command.length==0){
          deleteBackward();
        }else{
          updateCommand(command.substring(0,command.length-1));
        }
        break;
      default:
        if(e.ctrlKey){
          switch(e.key){
            case 'a':selectAll();return;
            case 'c':copy();return;
            case 'x':cut();return;
            case 'v':paste();return;
            case 'z':undo();return;
            case 'y':redo();return;
          }
        }
        if(!e.isComposing){
          if(command.length>0){
            if(/^[a-zA-Z]$/.test(e.key)){
              updateCommand(command+e.key);
              break;
            }else if(/^[1-9]$/.test(e.key)){
              var selected=parseInt(e.key);
              if(selected<commandPrompt.childElementCount){
                commandPrompt.children[selected].click();
                break;
              }else{
                updateCommand('');
              }
            }else if(command.length==1){
              command+=e.key;
              if(COMMANDS.has(command)){
                fireCommand(command);
              }
              updateCommand('');
              break;
            }else{
              if(commandPrompt.childElementCount>1){
                commandPrompt.children[1].click();
              }else{
                updateCommand('');
              }
              if(e.key=='Enter'||e.key=='Tab'||e.key==' ')
                break;
            }
          }
          switch(e.key){
            case '_':
              insertSub();
              break;
            case '^':
              insertSup();
              break;
            case '{':
              break;
            case '}':
              moveAnchorAndCaretRowEnd();
              moveAnchorAndCaretForward();
              break;
            case '[':
              if(!startPower())
                insertSymbol('[');
              break;
            case ']':
              if(!endPower())
                insertSymbol(']');
              break;
            case '\\':
              updateCommand('\\');
              break;
            default:
              if(e.key.length==1){
                insertSymbol(e.key);
              }else{
                return;
              }
              break;
          }
        }
        break;
    }
    e.preventDefault();
  };
  var updateHover=function(e){
    var origin=preview.getBoundingClientRect();
    var x=e.x-origin.x;
    var y=e.y-origin.y;
    var newHoverCursor=-1;
    var bestArea=Infinity;
    for(var i=0;i<caretPositions.length;i++){
      var val=caretPositions[i].rectangle;
      if(val[0]<=x&&x<=val[1]&&val[2]<=y&&y<=val[3]){
        var area=(val[1]-val[0])*(val[3]-val[2]);
        if(area<bestArea){
          bestArea=area;
          newHoverCursor=i;
        }
      }
    }
    if(newHoverCursor!=-1){
      if(newHoverCursor==hoverCursor){
        return;
      }
      if(hover!=null){
        document.getElementById('i'+hover.id).classList.remove('equation-editor-current');
        hover=null;
      }
      hoverCursor=newHoverCursor;
      var position=caretPositions[newHoverCursor];
      hoverCaret.style.left=position.x+'px';
      hoverCaret.style.top=position.rectangle[2]+'px';
      hoverCaret.style.height=position.rectangle[3]-position.rectangle[2]+'px';
      hoverCaret.style.visibility='visible';
      preview.style.cursor='text';
    }else{
      hoverCaret.style.visibility='hidden';
      hoverCursor=-1;
      var subPiece=null;
      for(let entry of locations){
        var key=entry.piece;
        var val=entry.rectangle;
        if(val[0]<=x&&x<=val[1]&&val[2]<=y&&y<=val[3]){
          var area=(val[1]-val[0])*(val[3]-val[2]);
          if(area<=bestArea){
            bestArea=area;
            subPiece=key;
          }
        }
      }
      if(subPiece==hover){
        return;
      }
      if(hover!=null){
        document.getElementById('i'+hover.id).classList.remove('equation-editor-current');
        hover=null;
      }
      if(subPiece!=null){
        hover=subPiece;
        document.getElementById('i'+hover.id).classList.add('equation-editor-current');
      }
      preview.style.cursor='grab';
    }
  };
  preview.onmousemove=function(e){
    if(e.buttons==1){
      if(dragAnchorStart==-1){
        if(hover!=null){
          var pair=pieceCursor.get(hover);
          dragAnchorStart=pair[0];
          dragAnchorEnd=pair[1];
        }else if(hoverCursor!=-1){
          dragAnchorStart=dragAnchorEnd=hoverCursor;
        }
      }
      updateHover(e);
      var dragCaretStart=-1;
      var dragCaretEnd=-1;
      if(hover!=null){
        var pair=pieceCursor.get(hover);
        dragCaretStart=pair[0];
        dragCaretEnd=pair[1];
      }else if(hoverCursor!=-1){
        dragCaretStart=dragCaretEnd=hoverCursor;
      }
      var newAnchor=anchor, newCaret=caret;
      if(dragCaretStart!=-1){
        if(dragAnchorStart!=-1){
          newAnchor=Math.min(Math.min(dragAnchorStart,dragAnchorEnd),Math.min(dragCaretStart,dragCaretEnd));
          newCaret=Math.max(Math.max(dragAnchorStart,dragAnchorEnd),Math.max(dragCaretStart,dragCaretEnd));
          if(dragCaretStart<dragAnchorStart){
            var tmp=newAnchor;
            newAnchor=newCaret;
            newCaret=tmp;
          }
        }else{
          newAnchor=dragAnchorStart=dragCaretStart;
          newCaret=dragAnchorEnd=dragCaretEnd;
        }
      }else{
        if(dragAnchorStart!=-1){
          newAnchor=dragAnchorStart;
          newCaret=dragAnchorEnd;
        }
      }
      if(newAnchor!=anchor||newCaret!=caret){
        anchor=newAnchor;
        caret=newCaret;
        displayEquation();
      }
    }else{
      updateHover(e);
    }
  };
  preview.parentElement.onmouseleave=function(e){
    if(hover!=null){
      document.getElementById('i'+hover.id).classList.remove('equation-editor-current');
      hover=null;
    }else if(hoverCursor!=-1){
      hoverCursor=-1;
      hoverCaret.style.visibility='hidden';
    }
  };
  container.onclick=function(){
    container.focus();
  };
  preview.onclick=function(e){
    updateHover(e);
    if(hoverCursor==caret&&hoverCursor==anchor){
      return;
    }
    var newAnchor=anchor, newCaret=caret;
    if(hover!=null){
      var pair=pieceCursor.get(hover);
      if(pair!=null){
        newAnchor=pair[0];
        newCaret=pair[1];
      }else{
        
      }
    }else if(hoverCursor!=-1){
      newAnchor=newCaret=hoverCursor;
    }
    if(newAnchor!=anchor||newCaret!=caret){
      anchor=newAnchor;
      caret=newCaret;
      displayEquation();
    }
  };
  preview.onmouseup=function(){
    dragAnchorStart=dragAnchorEnd=-1;
  };
  hoverCaret.style.visibility='hidden';
  var addListener=function(listener){
    changeListeners.push(listener);
  }
  var removeListener=function(listener){
    changeListeners.splice(changeListeners.indexOf(listener),1);
  }
  var getMathml=function(){
    return buffer.innerHTML.replace(/ id=[^>]*/g,'');
  };
  var latexMathml=[
    ["\\infty","∞"],["\\Delta","Δ"],["\\alpha","α"],["\\beta","β"],["\\gamma","γ"],["\\theta","θ"],["\\lambda","λ"],["\\mu","µ"],["\\pi","π"],["\\sigma","σ"],["\\phi","ϕ"],
    ["\\sum","∑"],["\\int","∫"],["\\lim","lim"],["\\log","log"],["\\sin","sin"],["\\cos","cos"],["\\tan","tan"],
    ["\\neq","≠"],["\\geq","≥"],["\\leq","≤"],["\\in","∈"],["\\rightarrow","→"],["\\forall","∀"],["\\exists","∃"],
    ["\\pm","±"],["\\times","×"],["\\div","÷"],["\\ldots","…"],["\\}","}"],["\\{","{"]];
  var mathml2latex=new Map();
  for(let pair of latexMathml){
    mathml2latex.set(pair[1],pair[0]);
  }
  var encodeLatex=function(root){
    var type=root.tagName.toLowerCase();
    if(type=='msub'){
      return encodeLatex(root.children[0])+'_{'+encodeLatex(root.children[1])+'}';
    }else if(type=='msup'){
      return encodeLatex(root.children[0])+'^{'+encodeLatex(root.children[1])+'}';
    }else if(type=='msubsup'){
      return encodeLatex(root.children[0])+'_{'+encodeLatex(root.children[1])+'}^{'+encodeLatex(root.children[2])+'}';
    }else if(type=='mfrac'){
      return '\\frac{'+encodeLatex(root.children[0])+'}{'+encodeLatex(root.children[1])+'}';
    }else if(type=='msqrt'){
      return '\\sqrt{'+encodeLatex(root.children[0])+'}';
    }else if(type=='mroot'){
      return '\\sqrt['+encodeLatex(root.children[1])+']{'+encodeLatex(root.children[0])+'}';
    }else if(type=='mi'||type=='mo'||type=='mn'){
      if(mathml2latex.has(root.textContent)){
        return mathml2latex.get(root.textContent)+' ';
      }else{
        return root.textContent;
      }
    }else{
      var code='';
      for(var j=0;j<root.childElementCount;j++){
        code+=encodeLatex(root.children[j]);
      }
      return code;
    }
  };
  var getLatex=function(){
    return encodeLatex(buffer.firstElementChild);
  };
  var setMathml=function(code){
    caret=0;
    anchor=0;
    buffer.innerHTML=code;
    updateEquation();
    selectAll();
    container.focus();
  }
  updateEquation();
  return {addListener:addListener,removeListener:removeListener,getMathml:getMathml,getLatex:getLatex,setMathml:setMathml};
};