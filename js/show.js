/** 第七版完整版
 * 相较于6.0版本
 * 改进了邻居的判定方式，现在弃用了RayCasting，使用了自己的判定方法
 * 引入了双层BOX，更加Compact
 * 加入了PreView和Undo、Redo更加贴合用户
 * 降低了CPU能耗
 * **/
//世界参数
var world; var wo; var we;
var fixDef = new b2FixtureDef;
var bodyDef = new b2BodyDef;
const drawScale = 30;
const canvaswidth = 1300;
const canvasheight = 600;
var backgroundcolor = "#FFFFFF";
var defaultfont = "Hobo std";
var colorthemenum = 0;

//全部数组参数
var bodyList = [];
var ifsubdivided = [];
var ifattract = [];
var tagColor = [];
var tagFont = [];
var drawnBody = [];
var bodywidth = [];
var bodyheight = [];
var bodydesent = [];
var prePosition = [];
var preEditInfo = [];
var preEditPoint = 0; //滑动指针
var preMovePosition = [];
var wordsNeighbor = [];
var PreNeighbor = [];
var preReWordleReason = [-1,-1];
var constrainBody = [];
var fw = [0, 0, 0, 0, 0,Math.PI/2,-Math.PI/2];
var color = [["#1a984f","#67bd64","#a7d96a","#fdae61","#f56d43","#fe5840"],
    ["#c98b2f","#803c27","#c56520","#e1b41b","#807916","#e4de26"],
    ["#ffec94","#ffaeae","#fff0aa","#b0e57c","#b4d8e7","#56baec"],
    ["#504b2e","#a8be40","#8bc27e","#c5ddd0","#c1d63d","#7faf35"],
	
	["#1f0207","#52030d","#95070e","#a3230d","#bd5600","#e4de26"],
    ["#084233","#4b9100","#c7bd00","#ffd83d","#b22400","#d58d2a"],
    ["#468966","#fff0a5","#ffb03b","#b64926","#8e2800","#294b81"],
	["#2b3b00","#636e00","#f7b100","#eb4200","#6b0019","#74839b"],
	
    ["#064210","#2e5606","#a69c10","#746010","#422e10","#7cc572"],
    ["#1f497d","#4f81bd","#c0504d","#9bbd59","#8064a2","#4bacc6"],
	];

var planet = [];
var multibodies = [];
//var pushingbar;

//固定全局变量及参数
var iternum = 9000;
var limit = 200;
var wordnum;
var isFirstContrust = true;
var ifstart = false;
var ifedit = false;
var ifaddconstrain = false;
var isshift = false;
var isctrl = false;
var animation = [];
var context; //这个是画板内容
var context2 = document.getElementById("canvas2").getContext("2d");

//可调参数（允许界面输入修改）
var radiusRatio = 0.8;
var startPositionRatio = 0.5;
var Reflag = false;
var Ifdebug = false;
var usecenter = true;
var ifAllFixed = true;
var maxfontsize = 66;
var minfontsize = 13;
var arapweight = 5;
var centerweight = 0.5;
var AddForce = true;
var UserReWordle = false;


function init() {
    //getText();
    createWorld();
    createWall();
    debugDraw();
    createObject();

    window.setInterval(update, 1000 / 60);

};

function createWorld() {
    world = new b2World(
        new b2Vec2(0, 0)    //gravity
        ,  true                 //allow sleep
    );
    world.SetWarmStarting(false);
};

function createWall() {
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;
    bodyDef.type = b2Body.b2_staticBody;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(canvaswidth/30, 0.3);
    bodyDef.position.Set(canvaswidth/30/2, canvasheight/30 + 0.2);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    bodyDef.position.Set(canvaswidth/30/2, -0.2);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    fixDef.shape.SetAsBox(0.3, canvasheight/30);
    bodyDef.position.Set(-0.2, canvasheight/30);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
    bodyDef.position.Set(canvaswidth/30+0.2, canvasheight/30);
    world.CreateBody(bodyDef).CreateFixture(fixDef);

    //加一个吸引源
    bodyDef.type=b2Body.b2_staticBody;
    fixDef.shape = new b2CircleShape(0.01/drawScale);
    bodyDef.position.Set(canvaswidth/drawScale/2,canvasheight/drawScale/2);
    var body1 = world.CreateBody(bodyDef);
    fixDef.isSensor = true;  //想要不产生碰撞反应，但是设置成fixtrue是不行的。
    body1.CreateFixture(fixDef);
    planet.push(body1);

    /*
    //加一个Pushingbar
    bodyDef.type=b2Body.b2_staticBody;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(100/30, 20/30);
    bodyDef.position.Set(100/30,50/30);
    bodyDef.bullet = true;
    var body2 = world.CreateBody(bodyDef);
    body2.CreateFixture(fixDef);
    body2.SetID(1024);
    pushingbar = body2;
    bodyheight[1024] = 20;
    bodywidth[1024] = 100;*/
};

function createObject() {
    /*if(wo[0].isInChinese()) {
     defaultfont = "微软雅黑";
     document.getElementById("inputallfont").value = "微软雅黑";
     }*/
    for(var i=0;i<wordnum;i++)
    {
        var xoffset,yoffset;
        xoffset = createOffSet();
        yoffset = createOffSet();
        var pX = canvaswidth/2 + xoffset*2;
        var pY = canvasheight/2 + yoffset*0.7;
        createBox(pX,pY,we[i],i);
    }
};

function createBox(pX,pY,size,i) {
    tagFont[i] = defaultfont;
    fixDef.isSensor = false;
    fixDef.density = 1.0;
    fixDef.friction = 0.2;
    fixDef.shape = new b2PolygonShape;
    var fontsize = (maxfontsize-minfontsize)*size + minfontsize;
    //context2.font = "bold " + fontsize + "px " + tagFont[i];
    context2.font = fontsize + "px " + tagFont[i];
    var width = context2.measureText(wo[i]).width;
    bodywidth[i] = width/2;
    bodyheight[i] = fontsize/2;
    bodydesent[i] = 0;
    ifsubdivided[i] = false;
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.Set(pX/drawScale,pY/drawScale);
    var body = world.CreateBody(bodyDef);

    CreateLittleBody(width,fontsize,body,i);

    body.SetID(i);
    bodyList[i] = body;
    tagColor[i] = createColor();
    if(size<=0.7) body.SetAngle(createAngle());

    ifattract[i] = true;
    body.SetFixedRotation(ifAllFixed);
    if(body.IsFixedRotation())
    {
        for(var f = body.GetFixtureList();
            f; f = f.m_next)
        {
            f.SetSensor(true);
        }
        var poss = placeBody(body,false);
        var start;
        if(prePosition[i] != undefined){
            start = {x:prePosition[i].x,y:prePosition[i].y};
        }
        else{
            start = {x:0,y:0};
            if(poss.y*30 <= 300)  start.y = (250 + createOffSet()*2)/drawScale;
            else  start.y = (350 + createOffSet()*2)/drawScale;
            if(poss.x*30 <= 650) start.x = (550 + createOffSet()*2)/drawScale;
            else start.x = (750 + createOffSet()*2)/drawScale;
        }
        var aniinfo = {id:i,startpos:start,endpos:poss,count:0,editflag:0};
        animation.push(aniinfo);
    }
};

function CreateLittleBody(width,fontsize,body,i) {
    if(we[i]>=0.5)
    {
        var maxheight = -10;
        var maxdesent = -10;
        var allwidth = -(width/2);
        var fixDef2 = new b2FixtureDef;
        fixDef2.isSensor = false;
        fixDef2.friction = 0.2;
        fixDef2.shape = new b2PolygonShape;
        for(var j=0;j<wo[i].length;j++)
        {
            var textdata = measureTextH_W(context2,0,0,250,300,fontsize, tagFont[i],wo[i][j]);

            var hx = textdata.width/2; var hy = textdata.height/2;
            var yoff = textdata.desent + (fontsize/2 - hy); var xoff = allwidth + hx;
            var array = [[-hx + xoff, -hy + yoff],
                [hx + xoff, -hy + yoff],
                [hx + xoff, hy + yoff],
                [-hx + xoff, hy + yoff]];
            fixDef2.shape.SetAsArray(createVerticesArray(array), 4);
            body.CreateFixture(fixDef2);

            allwidth = allwidth + hx*2;
            if(maxheight < hy) maxheight = hy;
            if(maxdesent < textdata.desent) maxdesent = textdata.desent;
        }
        var textdata = measureTextH_W(context2,0,0,250,300,fontsize, tagFont[i],"e");
        var hy = textdata.height/2; var hx = width/2;
        textdata = measureTextH_W(context2,0,0,250,300,fontsize, tagFont[i],"l");
        //var yoff = textdata.height - hy*2; console.log(yoff);
        //if(yoff == 0)
        var yoff = fontsize/2 - hy;
        var array = [[-hx, -hy + yoff],
            [hx, -hy + yoff],
            [hx, hy + yoff],
            [-hx, hy + yoff]];
        fixDef2.shape.SetAsArray(createVerticesArray(array), 4);
        body.CreateFixture(fixDef2);
        bodyheight[i] = (maxheight*2 + maxdesent)/2;
        bodydesent[i] = maxdesent;
        ifsubdivided[i] = true;
    }
    else{
        var textdata;
        var maxdesent = -10;
        for(var j=0;j<wo[i].length;j++) {
            var textdata = measureTextH_W(context2, 0, 0, 150, 200, fontsize, tagFont[i], wo[i][j]);
            if(textdata.desent > maxdesent) maxdesent = textdata.desent;
        }
        textdata= measureTextH_W(context2,0,0,350,200,fontsize, tagFont[i],wo[i]);
        var hy = textdata.height/2 + 2; var hx = width/2 + 2;
        var yoff = maxdesent;
        var array = [[-hx, -hy + yoff],
            [hx, -hy + yoff],
            [hx, hy + yoff],
            [-hx, hy + yoff]];
        fixDef.shape.SetAsArray(createVerticesArray(array), 4);
        bodyheight[i] = textdata.height/2;
        body.CreateFixture(fixDef);
    }
}

function createVerticesArray(array) {
    var vertices = [];
    for(var o=0;o<array.length;o++)
    {
        var vertice = new b2Vec2(array[o][0]/drawScale,array[o][1]/drawScale);
        vertices.push(vertice);
    }
    return vertices;
};

