## 1. Application Goal 
## 2. Functional Scope 
## 3. Request Flow 
## 4. Trust Boundaries



## Functional Scope 
Record the three operations by the application: 
• Create an issue. 
• View all issues. 
• Change an issue status. 


## Request Flow 
CREATE ISSUE: 
User → Frontend form → POST /api/issues → API validation → Data layer 
      ← Render created issue ← 201 + JSON ←───────────────┘ 
Explanation: 
• The user fills in the form (title, description) and clicks Submit. 
• The frontend sends POST /api/issues with the form data as JSON. 
• The API validates the data (title present, length limits). If invalid, it stops and returns code 400 and an error 
message. 
• The data layer stores the issue, gives it an id and status "open". 
• The API replies 201 Created and the new issue as JSON. 
• The frontend adds the new issue to the list on screen.


##  Page load → GET /api/issues → API → Data layer 
           ← Render list ← 200 + JSON array ←───┘ 
Explanation: 
• The page loads and the frontend sends GET /api/issues. 
• The API asks the data layer for every stored issue. 
• The API replies 200 OK and the JSON array (empty array if none). 
• The frontend renders one row/card per issue, or "No issues yet" when the array is empty. 


## CHANGE STATUS   

Button → PATCH /api/issues/{id}/status → API validation → Data layer 
        ← Re-render issue ← 200 + updated JSON ←──────────┘  
Explanation: 
• The user clicks a status button on one issue. 
• The frontend sends PATCH /api/issues/{id}/status with a body such as {"status": "in_progress"}. 
• The API validates two things: 
o the issue {id} exists (otherwise 404 Not Found) 
o the new status is an allowed value (otherwise 400 Bad Request) 
• The data layer updates only the status field of that issue. 
• The API replies 200 OK and the full updated issue as JSON. 
• The frontend re-renders that one issue with its new status.


## Trust Boundary 

A trust boundary ensures that data passing from the client-side to the server-side is validated and correct before it is 
received.  
 Draw or copy the following simplified boundary into the architecture document: 
USER-CONTROLLED SIDE                 APPLICATION-CONTROLLED SIDE 
  
Browser input  ───── HTTP request ─────▶  REST API  ─────▶  Data 
        ▲                                      │ 
        └────────── JSON response ◀────────────┘ 
Explanation: 
**User-controlled side:** AKA the browser, the form fields, the buttons, and 
every HTTP request that leaves the browser. The user can change any of 
it (browser dev tools, curl, Postman). When they a HTTP request is passed it is deemed untrusted until it is validated. 
  
**Application-controlled side:** AKA the REST API and the data layer. Only  
the code base runs here, and the data is reachable only through the API. 
  
**The boundary** is the HTTP request and follows rules: 
1. The API validates every request. Frontend checks are only for 
   
   
 
   convenience, never for security. 
2. The browser never talks to the data layer directly. 
3. The API returns only what the frontend needs, and never leaks 
   internal errors or stack traces. 
4. The frontend shows issue text as plain text, never as HTML.


# API Contract: Issues API 
  
## Data Dictionary: Issue 
  
| Field | Type | Source | Rule | 
|---|---|---|---| 
| id | string | Server | Required in stored/returned resource; unique; immutable. | 
| title | string | Client | Required; trim whitespace; 3–100 characters. | 
| description | string | Client | Required; trim whitespace; 5–500 characters. | 
| priority | string enum | Client | One of Low, Medium, High. | 
| status | string enum | Server / controlled update | Open or Resolved. New issues start as Open. | 
| createdAt | string (ISO 8601) | Server | Created when the issue is accepted; immutable. | 
  
  
A complete issue returned by the API has this shape: 
  
```json 
{ 
  "id": "ISS-101", 
  "title": "Unable to access Wi-Fi", 
  "description": "Connection fails in the teaching lab.", 
  "priority": "High", 
  "status": "Open", 
  "createdAt": "2026-09-15T12:30:00.000Z" 
} 
``` 
  
## Contract 1: View All Issues 
  - Request: `GET /api/issues` - Request body: none 
  
Successful response: `200 OK` with a JSON array. 
  
```json 
[ 
  { 
    "id": "ISS-101", 
    "title": "Unable to access Wi-Fi", 
    "description": "Connection fails in the teaching lab.", 
    "priority": "High", 
    "status": "Open", 
    "createdAt": "2026-09-15T12:30:00.000Z" 
  } 
] 
``` 
  
   
   
 
Empty result (not an error): 
  
```json 
[] 
``` 
  
Errors: `500`. 
  
## Contract 2: Create an Issue 
  - Request: `POST /api/issues` - Header: `Content-Type: application/json` 
  
Request body (client-owned fields only): 
  
```json 
{ 
  "title": "Projector not detected", 
  "description": "Laptop cannot detect the classroom projector.", 
  "priority": "Medium" 
} 
``` 
  
Successful response: `201 Created` with the complete created issue. 
  
```json 
{ 
  "id": "ISS-102", 
  "title": "Projector not detected", 
  "description": "Laptop cannot detect the classroom projector.", 
  "priority": "Medium", 
  "status": "Open", 
  "createdAt": "2026-09-15T12:35:00.000Z" 
} 
``` 
  
Errors: `400`, `415`, `500`. 
  
## Contract 3: Change Issue Status 
  - Request: `PATCH /api/issues/{id}/status` - Header: `Content-Type: application/json` 
  
Request body: 
  
```json 
{ 
  "status": "Resolved" 
} 
``` 
  
Successful response: `200 OK` with the complete updated issue. 
  
```json 
{ 
  "id": "ISS-101", 
   
   
 
  "title": "Unable to access Wi-Fi", 
  "description": "Connection fails in the teaching lab.", 
  "priority": "High", 
  "status": "Resolved", 
  "createdAt": "2026-09-15T12:30:00.000Z" 
} 
``` 
  
Errors: `400`, `404`, `415`, `500`. 
  
## Error Responses 
  
Every error response uses the same JSON shape: 
  
```json 
{ 
  "error": { 
    "code": "VALIDATION_ERROR", 
    "message": "Title must contain between 3 and 100 characters." 
  } 
} 
``` 
  
| Status | Code | Returned when | 
|---|---|---| 
| 400 | VALIDATION_ERROR | The data sent is missing, malformed or breaks a rule. | 
| 404 | ISSUE_NOT_FOUND | The id in the URL does not exist. | 
| 415 | UNSUPPORTED_MEDIA_TYPE | The body is not JSON although the endpoint requires JSON. | 
| 500 | INTERNAL_ERROR | Something unexpected failed on the server.
npm in