# Postman cURL Requests

In Postman, choose **Import → Raw text**, paste one command below, and import it. The API base URL is `http://localhost:5000`.

## Health

```sh
curl --location 'http://localhost:5000/health'
```

## Register

Replace `test@example.com` with a new email address if you have already registered it.

```sh
curl --location 'http://localhost:5000/api/auth/register' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "ChangeMe123!",
    "department": "Engineering"
  }'
```

## Login

Use the same email and password from registration. Copy `data.token` from the response for the protected requests below.

```sh
curl --location 'http://localhost:5000/api/auth/login' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "email": "test@example.com",
    "password": "ChangeMe123!"
  }'
```

## Current User

After importing, replace `PASTE_LOGIN_TOKEN_HERE` with the token from the login response, or configure Bearer Token in Postman's Authorization tab.

```sh
curl --location 'http://localhost:5000/api/auth/me' \
  --header 'Authorization: Bearer PASTE_LOGIN_TOKEN_HERE'
```

## Logout

Use the same login token. Logging out invalidates it.

```sh
curl --location --request POST 'http://localhost:5000/api/auth/logout' \
  --header 'Authorization: Bearer PASTE_LOGIN_TOKEN_HERE'
```

## Documents (Admin only)

All document requests require a bearer token for a user whose role is `Admin`. Replace `PASTE_ADMIN_TOKEN_HERE` with that user's login token. Upload accepts PDF, DOCX, or TXT files up to 10 MB.

### Upload Document

Replace the file path with a real local file path. cURL sets the multipart content type automatically.

```sh
curl --location 'http://localhost:5000/api/documents' \
  --header 'Authorization: Bearer PASTE_ADMIN_TOKEN_HERE' \
  --form 'file=@/path/to/document.pdf' \
  --form 'title=Project document' \
  --form 'description=Document uploaded for testing'
```

### List Documents

Pagination, search, and status are optional query parameters. Valid statuses: `Uploaded`, `Processing`, `Completed`, `Failed`.

```sh
curl --location 'http://localhost:5000/api/documents?page=1&limit=10&search=project&status=Uploaded' \
  --header 'Authorization: Bearer PASTE_ADMIN_TOKEN_HERE'
```

### Get Document

Replace `DOCUMENT_ID` with an ID returned by upload or list.

```sh
curl --location 'http://localhost:5000/api/documents/DOCUMENT_ID' \
  --header 'Authorization: Bearer PASTE_ADMIN_TOKEN_HERE'
```

### Retry Processing

Only documents with `Failed` status can be retried.

```sh
curl --location --request POST 'http://localhost:5000/api/documents/DOCUMENT_ID/retry' \
  --header 'Authorization: Bearer PASTE_ADMIN_TOKEN_HERE'
```

### Delete Document

```sh
curl --location --request DELETE 'http://localhost:5000/api/documents/DOCUMENT_ID' \
  --header 'Authorization: Bearer PASTE_ADMIN_TOKEN_HERE'
```
# API cURL Examples

These commands use PowerShell's `curl.exe`. Start the backend with `npm run dev` from `backend` first.

```powershell
$base = "http://localhost:5000"
```

## Health

```powershell
curl.exe -i "$base/health"
```

## Register

Use a new email address each time you register.

```powershell
$email = "you@example.com"
$password = "ChangeMe123!"
$registerBody = @{ name = "Test User"; email = $email; password = $password; department = "Engineering" } | ConvertTo-Json -Compress
$bodyFile = Join-Path $env:TEMP "enterprise-ai-request.json"
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($bodyFile, $registerBody, $utf8NoBom)

curl.exe -i -X POST "$base/api/auth/register" `
  -H "Content-Type: application/json" `
  --data-binary "@$bodyFile"
```

`department` is optional. The password must be 8-72 characters.

## Login

```powershell
$loginBody = @{ email = $email; password = $password } | ConvertTo-Json -Compress
[System.IO.File]::WriteAllText($bodyFile, $loginBody, $utf8NoBom)
$loginResponse = curl.exe -sS -X POST "$base/api/auth/login" `
  -H "Content-Type: application/json" `
  --data-binary "@$bodyFile" | ConvertFrom-Json

$token = $loginResponse.data.token
$token
```

## Get Current User

```powershell
curl.exe -i "$base/api/auth/me" `
  -H "Authorization: Bearer $token"
```

## Logout

```powershell
curl.exe -i -X POST "$base/api/auth/logout" `
  -H "Authorization: Bearer $token"

Remove-Item $bodyFile
```

Logout increments the user's token version, so the same token cannot be used afterward.