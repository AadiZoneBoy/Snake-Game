const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;

let score = 0, level = 1, speed = 200;
let snake = [{ x: 10 * box, y: 10 * box }];
let food = randomPosition();
let powerUp = null;
let d;

// Sounds (make sure files exist in "sounds" folder)
const sounds = {
    eat: new Audio("sounds/eat.wav"),
    power: new Audio("sounds/power.wav"),
    gameOver: new Audio("sounds/gameover.wav")
};

// Mobile swipe support
let touchStartX = 0, touchStartY = 0;
canvas.addEventListener('touchstart', e => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
});
canvas.addEventListener('touchend', e => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if(Math.abs(dx) > Math.abs(dy)){
        if(dx>0 && d!=="LEFT") d="RIGHT";
        if(dx<0 && d!=="RIGHT") d="LEFT";
    } else {
        if(dy>0 && d!=="UP") d="DOWN";
        if(dy<0 && d!=="DOWN") d="UP";
    }
});

document.addEventListener("keydown", e => {
    if(e.key==="ArrowLeft" && d!=="RIGHT") d="LEFT";
    if(e.key==="ArrowUp" && d!=="DOWN") d="UP";
    if(e.key==="ArrowRight" && d!=="LEFT") d="RIGHT";
    if(e.key==="ArrowDown" && d!=="UP") d="DOWN";
});

function randomPosition(){
    return { x: Math.floor(Math.random() * 25) * box, y: Math.floor(Math.random() * 25) * box };
}

function collision(head, array){
    return array.some(seg => seg.x === head.x && seg.y === head.y);
}

function spawnPowerUp(){
    if(Math.random() < 0.05) powerUp = randomPosition();
}

function draw(){
    // Background
    ctx.fillStyle = "#111";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Snake trail animation
    snake.forEach((seg,i)=>{
        const alpha = 1 - i*0.05;
        ctx.fillStyle = `rgba(0,255,0,${alpha})`;
        ctx.fillRect(seg.x, seg.y, box, box);
        ctx.strokeStyle = "#003300";
        ctx.strokeRect(seg.x, seg.y, box, box);
    });

    // Food
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(food.x, food.y, box, box);

    // Power-up
    if(powerUp){
        ctx.fillStyle = "#ffff00";
        ctx.fillRect(powerUp.x,powerUp.y,box,box);
    }

    let headX = snake[0].x;
    let headY = snake[0].y;

    if(d==="LEFT") headX -= box;
    if(d==="UP") headY -= box;
    if(d==="RIGHT") headX += box;
    if(d==="DOWN") headY += box;

    // Eat food
    if(headX === food.x && headY === food.y){
        score++;
        sounds.eat.play();
        if(score % 5 === 0){
            level++;
            speed = Math.max(50, speed-20);
            clearInterval(game);
            game = setInterval(draw,speed);
        }
        food = randomPosition();
        spawnPowerUp();
    } else snake.pop();

    // Eat power-up
    if(powerUp && headX === powerUp.x && headY === powerUp.y){
        score += 3;
        sounds.power.play();
        powerUp = null;
    }

    let newHead = { x: headX, y: headY };
    if(headX < 0 || headX >= canvas.width || headY < 0 || headY >= canvas.height || collision(newHead,snake)){
        clearInterval(game);
        sounds.gameOver.play();
        setTimeout(()=>alert("Game Over! Score: "+score),50);
    }

    snake.unshift(newHead);
    document.getElementById("score").innerText = score;
    document.getElementById("level").innerText = level;
}

let game = setInterval(draw,speed);
document.getElementById("restartBtn").addEventListener("click", ()=>location.reload());
