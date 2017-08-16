
      var game = {}

      function StartCalibration()
      {
        var canvas = document.getElementById('mainCanvas');
        var context = canvas.getContext('2d');
        
        context.canvas.width=window.innerWidth;
        context.canvas.height=window.innerHeight;

        game.canvas = canvas;
        game.context = context;
        game.width = window.innerWidth;
        game.height = window.innerHeight;

        var w = game.width;
        var h = game.height;
        game.targetPositions = [ [20,20], [w-20,20], [w-20,h-20],[20,h-20],[w/2,h/2]];
        game.lastTargetPosIdx = -1;
        NextTarget();

        var drawLoop = setInterval(function() 
        {
           calibrationDraw();
        }, 20);

        game.canvas.addEventListener('mousemove',onCalibrationMouseMove, false);
        game.canvas.addEventListener('click',onCallibrationMouseClick, false);
		    game.endCalibration = function()
		        {
		        	clearInterval(drawLoop);
		        	this.canvas.removeEventListener('mousemove',onCalibrationMouseMove, false);
		        	this.canvas.removeEventListener('click',onCallibrationMouseClick, false);
		        	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		        }
      }


      function NextTarget() 
      {
      	game.lastTargetPosIdx += 1;
      	if(game.lastTargetPosIdx >= game.targetPositions.length)
      	{
      		return false;
      	}

        tPos = game.targetPositions[game.lastTargetPosIdx];
        game.target = {
          x:tPos[0],
          y:tPos[1],
          radius:20,
          sqr_radius: 20*20,
          draw:function(context) 
          {
              context.beginPath();
              context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
              context.fillStyle = 'red';
              if(this.hover)
              {
                context.fillStyle = 'green';
              }
              context.fill();
              context.lineWidth = 5;
              context.strokeStyle = '#003300';
              context.stroke();

          },
          contain:function(posX,posY)
          {
            var disX = posX - this.x;
            var disY = posY - this.y;
            var dis2 = disX * disX + disY * disY;
            return dis2 < this.sqr_radius; 
          },
          hover:false
        }

        return true;
      }
      
      window.onload = function()
      {
        /*
      	// initialize demo.js
        initialize();

        

        StartCalibration();
        */
      };

      function calibrationDraw()
      {
        
        context = game.context;
        canvas = game.canvas;

        // Clean the canvas
        context.clearRect(0, 0, game.canvas.width, canvas.height);
        game.target.draw(context);

        var prediction = webgazer.getCurrentPrediction();
        if(prediction != null)
        {
        	context.fillStyle = 'green';
        	context.fillRect(prediction.x,prediction.y,5,5);
        }

      }

      function onCalibrationMouseMove(evt)
      {
        var mousePos = getMousePos(game.canvas, evt);
        if(game.target.contain(mousePos.x,mousePos.y))
        {
          game.target.hover = true;
        }else
        {
          game.target.hover = false;
        }

      }

      function onCallibrationMouseClick(evt)
      {
        var mousePos = getMousePos(game.canvas, evt);
        game.mousePos = mousePos;
        if(game.target.contain(mousePos.x,mousePos.y))
        {
            if(!NextTarget())
            {
            	console.log("End Calibration!")
            	game.endCalibration();
            }
        }

      }

      function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
      }

      function write(txt,posX,posY)
      {
        posX -= 100;
        posY -= 100;
        game.context.font = "30px Arial";
        game.context.fillText(txt,posX,posY);
      }
