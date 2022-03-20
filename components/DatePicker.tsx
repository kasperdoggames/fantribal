import { useRef, useState, useEffect } from "react";
import { format } from "date-fns";

export default function DatePicker({ onDateChange, formatString }: any) {
  const wrapperRef = useRef<any>(null);

  const formattedDateString = (dateObject: any) => {
    return format(
      new Date(dateObject.year, dateObject.month, dateObject.date, 0, 0, 0, 0),
      formatString || "E, do LLL yyyy"
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    initDate();
  }, []);

  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDefaultDate = () => {
    const today = new Date();
    const dateToday = today.getDate();
    const monthToday = today.getMonth();
    const yearToday = today.getFullYear();
    return { year: yearToday, month: monthToday, date: dateToday };
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState(getDefaultDate());
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(0);
  const [noOfDays, setNoOfDays] = useState<any>([]);
  const [blankdays, setBlankDays] = useState<any>([]);

  const initDate = () => {
    const defaultDate = getDefaultDate();
    setMonth(defaultDate.month);
    setYear(defaultDate.year);
    updateNoOfDays(defaultDate.year, defaultDate.month);
  };

  const isToday = (date: any) => {
    const today = new Date();
    const d = new Date(year, month, date);
    return today.toDateString() === d.toDateString();
  };

  const getDateValue = (date: any) => {
    const selectedDate = { year, month, date };
    setDatePickerValue(selectedDate);
    setShowDatePicker(false);
    if (onDateChange) {
      onDateChange(selectedDate);
    }
  };

  const updateNoOfDays = (forYear: any, forMonth: any) => {
    let daysInMonth = new Date(forYear, forMonth + 1, 0).getDate();
    let dayOfWeek = new Date(forYear, forMonth).getDay();
    let blankdaysArray = [];
    for (var i = 1; i <= dayOfWeek; i++) {
      blankdaysArray.push(i);
    }
    let daysArray = [];
    for (var i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }
    setBlankDays(blankdaysArray);
    setNoOfDays(daysArray);
  };

  const handleEscapeKeyDown = (e: any) => {
    if (e.keyCode === 27) {
      setShowDatePicker(false);
    }
  };

  const handleMonthBackClick = () => {
    let currentMonth = month;
    let currentYear = year;

    if (month === 0) {
      currentYear -= 1;
      currentMonth = 11;
    } else {
      currentMonth -= 1;
    }

    setYear(currentYear);
    setMonth(currentMonth);
    updateNoOfDays(currentYear, currentMonth);
  };

  const handleMonthForwardClick = () => {
    let currentMonth = month;
    let currentYear = year;
    if (month === 11) {
      currentMonth = 0;
      currentYear += 1;
    } else {
      currentMonth += 1;
    }

    setYear(currentYear);
    setMonth(currentMonth);
    updateNoOfDays(currentYear, currentMonth);
  };

  const renderNoOfDays = () => {
    return noOfDays.map((date: any, index: number) => {
      const defaultClasses =
        "text-sm leading-none leading-loose text-center transition duration-100 ease-in-out rounded-full cursor-pointer";
      const dynamicClasses = isToday(date)
        ? `bg-blue-500 text-white`
        : `text-gray-700 hover:bg-blue-200`;

      return (
        <div key={index} style={{ width: "14.28%" }} className="px-1 mb-1">
          <div
            onClick={() => {
              getDateValue(date);
            }}
            className={`${defaultClasses} ${dynamicClasses}`}
          >
            {date}
          </div>
        </div>
      );
    });
  };

  const renderCalendar = () => {
    return showDatePicker ? (
      <div
        className="absolute top-0 left-0 max-w-xs p-4 mt-12 bg-white border rounded-b-lg shadow-lg"
        // style={{ width: "17rem" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-lg font-bold text-gray-800">
              {MONTH_NAMES[month]}
            </span>
            <span className="ml-1 text-lg font-normal text-gray-600">
              {year}
            </span>
          </div>
          <div>
            <button
              type="button"
              className="inline-flex p-1 transition duration-100 ease-in-out rounded-full cursor-pointer focus:outline-none hover:bg-gray-200"
              onClick={handleMonthBackClick}
            >
              <svg
                className="inline-flex w-6 h-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              className="inline-flex p-1 transition duration-100 ease-in-out rounded-full cursor-pointer focus:outline-none hover:bg-gray-200"
              onClick={handleMonthForwardClick}
            >
              <svg
                className="inline-flex w-6 h-6 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap mb-3 -mx-1">
          {DAYS.map((day, index) => {
            return (
              <div key={index} style={{ width: "14.26%" }} className="px-1">
                <div className="text-xs font-medium text-center text-gray-800">
                  {day}
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap -mx-1">
            {blankdays.map((blankday: any, index: number) => {
              return (
                <div
                  key={index}
                  style={{ width: "14.28%" }}
                  className="p-1 text-sm text-center border border-transparent"
                ></div>
              );
            })}
            {renderNoOfDays()}
          </div>
        </div>
      </div>
    ) : null;
  };

  return (
    <div ref={wrapperRef}>
      <div className="container py-2 mx-auto">
        <div className="mb-5">
          <label
            htmlFor="datepicker"
            className="block mb-1 text-sm text-gray-900"
          >
            Select Date
          </label>
          <div className="relative">
            <input
              type="text"
              readOnly
              onClick={() => {
                setShowDatePicker(!showDatePicker);
              }}
              value={formattedDateString(datePickerValue)}
              onKeyDown={handleEscapeKeyDown}
              className="w-full py-3 pl-2 pr-10 font-semibold leading-none text-gray-700 bg-gray-300 rounded focus:outline-none focus:bg-gray-100 focus:border focus:text-black"
            />
            <div
              className="absolute top-0 right-0 px-3 py-2"
              onClick={() => {
                setShowDatePicker(!showDatePicker);
              }}
            >
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
}
