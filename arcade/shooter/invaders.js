$(function(){
//on crée une zone de jeu de 800px * 600px
var game = new Phaser.Game(800, 600, Phaser.AUTO, document.getElementById('gamecanvas'), { preload: preload, create: create, update: update, render: render });

//cette fonction est appelée pour charger les différentes ressources du jeu (images, sons, etc)
function preload() {
    var container = document.getElementById("gamecanvas");
    container.appendChild(game.canvas);

    //on charge l'image des tirs
    game.load.image('bullet', 'assets/bullet.png');
    //on charge l'image des tirs ennemis
    game.load.image('enemyBullet', 'assets/enemy-bullet.png');
    //on charge les images des tuiles du vaisseau ennemi
    game.load.spritesheet('invader', 'assets/invader32x32x4.png', 32, 32);
    //on charge l'image du vaisseau
    game.load.image('ship', 'assets/player.png');
    //on charge les images de l'explosion
    game.load.spritesheet('kaboom', 'assets/explode.png', 128, 128);
    //on charge l'image de fond
    game.load.image('starfield', 'assets/starfield.png');
    //on charge l'image de fond
    game.load.image('background', 'assets/background2.png');

}

var player;
var aliens;
var bullets;
var bulletTime = 0;
var cursors;
var fireButton;
var explosions;
var starfield;
var score = 0;
var scoreString = '';
var scoreText;
var lives;
var enemyBullet;
var firingTimer = 0;
var stateText;
var livingEnemies = [];

//Cette fonction est appelée à la création du jeu
function create() {
    //on crée un moteur physique de type arcade
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //on crée une image à partir de la ressource "starfield"
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    // On crée un groupe pour les tirs
    bullets = game.add.group();
    //On indique que les tirs sont gérés par le moteur physique
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    //on crée 30 éléments dans le groupe à partir de la ressource "bullet"
    bullets.createMultiple(30, 'bullet');
    //on défini leur point d'ancrage
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    //on indique que les tirs sont tués automatiquement si ils sortent du monde
    bullets.setAll('outOfBoundsKill', true);
    //on indique que les tirs vérifient si ils sortent du monde
    bullets.setAll('checkWorldBounds', true);

    // On crée un groupe pour les tirs ennemis
    enemyBullets = game.add.group();
    //On indique que les tirs sont gérés par le moteur physique
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    //on crée 30 éléments dans le groupe à partir de la ressource "enemyBullet"
    enemyBullets.createMultiple(30, 'enemyBullet');
    //on défini leur point d'ancrage
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    //on indique que les tirs sont tués automatiquement si ils sortent du monde
    enemyBullets.setAll('outOfBoundsKill', true);
    //on indique que les tirs vérifient si ils sortent du monde
    enemyBullets.setAll('checkWorldBounds', true);

    //on crée le vaisseau à partir de la ressource "ship"
    player = game.add.sprite(400, 500, 'ship');
    //on défini leur point d'ancrage
    player.anchor.setTo(0.5, 0.5);
    //On indique que vaisseau est géré par le moteur physique
    game.physics.enable(player, Phaser.Physics.ARCADE);

    //on crée un groupe pour les ennemis
    aliens = game.add.group();
    //On indique que les ennemis sont gérés par le moteur physique
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;
    //on crée les occurences des ennemis
    createAliens();

    //on crée une zone de texte pour afficher le score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

    //on crée un groupe pour les images représentants le nombre de vies restantes
    lives = game.add.group();
    //on crée une zone de texte pour afficher le nombre de vies
    game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '34px Arial', fill: '#fff' });

    //on crée une zone de texte pour afficher l'état du jeu
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    //on crée les images représentats le nombre de vies
    for (var i = 0; i < 3; i++) 
    {
        var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
        ship.anchor.setTo(0.5, 0.5);
        ship.angle = 90;
        ship.alpha = 0.4;
    }

    //on crée un groupe pour les explosions
    explosions = game.add.group();
    //on crée 30 occurences d'explosions
    explosions.createMultiple(30, 'kaboom');
    //on initialise les explosions
    explosions.forEach(setupInvader, this);

    //on active la gestion des inputs
    cursors = game.input.keyboard.createCursorKeys();
    //on active la gestion de la barre d'espace
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    
}

//fonction appellée pour la création des ennemis
function createAliens () {

    //on crée 4 lignes de 10 ennemis
    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 10; x++)
        {
            //on crée l'ennemi à partir de la ressource "invader"
            var alien = aliens.create(x * 48, y * 50, 'invader');
            //on défini le point d'ancrage en son centre
            alien.anchor.setTo(0.5, 0.5);
            //on crée une animation
            alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
            //on déclenche cette animation
            alien.play('fly');
            //on indique que les ennemis ne bougent pas
            alien.body.moves = false;
        }
    }

    //on initialise la position du groupe d'ennemi
    aliens.x = 100;
    aliens.y = 50;


    //On crée une animation de déplacement des ennemis
    var tween = game.add.tween(aliens).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    //A chaque boucle de l'animation, on appelle la fonction "descend"
    tween.onLoop.add(descend, this);
}

//fonction d'initialisation des explosions
function setupInvader (invader) {
    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');
}

//fonction pour gérer la descente des vaisseaux ennemis
function descend() {
    aliens.y += 10;
}