function preserveConstrain() {
    for(var i=0;i<constrainBody.length;i++)
    {
        var allconstrainbody = [];  //所有已经添加过的单词
        for(var p=0;p<i;p++)
            for(var q=0;q<constrainBody[p].length;q++) allconstrainbody.push(constrainBody[p][q]);

        if(constrainBody[i][0] >= 0)
        {
            constrainBody[i].sort(sortNumber);
            var bID = constrainBody[i][0]
            var bNeighbor = findNeighbor(true,bID);
            for(var j=1;j<constrainBody[i].length;j++)
            {
                var cID = constrainBody[i][j];
                var minneighbor = {widthdif:999,id:-1};
                var ifalreadyhave = false;
                var weightdifferratio = 0.1;
                while(minneighbor.id == -1)
                {
                    for(var v=0;v<bNeighbor.length;v++)
                    {
                        if(cID == bNeighbor[v]) {
                            ifalreadyhave = true; // 约束自然形成
                        }
                        //替换单词需要保持约束，不选择该单词
                        if( allconstrainbody.indexOf(bNeighbor[v]) != -1 ) {continue;}
                        var weightdiffer = Math.abs(we[cID] - we[bNeighbor[v]]);
                        if(weightdiffer < weightdifferratio)
                        {
                            var isOK = true;
                            if(bodyList[cID].IsFixedRotation())
                                if(bodyList[bNeighbor[v]].GetAngle() != 0) isOK = false;

                            if(isOK)
                            {
                                var widthdiffer = Math.abs(bodywidth[cID] - bodywidth[bNeighbor[v]]);
                                if(widthdiffer < minneighbor.widthdif){
                                    minneighbor.widthdif = widthdiffer;
                                    minneighbor.id = bNeighbor[v];
                                }
                            }
                        }
                    }
                    weightdifferratio = weightdifferratio + 0.1;
                }
                //如果约束不是自然形成的，找个相似权重的邻居，替换掉它
                if(!ifalreadyhave)
                {
                    //console.log("保持约束：" + wo[cID]);
                    //console.log("替换邻居：" + wo[minneighbor.id]);
                    //替换两个单词的位置
                    changeBodyPosition(cID,minneighbor.id);
                }
                tagColor[cID] = tagColor[bID];
            }
        }
    }
}

function changeBodyPosition(id1,id2) {
    var body1 = bodyList[id1];
    var body2 = bodyList[id2];
    if(body1.IsFixedRotation())
        if(body1.GetAngle() != 0)  {
            body2.SetAngle(body1.GetAngle());
            body1.SetAngle(0);
        }
    //body1替换body2的位置，body2重新找一个位置，或者他们俩互换位置
    for(var f = body1.GetFixtureList();
        f; f = f.m_next)
    {
        f.SetSensor(true);
    }
    for(var f = body2.GetFixtureList();
        f; f = f.m_next)
    {
        f.SetSensor(true);
    }

    var position1 = {x:body1.GetPosition().x, y:body1.GetPosition().y};
    var position2 = {x:body2.GetPosition().x, y:body2.GetPosition().y};
    body1.SetPosition(new b2Vec2(position2.x,position2.y));
    body2.SetPosition(new b2Vec2(position1.x,position1.y));

    for(var f = body1.GetFixtureList();
        f; f = f.m_next)
    {
        f.SetSensor(false);
    }
    for(var f = body2.GetFixtureList();
        f; f = f.m_next)
    {
        f.SetSensor(false);
    }
}

function movetonearNeighbor(id1,id2,id3){
    var body1 = bodyList[id1]; // 需要保持的邻居
    var body2 = bodyList[id2]; //需要被顶开的邻居
    var body3 = bodyList[id3]; //原始刚体
    if(body1.IsFixedRotation())
        if(body1.GetAngle() != 0)  {
            body1.SetAngle(0);
        }
    var position2 = {x:body2.GetPosition().x, y:body2.GetPosition().y};
    var position3 = {x:body3.GetPosition().x, y:body3.GetPosition().y};
    var ydiffer = position2.y - position3.y;
    body1.SetPosition(new b2Vec2(position2.x,position2.y - ydiffer * 0.5));
}

function createAngle() {
    var index = parseInt(Math.random()*6);
    return fw[index];
};

function createColor() {
    var index = parseInt(Math.random()*6);
    return color[colorthemenum][index];
};

function createOffSet() {
    if(Math.random() >= 0.5)
        return Math.random() * 70;
    else return -Math.random() * 70;
};

//以下是与wordle的融合，使用了螺旋线的初始化方法
function placeBody(body,isR) {
    var cont = 0; var positions = [];
    var lastcollideItem = null;
    var prenudge = {x:0,y:0};
    var lim = 600;
    if(isR) lim = 1000;
    for(var j=0;j<lim;j++)
    {
        var nudge = getSpiralNudger(j);
        var positionx = body.GetPosition().x + nudge.x/drawScale/2;
        var positiony = body.GetPosition().y + nudge.y/drawScale/2;
        body.SetPosition(new b2Vec2(positionx,positiony));
        var position = body.GetPosition();
        if(position.x < 0 || position.y<0 || position.x > canvaswidth || position.y > canvasheight)
            continue;

        if(lastcollideItem != null && collisionDec(lastcollideItem,body,isR))
            continue;

        var foundOverlap = false;
        //使用了自己重写的BOX碰撞检测，结果比原来紧凑很多
        for(var i=0;i<drawnBody.length;i++)
        {
            if(collisionDec(drawnBody[i],body,isR))
            {
                foundOverlap = true;
                lastcollideItem = drawnBody[i];
                break;
            }
        }
        if(!foundOverlap)
        {
            if(!isR)
            {
                drawnBody.push(body);
                return {x:positionx,y:positiony};
            }
            else {
                //返回20个新位置,革命道路第一步完成
                if(cont<20)
                {
                    var pp = {x:positionx,y:positiony};
                    positions[cont] = pp;
                    cont++;
                }
                else  return positions;
            }
        }
        prenudge = nudge;
        var ID = body.GetID();
    }
    if(!isR)
        return false;
    else return positions;
}

function isOverlap(body1,body2,isR) {
    var center1 = body1.GetPosition();
    var center2 = body2.GetPosition();
    var ID1 = body1.GetID();
    var ID2 = body2.GetID();
    if(we[ID1] >= 0.5) center1 = CorrectCenter(ID1,center1);
    if(we[ID2] >= 0.5) center1 = CorrectCenter(ID2,center1);
    var a = getPoint(center1,ID1,isR);
    var b = getPoint(center2,ID2,isR);
    var isoverlap = !(a[3] <= b[1] || a[1] >= b[3] || a[2] <= b[0] || a[0] >= b[2]);
    return isoverlap;
}

function getFourLines(rectPointsArr){
    var p0=rectPointsArr[0];
    var p1=rectPointsArr[1];
    var p2=rectPointsArr[2];
    var p3=rectPointsArr[3];
    var l1=[p0,p1];
    var l2=[p1,p2];
    var l3=[p2,p3];
    var l4=[p3,p0];
    return [l1,l2,l3,l4];
}

function getTYPoing(p,axis){
    //获取点在轴上的投影点
    //顶点在轴上的投影
    var x=((p[0]*axis[0]+p[1]*axis[1])/(axis[0]*axis[0]+axis[1]*axis[1]))*axis[0];
    var y=((p[0]*axis[0]+p[1]*axis[1])/(axis[0]*axis[0]+axis[1]*axis[1]))*axis[1];
    return [x,y];
};

function getLineTYToAxis(line,axis){//线到轴的投影

    var a=[axis[1][0]-axis[0][0],axis[1][1]-axis[0][1]];//轴向量
    var p0=line[0];//线的一个顶点0
    var p1=line[1];//线的一个顶点1
    var pt0=getTYPoing(p0,a);
    var pt1=getTYPoing(p1,a);
    return [pt0,pt1];

};

function isLineOverlap(l1,l2){//判断线段是否重叠

    var l1p1=l1[0],l1p2=l1[1],l2p1=l2[0],l2p2=l2[1];
    if(l1p1[0]!=l2p1[0]){//非垂直X轴的两线段
        if((l1p1[0]-l2p1[0])*(l1p1[0]-l2p2[0])<0||(l1p2[0]-l2p1[0])*(l1p2[0]-l2p2[0])<0||(l2p1[0]-l1p1[0])*(l2p1[0]-l1p2[0])<0||(l2p2[0]-l1p1[0])*(l2p2[0]-l1p2[0])<0){
            return true;
        }
    }
    else{//垂直X轴
        if((l1p1[1]-l2p1[1])*(l1p1[1]-l2p2[1])<0||(l1p2[1]-l2p1[1])*(l1p2[1]-l2p2[1])<0||(l2p1[1]-l1p1[1])*(l2p1[1]-l1p2[1])<0||(l2p2[1]-l1p1[1])*(l2p2[1]-l1p2[1])<0){
            return true;
        }
    }

    return false;
}

function detectAxisCollision(axis,lineArr){//矩形的轴和另一个矩形要比较的四个边

    for(var i=0,len=lineArr.length;i<len;i++){
        var tyLine=getLineTYToAxis(lineArr[i],axis);//获取线段在轴上的投影线段 [[a,b],[a1,b1]]
        var tyAxis=getLineTYToAxis(axis,axis);

        if(isLineOverlap(tyLine,tyAxis)){
            return true;
        }
    }
    return false;
};

function collisionDec(body1,body2,isR){
    //分离轴算法检测是否重叠，会精确些
    var center1 = body1.GetPosition();
    var center2 = body2.GetPosition();
    var ID1 = body1.GetID();
    var ID2 = body2.GetID();
    if(we[ID1] >= 0.5) center1 = CorrectCenter(ID1,center1);
    if(we[ID2] >= 0.5) center1 = CorrectCenter(ID2,center1);
    var a = getPoint(center1,ID1,isR);
    var b = getPoint(center2,ID2,isR);

    var linesArr1=getFourLines(a);//矩形1的四个边
    var linesArr2=getFourLines(b);//矩形2的四个边

    //矩形相邻的两个边作为两个轴，并且和另一个矩形的四个边进行投影重叠的比较
    if(detectAxisCollision(linesArr2[0],linesArr1)&&detectAxisCollision(linesArr2[1],linesArr1)&&detectAxisCollision(linesArr1[0],linesArr2)&&detectAxisCollision(linesArr1[1],linesArr2)){
        return true;
    }
    return false;
};

