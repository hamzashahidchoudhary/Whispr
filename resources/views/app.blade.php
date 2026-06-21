<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#111318">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>Whispr</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/App.jsx'])
    <style>
        * { box-sizing: border-box; }
        html, body, #app {
            height: 100%;
            height: 100dvh;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
        /* Prevent bounce scrolling on iOS */
        body {
            position: fixed;
            width: 100%;
            overscroll-behavior: none;
        }
    </style>
</head>
<body>
    <div id="app"></div>
</body>
</html>
