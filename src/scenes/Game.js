import Phaser from "/src/lib/phaser.js";

import Carrot from "../game/Carrot.js";

export default class Game extends Phaser.Scene{

    /** @type {Phaser.Physics.Arcade.Sprite} */
    player

     /** @type {Phaser.Physics.Arcade.StaticGroup} */
    platforms

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursors
    
    /** @type {Phaser.Physics.Arcade.Group} */
    carrots

    /** 
     * @type {Phaser.Physics.Arcade.Sprite} 
     * sprite
     * */

    addCarotAbove(sprite){
        const y = sprite.y - sprite.displayHeight

        /**@type {Phaser.physics.Arcade.Sprite} */
        const carrot = this.carrots.get(sprite.x, y, 'carrot')

        this.add.existing(carrot)

        //update the physics body size
        carrot.body.setSize(carrot.width, carrot.height)

        return carrot
    }

    constructor()
    {
        super('game')
    }

    preload()
    {
        this.load.image('background', '/assets/bg_layer1.png')

        this.load.image('platform', '/assets/ground_grass.png')

        this.load.image('bunny-stand', '/assets/bunny1_stand.png')

        this.cursors = this.input.keyboard.createCursorKeys()

        this.load.image('carrot', '/assets/carrot.png')
    }

    create()
    {
        //générer les background
        this.add.image(240, 320, 'background')
            .setScrollFactor(1, 0)
            
            //générer les plateformes
        this.platforms = this.physics.add.staticGroup()
// placement aléatoire de 5 plateformes sur l'écran
        for(let i=0; i<5; i++){
            const x = Phaser.Math.Between(80,400)
            const y = 150 * i

            const platform = this.platforms.create(x, y, 'platform')
            platform.scale = 0.5

            const body = platform.body
            body.updateFromGameObject()
        }

        this.player = this.physics.add.sprite(240, 320, 'bunny-stand')
        .setScale(0.5)
        //ajouter des collisions
        this.physics.add.collider(this.platforms, this.player)
        //retirer des collisions sous le perso seulement
        this.player.body.checkCollision.up = false
        this.player.body.checkCollision.left = false
        this.player.body.checkCollision.right = false
        // la caméra follow le perso
        this.cameras.main.startFollow(this.player)
        // la caméra n'a pas de scroll horizontal
        this.cameras.main.setDeadzone(this.scale.width * 1.5)
        
        this.carrots = this.physics.add.group({
            classType: Carrot
        })
        
        this.physics.add.collider(this.platforms, this.carrots)
    }

    update(t, dt)
    {
        // les plateformes réapparaissent plus haut lorsque le joueur atteint le haut du cadre
        this.platforms.children.iterate(child => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = child

            const scrollY = this.cameras.main.scrollY
            if(platform.y >= scrollY + 700){
                platform.y = scrollY - Phaser.Math.Between(50, 100)
                platform.body.updateFromGameObject()
            }
        })

// définir les vitesses et directions lorsque le perso rebondit ou qu'une touche droite/gauche est utilisée
        const touchingDown = this.player.body.touching.down
        if(touchingDown){
            this.player.setVelocityY(-300)
        }

        if(this.cursors.left.isDown && !touchingDown){
            this.player.setVelocityX(-200)
        }
        else if (this.cursors.right.isDown && !touchingDown){
            this.player.setVelocityX(200)
        }
        else{
            this.player.setVelocityX(0)
        }
// attacher la fonction du wrap au joueur
        this.horizontalWrap(this.player)
    }
    
    // le perso peut sortir du cadre à droite et revenir à gauche et vice-versa
    /**
     * @param {Phaser.GameObjects.Spite} sprite
     */
    horizontalWrap(sprite){
        const halfWidth = sprite.displayWidth * 0.5
        const gameWidth = this.scale.width
        if(sprite.x < -halfWidth){
            sprite.x = gameWidth + halfWidth
        }else if (sprite.x > gameWidth + halfWidth){
            sprite.x = -halfWidth
        }
    }
}