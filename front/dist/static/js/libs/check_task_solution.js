var the_check = true;
var sets = [];

    function checkTaskSol() {
        if(checkTaskSolution()) {
            if(typeof resolver !== 'undefined') {
                fillParts();
                showTaskModal('#congratulationModal');
            } else {
                showSaveModal();
            }
        } else {
            if(typeof resolver !== 'undefined') {
                showTaskModal('#taskErrorModal');
            } else {
                myAlert('Задача решена неверно!')
            }
        }
    }

    function checkTaskSolution() {
        let res;
        sets = [];
        resetAllLines();
        while(true) {
            res = getPartSetLines();
            if(!res.error && res.set.length) {
                sets.push(res.set);
                drawPartContur(res.set);
            } else
                break;
        }

        if(res.error)
            return false;
        else
            return compareParts();
    }

    function drawPartContur(set) {
        context6.clearRect(0, 0, 5000, 5000);
        for(let i=1; i<set.length; i++)
            drawline(context6, cells[set[i].i][set[i].j][set[i].lineName], boldLine2);
        context6.clearRect(0, 0, 5000, 5000);
    }

    function compareParts() {
        let allPartsEquals = true;
        if(parts!=sets.length) {
//            myAlert('Фигура разрезана на ' + sets.length + ' частей.<br><br>Количество частей отличается от заданного.');
            allPartsEquals = false;
        } else {
            for(let i=1; i<sets.length; i++) {
                allPartsEquals = compare2Sets(sets[i]);
                if(!allPartsEquals)
                    break;
            }
        }
        return allPartsEquals;
    }

    function compare2Sets(set_i) {
        let res = false;
        if(sets[0].length == set_i.length)
            for(let i=0; i<sets[0].length; i++) {
                res = compare2SetsDirect(set_i, i);
                if(res)
                    break;
                res = compare2SetsBackMirror(set_i, i);
                if(res)
                    break;
            }
        return res;
    }

    function compare2SetsDirect(set_i, start_index_set_i) {
        for(let i=1; i<sets[0].length; i++) {
            let j;
            if(start_index_set_i + i < sets[0].length)
                j = start_index_set_i + i;
            else
                j = start_index_set_i + i - sets[0].length + 1;
            if(sets[0][i].angle != set_i[j].angle ||
                sets[0][i].lineName[0] != set_i[j].lineName[0])
                return false;
        }
        return true;
    }
    function compare2SetsBackMirror(set_i, start_index_set_i) {
        for(let i=1; i<sets[0].length; i++) {
            let j = sets[0].length - i - start_index_set_i, j2;
            if(j < 1)
                j = sets[0].length - 1 + j;
            j2 = j + 1;
            if(j2 == sets[0].length)
                j2 = 1;
            if(sets[0][i].angle != set_i[j2].angle ||
                sets[0][i].lineName[0] != set_i[j].lineName[0])
                return false;
        }
        return true;
    }


    function goodLine(line) {
        if(line.bold && line.choosed != 2) {
            if(line.cut) {
                if(line.choosed)
                    line.choosed = 2;
                else
                    line.choosed = 1;
            } else
                line.choosed = 2;
            return true;
        } else
            return false;
    }
    function resetAllLines() {
        for(let i=0; i<125; i++)
            for(let j=0; j<125; j++) {
                cells[i][j].l1.choosed = 0;
                cells[i][j].l2.choosed = 0;
                if(cells[i][j].l3!=undefined)
                    cells[i][j].l3.choosed = 0;
                else {
                    cells[i][j].d1.choosed = 0;
                    cells[i][j].d2.choosed = 0;
                }
            }
    }

    function getPartSetLines() {
        let set = [];
        let error = false;
        let line = getLeftTopLine();
        if(line) {
            set.push(line);
            switch(grid) {
                case 1: // квадрат
                    if(!getNextSetLine1(set)) {
                        error = true;
//                        myAlert('Ошибка. Есть незамкнутые контуры.');
                    }
                    break;
                case 2: // треугольник
                    if(!getNextSetLine2(set)) {
                        error = true;
//                        myAlert('Ошибка. Есть незамкнутые контуры.');
                    }
                    break;
                case 3: // гексагон
                    if(!getNextSetLine3(set)) {
                        error = true;
//                        myAlert('Ошибка. Есть незамкнутые контуры.');
                    }
                    break;
            }
        }
        return { set: set, error: error };
    }

    function getLeftTopLine() {
        switch(grid) {
            case 1: // квадрат
                for(let i=contur.i1; i<contur.i2+1; i++) {
                    for(let j=contur.j1; j<contur.j2+1; j++) {
                        if(goodLine(cells[i][j].l1)) {
                            cells[i][j].l1.choosed = 1;
                            return  {
                                        i:i, j:j, lineName: 'l1',
                                        start_X: cells[i][j].l1.x1,
                                        start_Y: cells[i][j].l1.y1,
                                        finish_X: cells[i][j].l1.x2,
                                        finish_Y: cells[i][j].l1.y2,
                                        angle: 0
                                    };
                        } else if(goodLine(cells[i][j].d1)) {
                            cells[i][j].d1.choosed = 1;
                            return  {
                                        i:i, j:j, lineName: 'd1',
                                        start_X: cells[i][j].d1.x1,
                                        start_Y: cells[i][j].d1.y1,
                                        finish_X: cells[i][j].d1.x2,
                                        finish_Y: cells[i][j].d1.y2,
                                        angle: 0
                                    };
                        } else if(goodLine(cells[i][j].d2)) {
                            cells[i][j].d2.choosed = 1;
                            return  {
                                        i:i, j:j, lineName: 'd2',
                                        start_X: cells[i][j].d2.x1,
                                        start_Y: cells[i][j].d2.y1,
                                        finish_X: cells[i][j].d2.x2,
                                        finish_Y: cells[i][j].d2.y2,
                                        angle: 0
                                    };
                        }
                    }
                }
                break;
            case 2: // треугольник
                for(let i=contur.i1; i<contur.i2+1; i++) {
                    for(let j=contur.j1; j<contur.j2+1; j++) {
                        if(goodLine(cells[i][j].l1)) {
                            cells[i][j].l1.choosed = 1;
                            return  {
                                        i:i, j:j, lineName: 'l1',
                                        start_X: cells[i][j].l1.x1,
                                        start_Y: cells[i][j].l1.y1,
                                        finish_X: cells[i][j].l1.x2,
                                        finish_Y: cells[i][j].l1.y2,
                                        angle: 0
                                    };
                        } else if(goodLine(cells[i][j].l3)) {
                            cells[i][j].l3.choosed = 1;
                            return  {
                                        i:i, j:j, lineName: 'l3',
                                        start_X: cells[i][j].l3.x1,
                                        start_Y: cells[i][j].l3.y1,
                                        finish_X: cells[i][j].l3.x2,
                                        finish_Y: cells[i][j].l3.y2,
                                        angle: 0
                                    };
                        }
                    }
                }
                break;
            case 3: // гексагон
                for(let i=contur.i1; i<contur.i2+1; i++) {
                    for(let j=contur.j1; j<contur.j2+1; j++) {
                        if(goodLine(cells[i][j].l2)) {
                            cells[i][j].l2.choosed = 1;
                            return  {
                                        i:i, j:j, lineName: 'l2',
                                        start_X: cells[i][j].l2.x1,
                                        start_Y: cells[i][j].l2.y1,
                                        finish_X: cells[i][j].l2.x2,
                                        finish_Y: cells[i][j].l2.y2,
                                        angle: 0
                                    };
                        }
                    }
                }
                break;
        }
        return false;
    }


    function getNextSetLine1(set) {
        let i = set[set.length-1].i;
        let j = set[set.length-1].j;
        let el = set[set.length-1];
        let nextLine;
        let ii = i, jj = j;
        switch(el.lineName) {
            case 'l1':
                if(cells[i][j].l1.x1 == el.start_X) {
                    // конец линии l1 в точке х2 (вырезаемый кусок снизу от линии)
                    // поиск ближайшей линии начинаем с нижней d2
                    // обход ведем против часовой стрелки
                    if(goodLine(cells[i][j].d2)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'd2',
                            start_X: cells[ii][jj].d2.x2,
                            start_Y: cells[ii][jj].d2.y2,
                            finish_X: cells[ii][jj].d2.x1,
                            finish_Y: cells[ii][jj].d2.y1,
                            angle: 1
                        };
                    } else if(goodLine(cells[i+1][j].l2)) {
                        ii = i+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x1,
                            start_Y: cells[ii][jj].l2.y1,
                            finish_X: cells[ii][jj].l2.x2,
                            finish_Y: cells[ii][jj].l2.y2,
                            angle: 2
                        };
                    } else if(goodLine(cells[i+1][j].d1)) {
                        ii = i+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd1',
                            start_X: cells[ii][jj].d1.x1,
                            start_Y: cells[ii][jj].d1.y1,
                            finish_X: cells[ii][jj].d1.x2,
                            finish_Y: cells[ii][jj].d1.y2,
                            angle: 3
                        };
                    } else if(goodLine(cells[i+1][j].l1)) {
                        ii = i+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x1,
                            start_Y: cells[ii][jj].l1.y1,
                            finish_X: cells[ii][jj].l1.x2,
                            finish_Y: cells[ii][jj].l1.y2,
                            angle: 4
                        };
                    } else if(goodLine(cells[i+1][j-1].d2)) {
                        ii = i+1; jj = j-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd2',
                            start_X: cells[ii][jj].d2.x1,
                            start_Y: cells[ii][jj].d2.y1,
                            finish_X: cells[ii][jj].d2.x2,
                            finish_Y: cells[ii][jj].d2.y2,
                            angle: 5
                        };
                    } else if(goodLine(cells[i+1][j-1].l2)) {
                        ii = i+1; jj = j-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x2,
                            start_Y: cells[ii][jj].l2.y2,
                            finish_X: cells[ii][jj].l2.x1,
                            finish_Y: cells[ii][jj].l2.y1,
                            angle: 6
                        };
                    } else if(goodLine(cells[i][j-1].d1)) {
                        jj = j-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd1',
                            start_X: cells[ii][jj].d1.x2,
                            start_Y: cells[ii][jj].d1.y2,
                            finish_X: cells[ii][jj].d1.x1,
                            finish_Y: cells[ii][jj].d1.y1,
                            angle: 7
                        };
                    } 
                } else { // конец линии l1 в точке х1 (вырезаемый кусок сверху от линии)
                    // поиск ближайшей линии начинаем с верхней d2
                    // обход ведем против часовой стрелки
                    if(goodLine(cells[i][j-1].d2)) {
                        jj = j-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd2',
                            start_X: cells[ii][jj].d2.x1,
                            start_Y: cells[ii][jj].d2.y1,
                            finish_X: cells[ii][jj].d2.x2,
                            finish_Y: cells[ii][jj].d2.y2,
                            angle: 1
                        };
                    } else if(goodLine(cells[i][j-1].l2)) {
                        jj = j-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x2,
                            start_Y: cells[ii][jj].l2.y2,
                            finish_X: cells[ii][jj].l2.x1,
                            finish_Y: cells[ii][jj].l2.y1,
                            angle: 2
                        };
                    } else if(goodLine(cells[i-1][j-1].d1)) {
                        ii = i-1; jj = j-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd1',
                            start_X: cells[ii][jj].d1.x2,
                            start_Y: cells[ii][jj].d1.y2,
                            finish_X: cells[ii][jj].d1.x1,
                            finish_Y: cells[ii][jj].d1.y1,
                            angle: 3
                        };
                    } else if(goodLine(cells[i-1][j].l1)) {
                        ii = i-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x2,
                            start_Y: cells[ii][jj].l1.y2,
                            finish_X: cells[ii][jj].l1.x1,
                            finish_Y: cells[ii][jj].l1.y1,
                            angle: 4
                        };
                    } else if(goodLine(cells[i-1][j].d2)) {
                        ii = i-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd2',
                            start_X: cells[ii][jj].d2.x2,
                            start_Y: cells[ii][jj].d2.y2,
                            finish_X: cells[ii][jj].d2.x1,
                            finish_Y: cells[ii][jj].d2.y1,
                            angle: 5
                        };
                    } else if(goodLine(cells[i][j].l2)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x1,
                            start_Y: cells[ii][jj].l2.y1,
                            finish_X: cells[ii][jj].l2.x2,
                            finish_Y: cells[ii][jj].l2.y2,
                            angle: 6
                        };
                    } else if(goodLine(cells[i][j].d1)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'd1',
                            start_X: cells[ii][jj].d1.x1,
                            start_Y: cells[ii][jj].d1.y1,
                            finish_X: cells[ii][jj].d1.x2,
                            finish_Y: cells[ii][jj].d1.y2,
                            angle: 7
                        };
                    } 
                }
                break;
            case 'l2':
                if(cells[i][j].l2.y1 == el.start_Y) 
                { // конец линии l2 в точке y2 (вырезаемый кусок слева от линии)
                    // поиск ближайшей линии начинаем слева с d1
                    // обход ведем против часовой стрелки
                    if(goodLine(cells[i-1][j].d1)) {
                        ii = i-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd1',
                            start_X: cells[ii][jj].d1.x2,
                            start_Y: cells[ii][jj].d1.y2,
                            finish_X: cells[ii][jj].d1.x1,
                            finish_Y: cells[ii][jj].d1.y1,
                            angle: 1
                        };
                    } else if(goodLine(cells[i-1][j+1].l1)) {
                        ii = i-1; jj = j+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x2,
                            start_Y: cells[ii][jj].l1.y2,
                            finish_X: cells[ii][jj].l1.x1,
                            finish_Y: cells[ii][jj].l1.y1,
                            angle: 2
                        };
                    } else if(goodLine(cells[i-1][j+1].d2)) {
                        ii = i-1; jj = j+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd2',
                            start_X: cells[ii][jj].d2.x2,
                            start_Y: cells[ii][jj].d2.y2,
                            finish_X: cells[ii][jj].d2.x1,
                            finish_Y: cells[ii][jj].d2.y1,
                            angle: 3
                        };
                    } else if(goodLine(cells[i][j+1].l2)) {
                        jj = j+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x1,
                            start_Y: cells[ii][jj].l2.y1,
                            finish_X: cells[ii][jj].l2.x2,
                            finish_Y: cells[ii][jj].l2.y2,
                            angle: 4
                        };
                    } else if(goodLine(cells[i][j+1].d1)) {
                        jj = j+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd1',
                            start_X: cells[ii][jj].d1.x1,
                            start_Y: cells[ii][jj].d1.y1,
                            finish_X: cells[ii][jj].d1.x2,
                            finish_Y: cells[ii][jj].d1.y2,
                            angle: 5
                        };
                    } else if(goodLine(cells[i][j+1].l1)) {
                        jj = j+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x1,
                            start_Y: cells[ii][jj].l1.y1,
                            finish_X: cells[ii][jj].l1.x2,
                            finish_Y: cells[ii][jj].l1.y2,
                            angle: 6
                        };
                    } else if(goodLine(cells[i][j].d2)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'd2',
                            start_X: cells[ii][jj].d2.x1,
                            start_Y: cells[ii][jj].d2.y1,
                            finish_X: cells[ii][jj].d2.x2,
                            finish_Y: cells[ii][jj].d2.y2,
                            angle: 7
                        };
                    }
                } else { // конец линии l2 в точке y1 (вырезаемый кусок справа от линии)
                    // поиск ближайшей линии начинаем с правой d1
                    // обход ведем против часовой стрелки
                    if(goodLine(cells[i][j].d1)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'd1',
                            start_X: cells[ii][jj].d1.x1,
                            start_Y: cells[ii][jj].d1.y1,
                            finish_X: cells[ii][jj].d1.x2,
                            finish_Y: cells[ii][jj].d1.y2,
                            angle: 1
                        };
                    } else if(goodLine(cells[i][j].l1)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x1,
                            start_Y: cells[ii][jj].l1.y1,
                            finish_X: cells[ii][jj].l1.x2,
                            finish_Y: cells[ii][jj].l1.y2,
                            angle: 2
                        };
                    } else if(goodLine(cells[i][j-1].d2)) {
                        jj = j-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd2',
                            start_X: cells[ii][jj].d2.x1,
                            start_Y: cells[ii][jj].d2.y1,
                            finish_X: cells[ii][jj].d2.x2,
                            finish_Y: cells[ii][jj].d2.y2,
                            angle: 3
                        };
                    } else if(goodLine(cells[i][j-1].l2)) {
                        jj = j-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x2,
                            start_Y: cells[ii][jj].l2.y2,
                            finish_X: cells[ii][jj].l2.x1,
                            finish_Y: cells[ii][jj].l2.y1,
                            angle: 4
                        };
                    } else if(goodLine(cells[i-1][j-1].d1)) {
                        ii = i-1; jj = j-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd1',
                            start_X: cells[ii][jj].d1.x2,
                            start_Y: cells[ii][jj].d1.y2,
                            finish_X: cells[ii][jj].d1.x1,
                            finish_Y: cells[ii][jj].d1.y1,
                            angle: 5
                        };
                    } else if(goodLine(cells[i-1][j].l1)) {
                        ii = i-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x2,
                            start_Y: cells[ii][jj].l1.y2,
                            finish_X: cells[ii][jj].l1.x1,
                            finish_Y: cells[ii][jj].l1.y1,
                            angle: 6
                        };
                    } else if(goodLine(cells[i-1][j].d2)) {
                        ii = i-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd2',
                            start_X: cells[ii][jj].d2.x2,
                            start_Y: cells[ii][jj].d2.y2,
                            finish_X: cells[ii][jj].d2.x1,
                            finish_Y: cells[ii][jj].d2.y1,
                            angle: 7
                        };
                    } 
                }
                break;
            case 'd1':
                if(cells[i][j].d1.x1 == el.start_X) 
                { // конец линии d1 в точке х2 (вырезаемый кусок снизу от линии)
                    // поиск ближайшей линии начинаем с нижней l1
                    // обход ведем против часовой стрелки
                    if(goodLine(cells[i][j+1].l1)) {
                        jj = j+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x2,
                            start_Y: cells[ii][jj].l1.y2,
                            finish_X: cells[ii][jj].l1.x1,
                            finish_Y: cells[ii][jj].l1.y1,
                            angle: 1
                        };
                    } else if(goodLine(cells[i][j+1].d2)) {
                        jj = j+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd2',
                            start_X: cells[ii][jj].d2.x2,
                            start_Y: cells[ii][jj].d2.y2,
                            finish_X: cells[ii][jj].d2.x1,
                            finish_Y: cells[ii][jj].d2.y1,
                            angle: 2
                        };
                    } else if(goodLine(cells[i+1][j+1].l2)) {
                        ii = i+1; jj = j+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x1,
                            start_Y: cells[ii][jj].l2.y1,
                            finish_X: cells[ii][jj].l2.x2,
                            finish_Y: cells[ii][jj].l2.y2,
                            angle: 3
                        };
                    } else if(goodLine(cells[i+1][j+1].d1)) {
                        ii = i+1; jj = j+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd1',
                            start_X: cells[ii][jj].d1.x1,
                            start_Y: cells[ii][jj].d1.y1,
                            finish_X: cells[ii][jj].d1.x2,
                            finish_Y: cells[ii][jj].d1.y2,
                            angle: 4
                        };
                    } else if(goodLine(cells[i+1][j+1].l1)) {
                        ii = i+1; jj = j+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x1,
                            start_Y: cells[ii][jj].l1.y1,
                            finish_X: cells[ii][jj].l1.x2,
                            finish_Y: cells[ii][jj].l1.y2,
                            angle: 5
                        };
                    } else if(goodLine(cells[i+1][j].d2)) {
                        ii = i+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd2',
                            start_X: cells[ii][jj].d2.x1,
                            start_Y: cells[ii][jj].d2.y1,
                            finish_X: cells[ii][jj].d2.x2,
                            finish_Y: cells[ii][jj].d2.y2,
                            angle: 6
                        };
                    } else if(goodLine(cells[i+1][j].l2)) {
                        ii = i+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x2,
                            start_Y: cells[ii][jj].l2.y2,
                            finish_X: cells[ii][jj].l2.x1,
                            finish_Y: cells[ii][jj].l2.y1,
                            angle: 7
                        };
                    }
                } else { // конец линии d1 в точке х1 (вырезаемый кусок сверху от линии)
                    // поиск ближайшей линии начинаем с верхней l1
                    // обход ведем против часовой стрелки
                    if(goodLine(cells[i][j].l1)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x1,
                            start_Y: cells[ii][jj].l1.y1,
                            finish_X: cells[ii][jj].l1.x2,
                            finish_Y: cells[ii][jj].l1.y2,
                            angle: 1
                        };
                    } else if(goodLine(cells[i][j-1].d2)) {
                        jj = j-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd2',
                            start_X: cells[ii][jj].d2.x1,
                            start_Y: cells[ii][jj].d2.y1,
                            finish_X: cells[ii][jj].d2.x2,
                            finish_Y: cells[ii][jj].d2.y2,
                            angle: 2
                        };
                    } else if(goodLine(cells[i][j-1].l2)) {
                        jj = j-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x2,
                            start_Y: cells[ii][jj].l2.y2,
                            finish_X: cells[ii][jj].l2.x1,
                            finish_Y: cells[ii][jj].l2.y1,
                            angle: 3
                        };
                    } else if(goodLine(cells[i-1][j-1].d1)) {
                        ii = i-1; jj = j-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd1',
                            start_X: cells[ii][jj].d1.x2,
                            start_Y: cells[ii][jj].d1.y2,
                            finish_X: cells[ii][jj].d1.x1,
                            finish_Y: cells[ii][jj].d1.y1,
                            angle: 4
                        };
                    } else if(goodLine(cells[i-1][j].l1)) {
                        ii = i-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x2,
                            start_Y: cells[ii][jj].l1.y2,
                            finish_X: cells[ii][jj].l1.x1,
                            finish_Y: cells[ii][jj].l1.y1,
                            angle: 5
                        };
                    } else if(goodLine(cells[i-1][j].d2)) {
                        ii = i-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd2',
                            start_X: cells[ii][jj].d2.x2,
                            start_Y: cells[ii][jj].d2.y2,
                            finish_X: cells[ii][jj].d2.x1,
                            finish_Y: cells[ii][jj].d2.y1,
                            angle: 6
                        };
                    } else if(goodLine(cells[i][j].l2)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x1,
                            start_Y: cells[ii][jj].l2.y1,
                            finish_X: cells[ii][jj].l2.x2,
                            finish_Y: cells[ii][jj].l2.y2,
                            angle: 7
                        };
                    }
                }
                break;
            case 'd2':
                if(cells[i][j].d2.x1 == el.start_X) 
                { // конец линии d2 в точке х2 (вырезаемый кусок снизу от линии)
                    // поиск ближайшей линии начинаем с правой l2
                    // обход ведем против часовой стрелки
                    if(goodLine(cells[i+1][j].l2)) {
                        ii = i+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x1,
                            start_Y: cells[ii][jj].l2.y1,
                            finish_X: cells[ii][jj].l2.x2,
                            finish_Y: cells[ii][jj].l2.y2,
                            angle: 1
                        };
                    } else if(goodLine(cells[i+1][j].d1)) {
                        ii = i+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd1',
                            start_X: cells[ii][jj].d1.x1,
                            start_Y: cells[ii][jj].d1.y1,
                            finish_X: cells[ii][jj].d1.x2,
                            finish_Y: cells[ii][jj].d1.y2,
                            angle: 2
                        };
                    } else if(goodLine(cells[i+1][j].l1)) {
                        ii = i+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x1,
                            start_Y: cells[ii][jj].l1.y1,
                            finish_X: cells[ii][jj].l1.x2,
                            finish_Y: cells[ii][jj].l1.y2,
                            angle: 3
                        };
                    } else if(goodLine(cells[i+1][j-1].d2)) {
                        ii = i+1; jj = j-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd2',
                            start_X: cells[ii][jj].d2.x1,
                            start_Y: cells[ii][jj].d2.y1,
                            finish_X: cells[ii][jj].d2.x2,
                            finish_Y: cells[ii][jj].d2.y2,
                            angle: 4
                        };
                    } else if(goodLine(cells[i+1][j-1].l2)) {
                        ii = i+1; jj = j-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x2,
                            start_Y: cells[ii][jj].l2.y2,
                            finish_X: cells[ii][jj].l2.x1,
                            finish_Y: cells[ii][jj].l2.y1,
                            angle: 5
                        };
                    } else if(goodLine(cells[i][j-1].d1)) {
                        jj = j-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd1',
                            start_X: cells[ii][jj].d1.x2,
                            start_Y: cells[ii][jj].d1.y2,
                            finish_X: cells[ii][jj].d1.x1,
                            finish_Y: cells[ii][jj].d1.y1,
                            angle: 6
                        };
                    } else if(goodLine(cells[i][j].l1)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x2,
                            start_Y: cells[ii][jj].l1.y2,
                            finish_X: cells[ii][jj].l1.x1,
                            finish_Y: cells[ii][jj].l1.y1,
                            angle: 7
                        };
                    } 
                } else { // конец линии d2 в точке х1 (вырезаемый кусок сверху от линии)
                    // поиск ближайшей линии начинаем с левой l2
                    // обход ведем против часовой стрелки
                    if(goodLine(cells[i][j].l2)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x2,
                            start_Y: cells[ii][jj].l2.y2,
                            finish_X: cells[ii][jj].l2.x1,
                            finish_Y: cells[ii][jj].l2.y1,
                            angle: 1
                        };
                    } else if(goodLine(cells[i-1][j].d1)) {
                        ii = i-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd1',
                            start_X: cells[ii][jj].d1.x2,
                            start_Y: cells[ii][jj].d1.y2,
                            finish_X: cells[ii][jj].d1.x1,
                            finish_Y: cells[ii][jj].d1.y1,
                            angle: 2
                        };
                    } else if(goodLine(cells[i-1][j+1].l1)) {
                        ii = i-1; jj = j+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x2,
                            start_Y: cells[ii][jj].l1.y2,
                            finish_X: cells[ii][jj].l1.x1,
                            finish_Y: cells[ii][jj].l1.y1,
                            angle: 3
                        };
                    } else if(goodLine(cells[i-1][j+1].d2)) {
                        ii = i-1; jj = j+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd2',
                            start_X: cells[ii][jj].d2.x2,
                            start_Y: cells[ii][jj].d2.y2,
                            finish_X: cells[ii][jj].d2.x1,
                            finish_Y: cells[ii][jj].d2.y1,
                            angle: 4
                        };
                    } else if(goodLine(cells[i][j+1].l2)) {
                        jj = j+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x1,
                            start_Y: cells[ii][jj].l2.y1,
                            finish_X: cells[ii][jj].l2.x2,
                            finish_Y: cells[ii][jj].l2.y2,
                            angle: 5
                        };
                    } else if(goodLine(cells[i][j+1].d1)) {
                        jj = j+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'd1',
                            start_X: cells[ii][jj].d1.x1,
                            start_Y: cells[ii][jj].d1.y1,
                            finish_X: cells[ii][jj].d1.x2,
                            finish_Y: cells[ii][jj].d1.y2,
                            angle: 6
                        };
                    } else if(goodLine(cells[i][j+1].l1)) {
                        jj = j+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x1,
                            start_Y: cells[ii][jj].l1.y1,
                            finish_X: cells[ii][jj].l1.x2,
                            finish_Y: cells[ii][jj].l1.y2,
                            angle: 7
                        };
                    } 
                }
                break;
        }
        if(nextLine==undefined) // есть незамкнутые контуры
            return false;
        else {
            set.push(nextLine);
            if(set[set.length-1].start_X != set[0].start_X ||
                set[set.length-1].start_Y != set[0].start_Y ||
                set[set.length-1].finish_X != set[0].finish_X ||
                set[set.length-1].finish_Y != set[0].finish_Y) {
                if(getNextSetLine1(set)) // не вернулись к первой линии
                // продолжаем обход, ищем следующую линии контура куска
                    return true;
                else
                    return false;
            } else// обошли по контуру куска полный круг и вернулись к первой линии
                return true;
        }
    }


    function getNextSetLine2(set) { // треугольная сетка
        let i = set[set.length-1].i;
        let j = set[set.length-1].j;
        let el = set[set.length-1];
        let nextLine;
        let ii = i, jj = j;
        switch(el.lineName) {
            case 'l1':
                if(cells[i][j].l1.x1 == el.start_X) {
                    // конец линии l1 в точке х2 (вырезаемый кусок снизу от линии)
                    // поиск ближайшей линии начинаем с нижней l3
                    // обход ведем против часовой стрелки
                    if(goodLine(cells[i][j].l3)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'l3',
                            start_X: cells[ii][jj].l3.x2,
                            start_Y: cells[ii][jj].l3.y2,
                            finish_X: cells[ii][jj].l3.x1,
                            finish_Y: cells[ii][jj].l3.y1,
                            angle: 1
                        };
                    } else if(goodLine(cells[i+1][j].l2)) {
                        ii = i+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x1,
                            start_Y: cells[ii][jj].l2.y1,
                            finish_X: cells[ii][jj].l2.x2,
                            finish_Y: cells[ii][jj].l2.y2,
                            angle: 2
                        };
                    } else if(goodLine(cells[i+1][j].l1)) {
                        ii = i+1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x1,
                            start_Y: cells[ii][jj].l1.y1,
                            finish_X: cells[ii][jj].l1.x2,
                            finish_Y: cells[ii][jj].l1.y2,
                            angle: 3
                        };
                    } else {
                        if(j%2==0)
                            ii++;
                        jj--;
                        if(goodLine(cells[ii][jj].l3)) {
                            nextLine = {
                                i:ii, j:jj, lineName: 'l3',
                                start_X: cells[ii][jj].l3.x1,
                                start_Y: cells[ii][jj].l3.y1,
                                finish_X: cells[ii][jj].l3.x2,
                                finish_Y: cells[ii][jj].l3.y2,
                                angle: 4
                            };
                        } else if(goodLine(cells[ii][jj].l2)) {
                            nextLine = {
                                i:ii, j:jj, lineName: 'l2',
                                start_X: cells[ii][jj].l2.x2,
                                start_Y: cells[ii][jj].l2.y2,
                                finish_X: cells[ii][jj].l2.x1,
                                finish_Y: cells[ii][jj].l2.y1,
                                angle: 5
                            };
                        }
                    }
                } else { // конец линии l1 в точке х1 (вырезаемый кусок сверху от линии)
                    // поиск ближайшей линии начинаем с верхней l2
                    // обход ведем против часовой стрелки
                    if(j%2)
                        ii--;
                    if(goodLine(cells[ii][j-1].l3)) {
                        jj--;                    
                        nextLine = {
                            i:ii, j:jj, lineName: 'l3',
                            start_X: cells[ii][jj].l3.x1,
                            start_Y: cells[ii][jj].l3.y1,
                            finish_X: cells[ii][jj].l3.x2,
                            finish_Y: cells[ii][jj].l3.y2,
                            angle: 1
                        };
                    } else if(goodLine(cells[ii][j-1].l2)) {
                        jj--;                    
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x2,
                            start_Y: cells[ii][jj].l2.y2,
                            finish_X: cells[ii][jj].l2.x1,
                            finish_Y: cells[ii][jj].l2.y1,
                            angle: 2
                        };
                    } else if(goodLine(cells[i-1][jj].l1)) {
                        ii = i-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x2,
                            start_Y: cells[ii][jj].l1.y2,
                            finish_X: cells[ii][jj].l1.x1,
                            finish_Y: cells[ii][jj].l1.y1,
                            angle: 3
                        };
                    } else if(goodLine(cells[i-1][jj].l3)) {
                        ii = i-1;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l3',
                            start_X: cells[ii][jj].l3.x2,
                            start_Y: cells[ii][jj].l3.y2,
                            finish_X: cells[ii][jj].l3.x1,
                            finish_Y: cells[ii][jj].l3.y1,
                            angle: 4
                        };
                    } else if(goodLine(cells[i][j].l2)) {
                        ii = i;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x1,
                            start_Y: cells[ii][jj].l2.y1,
                            finish_X: cells[ii][jj].l2.x2,
                            finish_Y: cells[ii][jj].l2.y2,
                            angle: 5
                        };
                    }
                }
                break;
            case 'l2':
                if(cells[i][j].l2.y1 == el.start_Y) 
                { // конец линии l2 в точке y2 (вырезаемый кусок слева от линии)
                    // поиск ближайшей линии начинаем слева с l1
                    // обход ведем против часовой стрелки
                    if(j%2)
                        ii--;
                    if(goodLine(cells[ii][j+1].l1)) {
                        jj++;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x2,
                            start_Y: cells[ii][jj].l1.y2,
                            finish_X: cells[ii][jj].l1.x1,
                            finish_Y: cells[ii][jj].l1.y1,
                            angle: 1
                        };
                    } else if(goodLine(cells[ii][j+1].l3)) {
                        jj++;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l3',
                            start_X: cells[ii][jj].l3.x2,
                            start_Y: cells[ii][jj].l3.y2,
                            finish_X: cells[ii][jj].l3.x1,
                            finish_Y: cells[ii][jj].l3.y1,
                            angle: 2
                        };
                    } else if(goodLine(cells[ii+1][j+1].l2)) {
                        ii++; jj++;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x1,
                            start_Y: cells[ii][jj].l2.y1,
                            finish_X: cells[ii][jj].l2.x2,
                            finish_Y: cells[ii][jj].l2.y2,
                            angle: 3
                        };
                    } else if(goodLine(cells[ii+1][j+1].l1)) {
                        ii++; jj++;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x1,
                            start_Y: cells[ii][jj].l1.y1,
                            finish_X: cells[ii][jj].l1.x2,
                            finish_Y: cells[ii][jj].l1.y2,
                            angle: 4
                        };
                    } else if(goodLine(cells[i][j].l3)) {
                        ii = i; jj = j;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l3',
                            start_X: cells[ii][jj].l3.x1,
                            start_Y: cells[ii][jj].l3.y1,
                            finish_X: cells[ii][jj].l3.x2,
                            finish_Y: cells[ii][jj].l3.y2,
                            angle: 5
                        };
                    }
                } else { // конец линии l2 в точке y1 (вырезаемый кусок справа от линии)
                    // поиск ближайшей линии начинаем с правой l1
                    // обход ведем против часовой стрелки
                    if(goodLine(cells[i][j].l1)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x1,
                            start_Y: cells[ii][jj].l1.y1,
                            finish_X: cells[ii][jj].l1.x2,
                            finish_Y: cells[ii][jj].l1.y2,
                            angle: 1
                        };
                    } else {
                        if(j%2)
                            ii--;
                        if(goodLine(cells[ii][j-1].l3)) {
                            jj--;
                            nextLine = {
                                i:ii, j:jj, lineName: 'l3',
                                start_X: cells[ii][jj].l3.x1,
                                start_Y: cells[ii][jj].l3.y1,
                                finish_X: cells[ii][jj].l3.x2,
                                finish_Y: cells[ii][jj].l3.y2,
                                angle: 2
                            };
                        } else if(goodLine(cells[ii][j-1].l2)) {
                            jj--;
                            nextLine = {
                                i:ii, j:jj, lineName: 'l2',
                                start_X: cells[ii][jj].l2.x2,
                                start_Y: cells[ii][jj].l2.y2,
                                finish_X: cells[ii][jj].l2.x1,
                                finish_Y: cells[ii][jj].l2.y1,
                                angle: 3
                            };
                        } else if(goodLine(cells[i-1][j].l1)) {
                            ii = i-1;
                            nextLine = {
                                i:ii, j:jj, lineName: 'l1',
                                start_X: cells[ii][jj].l1.x2,
                                start_Y: cells[ii][jj].l1.y2,
                                finish_X: cells[ii][jj].l1.x1,
                                finish_Y: cells[ii][jj].l1.y1,
                                angle: 4
                            };
                        } else if(goodLine(cells[i-1][j].l3)) {
                            ii = i-1;
                            nextLine = {
                                i:ii, j:jj, lineName: 'l3',
                                start_X: cells[ii][jj].l3.x2,
                                start_Y: cells[ii][jj].l3.y2,
                                finish_X: cells[ii][jj].l3.x1,
                                finish_Y: cells[ii][jj].l3.y1,
                                angle: 5
                            };
                        }
                    }
                }
                break;
            case 'l3':
                if(cells[i][j].l3.x1 == el.start_X) 
                { // конец линии l3 в точке х2 (вырезаемый кусок снизу от линии)
                    // поиск ближайшей линии начинаем с правой l2
                    // обход ведем против часовой стрелки
                    if(goodLine(cells[i+1][j].l2)) {
                        ii++;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x1,
                            start_Y: cells[ii][jj].l2.y1,
                            finish_X: cells[ii][jj].l2.x2,
                            finish_Y: cells[ii][jj].l2.y2,
                            angle: 1
                        };
                    } else if(goodLine(cells[i+1][j].l1)) {
                        ii++;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x1,
                            start_Y: cells[ii][jj].l1.y1,
                            finish_X: cells[ii][jj].l1.x2,
                            finish_Y: cells[ii][jj].l1.y2,
                            angle: 2
                        };
                    } else {
                        if(j%2==0)
                            ii++;
                        if(goodLine(cells[ii][j-1].l3)) {
                            jj--;
                            nextLine = {
                                i:ii, j:jj, lineName: 'l3',
                                start_X: cells[ii][jj].l3.x1,
                                start_Y: cells[ii][jj].l3.y1,
                                finish_X: cells[ii][jj].l3.x2,
                                finish_Y: cells[ii][jj].l3.y2,
                                angle: 3
                            };
                        } else if(goodLine(cells[ii][j-1].l2)) {
                            jj--;
                            nextLine = {
                                i:ii, j:jj, lineName: 'l2',
                                start_X: cells[ii][jj].l2.x2,
                                start_Y: cells[ii][jj].l2.y2,
                                finish_X: cells[ii][jj].l2.x1,
                                finish_Y: cells[ii][jj].l2.y1,
                                angle: 4
                            };
                        } else if(goodLine(cells[i][j].l1)) {
                            ii = i;
                            nextLine = {
                                i:ii, j:jj, lineName: 'l1',
                                start_X: cells[ii][jj].l1.x2,
                                start_Y: cells[ii][jj].l1.y2,
                                finish_X: cells[ii][jj].l1.x1,
                                finish_Y: cells[ii][jj].l1.y1,
                                angle: 5
                            };
                        }
                    }
                } else { // конец линии l3 в точке х1 (вырезаемый кусок сверху от линии)
                    // поиск ближайшей линии начинаем с левой l2
                    // обход ведем против часовой стрелки
                    if(goodLine(cells[i][j].l2)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x2,
                            start_Y: cells[ii][jj].l2.y2,
                            finish_X: cells[ii][jj].l2.x1,
                            finish_Y: cells[ii][jj].l2.y1,
                            angle: 1
                        };
                    } else {
                        if(j%2)
                            ii--;
                        jj++;
                        if(goodLine(cells[ii][jj].l1)) {
                            nextLine = {
                                i:ii, j:jj, lineName: 'l1',
                                start_X: cells[ii][jj].l1.x2,
                                start_Y: cells[ii][jj].l1.y2,
                                finish_X: cells[ii][jj].l1.x1,
                                finish_Y: cells[ii][jj].l1.y1,
                                angle: 2
                            };
                        } else if(goodLine(cells[ii][jj].l3)) {
                            nextLine = {
                                i:ii, j:jj, lineName: 'l3',
                                start_X: cells[ii][jj].l3.x2,
                                start_Y: cells[ii][jj].l3.y2,
                                finish_X: cells[ii][jj].l3.x1,
                                finish_Y: cells[ii][jj].l3.y1,
                                angle: 3
                            };
                        } else if(goodLine(cells[ii+1][jj].l2)) {
                            ii++;
                            nextLine = {
                                i:ii, j:jj, lineName: 'l2',
                                start_X: cells[ii][jj].l2.x1,
                                start_Y: cells[ii][jj].l2.y1,
                                finish_X: cells[ii][jj].l2.x2,
                                finish_Y: cells[ii][jj].l2.y2,
                                angle: 4
                            };
                        } else if(goodLine(cells[ii+1][jj].l1)) {
                            ii++;
                            nextLine = {
                                i:ii, j:jj, lineName: 'l1',
                                start_X: cells[ii][jj].l1.x1,
                                start_Y: cells[ii][jj].l1.y1,
                                finish_X: cells[ii][jj].l1.x2,
                                finish_Y: cells[ii][jj].l1.y2,
                                angle: 5
                            };
                        }
                    }
                }
                break;
        }
        if(nextLine==undefined) // есть незамкнутые контуры
            return false;
        else {
            set.push(nextLine);
            if(set[set.length-1].start_X != set[0].start_X ||
                set[set.length-1].start_Y != set[0].start_Y ||
                set[set.length-1].finish_X != set[0].finish_X ||
                set[set.length-1].finish_Y != set[0].finish_Y) {
                if(getNextSetLine2(set)) // не вернулись к первой линии
                // продолжаем обход, ищем следующую линии контура куска
                    return true;
                else
                    return false;
            } else// обошли по контуру куска полный круг и вернулись к первой линии
                return true;
        }
    }


    function getNextSetLine3(set) { // гексагон
        let i = set[set.length-1].i;
        let j = set[set.length-1].j;
        let el = set[set.length-1];
        let nextLine;
        let ii = i, jj = j;
        switch(el.lineName) {
            case 'l1':
                if(cells[i][j].l1.y1 == el.start_Y) {
                    // конец линии l1 внизу (вырезаемый кусок слева от линии)
                    // обход ведем против часовой стрелки
                    if(j%2) 
                        ii--;
                    jj++;
                    if(goodLine(cells[ii][jj].l2)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x2,
                            start_Y: cells[ii][jj].l2.y2,
                            finish_X: cells[ii][jj].l2.x1,
                            finish_Y: cells[ii][jj].l2.y1,
                            angle: 1
                        };
                    } else if(goodLine(cells[ii][jj].l3)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'l3',
                            start_X: cells[ii][jj].l3.x1,
                            start_Y: cells[ii][jj].l3.y1,
                            finish_X: cells[ii][jj].l3.x2,
                            finish_Y: cells[ii][jj].l3.y2,
                            angle: 2
                        };
                    }
                } else { // конец линии l1 вверху (вырезаемый кусок справа от линии)
                    // обход ведем против часовой стрелки
                    if(goodLine(cells[i][j].l2)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x1,
                            start_Y: cells[ii][jj].l2.y1,
                            finish_X: cells[ii][jj].l2.x2,
                            finish_Y: cells[ii][jj].l2.y2,
                            angle: 1
                        };
                    } else if(goodLine(cells[i-1][jj].l3)) {
                        ii--;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l3',
                            start_X: cells[ii][jj].l3.x2,
                            start_Y: cells[ii][jj].l3.y2,
                            finish_X: cells[ii][jj].l3.x1,
                            finish_Y: cells[ii][jj].l3.y1,
                            angle: 2
                        };
                    }
                }
                break;
            case 'l2':
                if(cells[i][j].l2.x1 == el.start_X) 
                { // конец линии l2 в точке x2 справа (вырезаемый кусок снизу от линии)
                    // обход ведем против часовой стрелки
                    if(goodLine(cells[i][j].l3)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'l3',
                            start_X: cells[ii][jj].l3.x1,
                            start_Y: cells[ii][jj].l3.y1,
                            finish_X: cells[ii][jj].l3.x2,
                            finish_Y: cells[ii][jj].l3.y2,
                            angle: 1
                        };
                    } else {
                        if(j%2==0)
                            ii++;
                        jj--;
                        if(goodLine(cells[ii][jj].l1)) {
                            nextLine = {
                                i:ii, j:jj, lineName: 'l1',
                                start_X: cells[ii][jj].l1.x2,
                                start_Y: cells[ii][jj].l1.y2,
                                finish_X: cells[ii][jj].l1.x1,
                                finish_Y: cells[ii][jj].l1.y1,
                                angle: 2
                            };
                        }
                    }
                } else { // конец линии l2 слева в точке x1 (вырезаемый кусок сверху от линии)
                    // обход ведем против часовой стрелки
                    if(goodLine(cells[i-1][j].l3)) {
                        ii--;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l3',
                            start_X: cells[ii][jj].l3.x2,
                            start_Y: cells[ii][jj].l3.y2,
                            finish_X: cells[ii][jj].l3.x1,
                            finish_Y: cells[ii][jj].l3.y1,
                            angle: 1
                        };
                    } else if(goodLine(cells[i][j].l1)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x1,
                            start_Y: cells[ii][jj].l1.y1,
                            finish_X: cells[ii][jj].l1.x2,
                            finish_Y: cells[ii][jj].l1.y2,
                            angle: 2
                        };
                    }
                }
                break;
            case 'l3':
                if(cells[i][j].l3.x1 == el.start_X) 
                { // конец линии l3 в точке х2 (вырезаемый кусок снизу от линии)
                    // обход ведем против часовой стрелки
                    ii++;
                    if(goodLine(cells[ii][j].l1)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x1,
                            start_Y: cells[ii][jj].l1.y1,
                            finish_X: cells[ii][jj].l1.x2,
                            finish_Y: cells[ii][jj].l1.y2,
                            angle: 1
                        };
                    } else if(goodLine(cells[ii][j].l2)) {
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x1,
                            start_Y: cells[ii][jj].l2.y1,
                            finish_X: cells[ii][jj].l2.x2,
                            finish_Y: cells[ii][jj].l2.y2,
                            angle: 2
                        };
                    }
                } else { // конец линии l3 в точке х1 (вырезаемый кусок сверху от линии)
                    // обход ведем против часовой стрелки
                    if(j%2==0)
                        ii++;
                    if(goodLine(cells[ii][j-1].l1)) {
                        jj--;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l1',
                            start_X: cells[ii][jj].l1.x2,
                            start_Y: cells[ii][jj].l1.y2,
                            finish_X: cells[ii][jj].l1.x1,
                            finish_Y: cells[ii][jj].l1.y1,
                            angle: 1
                        };
                    } else if(goodLine(cells[i][j].l2)) {
                        ii = i;
                        nextLine = {
                            i:ii, j:jj, lineName: 'l2',
                            start_X: cells[ii][jj].l2.x2,
                            start_Y: cells[ii][jj].l2.y2,
                            finish_X: cells[ii][jj].l2.x1,
                            finish_Y: cells[ii][jj].l2.y1,
                            angle: 2
                        };
                    } 
                }
                break;
        }
        if(nextLine==undefined) // есть незамкнутые контуры
            return false;
        else {
            set.push(nextLine);
            if(set[set.length-1].start_X != set[0].start_X ||
                set[set.length-1].start_Y != set[0].start_Y ||
                set[set.length-1].finish_X != set[0].finish_X ||
                set[set.length-1].finish_Y != set[0].finish_Y) {
                if(getNextSetLine3(set)) // не вернулись к первой линии
                // продолжаем обход, ищем следующую линии контура куска
                    return true;
                else
                    return false;
            } else// обошли по контуру куска полный круг и вернулись к первой линии
                return true;
        }
    }


function fillParts() {
    let colors = [ '#ff00ff40', '#00ffff40', '#ffff0040', '#8000ff40', 
    '#0080ff40', '#80ff0040', '#ff008040', '#00ff8040', '#ff800040', '#80008040',
    '#00808040', '#80800040', '#40008040', '#40ff0040', '#40ffff40' ];

    clearParts();
    for(let i=0; i<sets.length; i++)
        fillPart(sets[i], colors[i]);
}
function fillPart(set, color) {
    context2.beginPath();
    if(color==undefined)
        context2.fillStyle = '#ff00ff80'; // устанавливаем цвет части
    else
        context2.fillStyle = color;
    context2.moveTo(set[1].start_X, set[1].start_Y);
    for(let i=2; i<set.length; i++)
        context2.lineTo(set[i].start_X, set[i].start_Y);
    context2.fill();
    context2.closePath(); 
}
function clearParts() {
    context2.clearRect(0,0,5000,5000);    
}
function clearSets() {
    if(sets.length) {
        sets = [];
        clearParts();    
    }
}