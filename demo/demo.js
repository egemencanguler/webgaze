var experimentStarted = false;
var currentRecording = null;
var imageLoaded = false; // start recording data when image is loaded
var data = null;
var recordingQ = null;
var windowSize = null;

var DURATION = 3000;

function getWindowSize()
{
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;
  var size = {width:x,height:y,x:x,y:y};
  return size;
}

function hideElementById(id)
{
  document.getElementById(id).style.display = "none";
}

function showElementById(id)
{
  document.getElementById(id).style.display = "initial";
}

function startExperiment()
{
  webgazer.showPredictionPoints(false);
  experimentStarted = true;

  hideElementById("mainTable");
  hideElementById("webgazerVideoFeed");
  hideElementById("overlay");
  stopVideoFeed();
  windowSize = getWindowSize();
  recordingQ = [];
  data = {
    "windowSize" : windowSize,
    "recordings" : recordingQ
  };
  var img = document.createElement("img");
  img.id = "image";
  document.body.appendChild(img);
  numberOfImages = 5;
  var number = 0;
  record(number ++);
  var refreshIntervalId = setInterval(
    function()
    {
      if(number == numberOfImages)
      {
          clearInterval(refreshIntervalId);
          endExperiment();
      }else
      {
        record(number ++);
      }
    }, DURATION);
}

function record(number)
{
  var imagePath = "./imgs/img" + String(number) + ".jpg";
  imageLoaded = false;
  currentRecording =
  {
    imageSize : null,
    imageScaledSize : null,
    imageNumber : number,
    gazeData : [],
    addGazeData : function(x,y,elapsedTime)
    {
        var leftX = (windowSize.width - this.imageScaledSize[0])/2;
        var upY = (windowSize.height - this.imageScaledSize[1])/2;

        var normalizedX = (x - leftX)/this.imageScaledSize[0];
        var normalizedY = (y - upY)/this.imageScaledSize[1];
        this.gazeData.push([normalizedX,normalizedY,x,y,elapsedTime]);
    }
  };
  recordingQ.push(currentRecording);
  changeImage(imagePath);

}
function changeImage(path)
{
    var img = document.getElementById("image");
    img.src = path
    img.onload = function()
    {
        currentRecording.imageSize = [img.naturalWidth,img.naturalHeight];
        var imgRatio = img.naturalWidth / img.naturalHeight;
        console.log("imgRatio",imgRatio);
        var windowRatio = windowSize.width / windowSize.height;
        console.log("wRatio",windowRatio);
        if(imgRatio > windowRatio)
        {
          img.width = windowSize.width;
          img.height = img.width * (img.naturalHeight / img.naturalWidth);
        }else
        {
          img.height = windowSize.height;
          img.width = img.height * (img.naturalWidth / img.naturalHeight);
        }
        currentRecording.imageScaledSize = [img.width,img.height];
        imageLoaded = true;
    }

}

function endExperiment()
{
    console.log(recordingQ);
    currentRecording = null;
    imageLoaded = false;
    var str = JSON.stringify(data);

    //Save the file contents as a DataURI
    var dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(str);
    document.getElementById("image").style.display = "none";
    window.open(dataUri)
    //Write it as the href for the link
    //var link = document.getElementById('link').href = dataUri;

}

function initialize()
{
  webgazer.setRegression('ridge') /* currently must set regression and tracker */
          .setTracker('clmtrackr')
          .setGazeListener(onGazeData)
          .begin()
          .showPredictionPoints(true); /* shows a square every 100 milliseconds where current prediction is */
  showVideoFeed();


    window.onbeforeunload = function()
    {
    //webgazer.end(); //Uncomment if you want to save the data even if you reload the page.
    window.localStorage.clear(); //Comment out if you want to save data across different sessions
    }
}

function onGazeData(data,elapsedTime)
{
    if (data == null || !imageLoaded)
    {
        return;
    }
    var xprediction = data.x; //these x coordinates are relative to the viewport
    var yprediction = data.y; //these y coordinates are relative to the viewport
    if(currentRecording != null)
    {
        currentRecording.addGazeData(data.x,data.y,elapsedTime);
    }
}

function showVideoFeed()
{
  var width = 320;
  var height = 240;
  var topDist = '0px';
  var leftDist = '0px';

  var setup = function()
  {
      var video = document.getElementById('webgazerVideoFeed');
      video.style.display = 'block';
      video.style.position = 'absolute';
      video.style.top = topDist;
      video.style.left = leftDist;
      video.width = width;
      video.height = height;
      video.style.margin = '0px';

      webgazer.params.imgWidth = width;
      webgazer.params.imgHeight = height;

      var overlay = document.createElement('canvas');
      overlay.id = 'overlay';
      overlay.style.position = 'absolute';
      overlay.width = width;
      overlay.height = height;
      overlay.style.top = topDist;
      overlay.style.left = leftDist;
      overlay.style.margin = '0px';

      document.body.appendChild(overlay);

      var cl = webgazer.getTracker().clm;

      function drawLoop() {
          requestAnimFrame(drawLoop);
          overlay.getContext('2d').clearRect(0,0,width,height);
          if (cl.getCurrentPosition()) {
              cl.draw(overlay);
          }
          // Show position
          var prediction = webgazer.getCurrentPrediction();
          if (prediction) {
              var x = prediction.x;
              var y = prediction.y;
              // show position
              var ctx = overlay.getContext('2d')
              ctx.font = "15px Arial";
              ctx.fillStyle = 'blue';
              ctx.fillText(x + "," + y,200 ,200);
          }

      }
      drawLoop();
      /*if(!experimentStarted)
      {
          drawLoop();
      }*/

  };

  function checkIfReady()
  {
    if (webgazer.isReady()) {
        setup();
    } else {
        setTimeout(checkIfReady, 100);
  }
  }
  setTimeout(checkIfReady,100);
}

function stopVideoFeed()
{

}