//cette fonction est appelée indéfiniment pour vérifier l'état des éléments du jeu
//c'est ici qu'on va contrôler l'état des éléments et déclencher des actions
function update() {

    //on déplace l'image de fond
    starfield.tilePosition.y += 2;

    //si le joeur est vivant
    if (player.alive)
    {
        //on remet à zéro sa vitesse
        player.body.velocity.setTo(0, 0);

        //si le bouton flèche gauche est appuyé
        if (cursors.left.isDown)
        {
            player.body.velocity.x = -200;
        }
        //si le bouton flèche droite est appuyé
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 200;
        }

        //si le bouton de tir est appuyé
        if (fireButton.isDown)
        {
            fireBullet();
        }

        //si les ennemis n'ont pas déjà tiré
        if (game.time.now > firingTimer)
        {
            enemyFires();
        }

        //on vérifie les collisions avec le moteur physique

        //si un tir heurte un ennemi on appelle la fonction "collisionHandler"
        game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
        //si un tir ennemi heurte le vaisseau on appelle la fonction "enemyHitsPlayer"
        game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
    }

}

function render() {

    // for (var i = 0; i < aliens.length; i++)
    // {
    //     game.debug.body(aliens.children[i]);
    // }

}

//fonction appelée si un tir heurte un ennemi
function collisionHandler (bullet, alien) {

    //on déclare le tir et l'ennemi comme morts
    bullet.kill();
    alien.kill();

    //on augmente le score et on modifie le texte du score
    score += 20;
    scoreText.text = scoreString + score;

    //on crée une explosion
    var explosion = explosions.getFirstExists(false);
    //on réinitialise l'explosion sur la position de l'ennemi
    explosion.reset(alien.body.x, alien.body.y);
    //on déclenche l'animation d'explosion
    explosion.play('kaboom', 30, false, true);

    //si il ne reste plus d'ennemi en vie
    if (aliens.countLiving() == 0)
    {
        //on augmente le score et on modifie le texte du score
        score += 1000;
        scoreText.text = scoreString + score;

        //on enlève tous les tirs ennemis
        enemyBullets.callAll('kill',this);
        //on affiche le texte de fin de partie
        stateText.text = " You Won, \n Click to restart";
        stateText.visible = true;

        //si l'utilisateur clic, on appelle la fonction "restart"
        game.input.onTap.addOnce(restart, this);
    }

}

//fonction appelée si un tir ennemi touche le vaisseau
function enemyHitsPlayer (player,bullet) {
    //on enlève le tir
    bullet.kill();
    //on enlève une des images d'indicateur de vie restantes
    live = lives.getFirstAlive();

    if (live)
    {
        live.kill();
    }

    //On crée une explosion
    var explosion = explosions.getFirstExists(false);
    //on positionne l'explosion sur le vaisseau
    explosion.reset(player.body.x, player.body.y);
    //on démarre l'explosion
    explosion.play('kaboom', 30, false, true);

    //si le joueur n'a plus de vies
    if (lives.countLiving() < 1)
    {
        //on tue le joueur
        player.kill();
        //on tue les tirs ennemis
        enemyBullets.callAll('kill');
        //on affiche le texte de fin de partie
        stateText.text=" GAME OVER \n Click to restart";
        stateText.visible = true;

        //si l'utilisateur clic, on appelle la fonction "restart"
        game.input.onTap.addOnce(restart,this);
    }

}

//fonction appelées pour gérer le tir des ennemis
function enemyFires () {

    //on récupère une occurence de tir dans le groupe
    enemyBullet = enemyBullets.getFirstExists(false);

    //on remet la liste d'ennemis à 0
    livingEnemies.length=0;

    //pour chaque ennemi encore vivant
    aliens.forEachAlive(function(alien){
        //on ajoute l'ennemià la liste
        livingEnemies.push(alien);
    });

    //si on a des ennemis
    if (enemyBullet && livingEnemies.length > 0)
    {
        //on tire au hasard un des ennemis vivants pour le faire tirer
        var random=game.rnd.integerInRange(0,livingEnemies.length-1);
        var shooter=livingEnemies[random];

        //on positionne le tir sur l'ennemi sélectionné
        enemyBullet.reset(shooter.body.x, shooter.body.y);
        //on envoi le tir vers le joueur
        game.physics.arcade.moveToObject(enemyBullet,player,120);
        //on indique que le prochain tire sera dans 2000 millisecondes
        firingTimer = game.time.now + 2000;
    }

}

//fonction appelée pour gérer les tirs du vaisseau
function fireBullet () {

    //on fixe une limite pour éviter que le vaisseau ne tire trop vite
    if (game.time.now > bulletTime)
    {
        //on récupère un des tirs du vaisseau dans le groupe
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            //on initialise le tir sur le vaisseau
            bullet.reset(player.x, player.y + 8);
            //on lui met une vitesse verticale négative pour que le tir monte vers les ennemis
            bullet.body.velocity.y = -400;
            //on empêche le prochain tir avant 200 millisecondes
            bulletTime = game.time.now + 200;
        }
    }

}

//fonction appelée pour redémarrer le jeu
function restart () {
    //on remet toutes les vies du vaisseau
    lives.callAll('revive');
    //on enlève tous les ennemis
    aliens.removeAll();
    //on crée les ennemis
    createAliens();

    //on fait revivre le joeur
    player.revive();
    //on cache le texte de statut du jeu
    stateText.visible = false;
}
});