"use strict";
function abs(num) {
    var result = num;
    if (num < 0) {
        result = -num;
    }
    return result;
}
function flatten(arrry) {
    var arry = [];
    for (var i = 0; i < arrry.length; i++) {
        arry = arry.concat(arrry[i]);
    }
    return arry;
}
function numToBase62(num) {
    if (num < 10) {
        return `${num}`;
    }
    else if (num < 36) {
        return String.fromCharCode(87 + num);
    }
    else if (num < 62) {
        return String.fromCharCode(29 + num);
    }
    else {
        throw new Error(`num is too large: ${num}`);
    }
}
function base62ToNum(str) {
    var code = str.charCodeAt(0);
    if (48 <= code && code <= 57) {
        return code - 48;
    }
    else if (97 <= code && code <= 122) {
        return code - 87;
    }
    else if (65 <= code && code <= 90) {
        return code - 29;
    }
    else {
        throw new Error(`invalid str ${str}`);
    }
}
class Pos {
    constructor(r, c) {
        this.r = r;
        this.c = c;
    }
    add(other) {
        return new Pos(this.r + other.r, this.c + other.c);
    }
    sub(other) {
        return new Pos(this.r - other.r, this.c - other.c);
    }
    equals(other) {
        return this.r == other.r && this.c == other.c;
    }
    toString() {
        return `(${this.r}, ${this.c})`;
    }
    static stringToPos(str) {
        var m = str.match(/(\d+), (\d+)/);
        if (m != null) {
            return new Pos(Number(m[1]), Number(m[2]));
        }
        else {
            throw new Error(`invalid str: ${str}`);
        }
    }
    between(other) {
        var diff = this.sub(other);
        var direction;
        if (diff.r == 0 && diff.c == 0) {
            return [];
        }
        else if (diff.r == 0 && diff.c < 0) {
            direction = Pos.RIGHT;
        }
        else if (diff.r == 0 && 0 < diff.c) {
            direction = Pos.LEFT;
        }
        else if (diff.r < 0 && diff.c == 0) {
            direction = Pos.DOWN;
        }
        else if (0 < diff.r && diff.c == 0) {
            direction = Pos.UP;
        }
        else if (diff.r < 0 && diff.c < 0) {
            direction = Pos.LOWER_RIGHT;
        }
        else if (diff.r < 0 && 0 < diff.c) {
            direction = Pos.LOWER_LEFT;
        }
        else if (0 < diff.r && diff.c < 0) {
            direction = Pos.UPPER_RIGHT;
        }
        else if (0 < diff.r && 0 < diff.c) {
            direction = Pos.UPPER_LEFT;
        }
        else {
            throw new Error("invalid betweens: " + this.toString() + ", " + other.toString());
        }
        var numberOfBetweens = (abs(diff.r) < abs(diff.c) ? abs(diff.c) : abs(diff.r)) - 1;
        var betweens = new Array(numberOfBetweens);
        betweens[0] = this.add(direction);
        for (var i = 1; i < numberOfBetweens; i++) {
            betweens[i] = betweens[i - 1].add(direction);
        }
        return betweens;
    }
}
Pos.ZERO = new Pos(0, 0);
Pos.UP = new Pos(-1, 0);
Pos.DOWN = new Pos(1, 0);
Pos.LEFT = new Pos(0, -1);
Pos.RIGHT = new Pos(0, 1);
Pos.UPPER_LEFT = new Pos(-1, -1);
Pos.UPPER_RIGHT = new Pos(-1, 1);
Pos.LOWER_LEFT = new Pos(1, -1);
Pos.LOWER_RIGHT = new Pos(1, 1);
var Disk;
(function (Disk) {
    Disk["NULL"] = "NULL";
    Disk["WHITE"] = "WHITE";
    Disk["BLACK"] = "BLACK";
})(Disk || (Disk = {}));
(function (Disk) {
    function getReverse(disk) {
        if (disk == Disk.NULL) {
            return Disk.NULL;
        }
        else if (disk == Disk.WHITE) {
            return Disk.BLACK;
        }
        else if (disk == Disk.BLACK) {
            return Disk.WHITE;
        }
        else {
            throw new Error(`invalid Disk type${disk}`);
        }
    }
    Disk.getReverse = getReverse;
})(Disk || (Disk = {}));
class Board {
    constructor() {
        this.resultHTML = "";
        this.board = new Array(Board.maxRow);
        for (var i = 0; i < this.board.length; i++) {
            this.board[i] = new Array(Board.maxColumn).fill(Disk.NULL);
        }
        this.board[3][3] = Disk.BLACK;
        this.board[3][4] = Disk.WHITE;
        this.board[4][3] = Disk.WHITE;
        this.board[4][4] = Disk.BLACK;
    }
    boardToBase62() {
        var sum = 0n;
        var index = 0n;
        var num = 0;
        var pos;
        var disk;
        for (var r = 0; r < Board.maxRow; r++) {
            for (var c = 0; c < Board.maxColumn; c++) {
                disk = this.getDisk(new Pos(r, c));
                if (disk == Disk.NULL) {
                    num = 0;
                }
                else if (disk == Disk.WHITE) {
                    num = 1;
                }
                else if (disk == Disk.BLACK) {
                    num = 2;
                }
                sum += BigInt(num) * 3n ** index;
                index++;
            }
        }
        var digits = [];
        var remainder;
        var quotient;
        index = 1n;
        while (0 < sum) {
            remainder = Number(sum % 62n);
            sum = sum / 62n;
            digits = [remainder].concat(digits);
        }
        var str = "";
        digits.map(digit => {
            str += numToBase62(digit);
        });
        if (str == "") {
            str = "0";
        }
        return str;
    }
    base62ToBoard(str) {
        if (str == "") {
            str = "0";
        }
        var digits = new Array(str.length);
        for (var i = 0; i < str.length; i++) {
            digits[i] = base62ToNum(str.charAt(i));
        }
        var sum = 0n;
        for (var i = 0; i < str.length; i++) {
            sum += BigInt(digits[str.length - (i + 1)]) * (62n ** BigInt(i));
        }
        var reminder;
        for (var r = 0; r < Board.maxRow; r++) {
            for (var c = 0; c < Board.maxColumn; c++) {
                if (sum == 0n) {
                    this.board[r][c] = Disk.NULL;
                }
                reminder = Number(sum % 3n);
                if (reminder == 0) {
                    this.board[r][c] = Disk.NULL;
                }
                else if (reminder == 1) {
                    this.board[r][c] = Disk.WHITE;
                }
                else if (reminder == 2) {
                    this.board[r][c] = Disk.BLACK;
                }
                sum = sum / 3n;
            }
        }
        return;
    }
    toHTML(puttables) {
        var html = `<div id="board">\n<table border="1" rules="all">`;
        var diskStr = "";
        var disk;
        var base62Str = "";
        var url = "";
        var cBoard;
        var targetPos;
        var targetPosStr;
        for (var r = 0; r < Board.maxRow; r++) {
            html += "<tr>\n";
            for (var c = 0; c < Board.maxColumn; c++) {
                disk = this.board[r][c];
                if (this.board[r][c] == Disk.BLACK) {
                    diskStr = "●";
                }
                else if (this.board[r][c] == Disk.WHITE) {
                    diskStr = "○";
                }
                else if (this.board[r][c] == Disk.NULL) {
                    targetPos = new Pos(r, c);
                    targetPosStr = targetPos.toString();
                    diskStr = "　";
                    if (targetPosStr in puttables) {
                        cBoard = this.clone();
                        cBoard.putAccordingPuttable(puttables, targetPosStr, Disk.BLACK);
                        url = "./othello.html?next=cpu&data=" + cBoard.boardToBase62();
                        diskStr = `<a href=${url}>　</a>`;
                    }
                }
                html += `<td>${diskStr}</td>\n`;
            }
            html += "</tr>\n";
        }
        html += this.resultHTML;
        return html;
    }
    clone() {
        var cBoard = new Board();
        for (var r = 0; r < Board.maxRow; r++) {
            for (var c = 0; c < Board.maxColumn; c++) {
                cBoard.board[r][c] = this.board[r][c];
            }
        }
        return cBoard;
    }
    getDisk(pos) {
        return this.board[pos.r][pos.c];
    }
    setDisk(pos, disk) {
        this.board[pos.r][pos.c] = disk;
        return;
    }
    putAccordingPuttable(puttable, key, disk) {
        puttable[key].map(beReversedPos => {
            this.setDisk(beReversedPos, disk);
        });
        this.setDisk(Pos.stringToPos(key), disk);
        return;
    }
    randomPut() {
        var disk = Disk.WHITE;
        var puttables = this.getPuttablePosesAndResult(disk);
        var length = Object.keys(puttables).length;
        if (length <= 0) {
            return false;
        }
        var randomIndex = Math.floor((length - 1) * Math.random());
        var randomKey = Object.keys(puttables)[randomIndex];
        this.putAccordingPuttable(puttables, randomKey, disk);
        return true;
    }
    getPuttablePosesAndResult(disk) {
        var reverseDiskPoses = [];
        for (var r = 0; r < Board.maxRow; r++) {
            for (var c = 0; c < Board.maxColumn; c++) {
                if (this.board[r][c] == Disk.getReverse(disk)) {
                    reverseDiskPoses = reverseDiskPoses.concat([new Pos(r, c)]);
                }
            }
        }
        var nullPosesAroundReverseDiskPos = flatten(reverseDiskPoses.map(reverseDiskPos => {
            var aroundReverseDiskPoses = this.getAroundPoses(reverseDiskPos);
            return aroundReverseDiskPoses.filter(aroundReverseDiskPos => this.getDisk(aroundReverseDiskPos) == Disk.NULL);
        }));
        var resultDict = {};
        var beReversedPoses;
        for (var i = 0; i < nullPosesAroundReverseDiskPos.length; i++) {
            beReversedPoses = this.getBeReversedPoses(nullPosesAroundReverseDiskPos[i], disk);
            if (beReversedPoses.length == 0) {
                continue;
            }
            resultDict[nullPosesAroundReverseDiskPos[i].toString()] = beReversedPoses;
        }
        return resultDict;
    }
    getAroundPoses(pos) {
        var targetDirections = [
            Pos.UP,
            Pos.DOWN,
            Pos.LEFT,
            Pos.RIGHT,
            Pos.UPPER_LEFT,
            Pos.UPPER_RIGHT,
            Pos.LOWER_LEFT,
            Pos.LOWER_RIGHT
        ];
        if (pos.r == 0) {
            targetDirections[0] = Pos.ZERO;
            targetDirections[4] = Pos.ZERO;
            targetDirections[5] = Pos.ZERO;
        }
        else if (pos.r == Board.maxRow - 1) {
            targetDirections[1] = Pos.ZERO;
            targetDirections[6] = Pos.ZERO;
            targetDirections[7] = Pos.ZERO;
        }
        if (pos.c == 0) {
            targetDirections[2] = Pos.ZERO;
            targetDirections[4] = Pos.ZERO;
            targetDirections[6] = Pos.ZERO;
        }
        else if (pos.c == Board.maxColumn - 1) {
            targetDirections[3] = Pos.ZERO;
            targetDirections[5] = Pos.ZERO;
            targetDirections[7] = Pos.ZERO;
        }
        var aroundPoses = targetDirections.filter(targetDirection => !targetDirection.equals(Pos.ZERO)).map(targetDirection => {
            return pos.add(targetDirection);
        });
        return aroundPoses;
    }
    getBeReversedPoses(pos, disk) {
        var aroundReverseColorPoses = this.getAroundPoses(pos).filter(aroundPos => {
            var aroundDisk = this.getDisk(aroundPos);
            return aroundDisk != Disk.NULL && aroundDisk != disk;
        });
        var reverseOpponentPoses = aroundReverseColorPoses.map(aroundReverseColorPos => {
            return this.getNearestSameDiskPos(pos, aroundReverseColorPos.sub(pos), disk);
        });
        var beReversedPosess = reverseOpponentPoses.filter(reverseOpponentPos => reverseOpponentPos != null).map(reverseOpponentPos => {
            if (reverseOpponentPos == null) {
                throw new Error("null");
            }
            return reverseOpponentPos.between(pos);
        });
        return flatten(beReversedPosess);
    }
    getNearestSameDiskPos(pos, direction, disk) {
        var checkPos = pos.add(direction);
        while (0 <= checkPos.r && checkPos.r <= Board.maxRow - 1 && 0 <= checkPos.c && checkPos.c <= Board.maxColumn - 1) {
            if (this.getDisk(checkPos) == disk) {
                return checkPos;
            }
            checkPos = checkPos.add(direction);
        }
        return null;
    }
    endGame() {
        var numberOfBlack = 0;
        var numberOfWhite = 0;
        var disk;
        for (var r = 0; r < Board.maxRow; r++) {
            for (var c = 0; c < Board.maxColumn; c++) {
                disk = this.board[r][c];
                if (disk == Disk.BLACK) {
                    numberOfBlack++;
                }
                else if (disk == Disk.WHITE) {
                    numberOfWhite++;
                }
            }
        }
        this.resultHTML = `<br>game set. ● = ${numberOfBlack}, ○ = ${numberOfWhite}`;
        return;
    }
}
Board.maxRow = 8;
Board.maxColumn = 8;
function getParam() {
    var url = new URL(window.location.href);
    var params = url.searchParams;
    return params;
}
function main() {
    var board = new Board();
    var param = getParam();
    var paramData = param.get("data") || "pSbL7AnCTi";
    var paramNext = param.get("next") || "";
    board.base62ToBoard(paramData);
    var puttables;
    if (paramNext === "cpu") {
        board.randomPut();
        puttables = board.getPuttablePosesAndResult(Disk.BLACK);
        while (Object.keys(puttables).length <= 0) {
            if (!board.randomPut()) {
                board.endGame();
                break;
            }
            puttables = board.getPuttablePosesAndResult(Disk.BLACK);
        }
    }
    else if (paramNext === "black") {
        puttables = board.getPuttablePosesAndResult(Disk.BLACK);
    }
    else if (paramNext === "white") {
        puttables = board.getPuttablePosesAndResult(Disk.WHITE);
    }
    else {
        puttables = {};
    }
    document.open();
    document.write(board.toHTML(puttables));
    document.close();
}
main();
