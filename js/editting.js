/**
 * Created by Ps on 2017/1/2.
 */

var xmlhttp;
var str = "";
var constrainpair = [];
var selectwords = [];

$(function ($) {
	var myCP,myCP2;
    var num;
	myCP =new dhtmlXColorPicker({
		input:"wordColor",
		custom_colors:color[colorthemenum],
	    });
	myCP.setPosition("right");
	myCP.attachEvent("onChange",function(color){
		var bID = selectedBody.GetID();
		tagColor[bID] = color;
	});
	myCP.attachEvent("onSelect",function(color){
		var bID = selectedBody.GetID();
		tagColor[bID] = color;
	});
	myCP.attachEvent("onCancel",function(){
		var pre_color=document.getElementById("wordColor").style.backgroundColor;
		var bID=selectedBody.GetID();
		tagColor[bID]=pre_color;
		document.getElementById('wordColor').value="word color";
		return true;
	});
    myCP2 =new dhtmlXColorPicker({
        input:"wordsColor",
        custom_colors:color[colorthemenum],
    });
    myCP2.setPosition("top");
    myCP2.attachEvent("onChange",function(color){
        for(var i=0;i<selectwords.length;i++){
            var sID = selectwords[i];
            tagColor[sID] = color;
        }
    });
    myCP2.attachEvent("onSelect",function(color){
        for(var i=0;i<selectwords.length;i++){
            var sID = selectwords[i];
            tagColor[sID] = color;
        }
    });
    $('.nav-main>li[id]').hover(function(){
        /*图标向上旋转*/
        $(this).children().removeClass().addClass('hover-up');
        /*下拉框出现*/
        var Obj = $(this).attr('id');
        num = Obj.substring(3, Obj.length);
        $('#box-'+num).slideDown(300);
    },function(){
        /*图标向下旋转*/
        $(this).children().removeClass().addClass('hover-down');
        /*下拉框消失*/
        $('#box-'+num).hide();
    });
//    hidden-box hover e
    $('.hidden-box').hover(function(){
        /*保持图标向上*/
        $('#li-'+num).children().removeClass().addClass('hover-up');
        $(this).show();
    },function(){
        $(this).slideUp(200);
        $('#li-'+num).children().removeClass().addClass('hover-down');
    });
    $("#closeBtn").hover(function () {
        $(this).css({ color: 'black' }) }, function () { $(this).css({ color: '#999' }) }).on('click', function () {
        $("#LoadBox").fadeOut("fast");
    });
    $("#closeBtn2").hover(function () {
        $(this).css({ color: 'black' }) }, function () { $(this).css({ color: '#999' }) }).on('click', function () {
        $("#WordsList").fadeOut("fast");
    });
    $("#closeBtn3").hover(function () {
        $(this).css({ color: 'black' }) }, function () { $(this).css({ color: '#999' }) }).on('click', function () {
        $("#ConstrainList").fadeOut("fast");
    });
    $("#closeBtn4").hover(function () {
        $(this).css({ color: 'black' }) }, function () { $(this).css({ color: '#999' }) }).on('click', function () {
        $("#ShowWordsList").fadeOut("fast");
    });

    $(".dropdown dt a").click(function() {
        $(".dropdown dd ul").toggle();
    });

    $(".dropdown dd ul li a").click(function() {
        var text = $(this).html();
        $(".dropdown dt a span").html(text);
        $(".dropdown dd ul").hide();
        var selectnum = parseInt(getSelectedValue("sample"));
        colorthemenum = selectnum;
		myCP =new dhtmlXColorPicker({
			input:"wordColor",
			custom_colors:color[colorthemenum],
	    });
		myCP.setPosition("right");
		myCP.attachEvent("onChange",function(color){
			var bID = selectedBody.GetID();
			tagColor[bID] = color;
		});
		myCP.attachEvent("onSelect",function(color){
			var bID = selectedBody.GetID();
			tagColor[bID] = color;
		});
		myCP.attachEvent("onCancel",function(){
		var pre_color=document.getElementById("wordColor").style.backgroundColor;
		var bID=selectedBody.GetID();
		tagColor[bID]=pre_color;
		document.getElementById('wordColor').value="word color";
		return true;
	});
        for(var i=0;i<tagColor.length;i++)
        {
            tagColor[i] = createColor();
        }
    });

    function getSelectedValue(id) {
        return $("#" + id).find("dt a span.value").html();
    }

    $(document).bind('click', function(e) {
        var $clicked = $(e.target);
        if (! $clicked.parents().hasClass("dropdown"))
            $(".dropdown dd ul").hide();
    });
});

