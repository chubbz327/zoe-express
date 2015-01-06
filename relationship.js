

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/relationship');

var Schema = mongoose.Schema;

var  StorySchema =  new mongoose.Schema(
{title:String,  _creator :{ type : String , ref : 'Person' }, fans :[{ type : String , ref : 'Person' }]}
);

var  PersonSchema =  new mongoose.Schema(
{  name : String , age : Number , stories :[{ type : Schema.Types.ObjectId , ref : 'Story' }]}
);


var Person = mongoose.model('Person', PersonSchema);
var Story = mongoose.model('Story', StorySchema);

var person  = new Person({name: 'Dinster', age: 33});
person.save(function(err){
  if(err) console.log(err);

});



var story   = new Story({title: 'forever and a day', _creator: person._id} );
story.save(function(err, story){
  if(err) console.log(err);
  console.log(story);
});

Story.find().populate('_creator').exec(function(err, stories){
  if(err) console.log(err);
  console.log(stories);
});


Story.find().populate('').exec(function(err, stories){
  if(err) console.log(err);
  console.log(stories);
});
