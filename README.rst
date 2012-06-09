===
wsc
===

**wsc** is a web browser based chat client for dAmn-like chat servers. At the moment,
the client only uses WebSockets as a transport, so to connect to dAmn's server using
this client, a WebSocket proxy needs to be used.


---------
How To
---------
Wsc is built as a jQuery plugin. The client itself draws the required HTML, but
you must provide a containing ``div`` for the client. Here is the shortest example
of how to use the client::
    
    <html>
        <head>
            <title>Chat Example</title>
            <style type="text/css">
                .main {
                    width: 100%;
                    height: 100%;
                }
            </style>
            <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
            <link rel="stylesheet" type="text/css" href="./dist/wsc.min.css" />
            <script type="text/javascript" src="./dist/wsc.min.js"></script>
            <script type="text/javascript">
                $(function() {
                    $('.main').wsc( 'init', {
                        "server": 'ws://proxy.address',
                        "username": 'username',
                        "pk": 'token',
                        "autojoin": '#Channel'
                    });
                    // Start connecting to the WebSocket proxy.
                    $('.main').wsc( 'connect' );
                });
            </script>
        </head>
        <body>
            <!-- doesn't seem to work well without a wrapping div.... -->
            <div class="main">
            </div>
        </body>
    </html>

There are more configuration options, which will be documented later.