import React, { forwardRef, useImperativeHandle, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import { Box } from "@mui/material";

const CalendarBase = ({ menu, deleteMenu, deleteAndAddMenu }, ref) => {
  const calendarRef = useRef(null);

  useImperativeHandle(ref, () => {
    return {
      getEventDates: () => {
        const eventDates = [];

        const calendarAPI = calendarRef.current.getApi();
        for (const e of calendarAPI.getEvents()) {
          eventDates.push(e.startStr);
        }

        return eventDates.sort((a, b) => {
          return a < b ? -1 : 1;
        });
      },
    };
  });

  /**
   * イベントがクリックされたときの処理関数
   *
   * @param {eventClickInfo} clickInfo イベントオブジェクト
   */
  const handleEventClick = (clickInfo) => {
    if (window.confirm(`'${clickInfo.event.title}'を削除しますか？`)) {
      deleteMenu(clickInfo.event.title);

      clickInfo.event.remove();
    }
  };

  /**
   * イベントがドロップされたときの処理関数
   *
   * @param {*} eventDropInfo イベントオブジェクト
   */
  const handleEventDrop = (eventDropInfo) => {
    const oldEvent = eventDropInfo.oldEvent;
    const newEvent = eventDropInfo.event;

    const eventTitle = oldEvent.title;
    const newEventDate = newEvent.startStr;

    deleteAndAddMenu(eventTitle, newEventDate);
  };

  return (
    <Box sx={{ m: 5 }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locales={allLocales}
        locale="ja"
        timeZone="local"
        editable={true}
        events={menu}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        ref={calendarRef}
      />
    </Box>
  );
};
const Calendar = forwardRef(CalendarBase);

export default Calendar;
