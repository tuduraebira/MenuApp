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
      // 削除される料理のindexを取得
      // TODO 同じ料理名だった場合の処理
      const index = menu.findIndex((e) => e.title === clickInfo.event.title);
      const title = clickInfo.event.title;
      if (index !== -1) {
        deleteMenu(index, title);
      }

      clickInfo.event.remove();
    }
  };

  const handleEventDrop = (eventDropInfo) => {
    const oldEvent = eventDropInfo.oldEvent;
    const newEvent = eventDropInfo.event;

    const oldEventIndex = menu.findIndex((e) => e.title === oldEvent.title);
    const oldEventTitle = oldEvent.title;
    const newEventDate = newEvent.startStr;
    const newEventTitle = newEvent.title;

    deleteAndAddMenu(oldEventIndex, oldEventTitle, newEventDate, newEventTitle);
  };

  return (
    <Box sx={{ m: 3 }}>
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
