<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#111318">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>Whispr</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/App.jsx'])
    <style>
        *, *::before, *::after { box-sizing: border-box; }
        html { height: 100%; }
        body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #0d0f14;
        }
        #app {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
    </style>
</head>
<body>
    <div id="app"></div>
</body>
</html>
