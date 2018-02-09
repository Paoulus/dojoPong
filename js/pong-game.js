/**
 * 	Settings del gioco
 *  variabili globali che contengono le informazioni più importanti =
 *  risuluzoine (screenWidth; screenHeight); 
 *  condizioni di vittoria/sconfitta (scoreToWin)...
 */

var screenWidth  = 1280;
var screenHeight = 640;

var dashSize = 10;

var paddleLeftX			= 100;
var paddleRightX 		= screenWidth - paddleLeftX; // o semplicemente 1180
var paddleVelocity 		= 500;
var paddleSegmentsMax 	= 8;
var paddleSegmentHeight = 8;
var paddleSegmentAngle 	= 15;
var paddleTopGap 		= 0;
var paddleScale         = 1.5;

var ballVelocityInit 			 	   = 400;
var ballStartingAngleLeftX 	           = -240;
var ballStartingAngleLeftY   		   = 240;
var ballStartingAngleRightX  		   = -120;
var ballStartingAngleRightY  		   = 120;
var ballRandomStartingAngleToLeftSide  = [ballStartingAngleLeftX, ballStartingAngleLeftY];
var ballRandomStartingAngleToRightSide = [ballStartingAngleRightX, ballStartingAngleRightY];
var ballStartDelay 			 		   = 3; //countdown al "lancio" della pallina NOTO: per un eventuale timer
var ballVelocityIncrement 	 		   = 35;
var ballSequentialHits 				   = 3; //serve per sapere il numero di colpi di fila prima dell'aumento della velocità
var ballScale                          = 1.5;

var scoreToWin = 11; //condizioni di vittoria

/**
 * variabili che contengono le informazioni sugli assets degli sprites
 */
var ballURL  = 'assets/ball.png';
var ballName = 'ball';
    
var paddleURL  = 'assets/paddle.png';
var paddleName = 'paddle';

/**
 * variabili che contengono le informazioni sugli assets sonori
 */
var ballBounceURL  = 'assets/ballBounce.ogg';
var ballBounceName = 'ballBounce';
    
var ballHitURL  = 'assets/ballHit.ogg';
var ballHitName ='ballHit';
    
var ballMissedURL  = 'assets/ballMissed.ogg';
var ballMissedName = 'ballMissed';

/**
 * per la gestione degli fonts
 */
var scoreLeftX  = screenWidth * 0.25;
var scoreRightX = screenWidth * 0.75;
var scoreTopY   = 10;

// NOTA: BISOGNA USARE I TAG DI CSS quindi magari la facciamo come cosa extra ?
var fontStyle = {
	            	font:  '80px Comic Sans', 
                 	fill:  '#FFFFFF',
                 	align: 'center'
                };

/**
 * lables
 */

var winTxt = 'The winner is';


// NOTA: questa cosa la possiamo dire in due parole senza perdere troppo tempo
//       al massimo la lasciamo come parte di approfondimento se riusciamo a spiegare
//       per bene gli oggetti
var game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, 'gameDiv', 
	{ 
		preload: preload, 
		create: create, 
		update: update 
	});

/**
 * Qui va scritto il codice per caricare tutti i file: sprites, audio...
 */
function preload() {
	game.load.image(ballName, ballURL);
	game.load.image(paddleName, paddleURL);

	game.load.audio(ballBounceName, ballBounceURL);
	game.load.audio(ballHitName, ballHitURL);
	game.load.audio(ballMissedName, ballMissedURL);
}


/**
 * Qui va creato il mondo di gioco.
 * Prima della funzione vanno create tutte le variabili neccessarie
 * Si consiglia di utlizzare delle funzoni ausiliarie
 * per suddividere in parti la gestione del mondo (Creazione degli sprite, della fisica, etc, etc)
 */

//variabili sprites
var backgroundGraphics;
var ballSprite;
var paddleLeftSprite;
var paddleRightSprite;
var paddleGroup;
    
    
//variabili per la gestione degli eventi player 1
var paddleLeftUpKeyEvent;
var paddleLeftDownKeyEvent;
    
