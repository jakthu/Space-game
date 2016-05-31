(function(){ //putting in function protects it from accessing in console
	//var context = document.getElementById("backgroundCanvas");
	$(document).ready(function(){ //$ means jQuery command
		//var canvas = document.getElementById("backgrounCanvas");
		//console.log("loaded");
		var game = {};
		
		game.stars = [];

		game.width = 550;
		game.height = 600;

		game.keys = [];

		game.projectiles = [];

		game.enemies = [];

		game.images = [];
		game.doneImages = 0;
		game.requiredImages = 0;

		game.gameOver = false;
		game.gameWon = false;

		game.count = 24;
		game.division = 48; //timer for when the enemies move
		game.left = false;
		game.enemySpeed = 2;

		game.explodeSound = new Audio("explosion.wav");

		game.shootSound = new Audio("shoot.wav");


		game.moving = false;

		game.fullShootTimer = 10;
		game.shootTimer = game.fullShootTimer;

		game.player = {
			x: game.width / 2 - 50,
			y: game.height - 110,
			width: 100,
			height: 100,
			speed: 3,
			rendered: false
		};

		game.contextBackground = document.getElementById("backgroundCanvas").getContext("2d");
		game.contextPlayer = document.getElementById("playerCanvas").getContext("2d");
		game.contextEnemies = document.getElementById("enemiesCanvas").getContext("2d");


		$(document).keydown(function(e){
			game.keys[e.keyCode ? e.keyCode : e.which] = true;
		});

		/*
			up - 38
			down - 40
			left - 37
			right - 39

			w - 87
			a - 65
			s - 83
			d - 68

			space - 32

		*/

		$(document).keyup(function(e){
			delete game.keys[e.keyCode ? e.keyCode : e.which];
		});

		function addBullet(){
			game.projectiles.push({
				x: game.player.x,
				y: game.player.y,
				width: 20,
				height: 20,
				image: 2 //the 2nd image imported (see the list)
			});
		}

		function init(){
			for(i = 0; i < 600; i++){
				game.stars.push({
					x: Math.floor(Math.random() * game.width),
					y: Math.floor(Math.random() * game.height),
					size: Math.random() * 5
				});
			}
			//game.contextPlayer.drawImage(game.images[0], 10, 10, 100, 100);
			for(y =0;y<5;y++){
				for(x=0;x<5;x++){
					game.enemies.push({
						x: (x * 70) + (10 * x) + 80,
						y: y * 70 + (10 * y) + 40,
						width: 70,
						height: 70,
						image: 1, //number reference to enemy image
						dead: false,
						deadTime: 20
					});
				}
			}
			loop();
			setTimeout(function(){
				game.moving = true;
			}, 5000);
		}
		
		function addStars(num){ //spawn stars
			for(i = 0; i < num; i++){
				game.stars.push({
					x: Math.floor(Math.random() * game.width),
					y: game.height + 10,
					size: Math.random() * 5
				});
			}

		}
		function update(){
			addStars(1);
			if(game.count > 100000)game.count = 0;
			game.count++;
			if(game.shootTimer>0)game.shootTimer--;

			for(i in game.stars){
				if(game.stars[i].y <= -5){ //deletes stars when they get to  y -5 so they dont take up memory when they leave screen
					game.stars.splice(i, 1);
				}
				game.stars[i].y--;
			}
			if(game.keys[37] || game.keys[65]){
				if(game.player.x>0){
					game.player.x-=game.player.speed;
					game.player.rendered = false;
				}
				
			}
			if(game.keys[39] || game.keys[68]){
				if(game.player.x<=game.width - game.player.width){
					game.player.x+=game.player.speed;
					game.player.rendered = false;
				}
				
			}
			if(game.count % game.division == 0){
				game.left = !game.left;
			}
			for(i in game.enemies){
				if(!game.moving){
					if(game.left){
					game.enemies[i].x-=game.enemySpeed;
					}else{
					game.enemies[i].x+=game.enemySpeed;

					}
				}
				
				if(game.moving){
					game.enemies[i].y++;
				}
				if(game.enemies[i].y >= game.height + game.enemies[i].height){
					game.gameOver = true;

				}
			}
			for(i in game.projectiles){
				game.projectiles[i].y-=3;
				if(game.projectiles[i].y <= -30){
					game.projectiles.splice(i, 1);
				}
				
			}
			if(game.keys[32] && game.shootTimer <= 0){ //makes bullets when click space bar
				addBullet();
				game.shootSound.play();
				game.shootTimer = game.fullShootTimer;
			}
			for(m in game.enemies){
				for(p in game.projectiles){
					if(collision(game.enemies[m], game.projectiles[p])){
						game.enemies[m].dead = true;
						game.explodeSound.play();
						game.enemies[m].image = 3;
						game.contextEnemies.clearRect(game.projectiles[p].x, game.projectiles[p].y, game.projectiles[p].width, game.projectiles[p].height);
						game.projectiles.splice(p,1);
					}
				}
			}
			for(i in game.enemies){
				if(game.enemies[i].dead){
					game.enemies[i].deadTime--;
				}
				if(game.enemies[i].dead && game.enemies[i].deadTime <= 0){
					game.enemies.splice(i,1);
					game.contextEnemies.clearRect(game.enemies[i].x, game.enemies.y[i], game.enemies.width[i], game.enemies.height[i]);
				}
			}
			if(game.enemies.length <= 0){
				game.gameWon = true;

			}
		}

		function render(){
			game.contextBackground.clearRect(0,0,game.width, game.height);
			game.contextBackground.fillStyle = "white";
			for(i in game.stars){
				var star = game.stars[i];
				game.contextBackground.fillRect(star.x, star.y, star.size, star.size);
			}
			if(!game.player.rendered){ //when the game is not rendered
				game.contextPlayer.clearRect(game.player.x - 50, game.player.y, game.player.width + 100, game.player.height);
				game.contextPlayer.drawImage(game.images[0], game.player.x, game.player.y, game.player.width, game.player.height);
				game.player.rendered = true;
			}
			for(i in game.enemies){
				var enemy = game.enemies[i];
				game.contextEnemies.clearRect(enemy.x - 10, enemy.y, enemy.width + 20, enemy.height);
				game.contextEnemies.drawImage(game.images[enemy.image], enemy.x, enemy.y, enemy.width, enemy.height);
			}
			for(i in game.projectiles){
				var proj = game.projectiles[i];
				game.contextEnemies.clearRect(proj.x - 30, proj.y, proj.width + 80, proj.height);				
				game.contextEnemies.drawImage(game.images[proj.image], proj.x, proj.y, proj.width, proj.height);
			}
			if(game.gameOver){
				game.contextBackground.fillStyle = "white";
				game.contextBackground.fillText("game over", game.width / 2 - 100, game.height / 2 - 25);
			}
			if(game.gameWon){
				game.contextBackground.fillStyle = "white";
				game.contextBackground.fillText("game won", game.width / 2 - 100, game.height / 2 - 25);
			}
		}

		function loop(){
			requestAnimFrame(function(){
				loop();
			});
			update();
			render();
		}

		function initImages(paths){
			game.requiredImages = paths.length;
			for(i in paths){
				var img = new Image();
				img.src = paths[i];
				game.images[i] = img;
				game.images[i].onload = function(){
					game.doneImages++;
				}
			}
		}

		function collision(first, second){
			return !(first.x > second.x + second.width || 
				first.x + first.width < second.x || 
				first.y > second.y + second.height ||
				first.y + first.height < second.y
				);
		}

		function checkImages(){
			if(game.doneImages >= game.requiredImages){
				init();
			}else{
				setTimeout(function(){
					checkImages();
				}, 1);
			}
		}
		game.contextBackground.font = "bold 50px monaco";
		game.contextBackground.fillStyle = "white";
		game.contextBackground.fillText("loading", game.width / 2 - 100, game.height / 2 - 25);
		initImages(["player.png", "enemy.png", "bullet.png", "explosion.png"]);
		checkImages();
		//init(); //must call it to make the function run
		//update();
		//render();

	});
})();

		window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame    ||
          window.msRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();