function LoadFile() {
    document.getElementById("filepath").innerHTML = "";
    document.getElementById("txt").value = "";
    var file=document.getElementById("fileinput");
    file.outerHTML += '';
    file.value = "";
    DestroyBody(true);
    preEditInfo = [];
    preEditPoint = 0;
    wordnum = 0;
    hasselect.flag = false;
    $("#LoadBox").fadeIn("slow");
}

function TextRead() {
    var file=document.getElementById("fileinput").files[0];
    if(file){
        var reader=new FileReader();
        reader.onload=function(e){
            var tx = e.target.result;
            str = tx;
        };
    }
    reader.readAsText(file);

    var path = (document.getElementById("fileinput").value).split("\\");
    var filename = path[path.length - 1];
    document.getElementById("filepath").innerHTML = filename;
}

function createXMLHttpRequest() {
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    }
    catch(e)
    {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        catch (oc)
        {
            xmlhttp = null;
        }
    }
    if(!xmlhttp && typeof XMLHttpRequest != "undefined")
    {
        xmlhttp = new XMLHttpRequest();
    }
    if(!xmlhttp) alert("xmlhttprequest failed");
    return xmlhttp;
}

function GetData() {
    //文件和输入框优先选择文本框信息读入
    var txt = "";
    if(document.all.txt.value != "")
    {
        txt = document.all.txt.value;
    }
    else if(str != "") txt = str;

    if(txt == "" || txt == undefined || txt == null)
        alert("Error! The text is empty.");
    else
    {
        createXMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4)
            {
                var myjson = xmlhttp.responseText;
                var data = eval("(" + myjson + ")");
                wo = data.wolistall[0];
                we = data.welistall[0];
                /*var showstr = "";
                for(var i=0;i<wo.length;i++)
                {
                    for(var j=0;j<30*we[i];j++)
                        showstr = showstr + wo[i] + " ";
                    showstr = showstr + "\n";
                }*/
                $("#LoadBox").fadeOut("fast");
                $("#WordsList").fadeIn("fase");
                CreateWordTable(true);
                constrainBody = [];
                CreateConstrainTable(true);
            }
        };
        xmlhttp.open("POST", "wordanalysis.jsp", "false");
        xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=utf-8");
        //xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlhttp.send("txt="+txt);
    }
}

function CreateWordTable(isstart) {
    $("#words_list").empty("");
    $("#words_list2").empty("");
    var table;
    if(isstart) table = document.getElementById("words_list");
    else table = document.getElementById("words_list2");
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    var tr = tbody.insertRow (0);
    if(isstart){
        var th = document.createElement("th");
        var ss = "word weight";
        th.innerHTML = ss;
        tr.appendChild (th);
    }
    else{
        var ss = ["word","weight"];
        for(var i=0;i<ss.length;i++){
            var th = document.createElement("th");
            th.innerHTML = ss[i];
            tr.appendChild (th);
        }
    }
    for (var i = 0; i < wo.length; i++)
    {
        var tr = tbody.insertRow (tbody.rows.length);
        tr.setAttribute("id",i);
        if(isstart){
            tr.setAttribute("onclick","selectLineForConstrain(this)");
            var ss = "" + wo[i] +" " + we[i];
            var td = tr.insertCell (tr.cells.length);
            td.innerHTML = ss;
        }
        else{
            tr.setAttribute("onclick","selectLineForDelete(this)");
            var ss = [wo[i],we[i]];
            for(var j=0;j<2;j++){
                var td = tr.insertCell (tr.cells.length);
                td.innerHTML = ss[j];
            }
        }
    }
}

function CreateConstrainTable(isstart) {
    $("#constrain_list").empty("");
    $("#constrain_list2").empty("");
    if(isstart) var table = document.getElementById("constrain_list");
    else var table = document.getElementById("constrain_list2");
    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    if(isstart)
    {
        var tr = tbody.insertRow (0);
        var ss = "  Constrain list";
        var th = document.createElement("th");
        th.innerHTML = ss;
        tr.appendChild (th);
        var tr = tbody.insertRow(tbody.rows.length);
        ss = "(Double click can remove constrain)";
        var td = tr.insertCell(tr.cells.length);
        td.innerHTML = ss;
        td.setAttribute("style","font-size:12px;text-align: left;");
    }
    for (var i = 0; i < constrainBody.length; i++)
    {
        ss="[";
        for(var j=0;j<constrainBody[i].length;j++)
        {
            ss = ss + wo[constrainBody[i][j]] + ",";
        }
        ss=ss.substring(0,ss.length-1);
        ss = ss +"]";
        var tr = tbody.insertRow (tbody.rows.length);
        tr.setAttribute("id",i);
        if(isstart)
        tr.setAttribute("ondblclick","DeleteLine(this,true)");
        else tr.setAttribute("ondblclick","DeleteLine(this,false)");
        var td = tr.insertCell (tr.cells.length);
        td.innerHTML = ss;
    }
}