var missedSide;
    
var scoreLeft  = 0;
var scoreRight = 0;
    
var lblScoreLeft;
var lblScoreRight;
    
var sndBallHit;
var sndBallBounce;
var sndBallMissed;
    
var instructions;
var winnerLeft;
var winnerRight;
    
var ballVelocity;
var ballReturnCount;

// NOTA: si potrebbe suddividere il create in più metodi
//       per esempio un metodo dove si definisce la fisica,
//       uno per la creazione degli sprite, ...

function create() {
	/******************
	 * creazione della grafia
	 ******************/

	//creo un "penello" per disegnare sullo schermo
	//questo per far vedere che tecnicamente si potrebbe 
	//creare tutta la grafica "manualmente" ma 
	//siccome ciò rende le cose molto diffici nei giochi più complessi
	//siccome ci sono troppe da disegnare ogni volta 
	//è stata inventata l'idea delle texture e degli sprites
	//per agevolare il processo
	graphics = game.add.graphics(0, 0);
    graphics.lineStyle(2, 0xFFFFFF, 1);
    
    //qui creo la linea che divide a metà lo schermo
    for (var y = 0; y < screenHeight; y += dashSize * 2) {
        graphics.moveTo(game.world.centerX, y);
        graphics.lineTo(game.world.centerX, y + dashSize);
    }
    
    /**
     * Spiegazione dell'anchor
     * come ben sapete in ogni libreria (per lo meno quelle sane di mente)
     * i sprite vengono rinchiusi in un rettangolo. L'angolo in alto a sinistra
     * ha sempre coordinate (0, 0) mentre quello in basso a destra (-1, -1).
     * Serve per fornire una posizione in percenturale delle dimensioni dello sprite.
     * Per esempio anchor(0.5, 0.5) equivale alla posizione (w*0.5, h*0.5) nel rettangolo.
     * Utilizzando gli attributi x e y della classe sprite equivale a spostare l'anchor 
     * dello sprite all'interno del mondo e di conseguenza anche dello sprite. 
     */
    ballSprite 		  = game.add.sprite(game.world.centerX, game.world.centerY, ballName);
    ballSprite.anchor.set(0.5, 0.5);
    ballSprite.scale.setTo(ballScale, ballScale);

    paddleLeftSprite  = game.add.sprite(paddleLeftX, game.world.centerY, paddleName);
    paddleLeftSprite.anchor.set(0.5, 0.5);
    paddleLeftSprite.scale.setTo(paddleScale, paddleScale);

    paddleRightSprite = game.add.sprite(paddleRightX, game.world.centerY, paddleName);
    paddleRightSprite.anchor.set(0.5, 0.5);
    paddleRightSprite.scale.setTo(paddleScale, paddleScale);

    lblScoreLeft	  = game.add.text(scoreLeftX, scoreTopY, "0", fontStyle);
    lblScoreLeft.anchor.set(0.5, 0);
    
    lblScoreRight 	  = game.add.text(scoreRightX,scoreTopY, "0", fontStyle);
    lblScoreRight.anchor.set(0.5, 0);

    lblWinner 		  = game.add.text(screenWidth * 0.25,screenHeight * 0.25, winTxt, fontStyle);
    lblWinner.anchor.set(0.5, 0.5);

    /***********************
     * creazione della fisica
     ***********************/

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.enable(ballSprite, Phaser.Physics.ARCADE);
        
    ballSprite.checkWorldBounds        = true;
    ballSprite.body.collideWorldBounds = true;
    ballSprite.body.immovable 		   = true;
    ballSprite.body.bounce.set(1);
    ballSprite.events.onOutOfBounds.add(handleEventBallOutOfBounds, this); //il this lo si può ignorare bisogna metterlo e basta
    
    // NOTA: qui bisogna spiegare cosa sono i gruppi 
    //       basterebbe dire che è una specie di array per contenere 
    //       i sprite che hanno proprietà simili 
    //       oppure sprite che si vogliono gestire in parallelo    
    paddleGroup 				= game.add.group();
    paddleGroup.enableBody      = true;
    paddleGroup.physicsBodyType = Phaser.Physics.ARCADE;
        
    paddleGroup.add(paddleLeftSprite);
    paddleGroup.add(paddleRightSprite);
        
    paddleGroup.setAll('checkWorldBounds', true);
    paddleGroup.setAll('body.collideWorldBounds', true);
    paddleGroup.setAll('body.immovable', true);

    /************************
     * creazione eventi keyboard
     ************************/
    paddleLeftUpKeyEvent = game.input.keyboard.addKey(Phaser.Keyboard.W);
    paddleLeftDownKeyEvent = game.input.keyboard.addKey(Phaser.Keyboard.S);

    //per modalità due giocatori
	//paddleRightUpKeyEvent   = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    //paddleRightDownKeyEvent = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    
    /******************
     * creazione audio
     ******************/
    sndBallHit    = game.add.audio(ballHitName);
    sndBallBounce = game.add.audio(ballBounceName);
    sndBallMissed = game.add.audio(ballMissedName);

    /*********
     * start game
     *********/
    paddleGroup.setAll('visible', true);
    paddleGroup.setAll('body.enable', true);
    
    paddleLeftUpKeyEvent.enabled = true;
    paddleLeftDownKeyEvent.enabled = true;
    
    paddleLeftSprite.y = game.world.centerY;
    paddleRightSprite.y = game.world.centerY;

    game.physics.arcade.checkCollision.left = false;
    game.physics.arcade.checkCollision.right = false;

    lblWinner.visible = false;

    ballSprite.reset(game.world.centerX, game.rnd.between(0, screenHeight));
    ballSprite.visible = true;
	ballVelocity 		= ballVelocityInit;
    ballReturnCount 	= 0;
    ballSprite.visible 	= true;
    
    var randomAngle = game.rnd.pick(ballRandomStartingAngleToLeftSide.concat(ballRandomStartingAngleToRightSide));
    
    if (missedSide == 'right') {
        randomAngle = game.rnd.pick(ballRandomStartingAngleToRightSide);
    } else if (missedSide == 'left') {
        randomAngle = game.rnd.pick(ballRandomStartingAngleToLeftSide);
    }
    
    game.physics.arcade.velocityFromAngle(randomAngle, ballVelocity, ballSprite.body.velocity);
}
/**
 * qui va scritto il codice che gestisce i movimente degli sprites
 * e gestisce gli eventi 
 */

