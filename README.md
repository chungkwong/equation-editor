# An easy-to-use equation editor for the web

## Features

1. **Graphical interface**. You can insert symbols, subscripts, superscripts, fractions, square roots and others by clicking buttons.
2. **Selection by dragging**. You can select part of an equation for removal or alter.
3. **LaTeX support**. You can type in a meaningful subset of LaTeX and get the corresponding equation exactly.
4. **Extensive keyboard support for navigation**. You can move cursor and modify selection with keys such as `LeftArrow`, `RightArrow`, `Home`, and `End` (possibly with modifiers such as `Shift` and `Ctrl`) in a way similiar to ordinary text editors.
5. **Copy-and-paste support**. You can move part of an equation freely.
6. **True WYSIWYG (What you see is what you get)**. You can see equations rendered with MathJax as you edit, so high-quality typography is expected.

## [Demo](http://chungkwong.cc/equation-editor/equation-editor.html)

## Usage

Consult the following example:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <script type="text/javascript" src="equation-editor.js"></script>
    <link rel="stylesheet" type="text/css" href="equation-editor.css">
  </head>
  <body>
    <h2>Equation editor by Chungkwong Chan</h2>
    <div id='EquationEditor'></div>
    LaTeX:
    <div id='LatexOutput'></div>
    MathML:
    <div id='MathmlOutput'></div>
    <script>
      var latexOutput=document.getElementById('LatexOutput');
      var mathmlOutput=document.getElementById('MathmlOutput');
      var equationEditor=createEquationEditor(document.getElementById('EquationEditor'));
      equationEditor.addListener(function(){
        latexOutput.textContent=equationEditor.getLatex();
        mathmlOutput.textContent=equationEditor.getMathml();
      });
      window.onload=function(){
        equationEditor.setMathml('<mrow><mi>x</mi><mo>=</mo><mfrac><mrow><mo>-</mo><mi>b</mi><mo>±</mo><msqrt><mrow><msup><mrow><mi>b</mi></mrow><mrow><mn>2</mn></mrow></msup><mo>-</mo><mn>4</mn><mi>a</mi><mi>c</mi></mrow></msqrt></mrow><mrow><mn>2</mn><mi>a</mi></mrow></mfrac></mrow>');
      };
    </script>
  </body>
</html>
```

## License

Copyright (c) 2020, Chungkwong Chan

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

    (1) Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer. 

    (2) Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in
    the documentation and/or other materials provided with the
    distribution.  
    
    (3)The name of the author may not be used to
    endorse or promote products derived from this software without
    specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.

# 在网页上轻松编辑数学公式

## 特点

1. **图形介面**。您可以通过点击插入符号、上下标、分式、根号等等。
2. **灵活的选区机制**。您可以用鼠标选区以便修改或移除。
3. **兼容LaTeX**。您可以盲打LaTeX（的一个实用的子集）而直接得到相应的公式。
4. **完善的键盘导航**。您可以用`LeftArrow`、`RightArrow`、`Home`和`End`等键（或配合`Shift`和`Ctrl`）移动光标或修改选区，就像通常的文本编辑器一样。
5. **支持复制粘贴**。您可以灵活搬运数学公式及其组成部分。
6. **真正即见即所得**。您在编辑时可立刻看到用MathJax渲染的高质量公式。

## [演示](http://chungkwong.cc/equation-editor/equation-editor.html)

## 用法

参考以下例子:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <script type="text/javascript" src="equation-editor.js"></script>
    <link rel="stylesheet" type="text/css" href="equation-editor.css">
  </head>
  <body>
    <h2>Equation editor by Chungkwong Chan</h2>
    <div id='EquationEditor'></div>
    LaTeX:
    <div id='LatexOutput'></div>
    MathML:
    <div id='MathmlOutput'></div>
    <script>
      var latexOutput=document.getElementById('LatexOutput');
      var mathmlOutput=document.getElementById('MathmlOutput');
      var equationEditor=createEquationEditor(document.getElementById('EquationEditor'));
      equationEditor.addListener(function(){
        latexOutput.textContent=equationEditor.getLatex();
        mathmlOutput.textContent=equationEditor.getMathml();
      });
      window.onload=function(){
        equationEditor.setMathml('<mrow><mi>x</mi><mo>=</mo><mfrac><mrow><mo>-</mo><mi>b</mi><mo>±</mo><msqrt><mrow><msup><mrow><mi>b</mi></mrow><mrow><mn>2</mn></mrow></msup><mo>-</mo><mn>4</mn><mi>a</mi><mi>c</mi></mrow></msqrt></mrow><mrow><mn>2</mn><mi>a</mi></mrow></mfrac></mrow>');
      };
    </script>
  </body>
</html>
```

## 版权信息

版权所有 (c) 2020, 陈颂光

不论修改过与否，只要满足以下条件，以源或二进制形式再发布或使用都是被允许的：

    (1) 源代码的再发布必须保留上面版权声明、这些条件和下面的免责声明。 

    (2) 二进制形式的再发布必须在文档和/或其它随发布提供的材料中重现
    上述上面版权声明、这些条件和下面的免责声明。
    
    (3) 在没有明确书面许可的情况下，作者的名称不能用于代言或推广衍生于这软件的产品。

作者仅提供本软件本身，不附带任何明示或暗示的保证, 包括但不限于暗示的适销性保证和
对特定用途的适应性。没有情况下作者要对任何直接、间接、意外、特殊、典型或后续的损失
（包括但不限于替代品或服务；可用性、数据或利润的损失；业务中断）负责，
不管怎样以任何方式使用本软件造成和在任何法律理论如合约、严格责任或民事
（包括过失或其它），即使已经被告知出现相关损失的可能性。
