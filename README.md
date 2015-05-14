# oars
A nodejs module making node-restify more easy to use.

Inspired by [Sailsjs](http://sailsjs.org). People can use **Configuration** making their [restify](http://restifyjs.com) server.

Feel **Honorable** to contribute your idea.

**IMPORTANT** version above 0.1.0 shall be stable.

## Get Started

User [Oars Generator](https://github.com/Evilcome/generator-oars) create a sample.

## Goal

- [x] Globals Variable
- [x] Logging
- [x] Middleware
- [x] Policies
- [x] Routes
- [x] Services
- [x] Oars Generator 
- [ ] API Document

### Globals Variable

Global variables will be exposed automatically by Oars. Default with [async](), [lodash](), oras, services available in global variables, you can use it directly in each controller.

### Logging

Make your server with more detail logger.

### Middleware

You can easily config the default or your own middlewares with the loading order.

### Policies

Configurable policies for controler or controller's method.

### Routes

You can design your app's URLs in any way you like :)

### Security

Protection against most known types of web-application-level attacks.

### Services

Services can be thought of as libraries which contain functions that you might want to use in many places of your application. For example, you might have an EmailService which wraps some default email message boilerplate code that you would want to use in many parts of your application. The main benefit of using services in Oars is that they are globalized -- you don't have to use require() to access them.

### Oars Generator

We provide command line generator tools for init your project.


