document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar-content');

  $.getJSON('/events/resources', res => {
      if (!res || !res.key || !res.email) {
        return;
      }

      //initate fullcalendar
      var calendar = new FullCalendar.Calendar(calendarEl, {
        googleCalendarApiKey: res.key,
        events: res.email,
        
        plugins: [ 'dayGrid', 'googleCalendar' ],
        header: {
          right: 'prev,next today',
        },
    
        timeFormat: 'H:mm-{H:mm}',
        nowIndicator: true,
        eventColor: '#539ab9;',

        // //week numbers calculation
        // weekNumbers: true,
        // weekLabel: "Week",

        
        //when hovering over events
        eventRender: function(info) {
          //only display if there is location/description for the event
          var location =  "";
          if(info.event.extendedProps.location != null) 
            location =  "Location: " + info.event.extendedProps.location;   
          var description = "";
          if(info.event.extendedProps.description != null) {
            if(location != "") location += '\n\n';
            description = "Description: " + info.event.extendedProps.description;
          }
            


          var tooltip = new Tooltip(info.el, {
            title: location + description,
            placement: 'left',
            trigger: 'hover',
            container: 'body'
          });
        },

        //disables default behavior, which redirects to another website when clicked
        eventClick: function(info) {
          info.jsEvent.preventDefault();
          //alert("Location: " + info.event.extendedProps.location + "\nDescription: " + info.event.extendedProps.description);
        }
      });
      calendar.render();
    });
});