function update() {
	/****************
	 * movimento degli sprites pc e npc
	 ****************/

	if (paddleLeftUpKeyEvent.isDown)
        paddleLeftSprite.body.velocity.y = -paddleVelocity;
    else if (paddleLeftDownKeyEvent.isDown) 
        paddleLeftSprite.body.velocity.y = paddleVelocity;
    else 
        paddleLeftSprite.body.velocity.y = 0;
    
    if (paddleLeftSprite.body.y < paddleTopGap)
        paddleLeftSprite.body.y = paddleTopGap;
    

    //per IA
    if(ballSprite.x >= screenWidth/2) {
        //var angle = Math.atan2(paddleRightSprite.y - ballSprite.y, paddleRightSprite.x - ballSprite.x) * (180/Math.PI);
        if(ballSprite.y > paddleRightSprite.y) 
        	paddleRightSprite.body.velocity.y = paddleVelocity;
        else paddleRightSprite.body.velocity.y = -paddleVelocity;    
        //console.log(ballSprite.y);
        //console.log(paddleRightSprite.y);
    }

    if (paddleRightSprite.body.y < paddleTopGap)
        paddleRightSprite.body.y = paddleTopGap;

    /************
     *  controllo collisioni
     ************/

	// NOTA: overlap va spiegato in un seconda momento
	//       prima c'è l'intersezione di ignoranza con la geometria
	//game.physics.arcade.overlap(ballSprite, paddleGroup, collideWithPaddle, null, this);
    
    //paddleGroup.forEach(function(element) {}, this);
    for (var i = 0, len = paddleGroup.children.length; i < len; i++) {  
    	//se la pallina interseca il pad i-esimo
    	if(Phaser.Rectangle.intersects(
    		ballSprite.getBounds(), paddleGroup.children[i].getBounds()
    	)) {
    		sndBallHit.play();

    		var returnAngle; //angolo di rimbalzo
		    var segmentHit = Math.floor((ballSprite.y - paddleGroup.children[i].y)/paddleSegmentHeight);
		    
		    if (segmentHit >= paddleSegmentsMax) 
		        segmentHit = paddleSegmentsMax - 1;
		    else if (segmentHit <= -paddleSegmentsMax)
		        segmentHit = -(paddleSegmentsMax - 1);
		    
		    
		    if (paddleGroup.children[i].x < screenWidth * 0.5) {
		        returnAngle = segmentHit * paddleSegmentAngle;
		        game.physics.arcade.velocityFromAngle(returnAngle, ballVelocity, ballSprite.body.velocity);
		    } else {
		        returnAngle = 180 - (segmentHit * paddleSegmentAngle);
		        
		        if (returnAngle > 180)
		            returnAngle -= 360;
		      
		        game.physics.arcade.velocityFromAngle(returnAngle, ballVelocity, ballSprite.body.velocity);
		    }
		    
		    ballReturnCount ++;
		    
		    if(ballReturnCount >= ballSequentialHits) {
		        ballReturnCount = 0;
		        ballVelocity += ballVelocityIncrement;
		    }
    	}
    }


    if (ballSprite.body.blocked.up || ballSprite.body.blocked.down 
    	|| ballSprite.body.blocked.left || ballSprite.body.blocked.right) {
        sndBallBounce.play();
    }
}


