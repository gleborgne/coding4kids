$(function(){
//on crée une zone de jeu de 800px * 600px
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gamecanvas', { preload: preload, create: create, update: update });

//cette fonction est appelée pour charger les différentes ressources du jeu (images, sons, etc)
function preload() {
    var container = document.getElementById("gamecanvas");
    container.appendChild(game.canvas);

    //chargement des tuiles d'image des éléments du jeu dans la ressource "breakout"
    game.load.atlas('breakout', 'assets/breakout.png', 'assets/breakout.json');
    //chargement de l'image de fond dans la ressource "starfield"
    game.load.image('starfield', 'assets/starfield.jpg');
}

var ball;
var paddle;
var bricks;

var ballOnPaddle = true;

var lives = 3;
var score = 0;

var scoreText;
var livesText;
var introText;

var s;

//Cette fonction est appelée à la création du jeu
function create() {

    //on crée un moteur physique de type arcade
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //on vérifie les collisions du "monde" sauf pour la partie bassede l'écran de jeu
    game.physics.arcade.checkCollision.down = false;

    //on charge l'image de fond
    s = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    //on crée un groupe d'objets pour les briques
    bricks = game.add.group();
    //on autorise les briques à utiliser le moteur physique Arcade
    bricks.enableBody = true;
    bricks.physicsBodyType = Phaser.Physics.ARCADE;

    var brick;

    //on crée 4 lignes de 15 briques, en déclarant une tuile d'image différente pour chaque ligne, 
    //en allant chercher dans la ressource "breakout"
    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 15; x++)
        {
            brick = bricks.create(120 + (x * 36), 100 + (y * 52), 'breakout', 'brick_' + (y+1) + '_1.png');
            //on met un facteur de rebond
            brick.body.bounce.set(1);
            //on indique que cet objet ne peut pas être déplacé par le moteur physique
            brick.body.immovable = true;
        }
    }

    //on prend l'image du curseur dans la ressource "breakout"
    paddle = game.add.sprite(game.world.centerX, 500, 'breakout', 'paddle_big.png');
    //on définit le point d'ancrage du curseur en son centre
    paddle.anchor.setTo(0.5, 0.5);
    //on active la gestion du curseur par le moteur physique
    game.physics.enable(paddle, Phaser.Physics.ARCADE);
    //on indique que le curseur entre en collision avec les parois du monde
    paddle.body.collideWorldBounds = true;
    //on fixe le facteur de rebond du curseur
    paddle.body.bounce.set(1);
    //on indique que le curseur n'est pas déplacé par le moteur physique
    paddle.body.immovable = true;

    //on crée la balle à partir de la ressource "breakout"
    ball = game.add.sprite(game.world.centerX, paddle.y - 16, 'breakout', 'ball_1.png');
    //on définit le point d'ancrage de la balle en son centre
    ball.anchor.set(0.5);
    //on indique que la balle entre en collision avec les parois du monde
    ball.checkWorldBounds = true;
    //on indique que la balle est gérée par le moteur physique
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    //on indique que la balle entre en collision avec les parois du monde
    ball.body.collideWorldBounds = true;
    //on fixe le facteur de rebond de la balle
    ball.body.bounce.set(1);
    //on définit une animation de rotation sur la balle à partir des images
    ball.animations.add('spin', [ 'ball_1.png', 'ball_2.png', 'ball_3.png', 'ball_4.png', 'ball_5.png' ], 50, true, false);
    //on déclare un évènement. Si la balle sort du monde, on appelle la fonction ballLost
    ball.events.onOutOfBounds.add(ballLost, this);

    //on crée une zone de texte pour le score
    scoreText = game.add.text(32, 550, 'score: 0', { font: "20px Arial", fill: "#ffffff", align: "left" });
    //on crée une zone de texte pour le nombre de vies
    livesText = game.add.text(680, 550, 'lives: 3', { font: "20px Arial", fill: "#ffffff", align: "left" });
    //on crée une zone de texte pour le résultat du jeu
    introText = game.add.text(game.world.centerX, 400, '- click to start -', { font: "40px Arial", fill: "#ffffff", align: "center" });
    introText.anchor.setTo(0.5, 0.5);

    //on s'abonne aux entrées/sorties pour gérer la libération de la balle
    game.input.onDown.add(releaseBall, this);

}

