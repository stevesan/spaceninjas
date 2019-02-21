DEST=~/stevesan.github.io/spaceninjas
mkdir -p $DEST
cp -r game/* $DEST
pushd $DEST
git add .
git commit -am "update space ninjas build"
git status
git push origin master