function render() {
	/**
	 * NOTA: questa funzione viene chiamata da Phaser
	 * dopo l'esecuzione di WebGL o del canvas' render quindi 
	 * si potrebbe utilizzare per scrivere delle codice di debug
	 * (console.log(....)) per sapere come cambiano i sprite dopo 
	 * ogni frame
	 */

}

//questa serve se quando si spiega overlap della phisica
function collideWithPaddle(ball, paddle) {
	//stesso codice dell'if col for
}

function handleEventBallOutOfBounds() {
	sndBallMissed.play();
    
    //controllo da che parte è uscita la pallina
    if (ballSprite.x < 0) {
        missedSide = 'left';
        scoreRight++;
    } else if (ballSprite.x > screenWidth) {
        missedSide = 'right';
        scoreLeft++;
    }
    
    //aggiorno il punteggio
    lblScoreLeft.text  = scoreLeft;
    lblScoreRight.text = scoreRight;
    
    //controllo le vincite
    if (scoreLeft >= scoreToWin) {
        lblWinner.text    = winTxt + " the left side";
        lblWinner.visible = true;
        //restartGame();
    } else if (scoreRight >= scoreToWin) {
        lblWinner.text    = winTxt + " " + " the right side";
        lblWinner.visible = true;
        //restartGame();
    } else {
        ballSprite.reset(game.world.centerX, game.rnd.between(0, screenHeight));
        ballSprite.visible = false;
        //se voglio far vedere il timer in breve, in un secondo momento
        //dopo aver riscitto il codice usando più funzioni per le operazioni 
        //che si ripetono
        //game.time.events.add(Phaser.Timer.SECOND * ballStartDelay, startBall, this);
        
        ballVelocity 		= ballVelocityInit;
        ballReturnCount 	= 0;
        ballSprite.visible 	= true;
        
        var randomAngle = game.rnd.pick(ballRandomStartingAngleToLeftSide.concat(ballRandomStartingAngleToRightSide));
        
        if (missedSide == 'right') {
            randomAngle = game.rnd.pick(ballRandomStartingAngleToRightSide);
        } else if (missedSide == 'left') {
            randomAngle = game.rnd.pick(ballRandomStartingAngleToLeftSide);
        }
        
        game.physics.arcade.velocityFromAngle(randomAngle, ballVelocity, ballSprite.body.velocity);
    }
}
