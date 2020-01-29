document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar-content');

  $.getJSON('/calendar/resources', res => {
      if (!res || !res.key || !res.email) {
        return;
      }

      var calendar = new FullCalendar.Calendar(calendarEl, {
        googleCalendarApiKey: res.key,
        events: res.email,
        
        plugins: [ 'dayGrid', 'googleCalendar' ],
        header: {
          right: 'prev,next today',
        },
    
        timeFormat: 'H:mm-{H:mm}',
        nowIndicator: true,

        // //week numbers calculation
        // weekNumbers: true,
        // weekLabel: "Week",

    
         eventRender: function(info) {
          var location =  "";
          if(info.event.extendedProps.location != null) 
            location =  "Location: " + info.event.extendedProps.location;
          var description = "";
          if(info.event.extendedProps.description != null) 
            description = "Description: " + info.event.extendedProps.description;


          var tooltip = new Tooltip(info.el, {
            title: location + description,
            placement: 'left',
            trigger: 'hover',
            container: 'body'
          });
        },

          eventColor: '#539ab9;',

    
        eventClick: function(info) {
          info.jsEvent.preventDefault();
          //alert("Location: " + info.event.extendedProps.location + "\nDescription: " + info.event.extendedProps.description);
        }
      });
      calendar.render();
    });
});