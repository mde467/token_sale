xcopy /s /i "./src" "./docs"
xcopy /s /i "./build/contracts" "./docs"
git add .
git commit -m "Compiles assets for git hub pages"
git push -u origin master