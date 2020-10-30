/**
 * Created by Ps on 2017/2/27.
 */
function ReWordle() {
    SavePreEditPosition();
    //再做一遍wordle，对边缘物体，尽量保持中心的邻居关系
    var ymax=0,xmax=0,ymin=1000,xmin=1000;
    for (var i = 0; i < wordnum; i++)
    {
        var bCenter = bodyList[i].GetWorldCenter();
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
    var R = Math.min((xmax-xmin)/2,(ymax-ymin)/2);
    console.log(R);

    var shouldMoveBody = [];

    for(var i=0;i<wordnum;i++)
    {
        var bodyposition = bodyList[i].GetWorldCenter();
        var distance = {x:bodyposition.x-center.x,y:bodyposition.y-center.y};
        var r = Math.sqrt(distance.x * distance.x + distance.y * distance.y);
        PreNeighbor[i] = wordsNeighbor[i];

        if(r>R*radiusRatio && we[i]<0.5)
        {
            var shouldprotect = false;
            for(var v=0;v<constrainBody.length;v++)
            {
                if(constrainBody[v].indexOf(i) == 1) shouldprotect = true;
            }

            if(!shouldprotect)
            {
                //console.log("可调单词：" + wo[i]);
                drawnBody.remove(bodyList[i]);
                for(var f = bodyList[i].GetFixtureList();
                    f; f = f.m_next)
                {
                    f.SetSensor(true);
                }
                var sbody = {id:i,r:r};
                shouldMoveBody.push(sbody);
            }
        }
    }

    shouldMoveBody.sort(sortNumber_forRewordle);

    neighberMove(center,shouldMoveBody,Reflag);

    iternum = 0;
    ifedit = false;
    console.log("ReWordle Over");
    PreNeighbor = [];
}

function neighberMove(center,smb,flag) {
    if(flag)
    {
        //这个是按照权重顺序
        for(var i=0;i<wordnum;i++)
        {
            var shouldmove = false;
            var f = bodyList[i].GetFixtureList();
            if(we[i] >= 0.5) {
                for(f = f.m_next; f; f = f.m_next) {
                    if(f.IsSensor()) shouldmove = true;
                }
            }
            else{
                for(f ; f; f = f.m_next) {
                    if(f.IsSensor()) shouldmove = true;
                }
            }
            if(shouldmove)
            {
                var po = bodyList[i].GetWorldCenter();
                drawnBody.remove(bodyList[i]);
                //中心最近的邻居的中心与物体中心连线，以该线段与邻居边界的交点作为起点

                var podisx = Math.abs(po.x - center.x);
                var podisy = Math.abs(po.y - center.y);

                var mindisneighbor = {dis:10000,id:-1};
                //var NeighborNow = findNeighbor(true,i);
                var sensorbody = [];
                for(var v=0;v<wordnum;v++)
                {
                    for(var f = bodyList[v].GetFixtureList();
                        f; f = f.m_next)
                    {
                        if(f.IsSensor()) {sensorbody.push(v);}
                    }
                }
                var NeighborIntersect = RemoveSensor(PreNeighbor[i],sensorbody);

                if(NeighborIntersect[0] == undefined) {
                    NeighborIntersect = findNeighbor(true,i);
                }

                var bodyposition;
                if(podisx > podisy){
                    //找距离中心水平距离最短的邻居
                    for(var v=0;v<NeighborIntersect.length;v++) {
                        bodyposition = bodyList[NeighborIntersect[v]].GetWorldCenter();
                        if(we[NeighborIntersect[v]] >= 0.5) bodyposition = CorrectCenter(NeighborIntersect[v],bodyposition);
                        var ndisx = Math.abs(bodyposition.x - center.x);
                        if(mindisneighbor.dis > ndisx){
                            mindisneighbor.dis = ndisx;
                            mindisneighbor.id = NeighborIntersect[v];
                        }
                    }
                }
                else{
                    //找距离中心垂直距离最短的邻居
                    for(var v=0;v<NeighborIntersect.length;v++) {
                        bodyposition = bodyList[NeighborIntersect[v]].GetWorldCenter();
                        if(we[NeighborIntersect[v]] >= 0.5) bodyposition = CorrectCenter(NeighborIntersect[v],bodyposition);
                        var ndisy = Math.abs(bodyposition.y - center.y);
                        if(mindisneighbor.dis > ndisy){
                            mindisneighbor.dis = ndisy;
                            mindisneighbor.id = NeighborIntersect[v];
                        }
                    }
                }

                //获取最近邻居的四个顶点位置
                var nID = mindisneighbor.id;
                var neighborpos = bodyList[nID].GetPosition();
                var neighborcenter = bodyList[nID].GetWorldCenter();
                if(we[nID] >= 0.5) neighborcenter = CorrectCenter(nID,neighborcenter);

                var nPoints = [
                    {x:neighborcenter.x*drawScale - bodywidth[nID], y:neighborcenter.y*drawScale - bodyheight[nID]}, //左上角
                    {x:neighborcenter.x*drawScale + bodywidth[nID], y:neighborcenter.y*drawScale - bodyheight[nID]}, //右上角
                    {x:neighborcenter.x*drawScale + bodywidth[nID], y:neighborcenter.y*drawScale + bodyheight[nID]}, //右下角
                    {x:neighborcenter.x*drawScale - bodywidth[nID], y:neighborcenter.y*drawScale + bodyheight[nID]}  //左下角
                ];

                var nangle = bodyList[nID].GetAngle();
                if(nangle != 0){
                    for(var v=0;v<nPoints.length;v++) {
                        var newx = (nPoints[v].x - neighborpos.x*drawScale)*Math.cos(nangle) - (nPoints[v].y - neighborpos.y*drawScale)*Math.sin(nangle) + neighborpos.x*drawScale;
                        nPoints[v].y = (nPoints[v].x - neighborpos.x*drawScale)*Math.sin(nangle) + (nPoints[v].y - neighborpos.y*drawScale)*Math.cos(nangle) + neighborpos.y*drawScale;
                        nPoints[v].x = newx;
                    }
                }

                //寻找交点
                var startpoint = {x:-10,y:-10};
                var a = {x:po.x*drawScale,y:po.y*drawScale};
                var b = {x:neighborcenter.x*drawScale,y:neighborcenter.y*drawScale};
                for(var v=0;v<4;v++){
                    var firstpoint = nPoints[v];
                    var secondpoint;
                    if(v == 3)
                        secondpoint = nPoints[0]
                    else secondpoint = nPoints[v+1];

                    var intersection = segmentsIntr(a,b,firstpoint,secondpoint);
                    if(intersection != false) {
                        startpoint = intersection;
                    }
                }


                if(startpoint.x == -10){
                    var pX = ((po.x - neighborcenter.x) * startPositionRatio + neighborcenter.x);
                    var pY = ((po.y - neighborcenter.y) * startPositionRatio + neighborcenter.y);
                    bodyList[i].SetPosition(new b2Vec2(pX,pY));
                }
                else bodyList[i].SetPosition(new b2Vec2(startpoint.x/drawScale,startpoint.y/drawScale));

                var poss = placeBody(bodyList[i],true);
                var finalpo = PickPosition(poss,bodyList[i]);
                var aniinfo = {id:i,startpos:prepo,endpos:finalpo,count:0,editflag:3};
                animation.push(aniinfo);
            }
        }
    }
    else
    {
        //按照距离圆心从小到大的顺序移动
        for(var j=0;j<smb.length;j++)
        {
            var i = smb[j].id;
            var po = bodyList[i].GetWorldCenter();
            var prepo = {x:bodyList[i].GetWorldCenter().x,y:bodyList[i].GetWorldCenter().y};
            drawnBody.remove(bodyList[i]);
            //中心最近的邻居的中心与物体中心连线，以该线段与邻居边界的交点作为起点

            var podisx = Math.abs(po.x - center.x);
            var podisy = Math.abs(po.y - center.y);

            var mindisneighbor = {dis:10000,id:-1};
            var sensorbody = [];
            for(var v=0;v<wordnum;v++)
            {
                for(var f = bodyList[v].GetFixtureList();
                    f; f = f.m_next)
                {
                    if(f.IsSensor()) {sensorbody.push(v);}
                }
            }
            var NeighborIntersect = RemoveSensor(PreNeighbor[i],sensorbody);

            if(NeighborIntersect[0] == undefined) {
                NeighborIntersect = findNeighbor(true,i);
            }

            var bodyposition;
            if(podisx > podisy){
                //找距离中心x距离最短的邻居
                for(var v=0;v<NeighborIntersect.length;v++) {
                    bodyposition = bodyList[NeighborIntersect[v]].GetWorldCenter();
                    if(we[NeighborIntersect[v]] >= 0.5) bodyposition = CorrectCenter(NeighborIntersect[v],bodyposition);
                    var ndisx = Math.abs(bodyposition.x - center.x);
                    if(mindisneighbor.dis > ndisx){
                        mindisneighbor.dis = ndisx;
                        mindisneighbor.id = NeighborIntersect[v];
                    }
                }
            }
            else{
                //找距离中心y距离最短的邻居
                for(var v=0;v<NeighborIntersect.length;v++) {
                    bodyposition = bodyList[NeighborIntersect[v]].GetWorldCenter();
                    if(we[NeighborIntersect[v]] >= 0.5) bodyposition = CorrectCenter(NeighborIntersect[v],bodyposition);
                    var ndisy = Math.abs(bodyposition.y - center.y);
                    if(mindisneighbor.dis > ndisy){
                        mindisneighbor.dis = ndisy;
                        mindisneighbor.id = NeighborIntersect[v];
                    }
                }
            }

            //获取最近邻居的四个顶点位置
            var nID = mindisneighbor.id;
            var neighborpos = bodyList[nID].GetPosition();
            var neighborcenter = bodyList[nID].GetWorldCenter();
            if(we[nID] >= 0.5) neighborcenter = CorrectCenter(nID,neighborcenter);

            var nPoints = [
                {x:neighborcenter.x*drawScale - bodywidth[nID], y:neighborcenter.y*drawScale - bodyheight[nID]}, //左上角
                {x:neighborcenter.x*drawScale + bodywidth[nID], y:neighborcenter.y*drawScale - bodyheight[nID]}, //右上角
                {x:neighborcenter.x*drawScale + bodywidth[nID], y:neighborcenter.y*drawScale + bodyheight[nID]}, //右下角
                {x:neighborcenter.x*drawScale - bodywidth[nID], y:neighborcenter.y*drawScale + bodyheight[nID]}  //左下角
            ];

            var nangle = bodyList[nID].GetAngle();
            if(nangle != 0){
                for(var v=0;v<nPoints.length;v++) {
                    var newx = (nPoints[v].x - neighborpos.x*drawScale)*Math.cos(nangle) - (nPoints[v].y - neighborpos.y*drawScale)*Math.sin(nangle) + neighborpos.x*drawScale;
                    nPoints[v].y = (nPoints[v].x - neighborpos.x*drawScale)*Math.sin(nangle) + (nPoints[v].y - neighborpos.y*drawScale)*Math.cos(nangle) + neighborpos.y*drawScale;
                    nPoints[v].x = newx;
                }
            }

            //寻找交点
            var startpoint = {x:-10,y:-10};
            var a = {x:po.x*drawScale,y:po.y*drawScale};
            var b = {x:neighborcenter.x*drawScale,y:neighborcenter.y*drawScale};
            for(var v=0;v<4;v++){
                var firstpoint = nPoints[v];
                var secondpoint;
                if(v == 3)
                    secondpoint = nPoints[0]
                else secondpoint = nPoints[v+1];

                var intersection = segmentsIntr(a,b,firstpoint,secondpoint);
                if(intersection != false) {
                    startpoint = intersection;
                }
            }


            if(startpoint.x == -10){
                var pX = ((po.x - neighborcenter.x) * startPositionRatio + neighborcenter.x);
                var pY = ((po.y - neighborcenter.y) * startPositionRatio + neighborcenter.y);
                bodyList[i].SetPosition(new b2Vec2(pX,pY));
            }
            else {
                bodyList[i].SetPosition(new b2Vec2(startpoint.x/drawScale,startpoint.y/drawScale));
            }

            var poss = placeBody(bodyList[i],true);
            var finalpo = PickPosition(poss,bodyList[i]);
            var aniinfo = {id:i,startpos:prepo,endpos:finalpo,count:0,editflag:3};
            animation.push(aniinfo);
        }
    }
}

function PickPosition(positions,body) {
    var scores = [];
    var sensorbody = [];
    for(var i=0;i<wordnum;i++)
    {
        for(var f = bodyList[i].GetFixtureList();
            f; f = f.m_next)
        {
            if(f.IsSensor()) {sensorbody.push(i);}
        }
    }
    var preNeighbor = RemoveSensor(PreNeighbor[body.GetID()],sensorbody);

    var preneighborword = [];
    for(var i=0;i<preNeighbor.length;i++)
        preneighborword.push(wo[preNeighbor[i]]);

    for(var i=0;i<positions.length;i++)
    {
        var pox = positions[i].x;
        var poy = positions[i].y;
        body.SetPosition(new b2Vec2(pox,poy));
        var NowNeighbor = findNeighbor(true,body.GetID());

        var nowneighborword = [];
        for(var j=0;j<NowNeighbor.length;j++)
            nowneighborword.push(wo[NowNeighbor[j]]);

        scores[i] = EvaluateScore(NowNeighbor,preNeighbor);
        //最后取最早达到最高分的那个位置，移过去，完成
    }

    var maxscorepos = scores.indexOf(Math.max.apply(Math, scores));
    var pox = positions[maxscorepos].x;
    var poy = positions[maxscorepos].y;
    body.SetPosition(new b2Vec2(pox,poy));
    drawnBody.push(body);
    return {x:pox,y:poy};
}

function RemoveSensor(Pren,sensor) {
    var newpren = [];
    for (var i=0;i<Pren.length;i++)
    {
        var ifhave = false;
        for(var j=0;j<sensor.length;j++)
        {
            if(Pren[i] == sensor[j]) ifhave = true;
        }
        if(!ifhave) newpren.push(Pren[i]);
    }
    return newpren;
}

function EvaluateScore(NowNeighbor,PreNeighbor) {
    var score = 0;
    for (var i1 = 0, i2 = 0; i1 < NowNeighbor.length && i2 < PreNeighbor.length; )
    {
        if (NowNeighbor[i1] != PreNeighbor[i2])
        {
            if (NowNeighbor[i1] < PreNeighbor[i2]) {
                ++i1;
            }
            else {
                ++i2;
            }
        }
        else {
            score++; ++i1; ++i2;
        }
    }
    return score;
}

function shouldReWordle() {
    var ymax=0,xmax=0,ymin=1000,xmin=1000;
    for (var i = 0; i < wordnum; i++)
    {
        var bCenter = bodyList[i].GetWorldCenter();
        if(we[i] >= 0.5) bCenter = CorrectCenter(i,bCenter);
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
    var R = Math.min((xmax-xmin)/2,(ymax-ymin)/2);

    for(var i=0;i<wordnum;i++)
    {
        if(!ifattract[i]) continue;
        //角度近似，对于小的角度变动同样当做竖直与水平情况处理
        var dif = 10 * Math.PI/180;
        var bangle = bodyList[i].GetAngle();
        if(!((bangle < dif && bangle > -dif) || (bangle > Math.PI/2 - dif && bangle < Math.PI/2 + dif)
            || (bangle > -Math.PI/2 - dif && bangle < -Math.PI/2 + dif)))
            continue;
        var bodyposition = bodyList[i].GetWorldCenter();
        if(we[i] >= 0.5) bodyposition = CorrectCenter(i,bodyposition);
        var distance = {x:bodyposition.x-center.x,y:bodyposition.y-center.y};
        var r = Math.sqrt(distance.x * distance.x + distance.y * distance.y);

        if(r<=R*0.8)
        {
            for(var j=0;j<wordsNeighbor[i].length;j++)
            {
                var nID = wordsNeighbor[i][j];
                var nbodyposition = bodyList[nID].GetWorldCenter();
                if(we[nID] >= 0.5) nbodyposition = CorrectCenter(nID,nbodyposition);
                if(!ifattract[nID]) continue;
                var nangle = bodyList[nID].GetAngle();
                //if(bodyList[nID].GetAngle() != 0 && bodyList[nID].GetAngle() != Math.PI/2 && bodyList[nID].GetAngle() != -Math.PI/2)
                if(!((nangle < dif && nangle > -dif) || (nangle > Math.PI/2 - dif && nangle < Math.PI/2 + dif)
                    || (nangle > -Math.PI/2 - dif && nangle < -Math.PI/2 + dif)))
                    continue;
                var width1 = bodywidth[i], height1 = bodyheight[i];
                var width2 = bodywidth[nID], height2 = bodyheight[nID];
                if((bangle > Math.PI/2 - dif && bangle < Math.PI/2 + dif)
                    || (bangle > -Math.PI/2 - dif && bangle < -Math.PI/2 + dif)) {
                    width1 = bodyheight[i];
                    height1 = bodywidth[i];
                }
                if((nangle > Math.PI/2 - dif && nangle < Math.PI/2 + dif)
                    || (nangle > -Math.PI/2 - dif && nangle < -Math.PI/2 + dif)) {
                    width2 = bodyheight[nID];
                    height2 = bodywidth[nID];
                }
                var xdiffer = Math.abs(nbodyposition.x - bodyposition.x)*drawScale - width1 - width2;
                var ydiffer = Math.abs(nbodyposition.y - bodyposition.y)*drawScale - height1 - height2;
                if(ydiffer > 40)
                {
                    if(IfAnotherOK(false,nID,i))
                    {
                        console.log("xdiffer情况: " + wo[i] + " & " + wo[nID]);
                        if((preReWordleReason[0] == nID && preReWordleReason[1] == i) ||
                            (preReWordleReason[1] == nID && preReWordleReason[0] == i))
                        {
                            document.getElementById("canvasinfo").innerHTML = "Maybe It is too far between words '" + wo[i]
                                +"' and '" + wo[nID] +"'.";
                            $("#canvasinfo").fadeIn("fast");
                            $("#canvasinfo").delay(5000).fadeOut("fast");
                            return false;
                        }
                        else
                        {
                            preReWordleReason[0] = nID;
                            preReWordleReason[1] = i;
                            return true;
                        }
                    }
                }
                else {
                    if(xdiffer > 70)
                    {
                        if(IfAnotherOK(true,nID,i))
                        {
                            console.log("xdiffer情况: "+wo[i] + " & " + wo[nID]);
                            if((preReWordleReason[0] == nID && preReWordleReason[1] == i) ||
                                (preReWordleReason[1] == nID && preReWordleReason[0] == i))
                            {
                                document.getElementById("canvasinfo").innerHTML = "Maybe It is too far between words '" + wo[i]
                                    +"' and '" + wo[nID] +"'.";
                                $("#canvasinfo").fadeIn("fast");
                                $("#canvasinfo").delay(5000).fadeOut("fast");
                                return false;
                            }
                            else
                            {
                                preReWordleReason[0] = nID;
                                preReWordleReason[1] = i;
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }
    //alert("meiyouwa");
    return false;
}

function IfAnotherOK(isx,nID,i) {
    //判断空隙的补正方法，非常繁琐，且只能用于横竖情况（囧）
    //直接遍历全局看是否有上下邻居靠得非常近的情况，终于写了个能用的小空隙过滤方法
    var bCenter = bodyList[i].GetWorldCenter();
    if(we[i] >= 0.5) bCenter = CorrectCenter(i,bCenter);
    var bnCenter = bodyList[nID].GetWorldCenter();
    if(we[nID] >= 0.5) bnCenter = CorrectCenter(nID,bnCenter);
    var xpo = bCenter.x;
    var xnpo = bnCenter.x;
    var ypo = bCenter.y;
    var ynpo = bnCenter.y;
    var xpmax,xpmin,ypmax,ypmin;
    if(xpo > xnpo) {xpmax = xpo;xpmin = xnpo;}
    else {xpmax = xnpo;xpmin = xpo;}
    if(ypo > ynpo) {ypmax = ypo;ypmin = ynpo;}
    else {ypmax = ynpo;ypmin = ypo;}
    if(isx)
    {
        var ymax = {d:0,id:-10},ymin = {d:1000,id:-10};
        for(var v=0;v<wordnum;v++)
        {
            if(v == i || v == nID) continue;
            var vCenter = bodyList[v].GetWorldCenter();
            if(we[v] >= 0.5) vCenter = CorrectCenter(v,vCenter);
            var bodyypo = vCenter.y;
            var bodyxpo = vCenter.x;
            if(bodyxpo > xpmin && bodyxpo < xpmax)
            {
                if(bodyypo > ypmax){
                    if(bodyypo < ymin.d) {ymin.d = bodyypo;ymin.id = v;}
                }
                if(bodyypo < ypmin){
                    if(bodyypo > ymax.d) {ymax.d = bodyypo;ymax.id = v;}
                }
            }
        }
        if(ymax.id != -10 && ymin.id != -10)
        {
            var height1 = bodyheight[ymax.id], height2 = bodyheight[ymin.id];
            if(bodyList[ymax.id].GetAngle() != 0) {height1 = bodywidth[ymax.id];}
            if(bodyList[ymin.id].GetAngle() != 0) {height2 = bodywidth[ymin.id];}
            var ydiffer2 = Math.abs(ymax.d - ymin.d)*drawScale - height1 - height2;
            if(ydiffer2 > 35) {
                //console.log(wo[ymax.id] + " & " + wo[ymin.id]);
                //console.log("x情况:邻居在异侧且差异大" + ydiffer2);
                return true;}
            else  {
                //console.log(wo[ymax.id] + " & " + wo[ymin.id]);
                //console.log("x情况:邻居在异侧但差异小: "+ ydiffer2);
                return false;}
        }
        else {//console.log("无ymax或者ymin");
            return true;}
    }
    else{
        var xmax = {d:0,id:-10},xmin = {d:1000,id:-10};
        for(var v=0;v<wordnum;v++)
        {
            if(v == i || v == nID) continue;
            var vCenter = bodyList[v].GetWorldCenter();
            if(we[v] >= 0.5) vCenter = CorrectCenter(v,vCenter);
            var bodyypo = vCenter.y;
            var bodyxpo = vCenter.x;
            if(bodyypo > ypmin && bodyypo < ypmax)
            {
                if(bodyxpo > xpmax){
                    if(bodyxpo < xmin.d) {xmin.d = bodyxpo;xmin.id = v;}
                }
                if(bodyxpo < xpmin){
                    if(bodyxpo > xmax.d) {xmax.d = bodyxpo;xmax.id = v;}
                }
            }
        }
        if(xmax.id != -10 && xmin.id != -10)
        {
            var width1 = bodywidth[xmax.id], width2 = bodywidth[xmin.id];
            if(bodyList[xmax.id].GetAngle() != 0) {width1 = bodyheight[xmax.id];}
            if(bodyList[xmin.id].GetAngle() != 0) {width2 = bodyheight[xmin.id];}
            var xdiffer2 = Math.abs(xmax.d - xmin.d)*drawScale - width1 - width2;
            if(xdiffer2 > 45) {
                //console.log(wo[xmax.id] + " & " + wo[xmin.id]);
                //console.log("y情况:邻居在异侧且差异大" + xdiffer2);
                return true;}
            else  {
                //console.log(wo[xmax.id] + " & " + wo[xmin.id]);
                //console.log("y情况:邻居在异侧但差异小: "+ xdiffer2);
                return false;}
        }
        else {//console.log("无xmax或者xmin");
            return true;}
    }
}

function sortNumber_forRewordle(a,b) {
    //从小到大
    var ar = a.r + (1/we[a.id])/5;
    var br = b.r + (1/we[b.id])/5;
    return ar - br;
}