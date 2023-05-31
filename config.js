require("dotenv").config();

const config = {
  dbValues: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  },

  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },

  port: process.env.PORT || 8080,
  expireTime: 24 * 60 * 10,
  dev: "development",
  test: "testing",
  prod: "production",

  getDbConnectionString: function () {
    return `mongodb+srv://${this.dbValues.username}:${this.dbValues.password}@cluster0.sqtbbft.mongodb.net/${this.dbValues.database}?retryWrites=true&w=majority`;
  },

  secret: {
    jwt: process.env.JWT || "nightwatch",
  },
};

module.exports = config;
