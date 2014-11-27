Postits = new Mongo.Collection("postits");

Columns = new Mongo.Collection("columns")

Columns.listcols = function () {
   return _.pluck(this.find({}).fetch(), 'name');
}
Columns.listIds = function () {
   return _.pluck(this.find({}).fetch(), '_id');
}

Columns.position = function(number) {
  Session.set('columnIndex', (Session.get('columnIndex') + number));
} 

if (Meteor.isClient) {

  Session.set('columnIndex', 0)

  // This code only runs on the client
  Meteor.subscribe('postits')
  Meteor.subscribe('columns')

  Template.body.helpers({
    postits: function () {
      return Postits.find({});
    },

  });

  Template.dynamic_columns.helpers({
    postitCol: function() {
      if (Session.get('columnIndex') === Columns.listcols().length) {
        Session.set('columnIndex', 0)
      }
     return Columns.listcols()[Session.get('columnIndex')];
    }
  });

  $(function () {

    var pushPostit = document.getElementById('submit-postit');
    var hammertime = new Hammer(pushPostit);

    // let the pan gesture support all directions.
    // this will block the vertical scrolling on a touch-device while on the element
    hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL });
    
    // listen to events...
    hammertime.on("swipeup", function(event) {
      var text = $('#test').val();
      var column = Columns.listIds()[Session.get('columnIndex')];
      Postits.insert({
        text: text,
        columnId: column,
        createdAt: new Date() 
      });

      event.target.text.value = "";

      return false;

    });

    var setColumn = document.getElementById('select-column');
    var hammercolumn = new Hammer(setColumn);


    hammercolumn.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

    hammercolumn.on("swipeleft", function(event) {
      alert("Swiping LEFT");
      Columns.position(1); 
      // document.getElementById('elenas-idea').reload();  
    });

  });

  Template.document_ready.rendered = function() {
    var width = $(window).width(), height = $(window).height();
    if (width <= 400) {
      alert('Im a mobile device!')
      $(".columns").hide();
    } else {
      // alert('Im a browser');
      $("#submit-postit").hide();
    }
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Columns.find().count() === 0) {
      Columns.insert({name: "ToDo"});
      Columns.insert({name: "Doing"});
      Columns.insert({name: "Done"});
    };
  });

  Meteor.publish('postits', function() {
   return Postits.find({}); 
  });

  Meteor.publish('columns', function() {
   return Columns.find({}); 
  });
}