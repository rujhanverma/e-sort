# Minimal static file server for this workspace.
# Usage: Start-Job -FilePath .\serve.ps1; Get-Job; Receive-Job -Id <id> -Keep

$port = 8000
$prefix = "http://localhost:$port/"
$root = Get-Location

$mimeTypes = @{
    ".html" = "text/html"
    ".htm"  = "text/html"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".txt"  = "text/plain"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Output "Serving $root at http://localhost:$port/"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        $path = $req.Url.AbsolutePath.TrimStart('/')
        if ([string]::IsNullOrEmpty($path)) { $path = 'index.html' }

        $filePath = Join-Path $root $path
        if (-not (Test-Path $filePath -PathType Leaf)) {
            $res.StatusCode = 404
            $res.ContentType = 'text/plain'
            $bytes = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.Close()
            continue
        }

        $ext = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
        $mime = $mimeTypes[$ext] -or 'application/octet-stream'
        $res.ContentType = $mime
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
        $res.Close()
    } catch {
        Start-Sleep -Milliseconds 50
    }
}

$listener.Stop()
$listener.Close()
