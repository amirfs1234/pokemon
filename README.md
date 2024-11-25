#Cybereason Pokemon App!#

###This is a basic application to register and login users, and get, update, and delete pokemon.###

There are many optimizations that could be made, such as:
1. Adding status codes in all places that require it (my application only has it in some of the places)
2. More robust error handling
3. Different way of managing consts, etc.

The point behind this application is to get a general feel for how it would work.

Set up is a breeze, after cloning the repo just run: docker-compose up --build, that'll give you the nestjs app,
the postgres container, and the redis container.

For convenience I've added a postman collection with all the relevant routes, separated into folders for the user routes, as well as the pokemon routes.