function getPoint(center,ID,isR) {
    var pos = bodyList[ID].GetPosition();
    var ratio = 1;
    if(isR) ratio = 0.9;

    var a = [
        [center.x*drawScale - bodywidth[ID]*ratio, center.y*drawScale - bodyheight[ID]*ratio], //左上角
        [center.x*drawScale + bodywidth[ID]*ratio, center.y*drawScale - bodyheight[ID]*ratio], //右上角
        [center.x*drawScale + bodywidth[ID]*ratio, center.y*drawScale + bodyheight[ID]*ratio], //右下角
        [center.x*drawScale - bodywidth[ID]*ratio, center.y*drawScale + bodyheight[ID]*ratio]  //左下角
    ];

    var angle = bodyList[ID].GetAngle();
    if(angle != 0){
        for(var v=0;v<a.length;v++) {
            var newx = (a[v][0] - pos.x*drawScale)*Math.cos(angle) - (a[v][1] - pos.y*drawScale)*Math.sin(angle) + pos.x*drawScale;
            a[v][1] = (a[v][0] - pos.x*drawScale)*Math.sin(angle) + (a[v][1] - pos.y*drawScale)*Math.cos(angle) + pos.y*drawScale;
            a[v][0] = newx;
        }
    }

    return a;

    /*var a = new Array();
    var ratio = 1;
    if(isR) ratio = 0.9;
    var angle = bodyList[ID].GetAngle();

    if(angle == 0)
    {
        a[0] = center.x*drawScale - bodywidth[ID] * ratio;//左上角x
        a[1] = center.y*drawScale - bodyheight[ID] * ratio; // 左上角y
        a[2] = center.x*drawScale + bodywidth[ID] * ratio; // 右下角x
        a[3] = center.y*drawScale + bodyheight[ID] * ratio; // 右下角y
    }
    else
    {
        a[0] = center.x*drawScale - bodyheight[ID] * ratio;//左上角x
        a[1] = center.y*drawScale - bodywidth[ID] * ratio; // 左上角y
        a[2] = center.x*drawScale + bodyheight[ID] * ratio; // 右下角x
        a[3] = center.y*drawScale + bodywidth[ID] * ratio; // 右下角y
    }

    return a;*/
};

function getSpiralNudger(attempt) {
    var rad = powerMap(0.5, attempt, 0, 600, 1, 100);
    var thetaIncrement = powerMap(1, attempt, 0, 600, 0.5, 0.3);
    var theta = thetaIncrement * attempt;
    var x = Math.cos(theta) * rad;
    var y = Math.sin(theta) * rad;
    return new b2Vec2(x,y);
}

function powerMap(power, v, min1, max1, min2, max2) {
    var val = v/(max1-min1);
    val = Math.pow(val, power);
    return (max2-min2)*val + min2;  //线性映射
}

function debugDraw() {
    //setup debug draw
    var debugDraw = new b2DebugDraw();
    context = document.getElementById("canvas").getContext("2d");
    debugDraw.SetSprite(context);
    debugDraw.SetDrawScale(30.0);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit );
    world.SetDebugDraw(debugDraw);
};

var mouseX, mouseY,premouseX = undefined,premouseY = undefined, mousePVec, isMouseMove, isMouseRotate, selectedBody,centerPVec,cBody;
var hasselect = {flag:false,time:0}, preselectBody, mrRadian, firstrotate = true;
var scalestart,scaleend,preBodypos,mousevector,rotationstart,rotationend = undefined;
var prefingerpositon = [];
var judge;
var canvasPosition = getElementPosition(document.getElementById("canvas"));
var canvas = document.getElementById("canvas");
canvas.addEventListener("mousedown", handleMouseDown, true);
canvas.addEventListener("touchstart", handleMouseDown, true);
canvas.addEventListener("mouseup", handleMouseUp, true);
canvas.addEventListener("touchend", handleMouseUp, true);
canvas.addEventListener("mousewheel", handleMousescroll, true);
var mc = new Hammer.Manager(canvas);
var pinch = new Hammer.Pinch();
var rotate = new Hammer.Rotate();
pinch.recognizeWith(rotate);
mc.add([pinch, rotate]);
mc.on("rotatestart rotatemove", handleTouchRotate);
mc.on("pinchstart pinchmove", handleTouchPinch);

/** 键盘监听事件 **/
document.onkeydown=function(event){
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if(e && e.keyCode==16){ // 按Shift
        isshift = true
    }
    if(e && e.keyCode==17){ //按Ctrl
        isctrl = true;
    }
};

document.onkeyup=function (event) {
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if(e && e.keyCode==16){ // 释放Shift
        isshift = false
    }
    if(e && e.keyCode==17){ //释放Ctrl
        isctrl = false;
    }
};

function handleMouseDown(e) {
    var clientX, clientY;
    if(e.clientX)
    {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    else if(e.changedTouches && e.targetTouches.length > 0 && e.targetTouches.length == 1)
    {
        var touch = e.changedTouches[e.changedTouches.length - 1];
        clientX = touch.clientX;
        clientY = touch.clientY;
    }
    else
    {
        return;
    }
    canvasPosition = getElementPosition(document.getElementById("canvas"));
    mouseX = (clientX - canvasPosition.x) / 30;
    mouseY = (clientY - canvasPosition.y) / 30;
    premouseX = mouseX;
    premouseY = mouseY;
    e.preventDefault();
    if(!isctrl && multibodies.length == 0){
        if(hasselect.flag && hasselect.time >= 1)
        {
            var body = getBodyAtMouse();
            if(body)
            {
                if(!ifaddconstrain)
                {
                    //if(cBody) cBody.SetType(b2Body.b2_dynamicBody);
                    /** Pushing bar test
                    if(bodyID == 1024)
                        for(var i=0;i<bodyList.length;i++)
                            bodyList[i].SetFixedRotation(false);**/

                    preBodypos = {x:body.GetWorldCenter().x,y:body.GetWorldCenter().y};
                    mousevector = {x:body.GetWorldCenter().x - mouseX,y:body.GetWorldCenter().y - mouseY};
                    SavePreEditPosition();
                    firstrotate = true;
                    body.SetType(b2Body.b2_staticBody);

                    if(preselectBody == body)
                    {
                        hasselect.time++;
                        if(!ifaddconstrain)
                        {
                            handleMouseMove(e);
                            canvas.addEventListener("mousemove", handleMouseMove, true);
                            canvas.addEventListener("touchmove", handleMouseMove, true);
                        }
                    }
                    else{
                        preselectBody = body;
                        document.getElementById("wordfont").value=tagFont[body.GetID()];
                        document.getElementById('wordColor').style.backgroundColor=tagColor[body.GetID()];
                        document.getElementById('wordColor').value="word color";
                        hasselect.flag = true;
                        ifedit = true;
                        hasselect.time = 1;

                        handleMouseMove(e);
                        canvas.addEventListener("mousemove", handleMouseMove, true);
                        canvas.addEventListener("touchmove", handleMouseMove, true);
                    }
                }
                else {
                    var len = constrainBody.length - 1;
                    var bID = body.GetID();
                    var isexisted = false;
                    for(var i=0;i<constrainBody[len].length;i++)
                    {
                        if(constrainBody[len][i] == bID) {
                            constrainBody[len].remove(bID);
                            isexisted = true;
                        }
                    }
                    if(!isexisted) constrainBody[len].push(bID);
                }
            }
            else {
                if(!ifaddconstrain)
                {
                    handleMouseUp();
                    hasselect.flag = false;
                    hasselect.time = 0;
                }
                LogOff();
                document.getElementById("wordedittools").style.display="none";//显示
            }
        }
        else
        {
            var body = getBodyAtMouse();
            if(body)
            {
                SingleWordPick(body,e);
            }
        }
    }
    if(isctrl){
        //多选模式
        var body = getBodyAtMouse();
        if(body){
            if(hasselect.flag){
                var sID = preselectBody.GetID();
                multibodies.push(sID);
                handleMouseUp();
                hasselect.flag = false;
                hasselect.time = 0;
                LogOff();
                document.getElementById("wordedittools").style.display="none";//显示
            }
            var bodyID = body.GetID();
            if(multibodies.indexOf(bodyID) != -1){
                multibodies.remove(bodyID);
            }
            else multibodies.push(bodyID);
        }
        else{
            //没有找到刚体，点击了空白区域
            multibodies = [];
            LogOff();
        }
    }
    if(!isctrl && multibodies.length != 0){
        var body = getBodyAtMouse();
        if(body){
            var bID = body.GetID();
            if(multibodies.indexOf(bID) == -1){
                //选中的刚体不在多选单词表里，变成单一单词选中操作
                multibodies = [];
                SingleWordPick(body,e);
            }
            else{
                //选中的刚体在刚体列表里，以该刚体为目标移动
                firstrotate = true;
                //preselectBody = body;
                preBodypos = {x:body.GetWorldCenter().x,y:body.GetWorldCenter().y};
                mousevector = {x:body.GetWorldCenter().x - mouseX,y:body.GetWorldCenter().y - mouseY};
                //SavePreEditPosition();
                for(var i=0;i<multibodies.length;i++){
                    bodyList[multibodies[i]].SetType(b2Body.b2_staticBody);
                }
                handleMouseMove(e);
                canvas.addEventListener("mousemove", handleMouseMove, true);
            }
        }
        else{
            //没有找到刚体，点击了空白区域
            multibodies = [];
            LogOff();
        }
    }

    if(hasselect.flag || multibodies.length != 0){
        judge = setInterval(function(){
                if(Math.abs(selectedBody.GetWorldCenter().x - preBodypos.x) < 0.01 && Math.abs(selectedBody.GetWorldCenter().y - preBodypos.y) < 0.01){
                    if(preMovePosition[0] == undefined)
                        SaveMovePositon();
                    if(multibodies.length == 0){
                        var f;
                        for(f = selectedBody.GetFixtureList();
                            f; f = f.m_next)
                        {
                            f.SetSensor(false);
                        }
                        ifattract[selectedBody.GetID()] = false;
                    }
                    else{
                        for(var i=0;i<multibodies.length;i++){
                            var bID = multibodies[i];
                            var f;
                            for(f = bodyList[bID].GetFixtureList();
                                f; f = f.m_next)
                            {
                                f.SetSensor(false);
                            }
                            ifattract[bID] = false;
                        }
                    }
                }
        },150);
    }

}

function LogOff() {
    mouseX = undefined;
    mouseY = undefined;
    premouseX = undefined;
    premouseY = undefined;
    preBodypos = undefined;
    firstrotate = true;
    preselectBody = undefined;
    selectedBody = undefined;
    mrRadian = undefined;
}

function SingleWordPick(body,e) {
    hasselect.flag = true;
    preselectBody = body;
    var bodyID = body.GetID();
    hasselect.time++;
    if(!ifaddconstrain)
    {
        /** Pushing bar test
        if(bodyID == 1024)
            for(var i=0;i<bodyList.length;i++)
                bodyList[i].SetFixedRotation(false);**/

        preBodypos = {x:body.GetWorldCenter().x,y:body.GetWorldCenter().y};
        mousevector = {x:body.GetWorldCenter().x - mouseX,y:body.GetWorldCenter().y - mouseY};
        SavePreEditPosition();
        body.SetType(b2Body.b2_staticBody);
        //if(cBody) cBody.SetType(b2Body.b2_dynamicBody);
        ifedit = true;
        document.getElementById("wordedittools").style.display="";//显示
        document.getElementById("wordfont").value=tagFont[body.GetID()];
        document.getElementById('wordColor').style.backgroundColor=tagColor[body.GetID()];
        document.getElementById('wordColor').value="word color";

        handleMouseMove(e);
        canvas.addEventListener("mousemove", handleMouseMove, true);
        canvas.addEventListener("touchmove", handleMouseMove, true);
    }
    else {
        var len = constrainBody.length;
        var temarray = [];
        temarray.push(bodyID);
        constrainBody[len] = temarray;
    }
}

function handleMouseUp() {
    if(cBody) cBody.SetType(b2Body.b2_dynamicBody);

    if(hasselect.flag)
    {
        canvas.removeEventListener("mousemove", handleMouseMove, true);
        canvas.removeEventListener("touchmove", handleMouseMove, true);
        isMouseMove = false;
        isMouseRotate = false;
        //if(preselectBody.GetID() != 1024)
        AddForce = true;
        //if(preselectBody.GetID() != 1024)
        preselectBody.SetType(b2Body.b2_dynamicBody);
        var f; f = preselectBody.GetFixtureList();
        if(f.IsSensor() == true){
            for(f = preselectBody.GetFixtureList();
                f; f = f.m_next)
            {
                f.SetSensor(false);
            }
        }
        var sID = preselectBody.GetID();
        var ce = preselectBody.GetContactList();
        ifattract[sID] = false;
        while(ce)
        {
            if(ce.contact.IsTouching())
            {
                ifattract[sID] = true;
                break;
            }
            ce = ce.next;
        }
        if(ifattract[sID])
            iternum = 0;
    }

    if(multibodies.length != 0){
        canvas.removeEventListener("mousemove", handleMouseMove, true);
        isMouseMove = false;
        isMouseRotate = false;
        AddForce = true;
        var ifattracts = false;
        for(var i=0;i<multibodies.length;i++){
            var bID = multibodies[i];
            bodyList[bID].SetType(b2Body.b2_dynamicBody);
            var f; f = bodyList[bID].GetFixtureList();
            if(f.IsSensor() == true){
                for(f = bodyList[bID].GetFixtureList();
                    f; f = f.m_next)
                {
                    f.SetSensor(false);
                }
            }
            ifattract[bID] = false;
            var ce = bodyList[bID].GetContactList();
            while(ce)
            {
                if(ce.contact.IsTouching())
                {
                    ifattracts = true;
                    break;
                }
                ce = ce.next;
            }
        }

        for(var i=0;i<multibodies.length;i++){
            var bID = multibodies[i];
            ifattract[bID] = ifattracts;
        }
        if(ifattracts) iternum = 0;
    }

    preMovePosition = [];
    clearInterval(judge);
}

function StaticCenter() {
    console.log("执行");
    var ymax=0,xmax=0,ymin=1000,xmin=1000;
    for (var i = 0; i < wordnum; i++)
    {
        var bCenter = bodyList[i].GetPosition();
        if(bCenter.x > xmax)
            xmax = bCenter.x;
        if(bCenter.y > ymax)
            ymax = bCenter.y;
        if(bCenter.x < xmin)
            xmin = bCenter.x;
        if(bCenter.y < ymin)
            ymin = bCenter.y;
    }

    var center = {x:(xmax-xmin)/2 + xmin,y:(ymax-ymin)/2 + ymin};
    centerPVec = new b2Vec2(center.x,center.y);
    var aabb = new b2AABB();
    aabb.lowerBound.Set(center.x - 0.001, center.y - 0.001);
    aabb.upperBound.Set(center.x + 0.001, center.y + 0.001);

    // Query the world for overlapping shapes.

    cBody = null;
    world.QueryAABB(getBodyCB2, aabb);
    if(cBody){
        console.log("有");
        cBody.SetType(b2Body.b2_staticBody);
    }
}

function getBodyCB2(fixture) {
    if(fixture.GetBody().GetID() >= 0) {
        if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), centerPVec)) {
            cBody = fixture.GetBody();
            return false;
        }
    }
    return true;
}

