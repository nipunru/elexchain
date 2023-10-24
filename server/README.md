# User Service

## Description

This API contains all user related endpoints and Authentication.

##### Routing : Express

##### ODM Database : Mongoose

##### Authentication : Passport, JWT

## Installation

#### Download Code | Clone the Repo

```
git clone {repo_name}
```

#### Install Node Modules

```
npm install
```

#### Create .env File

You will find a example.env file in the home directory. Paste the contents of that into a file named .env in the same directory.
Fill in the variables to fit your application

#### API Documentation

You can find api documentation from `<host>/<version>/api-docs` (EG: `http://localhost:4000/v1/api-docs`)

To update the document run `npm run generate-swagger`

#### CI/CD

`develop`, `qa` and `uat` branches are configured with AWS CodePipeline