function selectLineForConstrain(line) {
    if(typeof(line)   ==   "undefined "){
        alert('缺少参数');
    }
    else{
        var linenum = parseInt(line.id);
        if(constrainpair.indexOf(linenum) != -1)
            constrainpair.remove(linenum);
        else constrainpair.push(linenum);
        line.bgColor=line.bgColor==""?"#FFFF77":"";
    }
}

function selectLineForDelete(line) {
    if(typeof(line)   ==   "undefined "){
        alert('缺少参数');
    }
    else{
        var linenum = parseInt(line.id);
        if(selectwords.indexOf(linenum) != -1)
            selectwords.remove(linenum);
        else selectwords.push(linenum);
        line.bgColor=line.bgColor==""?"#FFFF77":"";
    }
}

function DeleteLine(line,isstart) {
    if(typeof(line)   ==   "undefined "){
        alert('缺少参数');
    }
    else{
        var linenum = parseInt(line.id);
        line.bgColor=line.bgColor==""?"#FFFF77":"";
        var ss="[";
        for(var j=0;j<constrainBody[linenum].length;j++)
        {
            ss = ss + wo[constrainBody[linenum][j]] + ",";
        }
        ss=ss.substring(0,ss.length-1);
        ss = ss +"]";
        if(confirm("Do you want to delete the constrain of " + ss + " ?")) {
            constrainBody.baoremove(linenum);
        }
        CreateConstrainTable(isstart);
    }
}

function Add_Constrain() {
    var len = constrainBody.length;
    if(constrainpair[0] >= 0 && constrainpair[1] >= 0) constrainBody[len] = constrainpair;
    constrainpair = [];
    for(var i=0;i<wo.length;i++)
    {
        var line = document.getElementById("" + i);
        line.bgColor = "";
    }
    CreateConstrainTable(true);
}

function Generate() {
    $("#WordsList").fadeOut("fase");
    wordnum = wo.length;
    ifstart = false;
    init();
}

function ShowConstrain() {
    $("#ConstrainList").fadeIn("slow");
    CreateConstrainTable(false);
}

function ShowWords() {
    $("#ShowWordsList").fadeIn("slow");
    CreateWordTable(false);
}

function DeleteWords() {
    SavePreEditPosition();
    selectwords.sort(sortNumber);
    for(var i=0;i<selectwords.length;i++){
        DeleteWord(false,(selectwords[i]-i));
    }
    selectwords = [];
    $("#ShowWordsList").fadeOut("fast");
}

function AddWord() {
    var isOK = true;
    if(iternum < 80) isOK = false;
    if(isOK)
    {
        SavePreEditPosition();
        var str = prompt("Please input the word and its weight(between 0-1) and use \",\" to split them: ","");
        if(str != "" && str != null && str != undefined)
        {
            var word = str.split(",")[0];
            var weight = parseFloat(str.split(",")[1]);
        }
        if(word != "" && word != null && word != undefined &&
            weight>=0 && weight <= 1)
        {
            var bID;
            for(var i=0;i<wordnum;i++){
                if(we[i] < weight){
                    bID = i;
                    break;
                }
            }
            wo.splice(bID,0,word);
            we.splice(bID,0,weight);
            bodyList.splice(bID,0,undefined);
            tagColor.splice(bID,0,undefined);
            tagFont.splice(bID,0,undefined);
            bodywidth.splice(bID,0,undefined);
            bodyheight.splice(bID,0,undefined);
            ifattract.splice(bID,0,undefined);

            var xoffset,yoffset;
            xoffset = createOffSet();
            yoffset = createOffSet();
            var pX = canvaswidth/2 + xoffset*1;
            var pY = canvasheight/2 + yoffset*1;
            createBox(pX,pY,we[bID],bID);
            wordnum++;
            for(var i=0;i<bodyList.length;i++)
                bodyList[i].SetID(i);
            ifstart = false;
        }
        else alert("The input is incorrect!")
    }
    else
    {
        alert("Please wait for the system to stop automatically.")
    }
}

function SaveImg() {
    var myCanvas = document.getElementById("canvas");

    var DataURL= myCanvas.toDataURL("image/png");

    var saveFile = function(data, filename){
        var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
        save_link.href = data;
        save_link.download = filename;

        var event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        save_link.dispatchEvent(event);
    };

    saveFile(DataURL,"mypic.png");
}

function SetBackColor() {
    var color = document.getElementById("backgroudColor").value;
    backgroundcolor = "#" + color;
}

function SetFontforAll() {
    var font = document.getElementById("inputallfont").value;
    if(!bodyList[0]) defaultfont = font;
    else {
        defaultfont = font;
        var info = SaveNow();
        for(var i=0;i<tagFont.length;i++)
            tagFont[i] = font;
        DestroyBody(false);
        ifattract = info.wordsIfatr;
        tagColor = info.wordsTagColor;
        ReCreateObject_Load(info.wordsPosition,info.wordsAngle,info.wordsIffix,info.wordsiternum);
    }
}

