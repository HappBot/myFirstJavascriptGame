// Variable Declaration
var myGamePiece;
var myObstacles = [];
var gameOverMessage;

// Game Start
function startGame () {
    
    // Character
    myGamePiece = new component(30, 30, "black", 10, 120);
    myScore = new component("20px", "Arial", "black", 5, 20, "text");
    myUpBtn = new component(30, 30, "blue", 50, 280);
    myDownBtn = new component(30, 30, "blue", 50, 340);
    myLeftBtn = new component(30, 30, "blue", 20, 310);
    myRightBtn = new component(30, 30, "blue", 80, 310);
    myGameArea.start();
}

// Canvas
var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function () {

        // Creating canvas on HTML
        this.canvas.width = window.innerWidth;
        this.canvas.height = 400;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[6]); // inserting canvas on the beginning of the HTML

        // Starting count of frame number at the beginning of the game
        this.frameNo = 0;

        // Setting framecount for sensing controls commands
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function(e) {
            myGameArea.keys = (myGameArea.keys || [])
            myGameArea.keys[e.keyCode] = true;
        });
        window.addEventListener('keyup', function(e) {
            myGameArea.keys[e.keyCode] = false;
        });
        window.addEventListener('mousedown', function (e) {
            myGameArea.x = e.pageX - 20;
            myGameArea.y = e.pageY - document.getElementById("header").offsetHeight;
        });
        window.addEventListener('mouseup', function (e) {
            myGameArea.x = false;
            myGameArea.y = false;
        });
        window.addEventListener('touchstart', function (e) {
            myGameArea.x = e.pageX - 20;
            myGameArea.y = e.pageY - document.getElementById("header").offsetHeight;
        });
        window.addEventListener('touchend', function (e) {
            myGameArea.x = false;
            myGameArea.y = false;
        });
    },
    clear : function() {
        this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        stopMessage = new component("50px", "Arial", "black", myGamePiece.x+myGamePiece.width, myGamePiece.y+myGamePiece.height, "text");
        stopMessage.text = "You Died";
        stopMessage.update();
        clearInterval(this.interval);

    }
}

// Checking if the framecount matches a given interval n
function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {
        return true;
    }
    return false;
}

// Function that creates the components
function component(width, height, color, x, y, type) { 
    this.width = width;
    this.height = height;
    this.angle = 0;
    this.x = x;
    this.y = y;
    this.type = type;
    this.speedX = 0;
    this.speedY = 0;
    this.gravity = 0.05;
    this.gravitySpeed = 0;
    this.bounce = 1.1;
    this.update = function() {
        ctx = myGameArea.context;

        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };
    this.clicked = function() {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var clicked = true;
        if ((mybottom < myGameArea.y) || (mytop > myGameArea.y) || (myright < myGameArea.x) || (myleft > myGameArea.x)) {
          clicked = false;
        }
        return clicked;
    };
    this.newPos = function() {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom();
    };
    this.hitBottom = function() {
        var rockBottom = myGameArea.canvas.height - this.height;
        if (this.y > rockBottom) {
            this.y = rockBottom;
            this.gravitySpeed = -(this.gravitySpeed*this.bounce + this.speedY);
        }
    };

    // Checking if the character crashes with other objects
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + this.width;
        var mytop = this.y;
        var mybottom = this.y + this.height;
        var otherleft = otherobj.x;
        var otherright = otherobj.x + otherobj.width;
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + otherobj.height;
        var crash = true;
        if (
            (mybottom < othertop) ||
            (mytop > otherbottom) ||
            (myright < otherleft) ||
            (myleft > otherright)
        ) {
            crash = false;
        }
        return crash;
    }
}

// Update Frames
function updateGameArea() {

    var x, y;

    // Stop game if character crashes with any of the obstacles
    for (let i = 0; i < myObstacles.length; i++) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            myGameArea.stop();
            return;
        }
    }

    // Stop game if character passes left border or top
    if (myGamePiece.x < -myGamePiece.width || myGamePiece.y < -myGamePiece.height) {
        myGameArea.stop();
        return;
    }

    // Clearing gameArea so objects won't leave their traces
    myGameArea.clear();

    // Updating framecount
    myGameArea.frameNo +=1;

    // Creating Obstacles
    if (myGameArea.frameNo == 1 || everyinterval(150)) {
        x = myGameArea.canvas.width;
        y = myGameArea.canvas.height;
        
        // random height
        minHeight = 20;
        maxHeight = 150;
        height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);

        // vertical distance between obstacles
        minGap = 75;
        maxGap = 200;
        gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);

        // Top Obstacles
        myObstacles.push(new component(50, height, "gray", x, 0));

        // Bottom Obstacles
        myObstacles.push(new component(20, y - height - gap, "darkred", x, height + gap));
    };

    // Moving Obstacles
    for (i=0; i < myObstacles.length; i++) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    };

    // To stop our character after we stop pressing the keys
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;

    // Movement control
    if (myGameArea.keys && myGameArea.keys[37]) {
        myGamePiece.speedX = -2; 
        myThrustLeft = new component(10, 30, "blue", myGamePiece.x + myGamePiece.width - 5, myGamePiece.y);
        myThrustLeft.update();
    };
    if (myGameArea.keys && myGameArea.keys[39]) {
        myGamePiece.speedX = 2;
        myThrustRight = new component(10, 30, "blue", myGamePiece.x - 5, myGamePiece.y);
        myThrustRight.update();
    };
    if (myGameArea.keys && myGameArea.keys[38]) {
        myGamePiece.speedY = -3; 
        myThrustUp = new component(30, 10, "blue", myGamePiece.x, myGamePiece.y + myGamePiece.height - 5);
        myThrustUp.update();
    };
    if (myGameArea.keys && myGameArea.keys[40]) {
        myGamePiece.speedY = 3;
        myThrustDown = new component(30, 10, "blue", myGamePiece.x, myGamePiece.y - 5);
        myThrustDown.update();
    };

    // Buttons

    if (myGameArea.x && myGameArea.y) {
        if (myUpBtn.clicked()) {
          myGamePiece.y -= 3;
          myThrustUp = new component(30, 10, "blue", myGamePiece.x, myGamePiece.y + myGamePiece.height - 5);
          myThrustUp.update();
        }
        if (myDownBtn.clicked()) {
          myGamePiece.y += 3;
          myThrustDown = new component(30, 10, "blue", myGamePiece.x, myGamePiece.y - 5);
          myThrustDown.update();
        }
        if (myLeftBtn.clicked()) {
          myGamePiece.x += -3;
          myThrustLeft = new component(10, 30, "blue", myGamePiece.x + myGamePiece.width - 5, myGamePiece.y);
          myThrustLeft.update();
        }
        if (myRightBtn.clicked()) {
          myGamePiece.x += 3;
          myThrustRight = new component(10, 30, "blue", myGamePiece.x - 5, myGamePiece.y);
          myThrustRight.update();
        }
    };


    // Score

    myScore.text = "SCORE: " + myGameArea.frameNo;
    myScore.update();


    myUpBtn.update();
    myDownBtn.update();
    myLeftBtn.update();
    myRightBtn.update();
    myGamePiece.newPos();
    myGamePiece.update();
}

console.log("Header Height:" + document.getElementById("header").offsetHeight)

console.log("Canvas Height:" + myGameArea.canvas.border)
