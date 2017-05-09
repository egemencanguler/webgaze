if [ $1 -gt 1 ]
then
  cp batch1/*.jpg ./TurkerGaze/demo/imgs
  cp batch2/*.jpg ./demo/imgs/
else
  cp batch2/*.jpg ./TurkerGaze/demo/imgs
  cp batch1/*.jpg ./demo/imgs/
fi