//cette fonction est appelée indéfiniment pour vérifier l'état des éléments du jeu
//c'est ici qu'on va contrôler l'état des éléments et déclencher des actions
function update () {

    //  Fun, but a little sea-sick inducing :) Uncomment if you like!
    // s.tilePosition.x += (game.input.speed.x / 2);

    //on fixe la position du curseur en fonction de la position de la souris
    paddle.x = game.input.x;

    //on empêche le curseur de déborder à gauche ou à droite
    if (paddle.x < 24)
    {
        paddle.x = 24;
    }
    else if (paddle.x > game.width - 24)
    {
        paddle.x = game.width - 24;
    }

    //si la balle est accrochée au curseur, on la déplace avec le curseur
    if (ballOnPaddle)
    {
        ball.body.x = paddle.x;
    }
    //sinon on demande au moteur physique ded gérer les collisions
    else
    {
        //si la balle entre en collision avec le curseur, on appelle la fonction ballHitPaddle
        game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
        //si la balle entre en collision avec une brique, on appelle la fonction ballHitBrick
        game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
    }

}

//fonction pour gérer la libération de la balle lorsqu'elle est accrochée au curseur
function releaseBall () {

    if (ballOnPaddle)
    {
        ballOnPaddle = false;
        ball.body.velocity.y = -300;
        ball.body.velocity.x = -75;
        ball.animations.play('spin');
        introText.visible = false;
    }

}

//fonction appelée lorsque la balle sort de l'écran
function ballLost () {
    //on diminue le nombre de vies
    lives--;
    //on change le texte d'affichage du nombre de vies
    livesText.text = 'lives: ' + lives;

    //si il n'y a plus de vie, fin de partie
    if (lives === 0)
    {
        gameOver();
    }
    //sinon
    else
    {
        //on accroche la balle sur le curseur
        ballOnPaddle = true;
        //on réinitialise la position de la balle sur le curseur
        ball.reset(paddle.body.x + 16, paddle.y - 16);
        //on arrête l'animation de la balle
        ball.animations.stop();
    }

}

//fonction appelée si on perd la partie
function gameOver () {
    //on arrête la balle
    ball.body.velocity.setTo(0, 0);
    //on affiche le texte de résultat
    introText.text = 'Game Over!';
    introText.visible = true;

}

//fonction appelée si la balle touche une brique
function ballHitBrick (_ball, _brick) {
    //on déclare la brique comme morte
    _brick.kill();
    //on augmente le score
    score += 10;
    //on modifie le texte du score
    scoreText.text = 'score: ' + score;

    //Si il ne reste plus de briques "vivantes"
    if (bricks.countLiving() == 0)
    {
        //on augmente le score
        score += 1000;
        //on met à jour le texte du score
        scoreText.text = 'score: ' + score;
        //on affiche le résultat
        introText.text = '- Next Level -';

        // On arrête la balle et on l'accroche au curseur
        ballOnPaddle = true;
        ball.body.velocity.set(0);
        ball.x = paddle.x + 16;
        ball.y = paddle.y - 16;
        ball.animations.stop();

        //On remet toutes les briques en place et vivantes
        bricks.callAll('revive');
    }

}

//fonction appelée si la balle touche le curseur
function ballHitPaddle (_ball, _paddle) {

    var diff = 0;

    //si la balle est sur la gauche du curseur
    if (_ball.x < _paddle.x)
    {        
        diff = _paddle.x - _ball.x;
        _ball.body.velocity.x = (-10 * diff);
    }
    //si la balle est sur la droite du curseur
    else if (_ball.x > _paddle.x)
    {
        diff = _ball.x -_paddle.x;
        _ball.body.velocity.x = (10 * diff);
    }
    //sinon la balle rebondi parfaitement à la verticale
    else
    {
        //on ajoute un petit déclage dans la vitesse horizontale pour que la balle de rebondisse pas verticalement à l'infini
        _ball.body.velocity.x = 2 + Math.random() * 8;
    }

}
});