function SetFontforSelect() {
    var font = document.getElementById("wordsFont").value;
    for(var i=0;i<selectwords.length;i++){
        var sID = selectwords[i];
        SetWordFont(true,sID,font);
    }
}

function SetWordFont(preorafter,ID,fontname) {
    var font;
    var bID;
    if(preorafter){
        bID = ID;
        font = fontname;
    }
    else {
        bID = selectedBody.GetID();
        font = document.getElementById("wordfont").value;
    }
    var position = {};
    position.x = bodyList[bID].GetPosition().x;
    position.y = bodyList[bID].GetPosition().y;
    var angle = bodyList[bID].GetAngle();
    var iffix = bodyList[bID].IsFixedRotation();
    tagFont[bID] = font;
    world.DestroyBody(bodyList[bID]);
    ReCreateBody(position,angle,iffix,bID);
    if(!preorafter) {
        selectedBody = bodyList[bID];
        preselectBody = bodyList[bID];
    }
}

function DeleteWord(issingle,ID) {
    var bID;
    if(issingle){
        bID = selectedBody.GetID();
    }
    else bID = ID;
    drawnBody.remove(bodyList[bID]);
    //world.DestroyBody(bodyList[bID]);
    hasselect.flag=false;
    var prewo = [].concat(wo);
    //把已经删除的单词移动后面去，然后修复word数量

    wo.splice(wordnum,0,wo[bID]);
    wo.splice(bID,1);
    we.splice(wordnum,0,we[bID]);
    we.splice(bID,1);
    bodyList.splice(wordnum,0,bodyList[bID]);
    bodyList.splice(bID,1);
    for(var i=0;i<bodyList.length;i++)
        bodyList[i].SetID(i);

    var f;
    for(f = bodyList[wordnum - 1].GetFixtureList();
        f; f = f.m_next)
    {
        f.SetSensor(true);
    }
    var start = {x:bodyList[wordnum - 1].GetPosition().x,y:bodyList[wordnum - 1].GetPosition().y};
    var end = {x:0,y:0};
    end.x = (750 + createOffSet()*2)/drawScale;
    if(bodyList[wordnum - 1].GetPosition().y*30 <= 300)  end.y = -150/drawScale;
    else  end.y = 750/drawScale;
    var aniinfo = {id:(wordnum - 1),startpos:start,endpos:end,count:0,editflag:1};
    animation.push(aniinfo);

    tagColor.splice(wordnum,0,tagColor[bID]);
    tagColor.splice(bID,1);
    tagFont.splice(wordnum,0,tagFont[bID]);
    tagFont.splice(bID,1);
    bodywidth.splice(wordnum,0,bodywidth[bID]);
    bodywidth.splice(bID,1);
    bodyheight.splice(wordnum,0,bodyheight[bID]);
    bodyheight.splice(bID,1);
    //prePosition.splice(wordnum,0,prePosition[bID]);
    prePosition.splice(bID,1);
    ifattract.push(false);
    ifattract.splice(bID,1);
    wordsNeighbor.splice[bID,1];
    wordnum--;

    //修复constrain列表
    for(var i=0;i<constrainBody.length;i++)
    {
        for(var j=0;j<constrainBody[i].length;j++)
        {
            var num = wo.indexOf(prewo[constrainBody[i][j]]);
            if(num != -1){
                constrainBody[i][j] = num;
            }
        }
    }
    iternum = 0;
    if(issingle) {
        handleMouseUp();
        hasselect.flag = false;
        hasselect.time = 0;
        mouseX = undefined;
        mouseY = undefined;
        premouseX = undefined;
        premouseY = undefined;
        preBodypos = undefined;
        firstrotate = true;
        preselectBody = undefined;
        selectedBody = undefined;
        mrRadian = undefined;
        document.getElementById("wordedittools").style.display="none";//显示
    }
}

function AddConstrain() {
    if(!ifaddconstrain)
    {
        document.getElementById("addconstrain").value="Add Over";
        ifaddconstrain = true;
    }
    else
    {
        hasselect.flag = false;
        ifaddconstrain = false;
        document.getElementById("addconstrain").value="AddConstrain";
        preserveConstrain();
    }
}

Array.prototype.baoremove = function(dx)
{
    //删除指定下标的元素
    if(isNaN(dx)||dx>this.length){return false;}
    this.splice(dx,1);
}

function IfDebug(){
    if(Ifdebug) Ifdebug = false;
    else Ifdebug = true;
}

function DoReWordle(){
    var shoulerewordle = shouldReWordle();
    if(shoulerewordle) UserReWordle = true;
    else alert("There is no need to ReWordle");
}

