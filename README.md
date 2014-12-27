

# zoe-express
zoe-express was written to generate RESTful APi from a yaml file;  using mongo, node.js, and express as the implementation.

The idea behind zoe-express is that code generated via metadata can be:
  1. quickly modified globaly
  2. easier to trouble shoot; as all models and controllers are generated
     from the same template
  3. quicker to deploy; as the backend api is generated (:

## Installation

	$ sudo npm install -g git://github.com/chubbz327/zoe-express.git


## Usage
zoe-express uses a loosely based yaml file that is based on a mongoose schema declaration; for example the following schemas:

  - <EXPRESSROOT>/models/Test.js
```lang
	var mongoose = require('mongoose');
	var TestSchema =  new mongoose.Schema(
	{ name : String , updated_at :{ type : Date , default : Date.now }});
	
	module.exports = mongoose.model('Test', TestSchema);
```

  - <EXPRESSROOT>/models/Test2.js
```lang
	var mongoose = require('mongoose');
	var Test2Schema =  new mongoose.Schema(
	{ name : String , updated_at :{ type : Date , default : Date.now }});

	module.exports = mongoose.model('Test2', Test2Schema);
```
Can be represented in the yaml description file as:
<YAML Description File AKA test.yml in this case>

```lang
models:
  - name: Test
    member:
      name: String
      updated_at:
        type: Date
        default: Date.now

  - name: Test2
    member:
      name: String
      updated_at:
        type: Date
        default: Date.now
```
Running  zoe-express, assuming the file is named test.yml

	$ zoe-express --yaml test.yaml <APPNAME>
	$ cd <APPNAME>
	$ npm install
	$ mongod
	$ DEBUG=<APPNAME> ./bin/www
	$ # #! AKA Bang done!!!!
Will generate
  1. the the model files mentioned above
  2. add the require and use statements to app.js 
  3. create the route js scripts for RESTful CRUD

 
## Contributing

Please feel free to contribute; you.branteaser("cockout rockout with");

### Tools

## Release History

* 0.1.0 Initial release