function handleMouseMove(e) {
    var clientX, clientY;
    if(e.clientX)
    {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    else if(e.changedTouches && e.changedTouches.length > 0)
    {
        var touch = e.changedTouches[e.changedTouches.length - 1];
        clientX = touch.clientX;
        clientY = touch.clientY;
    }
    else
    {
        return;
    }
    canvasPosition = getElementPosition(document.getElementById("canvas"));
    mouseX = (clientX - canvasPosition.x) / 30;
    mouseY = (clientY - canvasPosition.y) / 30;
    e.preventDefault();
    if(multibodies.length == 0 && preselectBody.GetID() != 1024){
        preselectBody.SetAwake(true);
        preselectBody.SetAngularVelocity(0);
        preselectBody.SetLinearVelocity(new b2Vec2(0,0));

        if(!(mouseX >= (premouseX - 2/30)  && mouseX <= (premouseX + 2/30)
            && mouseY >= (premouseY - 2/30) && mouseY <= (premouseY + 2/30)))
        {
            //if(!(e.button == 2)){
            if(preMovePosition[0]) {
                LoadMovePosition(preselectBody.GetID(),false);
            }
            else {
                if(ifattract[preselectBody.GetID()])
                iternum = 0;
            }
            //}
            for(f = preselectBody.GetFixtureList();
                f; f = f.m_next)
            {
                f.SetSensor(true);
            }
        }
    }
    else{
        for(var i=0;i<multibodies.length;i++){
            var bID = multibodies[i];
            bodyList[bID].SetAwake(true);
            bodyList[bID].SetAngularVelocity(0);
            bodyList[bID].SetLinearVelocity(new b2Vec2(0,0));
        }

        if(!(mouseX >= (premouseX - 2/30)  && mouseX <= (premouseX + 2/30)
            && mouseY >= (premouseY - 2/30) && mouseY <= (premouseY + 2/30)))
        {
            if(preMovePosition[0]) {
                LoadMovePosition(undefined,true);
            }
            else iternum = 0;
            for(var i=0;i<multibodies.length;i++){
                var bID = multibodies[i];
                for(f = bodyList[bID].GetFixtureList();
                    f; f = f.m_next)
                {
                    f.SetSensor(true);
                }
            }
        }
    }

    premouseX = mouseX;
    premouseY = mouseY;
    if(e.targetTouches)
    {
        if(e.targetTouches.length == 1 && hasselect.flag)
        {
            isMouseMove = true;
        }
        if(e.targetTouches.length == 2 && hasselect.flag)
        {
            var f;
            for(f = preselectBody.GetFixtureList();
                f; f = f.m_next)
            {
                f.SetSensor(false);
            }
        }
    }
    else{
        if((e.button == 0 && hasselect.flag)|| (e.button == 0 && multibodies.length != 0))
        {
            isMouseMove = true;
        }
        if(e.button == 2 && hasselect.flag || (e.button == 2 && multibodies.length != 0))
        {
            if(multibodies.length == 0){
                var f;
                for(f = preselectBody.GetFixtureList();
                    f; f = f.m_next)
                {
                    f.SetSensor(false);
                }
            }
            else{
                for(var i=0;i<multibodies.length;i++){
                    var bID = multibodies[i];
                    var f;
                    for(f = bodyList[bID].GetFixtureList();
                        f; f = f.m_next)
                    {
                        f.SetSensor(false);
                    }
                }
            }
            isMouseRotate = true;
        }
    }
};

function handleMousescroll(e) {
    //鼠标滚轮事件，目前暂时不兼容Firefox浏览器
    var direct=0;
    e=e || window.event;
    if(hasselect.flag)
    {
        var sID = selectedBody.GetID();
        /*if(sID == 1024) {
            var shrinkratio;
            if(e.wheelDelta<0){
                shrinkratio = 0.9;
                var f;
                for(f = pushingbar.GetFixtureList();
                    f; f = f.m_next)
                {
                    var selectshape = f.GetShape();
                    var vecarray = selectshape.GetVertices();
                    for(var i in vecarray)
                    {
                        var vec = vecarray[i];
                        vec.x = vec.x * shrinkratio;
                        vec.y = vec.y * shrinkratio;
                    }
                }

                bodyheight[sID] = bodyheight[sID]*shrinkratio;
                bodywidth[sID] = bodywidth[sID]*shrinkratio;
            }
            else{
                shrinkratio = 1.1;
                var f;
                for(f = pushingbar.GetFixtureList();
                    f; f = f.m_next)
                {
                    var selectshape = f.GetShape();
                    var vecarray = selectshape.GetVertices();
                    for(var i in vecarray)
                    {
                        var vec = vecarray[i];
                        vec.x = vec.x * shrinkratio;
                        vec.y = vec.y * shrinkratio;
                    }
                }

                bodyheight[sID] = bodyheight[sID]*shrinkratio;
                bodywidth[sID] = bodywidth[sID]*shrinkratio;
            }
        }
        else{*/
            if(e.wheelDelta) {
                if(e.wheelDelta<0){
                    //滑轮向下滑动，缩小物体，缩小物体权重，最小至最小物体的权重
                    var newweight = we[sID] * 0.95;
                    ScaleWords(sID,newweight);
                }
                else{
                    //滑轮向上滑动，放大物体，放大物体权重，最大至1
                    var newweight = we[sID] * 1.05;
                    if((newweight < 0.5) || (newweight >= 0.5 && ifsubdivided[sID] == true)) ScaleWords(sID,newweight);
                    else{
                        //放大权重超过0.5的单词，重新构造刚体，进行细分
                        var pos = {x:bodyList[sID].GetPosition().x,y:bodyList[sID].GetPosition().y};
                        var ang = bodyList[sID].GetAngle();
                        var iffix = bodyList[sID].IsFixedRotation();
                        world.DestroyBody(bodyList[sID]);
                        we[sID] = newweight;
                        ReCreateBody(pos,ang,iffix,sID,false);
                        ifsubdivided[sID] = true;
                    }
                }
            }
            if(ifattract[sID])
                iternum = 0;
        //}
    }
    if(e.preventDefault){/*FF 和 Chrome*/
        e.preventDefault();// 阻止默认事件
    }
}

function ScaleWords(sID,newweight) {
    var fontsize = (maxfontsize-minfontsize) * newweight + minfontsize;
    context2.font = fontsize + "px " + tagFont[sID];
    var newwidth = context2.measureText(wo[sID]).width/2;
    var shrinkratio = newwidth/bodywidth[sID];
    var f;
    for(f = bodyList[sID].GetFixtureList();
        f; f = f.m_next)
    {
        var selectshape = f.GetShape();
        var vecarray = selectshape.GetVertices();
        for(var i in vecarray)
        {
            var vec = vecarray[i];
            vec.x = vec.x * shrinkratio;
            vec.y = vec.y * shrinkratio;
        }
    }
    bodyheight[sID] = bodyheight[sID] * shrinkratio;
    bodywidth[sID] = newwidth;
    we[sID] = newweight;
}

function handleTouchRotate(e){
    if(hasselect.flag)
    {
        isMouseMove = false;
        isMouseRotate = false;
        var f;
        for(f = selectedBody.GetFixtureList();
            f; f = f.m_next)
        {
            f.SetSensor(false);
        }
        switch (e.type)
        {
            case 'rotatestart':
                rotationstart = e.rotation;
                //prefingerpositon[0] = {x:e.pointers[0].pageX,y:e.pointers[0].pageY};
                //prefingerpositon[1] = {x:e.pointers[1].pageX,y:e.pointers[1].pageY};
                break;
            case 'rotatemove':
                var touches = e.pointers;
                rotationend = e.rotation - rotationstart;
                rotationstart = e.rotation;
                selectedBody.SetAngularVelocity(0);
                selectedBody.SetLinearVelocity(new b2Vec2(0,0));
                selectedBody.SetAwake(true);
                selectedBody.m_force.SetZero();
                var preangle = selectedBody.GetAngle();
                selectedBody.SetAngle(preangle + rotationend * Math.PI/180);
                prefingerpositon[0] = {x:e.pointers[0].pageX,y:e.pointers[0].pageY};
                prefingerpositon[1] = {x:e.pointers[1].pageX,y:e.pointers[1].pageY};
                break;
        }
    }
}

function handleTouchPinch(e){
    if(hasselect.flag)
    {
        var touches = e.pointers;
        var scale = 1;
        isMouseMove = false;
        isMouseRotate = false;
        var f;
        for(f = selectedBody.GetFixtureList();
            f; f = f.m_next)
        {
            f.SetSensor(false);
        }
        switch (e.type)
        {
            case 'pinchstart':
                scalestart = Math.sqrt(
                    ((touches[0].pageX-touches[1].pageX)*(touches[0].pageX-touches[1].pageX))
                    +((touches[0].pageY-touches[1].pageY)*(touches[0].pageY-touches[1].pageY)));
                break;
            case 'pinchmove':
                scaleend = Math.sqrt(
                    ((touches[0].pageX-touches[1].pageX)*(touches[0].pageX-touches[1].pageX))
                    +((touches[0].pageY-touches[1].pageY)*(touches[0].pageY-touches[1].pageY)));
                scale = scaleend/scalestart;
                scalestart = scaleend;
                break;
        }

        var sID = selectedBody.GetID();
        /*if(sID == 1024) {
            var f;
            for(f = pushingbar.GetFixtureList();
                f; f = f.m_next)
            {
                var selectshape = f.GetShape();
                var vecarray = selectshape.GetVertices();
                for(var i in vecarray)
                {
                    var vec = vecarray[i];
                    vec.x = vec.x * scale;
                    vec.y = vec.y * scale;
                }
            }

            bodyheight[sID] = bodyheight[sID]*scale;
            bodywidth[sID] = bodywidth[sID]*scale;
        }
        else {*/
            var newweight = we[sID] * scale;
            if((newweight < 0.5) || (newweight >= 0.5 && ifsubdivided[sID] == true)) ScaleWords(sID,newweight);
            else{
                //放大权重超过0.5的单词，重新构造刚体，进行细分
                var pos = {x:bodyList[sID].GetPosition().x,y:bodyList[sID].GetPosition().y};
                var ang = bodyList[sID].GetAngle();
                var iffix = bodyList[sID].IsFixedRotation();
                world.DestroyBody(bodyList[sID]);
                we[sID] = newweight;
                ReCreateBody(pos,ang,iffix,sID,false);
                ifsubdivided[sID] = true;
            }

            if(ifattract[sID]) iternum = 0;
        //}
    }
}

function getBodyAtMouse() {
    mousePVec = new b2Vec2(mouseX, mouseY);
    var aabb = new b2AABB();
    aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
    aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);

    // Query the world for overlapping shapes.

    selectedBody = null;
    world.QueryAABB(getBodyCB, aabb);
    return selectedBody;
}

