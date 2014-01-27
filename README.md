jswars
======
jswars is a project in collaboration with [porter][porterrepo]
to create a modern, HTML5/websocket based interpretation of the turn based
strategy classic Advanced Wars. It is in its early stages as this point, and
currently represents less than what anyone would consider a game, but it's
progressing quickly, and will hopefully soon be a source of great strategic
joy for, at the very least, its authors.

Setup
=====
To get started running a local version of the game, first clone both jswars and
porter to your machine. Setup instructions for porter can be found in its
[readme][porterreadme]

jswars uses Go to serve its webpages and route game requests to the porter server.
As such, you will need to have Go installed, then configure it for this project.
If the jswars directory is saved on your machine in ~/sandbox/jswars, set your
GOPATH environment variable to "/home/<username>/sandbox/jswars/" using your
shell command of choice. A proper setup should echo the above in the list
of environment variables when you run "go env"

The last setup element required is to grab the [gorilla websocket][gorillaws]
library for communication between the web client and the Go server. Running

    go get

within the project directory should grab and appropriately install the library.

Running the server
==================
Once the server has been properly setup as above, run

    go run server.go

within the jswars directory to run the server on the default port, 8888.
Adding the command line argument

    -port=":<port num>"

to the above command allows you to configure the servers port.

Finally, the porter server must also be running on your local machine in order
to facilitate the actual processing of the game.

Playing the game
================
Navigate your web browser to localhost:8888 to view the game itself. At this
point in time you are allowed to have a 1 player game, which can be setup by
clicking the "Lazy Quinten" button. If everything works correctly, you should
see roughly the following screen:

![alt text][simple]

You can use the arrow keys to move the camera, and click on the unit in the
world to select it. You can then hit the "m" key to show the unit's available
moves, and click within the blue region to plot a path, as shown below:

![alt text][move]

With a valid move plotted, hit "m" again to send the move command to the server,
which will validate it, then send back a confirmation which, if successful, will
prompt the unit to move to the destination.

To clear unit selection and go back to camera control, hit "escape", then click
off the unit on the map.

[porterrepo]: https://github.com/DomoCo/porter
[porterreadme]: https://github.com/DomoCo/porter/blob/master/README.md
[gorillaws]: https://github.com/gorilla/websocket
[simple]: https://raw.github.com/DomoCo/common/master/images/jswars.png
[move]: https://raw.github.com/DomoCo/common/master/images/jswarsMove.png
