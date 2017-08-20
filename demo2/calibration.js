
      var game = {}

      // Train Target parameters
      var TrTInnerRadius = 5;
      var TrTOutherRadius = 20;
      var TrTInnerColor = "red";
      var TrTInnerHoverColor = "green";
      var TrTOutherColor = "green";

      // Test Target parameters
      var TeTInnerRadius = 50;
      var TeTOutherRadius = 52;
      var TeTInnerColor = "red";
      var TeTInnerHoverColor = "green";
      var TeTOutherColor = "green";
      var TeTHealth = 10;

      function StartCalibration(onCalibrationEnd)
      {
        var canvas = document.getElementById('mainCanvas');
        var context = canvas.getContext('2d');
        
        context.canvas.width=window.innerWidth;
        context.canvas.height=window.innerHeight;

        game.canvas = canvas;
        game.context = context;
        game.width = window.innerWidth;
        game.height = window.innerHeight;

        game.calibrationEnd = onCalibrationEnd;

        
        var margin = TrTOutherRadius + 10;
        //topleft, topmid, topright,
        game.targetPositions = [];
        var rowNumber = 4;
        var columnNumber = 10;
        var xMarginBetween = (game.width - 2 * margin) / (columnNumber - 1);
        var yMarginBetween = (game.height - 2 * margin) / (rowNumber - 1);
        for(var x = 0; x < columnNumber; x ++)
        {
          var posX = xMarginBetween * x + margin;
          for(var y = 0; y < rowNumber; y ++)
          {
            var posY = yMarginBetween * y + margin;
            game.targetPositions.push([posX,posY]);
          }
        }
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
              checkCalibration();
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
          radius : TrTInnerRadius,
          sqr_radius: TrTInnerRadius * TrTInnerRadius,
          strokeWidth: TrTOutherRadius - TrTInnerRadius,
          draw:function(context) 
          {
              context.beginPath();
              context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
              context.fillStyle = TrTInnerColor;
              if(this.hover)
              {
                context.fillStyle = TrTInnerHoverColor;
              }
              context.fill();
              context.lineWidth = this.strokeWidth;
              context.strokeStyle = '#003300';
              context.stroke();

          },
          contains:function(posX,posY)
          {
            var disX = posX - this.x;
            var disY = posY - this.y;
            var dis2 = disX * disX + disY * disY;
            return dis2 < this.sqr_radius; 
          },
          outherContains:function(posX,posY)
          {
            var disX = posX - this.x;
            var disY = posY - this.y;
            var dis2 = disX * disX + disY * disY;
            return dis2 < TrTOutherRadius* TrTOutherRadius;
          },
          hover:false
        }

        return true;
      }
      
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
        if(game.target.outherContains(mousePos.x,mousePos.y))
        {
          var features = webgazer.addDataGetFeature(mousePos.x,mousePos.y,"move");
        }
        if(game.target.contains(mousePos.x,mousePos.y))
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
        if(game.target.contains(mousePos.x,mousePos.y))
        {
            var features = webgazer.addDataGetFeature(mousePos.x,mousePos.y,"click");
            console.log(features);
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


      // Calibration check

      function NextCheckTarget() 
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
          radius:TeTInnerRadius,
          sqr_radius: TeTInnerRadius * TeTInnerRadius,
          strokeWidth: TeTOutherRadius - TeTInnerRadius,
          health: TeTHealth,
          draw:function(context) 
          {
              context.beginPath();
              context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
              context.fillStyle = TeTInnerColor;
              if(this.hover)
              {
                context.fillStyle = TeTInnerHoverColor;
              }
              context.fill();
              context.lineWidth = this.strokeWidth;
              context.strokeStyle = TrTOutherColor;
              context.stroke();

          },
          contain:function(posX,posY)
          {
            var disX = posX - this.x;
            var disY = posY - this.y;
            var dis2 = disX * disX + disY * disY;
            return dis2 < this.sqr_radius; 
          },
          distance:function(posX, posY)
          {
            var disX = posX - this.x;
            var disY = posY - this.y;
            var dis2 = disX * disX + disY * disY;
            return Math.sqrt(dis2);

          },
          hover:false
        }

        return true;
      }



      function checkCalibration()
      {
        var w = game.width;
        var h = game.height;
        var margin = TeTOutherRadius + 10;
        game.targetPositions = [ [margin,margin], [w-margin,margin], [w-margin,h-margin],[margin,h-margin],[w/2,h/2]];
        game.lastTargetPosIdx = -1;
        NextCheckTarget();

        var drawLoop = setInterval(function() 
        {
           checkDraw();
        }, 20);

        game.endCheck = function()
        {
            clearInterval(drawLoop);
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // Call back
            game.calibrationEnd();
        }
      }

      function checkDraw()
      {
        
        context = game.context;
        canvas = game.canvas;
        // Clean the canvas
        context.clearRect(0, 0, game.canvas.width, canvas.height);
        game.target.draw(context);

        var prediction = webgazer.getCurrentPrediction();
        if(prediction != null)
        {
            if(game.target.contain(prediction.x,prediction.y))
            {
               game.target.hover = true;
               game.target.health -= 1;
               if(game.target.health <= 0)
               {
                  if(!NextCheckTarget())
                  {
                    console.log("End Check!")
                    game.endCheck();
                  }
               }
            }else
            {
               game.target.hover = false;
            }
        }

      }