function getBodyCB(fixture) {
    if(fixture.GetBody().GetID() >= 0) {
        if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
            selectedBody = fixture.GetBody();
            return false;
        }
    }
    return true;
}

var temPosition = undefined;

function findNeighbor(isR,jp) {
    var j = 0;
    if(isR) j = jp;
    for(j;j<wordnum;j++)
    {
        var anotherpo = new b2Vec2();
        var myPosition;
        if(!isR) myPosition = prePosition[j];
        else myPosition = bodyList[j].GetWorldCenter();
        if(we[j] >= 0.5) myPosition = CorrectCenter(j,myPosition);
        var myNeighbor = new Array();
        for(var i=0;i<wordnum;i++)
        {
            //判断相邻的依据被定义为若两个Body的连线不经过第三个Body
            //则两个Body相邻
            if(i==j) continue;

            if(!isR) anotherpo = prePosition[i];
            else anotherpo = bodyList[i].GetWorldCenter();
            if(we[i] >= 0.5) anotherpo = CorrectCenter(i,anotherpo);
            var haveother = false;

            for(var v=0;v<wordnum;v++)
            {
                if(v == i || v == j) continue;
                var vpos = bodyList[v].GetPosition();
                var vcenter = bodyList[v].GetWorldCenter();
                if(we[v] >= 0.5) vcenter = CorrectCenter(v,vcenter);

                var vPoints = [
                    {x:vcenter.x*drawScale - bodywidth[v], y:vcenter.y*drawScale - bodyheight[v]}, //左上角
                    {x:vcenter.x*drawScale + bodywidth[v], y:vcenter.y*drawScale - bodyheight[v]}, //右上角
                    {x:vcenter.x*drawScale + bodywidth[v], y:vcenter.y*drawScale + bodyheight[v]}, //右下角
                    {x:vcenter.x*drawScale - bodywidth[v], y:vcenter.y*drawScale + bodyheight[v]}  //左下角
                ];
                var vAngle = bodyList[v].GetAngle();
                if(vAngle != 0){
                    for(var u=0;u<vPoints.length;u++) {
                        var newX = (vPoints[u].x - vpos.x*drawScale)*Math.cos(vAngle) - (vPoints[u].y - vpos.y*drawScale)*Math.sin(vAngle) + vpos.x*drawScale;
                        vPoints[u].y = (vPoints[u].x - vpos.x*drawScale)*Math.sin(vAngle) + (vPoints[u].y - vpos.y*drawScale)*Math.cos(vAngle) + vpos.y*drawScale;
                        vPoints[u].x = newX;
                    }
                }
                var a = {x:myPosition.x*drawScale,y:myPosition.y*drawScale};
                var b = {x:anotherpo.x*drawScale,y:anotherpo.y*drawScale};
                for(var u=0;u<4;u++){
                    var firstpoint = vPoints[u];
                    var secondpoint;
                    if(u == 3)
                        secondpoint = vPoints[0]
                    else secondpoint = vPoints[u+1];

                    var intersection = segmentsIntr(a,b,firstpoint,secondpoint);
                    if(intersection != false){
                        haveother = true;
                        break;
                    }
                }
            }

            /*var FixtureAll = world.RayCastAll(myPosition,anotherpo);
            var ID = -1;

            for(var v=0;v<FixtureAll.length;v++)
            {
                ID = FixtureAll[v].GetBody().GetID();
                if(ID == j) continue;
                else {
                    if(ID != i){
                        //如果两点连线连段上有别的Body经过，则认为这两个Body不相邻
                        haveother = true;
                        break;
                    }
                }
            }*/

            if(!haveother) myNeighbor.push(i);
        }
        if(!isR) wordsNeighbor[j] = myNeighbor;
        else
        {
            return myNeighbor;
        }
    };
    temPosition = undefined;
}

function calR(i) {
    //这个P存储的是边,i是中心点，j是它的邻居点
    var S = [[0,0],[0,0]];
    for(var j=0;j<wordsNeighbor[i].length;j++)
    {
        var JID = wordsNeighbor[i][j];
        var P = [[prePosition[i].x - prePosition[JID].x],[prePosition[i].y - prePosition[JID].y]];
        var positionI = bodyList[i].GetPosition();
        var positionJ = bodyList[JID].GetPosition();
        var PP = [[positionI.x-positionJ.x],[positionI.y-positionJ.y]];
        var Sa = numeric.dot(P,numeric.transpose(PP));

        //权重部分处理
        var wIJ = 5*10*we[i]*we[j];
        var length = PP[0][0]*PP[0][0] + PP[1][0]*PP[1][0];
        wIJ = wIJ/length;
        Sa = numeric.mul(Sa,wIJ);

        S = numeric.add(S,Sa);
    }
    //numeric.js 这个库计算精度有问题，所以对S保留小数点后4位，从此告别NAN错误
    for(var u=0;u<2;u++)
        for(var v=0;v<2;v++)
            S[u][v] = parseFloat(S[u][v].toFixed(4));

    var re=numeric.svd(S);
    var UT = numeric.transpose(re.U);
    var V = re.V;
    var Svalue = re.S;
    var R = numeric.dot(V,UT);
    if(numeric.det(R) <= 0)
    {
        if(Svalue[0] > Svalue[1])
        {
            var reU = [[re.U[0][0],-re.U[0][1]],[re.U[1][0],-re.U[1][1]]];
            R = numeric.dot(V,numeric.transpose(reU));
        }
        else
        {
            var reU = [[-re.U[0][0],re.U[0][1]],[-re.U[1][0],re.U[1][1]]];
            R = numeric.dot(V,numeric.transpose(reU));
        }
    }

    //以下是debug时用的错误信息输出
    if(numeric.det(R) <= 0) console.log("发生行列式错误：" + i);
    for(var u=0;u<2;u++)
    {
        for(var v=0;v<2;v++)
        {
            if(!R[u][v] && R[u][v]!=0)
            {
                console.log("R有问题" + JSON.stringify(S));
                return [[1,0],[0,1]];
            }
        }
    }

    return R;
}

