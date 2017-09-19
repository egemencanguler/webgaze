var hohey = {}

hohey.train = function (features, points)
{
    var yX = [];
    var yY = [];
    for(var i = 0; i < points.length; i ++)
    {
        yX.push([points[i][0]]);
        yY.push([points[i][1]]);
    }
    var X = new Matrix(features);
    var X_T = X.T;
    yX = new Matrix(yX);
    yY = new Matrix(yY);

    var lmbda = 0.1;

    var t1 = X_T.multiply(X);
    var t2 = Matrix.identity(X.shape[1]).scale(lmbda);
    var C = t1.add(t2);
    var C_inv = C.inverse();


    hohey.wX = C_inv.multiply(X_T.multiply(yX));
    hohey.wY = C_inv.multiply(X_T.multiply(yY));

    var predX = X.multiply(hohey.wX);
    var predY = X.multiply(hohey.wY);

    console.log(predX.subtract(yX));
    console.log(predY.subtract(yY));

}

hohey.predict = function(feature)
{
    var vec = new Matrix([feature],{shape:[1,120]});
    var pX = vec.multiply(hohey.wX);
    var pY = vec.multiply(hohey.wY);
    return [pX.get(0,0),pY.get(0,0)];
}