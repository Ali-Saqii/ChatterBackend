# Chatter API

REST API reference for the SwiftUI client.

## Connection

The Express server listens on `PORT` from the environment, or `5000` when
`PORT` is not set. Set the SwiftUI app's base URL to the address reachable
from the device or simulator, for example:

```text
http://localhost:5000
```

For an iOS simulator, `localhost` refers to the Mac running the backend. A
physical device must use the Mac's LAN IP address (and the server must be
reachable through the local network).

All paths below are relative to the base URL and begin with `/api`.

## Authentication

Registering and logging in return a JWT in `data.token`. Include it on every
protected request:

```http
Authorization: Bearer <token>
```

Tokens currently expire after `JWT_EXPIRES_IN` (the backend default is `7d`).
When the token is missing, invalid, expired, or references a deleted user, the
API returns `401`.

## Response envelope

Successful responses use this shape:

```json
{
  "status": 200,
  "message": "Message from the endpoint",
  "data": {},
  "success": true
}
```

`data` may be an object, an array, or `null`.

Errors use this shape:

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": []
}
```

Validation errors have `message: "Validation Error"` and put one or more
Joi validation messages in `errors`. Do not assume that every error includes
the same HTTP status in its JSON body; use the HTTP status code.

## Pagination

Paginated endpoints accept these query parameters:

| Parameter | Type | Default | Limits |
| --- | --- | --- | --- |
| `page` | integer | `1` | Must be at least `1` |
| `limit` | integer | `10` | Must be `1` through `100` |

Paginated responses include:

```json
{
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 0
  }
}
```

## Authentication endpoints

### Register

```http
POST /api/auth/register
Content-Type: application/json
```

Request body:

```json
{
  "fullName": "Ada Lovelace",
  "username": "ada_lovelace",
  "email": "ada@example.com",
  "password": "secret123"
}
```

Validation:

- `fullName`: required, 3–30 characters.
- `username`: required, 5–30 characters. The model allows letters, numbers,
  and underscores.
- `email`: required and must be a valid email address.
- `password`: required and at least 6 characters.

Response: `201 Created`

```json
{
  "status": 201,
  "message": "User registered successfully",
  "data": { "token": "<jwt>" },
  "success": true
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

Request body:

```json
{
  "identifier": "ada_lovelace",
  "password": "secret123"
}
```

`identifier` accepts either the username or email. Response: `200 OK`, with
the same `{ "token": "<jwt>" }` data shape as registration.

### Forgot password

```http
POST /api/auth/forgotPassword
Content-Type: application/json
```

Request body:

```json
{ "email": "ada@example.com" }
```

Response: `200 OK`

```json
{
  "status": 200,
  "message": "A new password has been sent to your email",
  "data": null,
  "success": true
}
```

For privacy, an unknown email also receives this success response. The
backend generates and emails a new password; the client should direct the
user to log in and change it.

## User endpoints

All user endpoints require the Bearer token.

### Get current profile

```http
GET /api/user/profile
```

Response: `200 OK`. `data` contains the current user profile:

```json
{
  "_id": "<user-id>",
  "fullName": "Ada Lovelace",
  "username": "ada_lovelace",
  "email": "ada@example.com",
  "bio": "",
  "avatarURL": "",
  "postsCount": 0,
  "friendsCount": 0
}
```

The profile response excludes the password hash, avatar Cloudinary public ID,
and Mongoose timestamps.

### Update profile

```http
PUT /api/user/updateProfile
Content-Type: application/json
```

All fields are optional; send only fields to update:

```json
{
  "fullName": "Ada Byron Lovelace",
  "username": "ada_byron",
  "bio": "Mathematician and writer"
}
```

Validation: `fullName` is 2–50 characters, `username` is 3–30 alphanumeric
characters, and `bio` is at most 160 characters. Empty strings are accepted
by validation. Response: `200 OK`, with the updated user document in `data`.

### Change password

```http
PUT /api/user/updatePassword
Content-Type: application/json
```

```json
{
  "oldPassword": "secret123",
  "newPassword": "newsecret123"
}
```

`newPassword` must be 6–72 characters. Response: `200 OK` with `data: null`.

### Change profile picture

```http
PATCH /api/user/profilePicture
Content-Type: multipart/form-data
```

Attach one image file using the field name `avatar`. The upload middleware
accepts image and video MIME types and allows files up to 50 MB, but this
endpoint is intended for a profile image. Response: `200 OK`:

```json
{
  "status": 200,
  "message": "Profile picture updated successfully",
  "data": { "avatarURL": "https://..." },
  "success": true
}
```

### Delete account

```http
DELETE /api/user/delete
```

Response: `200 OK` with `data: null`. The backend removes the user's posts,
comments, likes, friend requests, and uploaded avatar/media records.

## Post endpoints

All post endpoints require the Bearer token.

### Create a post

```http
POST /api/post/createPost
Content-Type: multipart/form-data
```

Multipart fields:

| Field | Type | Required |
| --- | --- | --- |
| `text` | string, max 2,000 characters | No, if `media` is supplied |
| `media` | one image or video file | No, if non-empty `text` is supplied |

The file field must be named `media`. At least one of non-empty `text` or
`media` is required. Uploads are limited to 50 MB. Response: `201 Created`,
with the newly created post in `data.post`:

```json
{
  "status": 201,
  "message": "Post created successfully",
  "data": {
    "post": {
      "_id": "<post-id>",
      "author": "<user-id>",
      "text": "Hello Chatter",
      "mediaURL": "",
      "mediaPublicId": "",
      "mediaType": "none",
      "likesCount": 0,
      "commentsCount": 0,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  },
  "success": true
}
```

`mediaType` is `none`, `image`, or `video`. The create response contains the
author ID; feed and user-post endpoints populate author profile fields.

### Delete a post

```http
DELETE /api/post/deletePost/<postId>
```

Only the post author can delete it. Response: `200 OK` with `data: null`.

### Get the current user's posts

```http
GET /api/post/myPosts?page=1&limit=10
```

Response: `200 OK`; `data` is `{ "posts": [...], "pagination": {...} }`.
Posts are ordered newest first and include an `author` object containing
`_id`, `username`, `fullName`, and `avatarURL`.

### Get another user's posts

```http
GET /api/post/userPosts/<userId>?page=1&limit=10
```

Response: `200 OK`; shape and ordering match `myPosts`.

### Get feed

```http
GET /api/post/feed?page=1&limit=10
```

Response: `200 OK`; `data` is `{ "posts": [...], "pagination": {...} }`.
The feed currently returns all posts, newest first, rather than filtering by
the authenticated user's friends.

## Comment and like endpoints

All comment and like endpoints require the Bearer token.

### Create a comment

```http
POST /api/comment/createComment/<postId>
Content-Type: application/json
```

```json
{ "content": "Nice post!" }
```

Whitespace-only content is rejected. The model maximum is 500 characters.
Response: `201 Created`; `data` is the newly created comment:

```json
{
  "_id": "<comment-id>",
  "post": "<post-id>",
  "user": "<user-id>",
  "content": "Nice post!",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

### Get comments for a post

```http
GET /api/comment/getComments/<postId>?page=1&limit=10
```

Response: `200 OK`; `data` is `{ "comments": [...], "pagination": {...} }`.
Comments are newest first and populate `user` with `fullName`, `username`, and
`avatarURL`.

### Delete a comment

```http
DELETE /api/comment/deleteComment/<commentId>
```

Only the comment author can delete it. Response: `200 OK` with `data: null`.

### Like a post

```http
POST /api/comment/likePost/<postId>
```

Response: `201 Created`; `data` is the created like document:

```json
{
  "_id": "<like-id>",
  "user": "<user-id>",
  "post": "<post-id>"
}
```

Calling this endpoint twice for the same user and post returns `409`.

### Unlike a post

```http
POST /api/comment/unlikePost/<postId>
```

Response: `200 OK` with `data: null`. If the current user has not liked the
post, the endpoint returns `404`.

## Friend endpoints

All friend endpoints require the Bearer token. User and request IDs are
MongoDB ObjectId strings.

### Send a friend request

```http
POST /api/friend/sendRequest/<receiverId>
```

Response: `201 Created` with `data: null`. A user cannot request themselves,
and a duplicate request in either direction returns `400`.

### Accept a friend request

```http
POST /api/friend/acceptRequest/<requestId>
```

Only the request receiver can accept it. Response: `200 OK` with `data: null`.

### Decline a friend request

```http
POST /api/friend/declineRequest/<requestId>
```

Only the request receiver can decline it. Response: `200 OK` with `data: null`.

### Cancel a sent request

```http
POST /api/friend/cancelRequest/<requestId>
```

Only the request sender can cancel it. Response: `200 OK` with `data: null`.

### Delete a friend

```http
DELETE /api/friend/deleteFriend/<friendId>
```

`friendId` is the other user's ID, not the friend-request document ID. The
relationship must be accepted. Response: `200 OK` with `data: null`.

### List friends

```http
GET /api/friend/friendsList?page=1&limit=10
```

Response: `200 OK`; `data` is:

```json
{
  "friends": [
    {
      "_id": "<user-id>",
      "fullName": "Ada Lovelace",
      "username": "ada_lovelace",
      "avatarURL": ""
    }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

### Incoming friend requests

```http
GET /api/friend/friendRequests?page=1&limit=10
```

Response: `200 OK`; `data` is `{ "requests": [...], "pagination": {...} }`.
Each request includes populated `sender` (with `fullName`, `username`, and
`avatarURL`) and a `receiver` ID.

### Sent friend requests

```http
GET /api/friend/sentRequests?page=1&limit=10
```

Response: `200 OK`; `data` is `{ "requests": [...], "pagination": {...} }`.
Each request includes a populated `receiver` (with `fullName`, `username`, and
`avatarURL`) and a `sender` ID.

## SwiftUI implementation notes

- Store the JWT securely in Keychain rather than `UserDefaults`.
- Send JSON requests with `Content-Type: application/json`; use
  `multipart/form-data` for profile and post media uploads.
- For multipart requests, let `URLSession`/`URLRequest` use the generated
  boundary; do not set a fixed boundary without writing the matching body.
- Decode the envelope's `success`, `message`, and `data` fields, and map
  non-2xx HTTP responses to the documented `message`/`errors` values.
- Treat `401` as an unauthenticated session and require a new login. The API
  does not provide a refresh-token endpoint.