function calattractF(i) {
    var sum = [0,0];
    for(var j=0;j<wordsNeighbor[i].length;j++)
    {
        var positionI = bodyList[i].GetPosition();
        var JID = wordsNeighbor[i][j];
        var positionJ = bodyList[JID].GetPosition();
        var Ri = calR(i);
        var Rj = calR(JID);
        var R = numeric.add(Ri,Rj);
        var P = [[prePosition[i].x - prePosition[JID].x],[prePosition[i].y - prePosition[JID].y]];
        var PP = [[positionI.x-positionJ.x],[positionI.y-positionJ.y]];
        var Sa = numeric.dot(R,P);
        Sa = numeric.mul(Sa,-1/2);
        Sa = numeric.add(PP,Sa);
        //乘了4*10^15倍  这个力too small，必须要倍乘很大的倍数才能显现出来
        Sa = numeric.mul(Sa,4000000000000000);
        Sa = numeric.transpose(Sa);

        //权重部分处理
        var wIJ = 5*10*we[i]*we[j];
        var length = PP[0][0]*PP[0][0] + PP[1][0]*PP[1][0];
        wIJ = wIJ/length;
        Sa[0] = numeric.mul(Sa[0],wIJ);

        sum = numeric.add(sum,Sa[0]);
    }
    return sum;
}

function drawText() {
    if(!Ifdebug) {
        context.clearRect(0,0,context.canvas.width,context.canvas.height);
        context.save();
        context.fillStyle = backgroundcolor;
        context.fillRect(0,0,canvaswidth,canvasheight);
        context.restore();
    }

    /*context.save();
    context.translate(pushingbar.GetPosition().x*drawScale, pushingbar.GetPosition().y*drawScale);
    context.rotate(pushingbar.GetAngle());
    context.fillStyle = "#009933";
    context.fillRect(-bodywidth[1024],-bodyheight[1024],bodywidth[1024]*2,bodyheight[1024]*2);
    context.restore();*/

    //根据Box的位置画上文字，画在中心位置
    for(var i=0;i<wordnum;i++)
    {
        var position = bodyList[i].GetPosition();
        var angle = bodyList[i].GetAngle();

        context.save();
        context.translate(position.x*drawScale, position.y*drawScale);
        context.rotate(angle);
        var fontsize = (maxfontsize-minfontsize)*we[i] + minfontsize;
        context.font = fontsize + "px " + tagFont[i];
        context.fillStyle = tagColor[i];
        context.textAlign="center";
        if(we[i] >= 0.5)
            context.fillText(wo[i], 0, fontsize/2);
        else context.fillText(wo[i], 0, bodyheight[i]);

        context.restore();
    }
    for(var j=0;j<animation.length;j++){
        i = animation[j].id;

        var position = bodyList[i].GetPosition();
        var angle = bodyList[i].GetAngle();

        context.save();
        context.translate(position.x*drawScale, position.y*drawScale);
        context.rotate(angle);
        var fontsize = (maxfontsize-minfontsize)*we[i] + minfontsize;
        context.font = fontsize + "px " + tagFont[i];
        context.fillStyle = tagColor[i];
        context.textAlign="center";
        if(we[i] >= 0.5)
            context.fillText(wo[i], 0, fontsize/2);
        else context.fillText(wo[i], 0, bodyheight[i]);

        context.restore();
    }

    for(var i=0;i<multibodies.length;i++){
        var sID = multibodies[i];
        var angle = bodyList[sID].GetAngle();
        var position = bodyList[sID].GetWorldCenter();
        var width = bodywidth[sID];
        var height = bodyheight[sID];
        var fontsize = (maxfontsize-minfontsize)*we[sID] + minfontsize;
        context.save();
        context.translate(position.x*drawScale, position.y*drawScale);
        context.rotate(angle);
        context.strokeStyle = "#ff00ff";
        if(we[sID] >= 0.5)
            context.strokeRect(-width,-height + fontsize/2 - height + bodydesent[sID],width*2,height*2);
        else context.strokeRect(-width,-height,width*2,height*2);
        context.restore();
    }

    if(hasselect.flag)
    {
        if(!ifaddconstrain)
        {
            var sID = selectedBody.GetID();
            var angle = selectedBody.GetAngle();
            var position = selectedBody.GetWorldCenter();
            var width = bodywidth[sID];
            var height = bodyheight[sID];
            var fontsize = (maxfontsize-minfontsize)*we[sID] + minfontsize;
            context.save();
            context.translate(position.x*drawScale, position.y*drawScale);
            context.rotate(angle);
            context.strokeStyle = "#ff00ff";
            if(we[sID] >= 0.5)
                context.strokeRect(-width,-height + fontsize/2 - height + bodydesent[sID],width*2,height*2);
            else context.strokeRect(-width,-height,width*2,height*2);
            context.restore();
        }
        else {
            var len = constrainBody.length - 1;
            if(constrainBody[len])
            {
                for(var i=0;i<constrainBody[len].length;i++)
                {
                    var sID = constrainBody[len][i];
                    var angle = bodyList[sID].GetAngle();
                    var position = bodyList[sID].GetWorldCenter();
                    var width = bodywidth[sID];
                    var height = bodyheight[sID];
                    var fontsize = (maxfontsize-minfontsize)*we[sID] + minfontsize;
                    context.save();
                    context.translate(position.x*drawScale, position.y*drawScale);
                    context.rotate(angle);
                    context.strokeStyle = "#009933";
                    if(we[sID] >= 0.5)
                        context.strokeRect(-width,-height + fontsize/2 - height + bodydesent[sID],width*2,height*2);
                    else context.strokeRect(-width,-height,width*2,height*2);
                    context.restore();
                }
            }
        }
    }
}

function update() {
    if(hasselect.flag || multibodies.length != 0)
        if(preBodypos) preBodypos = {x:selectedBody.GetWorldCenter().x,y:selectedBody.GetWorldCenter().y};
    mouseMoveAndRotate();  //鼠标操作移动和旋转封装方法
    centerAttract();   //中心吸引力封装方法
    forEachAttract();  //刚体和邻居的相互作用力封装方法
    AnimationCal();

    world.Step(
        1 / 60   //frame-rate
        ,  10       //velocity iterations
        ,  10       //position iterations
    );
    world.DrawDebugData();
    //if(iternum%2 == 0)
    drawText();
    world.ClearForces();
    //showParameter();
};

function mouseMoveAndRotate() {
    if(isMouseMove)
    {
        selectedBody.SetAngularVelocity(0);
        selectedBody.SetLinearVelocity(new b2Vec2(0,0));
        selectedBody.SetAwake(true);
        selectedBody.m_force.SetZero();
        var prePositon = {x:selectedBody.GetPosition().x,y:selectedBody.GetPosition().y};
        var differ = {x:mouseX + mousevector.x - prePositon.x,y:mouseY + mousevector.y - prePositon.y};
        selectedBody.SetPosition(new b2Vec2(prePositon.x+differ.x,prePositon.y+differ.y));
        if(multibodies.length != 0){
            for(var i=0;i<multibodies.length;i++){
                var bID = multibodies[i];
                if(bID == selectedBody.GetID()) continue;
                var prePositon = {x:bodyList[bID].GetPosition().x,y:bodyList[bID].GetPosition().y};
                bodyList[bID].SetPosition(new b2Vec2(prePositon.x+differ.x,prePositon.y+differ.y));
            }
        }
    }

    if(isMouseRotate)
    {
        if(!firstrotate)
        {
            if(isshift){
                var center = selectedBody.GetWorldCenter();
                var newangle = Math.atan2(mouseY - center.y, mouseX - center.x) - mrRadian;
                if(Math.abs((newangle*180/Math.PI)%15) < 5){
                    selectedBody.SetAngularVelocity(0);
                    selectedBody.SetLinearVelocity(new b2Vec2(0,0));
                    selectedBody.SetAwake(true);
                    selectedBody.m_force.SetZero();
                    var setangle = Math.floor((newangle*180/Math.PI)/15)*15;
                    selectedBody.SetAngle(setangle*Math.PI/180);
                    if(multibodies.length != 0){
                        for(var i=0;i<multibodies.length;i++){
                            var bID = multibodies[i];
                            if(bID == selectedBody.GetID()) continue;
                            bodyList[bID].SetAngle(setangle*Math.PI/180);
                        }
                    }
                }
            }
            else{
                selectedBody.SetAngularVelocity(0);
                selectedBody.SetLinearVelocity(new b2Vec2(0,0));
                selectedBody.SetAwake(true);
                selectedBody.m_force.SetZero();
                var center = selectedBody.GetWorldCenter();
                selectedBody.SetAngle(Math.atan2(mouseY - center.y, mouseX - center.x) - mrRadian);
                if(multibodies.length != 0){
                    for(var i=0;i<multibodies.length;i++){
                        var bID = multibodies[i];
                        if(bID == selectedBody.GetID()) continue;
                        bodyList[bID].SetAngle(Math.atan2(mouseY - center.y, mouseX - center.x) - mrRadian);
                    }
                }
            }
        }
        else
        {
            var center = selectedBody.GetWorldCenter();
            var preRadian = selectedBody.GetAngle();
            mrRadian = Math.atan2(mouseY - center.y, mouseX - center.x) - preRadian;
            firstrotate = false;
        }
    }
}

function centerAttract() {
    if(usecenter && AddForce){
        for(var i=0;i<wordnum;i++)
        {
            if(ifattract[i])
            {
                for(var j=0;j<planet.length;j++)
                {
                    var deposition = bodyList[i].GetWorldCenter();
                    var planetshpae = planet[j].GetFixtureList().GetShape();
                    var planetradius = planetshpae.GetRadius();
                    var planetposition = planet[j].GetWorldCenter();
                    var planetdistance = new b2Vec2(0,0);
                    planetdistance.Add(deposition);
                    planetdistance.Subtract(planetposition);
                    var finaldistance = planetdistance.Length();
                    planetdistance.Normalize();
                    if(finaldistance <= planetradius*5500000)
                    {
                        //对距离小于1的物体速度归零，防止产生蜜汁颤动
                        if(finaldistance < 1)
                        {
                            //bodyList[i].SetAwake(false);
                            bodyList[i].SetAngularVelocity(0);
                            bodyList[i].SetLinearVelocity(new b2Vec2(0,0));
                        }
                        else
                        {
                            planetdistance.NegativeSelf();
                            //应用万有引力定律
                            //var vecSum = Math.abs(planetdistance.x) + Math.abs(planetdistance.y);
                            //var m1 = (bodyheight[i]*2/drawScale) * (bodywidth[i]*2/drawScale);
                            var m1 = bodyList[i].GetMass();

                            var m2 = 1;
                            //planetdistance.Multiply(m1*m2*(finaldistance*finaldistance) * centerweight);
                            planetdistance.Multiply(m1*m2*(finaldistance*finaldistance) * (1.2/(iternum + 1)));
                            bodyList[i].ApplyForce(planetdistance,bodyList[i].GetWorldCenter());
                        }
                    }
                }
            }
        }
    }
    iternum++;
    if(isFirstContrust && iternum == 10)
    {
        preserveConstrain();
        isFirstContrust = false;
    }
}

