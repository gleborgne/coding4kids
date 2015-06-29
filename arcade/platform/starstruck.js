$(function(){
//on crée une zone de jeu de 800px * 600px
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gamecanvas', { preload: preload, create: create, update: update, render: render });

//cette fonction est appelée pour charger les différentes ressources du jeu (images, sons, etc)
function preload() {
    //on initialise la zone de dessin
    var container = document.getElementById("gamecanvas");
    container.appendChild(game.canvas);

    //chargement de la définition du niveau ou tilemap (différents blocs qui composent le niveau)
    //peut être édité avec l'éditeur tiled disponible ici : http://www.mapeditor.org/
    game.load.tilemap('level1', 'assets/level1.json', null, Phaser.Tilemap.TILED_JSON);
    
    //chargement des images des tuiles du niveau
    game.load.image('tiles-1', 'assets/tiles-1.png');

    //chargement des images des tuiles du personnage
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    //chargement des images des tuiles des droids
    game.load.spritesheet('droid', 'assets/droid.png', 32, 32);
    //chargement de l'images de la petite étoile
    game.load.image('starSmall', 'assets/star.png');
    //chargement de l'images de la grande étoile
    game.load.image('starBig', 'assets/star2.png');
    //chargement de l'image de fond
    game.load.image('background', 'assets/background2.png');

}

var map;
var tileset;
var layer;
var player;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var bg;

//Cette fonction est appelée à la création du jeu
function create() {

    //on crée un moteur physique de type arcade
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //on applique une couleur de fond noire
    game.stage.backgroundColor = '#000000';
    //on crée une image à partir de la resource "background" et on la dessine sur toute la surface
    bg = game.add.tileSprite(0, 0, 800, 600, 'background');
    //on fixe l'image par rapport à la caméra pour que l'image de fond soit fixe quel que soit le mouvement
    //de la caméra
    bg.fixedToCamera = true;
    //chargement de la map
    map = game.add.tilemap('level1');
    //chargement des images de la map
    map.addTilesetImage('tiles-1');
    //On définition les éléments de la map qui provoquent des collisions
    map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);
    //on crée une version de la map utilisable dans le jeu
    layer = map.createLayer('Tile Layer 1');

    //  Un-comment this on to see the collision tiles
    // layer.debug = true;

    layer.resizeWorld();

    //on défini la gravité pour que les personnes et les objets tombent de facon naturelle
    game.physics.arcade.gravity.y = 250;

    //on crée un objet pour le joeur, à partir des images de la ressource "dude"
    player = game.add.sprite(32, 32, 'dude');
    //on active le moteur physique de type arcade
    game.physics.enable(player, Phaser.Physics.ARCADE);

    //on définit le facteur de rebond sur le personnage
    player.body.bounce.y = 0.2;
    //on indique que le personnage ne peut pas franchir les limites du monde
    player.body.collideWorldBounds = true;
    //on défini la taille du personnage
    player.body.setSize(20, 32, 5, 16);

    //on définit des animations à partir des images des tuiles du personnage
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('turn', [4], 20, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //on indique que la caméra suit le personnage
    game.camera.follow(player);

    //on déclare la gestion des évènements clavier
    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

}

//cette fonction est appelée indéfiniment pour vérifier l'état des éléments du jeu
//c'est ici qu'on va contrôler l'état des éléments et déclencher des actions
function update() {
    //on laisse le moteur vérifier les collisions avec la map
    game.physics.arcade.collide(player, layer);
    //on remet à zéro la vitesse de déplacement horizontale du personnage
    player.body.velocity.x = 0;

    //si on appui sur la flèche gauche
    if (cursors.left.isDown) 
    {
        //on définit une vitesse horizontale négative
        player.body.velocity.x = -150;

        //et on met l'animation "left" sur le personnage
        if (facing != 'left')
        {
            player.animations.play('left');
            facing = 'left';
        }
    }
    //si on appui sur la flèche droite
    else if (cursors.right.isDown)
    {
        //on définit une vitesse horizontale
        player.body.velocity.x = 150;
        //et on met l'animation "right" sur le personnage
        if (facing != 'right')
        {
            player.animations.play('right');
            facing = 'right';
        }
    }
    else //sinon
    {
        //si le personnage n'est pas encore en mode statique, on arrête l'animation du personnage
        if (facing != 'idle')
        {
            player.animations.stop();

            if (facing == 'left')
            {
                player.frame = 0;
            }
            else
            {
                player.frame = 5;
            }

            facing = 'idle';
        }
    }
    
    //si le bouton de saut est appuyé, et que le personnage est au sol et qu'on a pas déjà traité le saut
    if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer)
    {
        //on met une vitesse verticale négative sur le personnage (pour qu'il monte)
        player.body.velocity.y = -250;
        jumpTimer = game.time.now + 750;
    }

}

function render () {

    // game.debug.text(game.time.physicsElapsed, 32, 32);
    // game.debug.body(player);
    // game.debug.bodyInfo(player, 16, 24);

}
});