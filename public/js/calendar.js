document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar-content');
  
      var calendar = new FullCalendar.Calendar(calendarEl, {
          googleCalendarApiKey: process.env.CALENDAR_API_KEY,
          events: process.env.CALENDAR_EMAIL,
          
          plugins: [ 'dayGrid', 'googleCalendar', 'timeGrid' ],
          header: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
          },
  
          timeFormat: 'H:mm-{H:mm}',
        //   defaultView: 'timeGridWeek',
          nowIndicator: true,
        //   //weekNumbers: true,
  
        //   // eventRender : function(event, element) {
        //   //   element[0].title = event.title;
        //   // },
  
        //   eventRender: function(info) {
        //     var tooltip = new Tooltip(info.el, {
        //       title: info.event.extendedProps.description,
        //       //placement: 'top',
        //       //trigger: 'hover',
        //       //container: 'body'
        //     });
        //   },
  
  
        
        //   eventClick: function(info) {
        //     info.jsEvent.preventDefault();
        //     alert("Location: " + info.event.extendedProps.location + "\nDescription: " + info.event.extendedProps.description);
        //   }
      });
      calendar.render();
  });