function forEachAttract() {
    if(ifstart && AddForce)
    {
        if(iternum<80)
        {
            if(iternum <= 2 || iternum%5 == 0)
            findNeighbor(false,undefined);
            for(var i=0;i<wordnum;i++)
            {
                var Ftemp = calattractF(i);
                var Feach = new b2Vec2(-Ftemp[0]*arapweight,-Ftemp[1]*arapweight);
                if(ifattract[i])
                {
                    Feach.Multiply((1/(iternum + 1)));
                    bodyList[i].ApplyForce(Feach,bodyList[i].GetWorldCenter());
                    var bpreVelocity = {x:bodyList[i].GetLinearVelocity().x,y:bodyList[i].GetLinearVelocity().y};
                    if(iternum > 30){
                        bodyList[i].SetLinearVelocity(new b2Vec2(bpreVelocity.x*0.96,bpreVelocity.y*0.96));
                    }
                    if(iternum > 60){
                        bodyList[i].SetLinearVelocity(new b2Vec2(bpreVelocity.x*0.8,bpreVelocity.y*0.8));
                    }
                }else {
                    bodyList[i].SetAngularVelocity(0);
                    bodyList[i].SetLinearVelocity(new b2Vec2(0,0));
                }
            }
        }
        else{
            for(var i=0;i<wordnum;i++) {
                bodyList[i].SetAngularVelocity(0);
                bodyList[i].SetLinearVelocity(new b2Vec2(0,0));
            }
        }
    }

    if(UserReWordle) {console.log("用户要求Re-Worlde"); ReWordle(); UserReWordle = false;}

    for(var i=0;i<wordnum;i++)
    {
        prePosition[i] = bodyList[i].GetPosition();
    }
    ifstart = true;
}

function AnimationCal() {
    if(animation.length != 0){
        for(var i=0;i<animation.length;i++)
        {
            var info = animation[i];
            var allnum = 15;
            if(info.editflag == 0) allnum = 20;
            if(info.count < allnum){
                var differ = {x:(info.endpos.x - info.startpos.x),y:(info.endpos.y - info.startpos.y)};
                var pos = {
                    x:info.startpos.x+(differ.x*(info.count+1)/allnum),
                    y:info.startpos.y+(differ.y*(info.count+1)/allnum)
                };
                bodyList[info.id].SetPosition(new b2Vec2(pos.x,pos.y));
                info.count++;
            }
            else{
                bodyList[info.id].SetAngularVelocity(0);
                bodyList[info.id].SetLinearVelocity(new b2Vec2(0,0));
                animation.splice(i,1);
                if(info.editflag == 0 || info.editflag == 3) {
                    iternum = 0;
                }
                if(info.editflag == 0 || info.editflag >= 2){
                    var f;
                    for(f = bodyList[info.id].GetFixtureList();
                        f; f = f.m_next)
                    {
                        f.SetSensor(false);
                    }
                }
                i--;
            }
        }
    }
}

function segmentsIntr(a, b, c, d){

    // 三角形abc 面积的2倍
    var area_abc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);

    // 三角形abd 面积的2倍
    var area_abd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);

    // 面积符号相同则两点在线段同侧,不相交 (对点在线段上的情况,本例当作不相交处理);
    if ( area_abc*area_abd>=0 ) {
        return false;
    }

    // 三角形cda 面积的2倍
    var area_cda = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
    // 三角形cdb 面积的2倍
    // 注意: 这里有一个小优化.不需要再用公式计算面积,而是通过已知的三个面积加减得出.
    var area_cdb = area_cda + area_abc - area_abd ;
    if (  area_cda * area_cdb >= 0 ) {
        return false;
    }

    //计算交点坐标
    var t = area_cda / ( area_abd- area_abc );
    var dx= t*(b.x - a.x),
        dy= t*(b.y - a.y);
    return { x: a.x + dx , y: a.y + dy };

}

function sortNumber(a,b) {
    //从小到大
    return a - b;
}

function SaveEditData() {
    var position = new Array();
    var angle = new Array();
    for(var i=0;i<wordnum;i++)
    {
        var p = {};
        p.x = bodyList[i].GetPosition().x;
        p.y = bodyList[i].GetPosition().y;
        position.push(p);
        angle.push(bodyList[i].GetAngle());
    }
    var data = {word:wo,weight:we,position:position,angle:angle,ifattract:ifattract,color:tagColor,font:tagFont,
        iffix:bodyList[0].IsFixedRotation(),constrain:constrainBody,iter:iternum};
    document.getElementById("myTextArea").innerHTML = JSON.stringify(data);

    var aux = document.createElement("input");
    var content = document.getElementById("myTextArea").innerHTML || document.getElementById("myTextArea").value;
    aux.setAttribute("value", content);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);

    //var Url2=document.getElementById("myTextArea");
    //Url2.select(); // 选择对象
    //document.execCommand("Copy",false,null); // 执行浏览器复制命令
    alert("The edit data has been copied to the clipboard. You can paste it to the notepad and save it.");
};

function LoadEditData() {
    var str = prompt("Please input edit data: ","");
    var data = eval('(' + str + ')');

    var isNoWords = false;
    if(!world)
    {
        world = new b2World(new b2Vec2(0, 0),true);
        createWall();
        debugDraw();
        isNoWords = true;
    }

    for(var i=0;i<bodyList.length;i++)
    {
        world.DestroyBody(bodyList[i]);
    }

    ifstart = false;
    hasselect.flag = false;
    bodyList = [];
    bodywidth = [];
    bodyheight = [];
    prePosition = [];
    drawnBody = [];
    preEditInfo = [];
    preEditPoint = 0;
    preReWordleReason = [-1,-1];
    wo = data.word;
    we = data.weight;
    wordnum = wo.length;
    ifattract = data.ifattract;
    tagColor = data.color;
    tagFont = data.font;
    constrainBody = data.constrain;

    ReCreateObject_Load(data.position,data.angle,data.iffix,data.iter);

    if(isNoWords) {
        window.setInterval(update, 1000 / 60);
    }
};

function ReCreateObject_Load(position,angle,iffix,iter) {
    for(var i=0;i<wordnum;i++)
    {
        ReCreateBody(position[i],angle[i],iffix,i,true);
    }
    iternum = iter;
    ifstart = false;
}

function ReCreateBody(position,angle,iffix,i,isload) {
    fixDef.isSensor = false;
    fixDef.density = 1.0;
    fixDef.friction = 0.1;
    bodyDef.type = b2Body.b2_dynamicBody;
    fixDef.shape = new b2PolygonShape;
    var fontsize = (maxfontsize-minfontsize)*we[i] + minfontsize;
    context2.font = fontsize + "px " + tagFont[i];
    var width = context2.measureText(wo[i]).width;
    bodywidth[i] = width/2;
    bodyheight[i] = fontsize/2;
    ifsubdivided[i] = false;
    bodyDef.position.Set(position.x,position.y);
    var body = world.CreateBody(bodyDef);

    CreateLittleBody(width,fontsize,body,i);

    body.SetAngle(angle);
    body.SetID(i);
    bodyList[i] = body;
    drawnBody.push(body);
    body.SetFixedRotation(iffix);
    if(isload && iffix){
        var start;
        start = {x:0,y:0};
        if(position.y*30 <= 300)  start.y = (250 + createOffSet()*2)/drawScale;
        else  start.y = (350 + createOffSet()*2)/drawScale;
        if(position.x*30 <= 650) start.x = (550 + createOffSet()*2)/drawScale;
        else start.x = (750 + createOffSet()*2)/drawScale;
        var aniinfo = {id:i,startpos:start,endpos:position,count:0,editflag:0 };
        animation.push(aniinfo);
    }
}

function SaveNow() {
    var position = new Array();
    var angle = new Array();
    for(var i=0;i<wordnum;i++)
    {
        var p = {};
        p.x = bodyList[i].GetPosition().x;
        p.y = bodyList[i].GetPosition().y;
        position.push(p);
        angle.push(bodyList[i].GetAngle());
    }

    var info = {wordsPosition:position,wordsAngle:angle,wordsIfatr:ifattract,
        wordsTagColor:tagColor,wordsIffix:bodyList[0].IsFixedRotation(),wordsiternum:iternum};

    return info;
}

function SavePreEditPosition() {
    var position = new Array();
    var angle = new Array();
    for(var i=0;i<bodyList.length;i++)
    {
        var p = {};
        p.x = bodyList[i].GetPosition().x;
        p.y = bodyList[i].GetPosition().y;
        position.push(p);
        angle.push(bodyList[i].GetAngle());
    }

    var info = {prewo:[].concat(wo),prewe:[].concat(we),
        preTagColor:[].concat(tagColor),
        preTagFont:[].concat(tagFont),
        prewordnum:wordnum,prePosition:position,preAngle:angle};


    if(preEditPoint < 11){
        preEditInfo[preEditPoint] = info;
        preEditPoint++;
        if(preEditInfo.length != preEditPoint){
            var differ = preEditInfo.length - preEditPoint;
            preEditInfo.splice(preEditPoint,differ);
        }
    }
    else{
        preEditInfo.splice(0,1);
        preEditInfo[preEditPoint-1] = info;
    }
}

