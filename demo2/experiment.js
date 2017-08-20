
var experiment = {}
experiment.started = false;
experiment.currentRecording = null;
experiment.imageLoaded = false; // start recording data when image is loaded
experiment.data = null;
experiment.recordingQ = null;
experiment.windowSize = null;

// show each image for spesified duration
//var DURATION = 3000;
var DURATION = 3000;

function getWindowSize()
{
  /*var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;*/
  var x = window.innerWidth;
  var y = window.innerHeight;
  var size = {width:x,height:y,x:x,y:y};
  return size;
}

function startExperiment()
{
  webgazer.setGazeListener(onGazeData);

  window.onbeforeunload = function()
  {
    //webgazer.end(); //Uncomment if you want to save the data even if you reload the page.
    window.localStorage.clear(); //Comment out if you want to save data across different sessions
  }
  experiment.started = true;
  experiment.windowSize = getWindowSize();
  experiment.recordingQ = [];
  experiment.data = {
    "windowSize" : experiment.windowSize,
    "recordings" : experiment.recordingQ
  };

  // Create Image Container
  var img = document.createElement("img");
  img.id = "image";
  document.body.appendChild(img);

  numberOfImages = 5;
  var number = 0;
  startRecording(number ++);
  /* ! */

  var refreshIntervalId = setInterval(
    function()
    {
      if(number == numberOfImages)
      {
          clearInterval(refreshIntervalId);
          endExperiment();
      }else
      {
        startRecording(number ++);
      }
    }, DURATION);
}

function startRecording(imageNumber)
{
  var imagePath = "./imgs/img" + String(imageNumber) + ".jpg";
  experiment.imageLoaded = false;
  currentRecording =
  {
    imageSize : null,
    imageScaledSize : null,
    imageNumber : imageNumber,
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
  experiment.recordingQ.push(currentRecording);
  changeImage(imagePath);

}
function changeImage(path)
{
    var img = document.getElementById("image");
    img.src = path
    img.onload = function()
    {
        currentRecording.imageSize = [img.naturalWidth,img.naturalHeight];
        var windowSize = experiment.windowSize;
        var imgRatio = img.naturalWidth / img.naturalHeight;
        var windowRatio = windowSize.width / windowSize.height;
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

function onGazeData(data,elapsedTime)
{
    if (data == null || !experiment.imageLoaded)
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

function endExperiment()
{
    console.log(experiment.data);
    currentRecording = null;
    imageLoaded = false;
    var str = JSON.stringify(experiment.data);
    console.log("Data\n" + str)
    console.log("Data End!");

    //Save the file contents as a DataURI
    var dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(str);
    console.log("Uri" + dataUri);
    document.getElementById("image").style.display = "none";

    var textToSave = str
    var textToSaveAsBlob = new Blob([textToSave], {type:"text/plain"});
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
    var fileNameToSaveAs = "result.json";
 
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
 
    downloadLink.click();
    
    //Write it as the href for the link
    //var link = document.getElementById('link').href = dataUri;

}



