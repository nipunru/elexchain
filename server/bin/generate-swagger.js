const packageJson = require("../package.json");
const swagger = require("swagger-spec-express");
const app = require("../app");

var options = {
  title: packageJson.name,
  version: packageJson.version,
  description:
    "This is documentation for the bb API.<br><br> For every request you must include in the header: <br> <b>Content-Type: application/json</b> <br> <b>Authorization: Bearer <TOKEN></b> (Only for protected routes by authorization we use JWT.)<br>",
  termsOfService: "http://swagger.io/terms/",
  contact: {
    email: "nipun@ceylonsolutions.com",
  },
  license: {
    name: "Apache 2.0",
    url: "http://www.apache.org/licenses/LICENSE-2.0.html",
  },
  host: "localhost:4000",
  basePath: "/",
  tags: [
    {
      name: "user-service",
      description: "Authentication and User Management",
    },
  ],
  schemes: ["http", "https"],
};

swagger.initialise(app, options);
swagger.swaggerize(app);
swagger.compile();

var fs = require("fs");
fs.writeFile("public/documentation/v1/api-v1.json", JSON.stringify(swagger.json()), function (err) {
  if (err) throw err;
  console.log("complete");
  process.exit();
});