function PreOrAfterEdit(ifpre) {
    hasselect.flag = false;
    var info;
    if(ifpre){
        if(preEditPoint == preEditInfo.length){
            SavePreEditPosition();
        }
        if(preEditPoint > 1){
            iternum = 1000;
            info = preEditInfo[preEditPoint-2];
            if(info.prewordnum > wordnum){
                //发生了删词操作，可能多个，可能一个
                var differnum = info.prewordnum - wordnum;
                var last = wordnum + differnum -1;
                for(var j=differnum;j > 0;j--){
                    var bID = info.prewo.indexOf(wo[last]);
                    ChangeArrayPostion(bID,last);
                }
                wordnum = wordnum + differnum;
                for(var i=0;i<bodyList.length;i++)
                    bodyList[i].SetID(i);
                ifstart = false;
                for(var i=0;i<wordnum;i++)
                {
                    var start = {x:bodyList[i].GetPosition().x,y:bodyList[i].GetPosition().y};
                    var end = info.prePosition[i];
                    if(!(Math.abs(start.x - end.x) < 0.01 && Math.abs(start.y - end.y) < 0.01)){
                        for(var f = bodyList[i].GetFixtureList();
                            f; f = f.m_next)
                        {
                            f.SetSensor(true);
                        }
                        var aniinfo = {id:i,startpos:start,endpos:end,count:0,editflag:2};
                        animation.push(aniinfo);
                    }
                }
            }
            else if(info.prewordnum < wordnum){
                var bID;
                for(var i=0;i<wordnum;i++){
                    if(wo[i] != info.prewo[i]){
                        bID = i;
                        break;
                    }
                }
                DeleteWord(false,bID);
            }
            else if(info.prewordnum == wordnum){
                //词数不变，发生了移动或者旋转或者放缩操作
                for(var i=0;i<wordnum;i++)
                {
                    bodyList[i].SetAngle(info.preAngle[i]);
                    var start = {x:bodyList[i].GetPosition().x,y:bodyList[i].GetPosition().y};
                    var end = info.prePosition[i];
                    //差we还原
                    if(!(Math.abs(start.x - end.x) < 0.03 && Math.abs(start.y - end.y) < 0.03)){
                        for(var f = bodyList[i].GetFixtureList();
                            f; f = f.m_next)
                        {
                            f.SetSensor(true);
                        }
                        var aniinfo = {id:i,startpos:start,endpos:end,count:0,editflag:2};
                        animation.push(aniinfo);
                    }
                    if(we[i] != info.prewe[i]){
                        ScaleWords(i,info.prewe[i]);
                    }
                    if(tagFont[i] != info.preTagFont[i]){
                        SetWordFont(true,i,info.preTagFont[i]);
                    }
                }
                // tagColor = info.preTagColor  错误写法！直接引用了地址，怪不得值老是会变，我还以为存错了
                tagColor = [].concat(info.preTagColor);
            }
            preEditPoint--;
        }
        else alert("No more PreEdit information");
    }
    else{
            if(preEditPoint < preEditInfo.length){
            iternum = 1000;
            info = preEditInfo[preEditPoint];
            if(info.prewordnum < wordnum){
                //下一步是删词操作
                for(var i=info.prewo.length - 1;i>=info.prewordnum;i--){
                    var bID = wo.indexOf(info.prewo[i]);
                    DeleteWord(false,bID);
                }
            }
            else if(info.prewordnum > wordnum) {
                var differnum = info.prewordnum - wordnum;
                var last = wordnum + differnum -1;
                var bID = info.prewo.indexOf(wo[last]);
                ChangeArrayPostion(bID,last);
                wordnum++;
                for(var i=0;i<bodyList.length;i++)
                    bodyList[i].SetID(i);
                ifstart = false;
                for(var f = bodyList[bID].GetFixtureList();
                    f; f = f.m_next)
                {
                    f.SetSensor(true);
                }
                var start = {x:bodyList[bID].GetPosition().x,y:bodyList[bID].GetPosition().y};
                var end = info.prePosition[bID];
                if(!(Math.abs(start.x - end.x) < 0.03 && Math.abs(start.y - end.y) < 0.03)){
                    var aniinfo = {id:bID,startpos:start,endpos:end,count:0,editflag:2};
                    animation.push(aniinfo);
                }
            }
            else if(info.prewordnum == wordnum){
                //下一步是移动或者旋转或者放缩操作
                for(var i=0;i<wordnum;i++)
                {
                    bodyList[i].SetAngle(info.preAngle[i]);
                    var start = {x:bodyList[i].GetPosition().x,y:bodyList[i].GetPosition().y};
                    var end = info.prePosition[i];
                    if(!(Math.abs(start.x - end.x) < 0.01 && Math.abs(start.y - end.y) < 0.01)){
                        for(var f = bodyList[i].GetFixtureList();
                            f; f = f.m_next)
                        {
                            f.SetSensor(true);
                        }
                        var aniinfo = {id:i,startpos:start,endpos:end,count:0,editflag:2};
                        animation.push(aniinfo);
                    }
                    if(we[i] != info.prewe[i]){
                        ScaleWords(i,info.prewe[i]);
                    }
                    if(tagFont[i] != info.preTagFont[i]){
                        SetWordFont(true,i,info.preTagFont[i]);
                    }
                }
                tagColor = [].concat(info.preTagColor);
            }

            preEditPoint++;
            if(preEditPoint == preEditInfo.length){
                preEditInfo.splice(preEditInfo.length-1,1);
                preEditPoint --;
            }
        }
        else {
            alert("No more AfterEdit information");
        }
    }
}

function ChangeArrayPostion(a,b){
    var temp = {word:wo[b],weight:we[b],body:bodyList[b],color:tagColor[b],
    font:tagFont[b],width:bodywidth[b],height:bodyheight[b]};
    wo.splice(b,1);
    we.splice(b,1);
    bodyList.splice(b,1);
    tagColor.splice(b,1);
    tagFont.splice(b,1);
    bodywidth.splice(b,1);
    bodyheight.splice(b,1);
    ifattract.splice(b,1);

    wo.splice(a,0,temp.word);
    we.splice(a,0,temp.weight);
    bodyList.splice(a,0,temp.body);
    tagColor.splice(a,0,temp.color);
    tagFont.splice(a,0,temp.font);
    bodywidth.splice(a,0,temp.width);
    bodyheight.splice(a,0,temp.height);
    ifattract.splice(a,0,true);
}

function SaveMovePositon() {
    console.log("存了");
    AddForce = false;
    if(cBody)
        cBody.SetType(b2Body.b2_dynamicBody);
    for(var i=0;i<wordnum;i++){
        var pos = bodyList[i].GetPosition();
        preMovePosition[i] = {x:pos.x,y:pos.y};
        bodyList[i].SetAngularVelocity(0);
        bodyList[i].SetLinearVelocity(new b2Vec2(0,0));
    }
}

function LoadMovePosition(ID,ifmulti) {
    for(var i=0;i<wordnum;i++)
    {
        if(!ifmulti) {
            if(i == ID) continue;
        }
        else{
            if(multibodies.indexOf(i) != -1) continue;
        }
        for(var f = bodyList[i].GetFixtureList();
            f; f = f.m_next)
        {
            f.SetSensor(true);
        }
        bodyList[i].SetPosition(new b2Vec2(preMovePosition[i].x,preMovePosition[i].y));
    }

    for(var i=0;i<wordnum;i++)
    {
        for(var f = bodyList[i].GetFixtureList();
            f; f = f.m_next)
        {
            f.SetSensor(false);
        }
    }
}

function ReLayout() {
    SavePreEditPosition();
    hasselect.flag = false;
    ifedit = false;
    for(var i=0;i<wordnum;i++)
    {
        prePosition[i] = bodyList[i].GetPosition();
    }
    DestroyBody(false);
    //重新排序一下wolist 和 welist
    //ReSortWoandWe();
    createObject();
    isFirstContrust = true;
    ifstart = false;
}

function DestroyBody(isall) {
    if(isall){
        for(var i=0;i<bodyList.length;i++){
            world.DestroyBody(bodyList[i]);
        }

        bodyList = [];
        bodywidth = [];
        bodyheight = [];
        wordsNeighbor = [];
        prePosition = [];
        ifattract = [];
        tagColor = [];
    }
    else{
        for(var i=0;i<wordnum;i++)
        {
            world.DestroyBody(bodyList[i]);
            bodyList[i] = undefined;
            bodywidth[i] = undefined;
            bodyheight[i] = undefined;
            wordsNeighbor[i] = undefined;
            ifattract[i] = undefined;
            tagColor[i] = undefined;
        }
    }

    ifstart = false;
    drawnBody = [];
}

function ReSortWoandWe() {
    var prewo = [].concat(wo);
    //重新排序一下wolist 和 welist
    for (var i = 0;i<wordnum;i++) {
        for (var j = 0; j < wordnum-i-1; j++) {
            if (we[j]<we[j+1]) {
                var temp = we[j];
                var temp2 = wo[j];
                we[j] = we[j+1];
                wo[j] = wo[j+1];
                we[j+1] = temp;
                wo[j+1] = temp2;
            }
        }
    }
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
}

String.prototype.isInChinese = function() {
    return (this.length != this.replace(/[^\x00-\xff]/g,"**").length);
}

function getElementPosition(element) {
    var elem=element, tagname="", x=0, y=0;

    while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
        y += elem.offsetTop;
        x += elem.offsetLeft;
        tagname = elem.tagName.toUpperCase();

        if(tagname == "BODY")
            elem=0;

        if(typeof(elem) == "object") {
            if(typeof(elem.offsetParent) == "object")
                elem = elem.offsetParent;
        }
    }

    return {x: x, y: y};
};

$(document).ready(function(){
    $("#canvas").bind("contextmenu",function(e){
        return false;
    });
});

function measureTextH_W(ctx, left, top, width, height, fontsize, fontname, txt) {

    // Draw the text in the specified area
    ctx.clearRect(0,0,450,400);
    ctx.save();
    ctx.translate(left, fontsize + 10);
    ctx.font = fontsize +"px "+fontname;
    ctx.fillStyle = "#000000";
    ctx.fillText(txt,0,0);
    var bwidth = ctx.measureText(txt).width;
    ctx.restore();

    // Get the pixel data from the canvas
    var data = ctx.getImageData(left, top, width, height).data,
        first = false,
        last = false,
        desent = 0;
    r = height,
        c = 0;

    // Find the last line with a non-white pixel
    while(!last && r) {
        r--;
        for(c = 0; c < width; c++) {
            if(data[r * width * 4 + c * 4 + 3]) {
                last = r;
                break;
            }
        }
    }

    // Find the first line with a non-white pixel
    while(r) {
        r--;
        for(c = 0; c < width; c++) {
            if(data[r * width * 4 + c * 4 + 3]) {
                if(r > fontsize+10)
                    desent++;
                first = r;
                break;
            }
        }
    }

    // If we've got it then return the height
    if(first != r) {
        ctx.clearRect(0,0,150,150);
        return {height:(last - first),width:bwidth,desent:desent};
    }

    // We screwed something up...  What do you expect from free code?
    return 0;
}

function CorrectCenter(id,prepos) {
    var fontsize = (maxfontsize-minfontsize)*we[id] + minfontsize;
    var yoff = fontsize/2 - bodyheight[id] + bodydesent[id];
    var angle = bodyList[id].GetAngle();
    var cocenter = {x:prepos.x,y:prepos.y + yoff/drawScale};
    if(angle != 0){
        var newx = (cocenter.x - prepos.x)*Math.cos(angle) - (cocenter.y - prepos.y)*Math.sin(angle) + prepos.x;
        cocenter.y = (cocenter.x - prepos.x)*Math.sin(angle) + (cocenter.y - prepos.y)*Math.cos(angle) + prepos.y;
        cocenter.x = newx;
    }
    return new b2Vec2(cocenter.x,cocenter.y);
}

Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};